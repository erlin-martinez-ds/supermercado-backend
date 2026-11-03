import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';

import {
  EstadoTrabajoFacturacion,
  TrabajoFacturacion,
} from '../entities/trabajo-facturacion.entity';

import { SimuladorProveedorService } from '../simulador-proveedor.service';
import { IntentoFacturacion } from '../entities/intento-facturacion.entity';
import { DataSource } from 'typeorm';

class ResultadoTardioError extends Error {
  constructor(idTrabajo: number) {
    super(
      `El trabajo ${idTrabajo} cambió de estado antes de guardar el resultado.`,
    );
    this.name = 'ResultadoTardioError';
  }
}
@Injectable()
export class ProcesadorFacturacionService {
  private readonly logger = new Logger(ProcesadorFacturacionService.name);

  constructor(
    @InjectRepository(TrabajoFacturacion)
    private readonly trabajoRepository: Repository<TrabajoFacturacion>,

    @InjectRepository(IntentoFacturacion)
    private readonly intentoRepository: Repository<IntentoFacturacion>,

    private readonly simuladorProveedor: SimuladorProveedorService,

    private readonly dataSource: DataSource,
  ) {}

  @Cron('*/30 * * * * *')
  async revisarCola(): Promise<void> {
    const ahora = new Date();

    const trabajos = await this.trabajoRepository.find({
      where: [
        {
          estado: EstadoTrabajoFacturacion.PENDIENTE,
          proximo_intento: LessThanOrEqual(ahora),
        },
        {
          estado: EstadoTrabajoFacturacion.REINTENTO,
          proximo_intento: LessThanOrEqual(ahora),
        },
      ],
      order: {
        proximo_intento: 'ASC',
        id_trabajo: 'ASC',
      },
      take: 20,
    });

    for (const trabajo of trabajos) {
      try {
        await this.procesarTrabajo(trabajo);
      } catch (error) {
        this.logger.error(
          `Error procesando el trabajo ${trabajo.id_trabajo}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  private async procesarTrabajo(trabajo: TrabajoFacturacion): Promise<void> {
    const ahora = new Date();

    const reclamo = await this.dataSource.transaction(async (manager) => {
      // Reclamar el trabajo e incrementar el contador en la misma transacción.
      const resultadoReclamo = await manager
        .createQueryBuilder()
        .update(TrabajoFacturacion)

        .set({
          estado: EstadoTrabajoFacturacion.PROCESANDO,
          ultimo_intento: ahora,
          bloqueado_hasta: new Date(ahora.getTime() + 5 * 60 * 1000),
          intentos: () => '`intentos` + 1',
        })

        .where('id_trabajo = :id', {
          id: trabajo.id_trabajo,
        })
        .andWhere('estado IN (:...estados)', {
          estados: [
            EstadoTrabajoFacturacion.PENDIENTE,
            EstadoTrabajoFacturacion.REINTENTO,
          ],
        })
        .andWhere('proximo_intento <= :ahora', { ahora })
        .execute();

      // Otro proceso pudo reclamar el trabajo primero.
      if (resultadoReclamo.affected !== 1) {
        return null;
      }

      // Leer el contador ya incrementado.
      const trabajoActualizado = await manager.findOne(TrabajoFacturacion, {
        where: { id_trabajo: trabajo.id_trabajo },
      });

      if (!trabajoActualizado) {
        throw new Error(
          `No se encontró el trabajo ${trabajo.id_trabajo} después de reclamarlo.`,
        );
      }

      // Crear el historial dentro de la misma transacción.
      const intento = manager.create(IntentoFacturacion, {
        id_trabajo: trabajo.id_trabajo,
        numero_intento: trabajoActualizado.intentos,
        resultado: 'EN_PROCESO',
        codigo_respuesta: null,
        mensaje_respuesta: null,
        error: null,
      });

      const intentoGuardado = await manager.save(IntentoFacturacion, intento);

      return {
        trabajoActualizado,
        intento: intentoGuardado,
      };
    });

    if (!reclamo) {
      return;
    }

    const trabajoActualizado = reclamo.trabajoActualizado;
    const intento = reclamo.intento;
    const intentosActuales = trabajoActualizado.intentos;

    this.logger.log(
      `Procesando trabajo ${trabajo.id_trabajo}, factura ${trabajo.id_factura}, intento ${intentosActuales}.`,
    );

    // 4. Ejecutar el simulador.
    // Separamos esta llamada para distinguir sus excepciones de los errores
    // que puedan ocurrir al guardar el trabajo o el historial.
    let respuesta: Awaited<ReturnType<SimuladorProveedorService['transmitir']>>;

    try {
      respuesta = await this.simuladorProveedor.transmitir(
        trabajo.id_factura,
        trabajo.clave_idempotencia,
      );
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      const agotados = intentosActuales >= trabajoActualizado.max_intentos;

      const esperaMs = Math.min(
        30_000 * 2 ** (intentosActuales - 1),
        60 * 60 * 1000,
      );

      try {
        await this.guardarResultadoIntento(
          trabajo.id_trabajo,
          intento.id_intento,
          intentosActuales,
          {
            estado: agotados
              ? EstadoTrabajoFacturacion.ERROR_PERMANENTE
              : EstadoTrabajoFacturacion.REINTENTO,
            ultimo_error: mensaje,
            proximo_intento: agotados ? null : new Date(Date.now() + esperaMs),
          },
          {
            resultado: 'EXCEPCION',
            error: mensaje,
            mensaje_respuesta: mensaje,
          },
        );
      } catch (errorAlGuardar) {
        this.logger.error(
          `No fue posible guardar el resultado del intento ${intento.id_intento}: ${
            errorAlGuardar instanceof Error
              ? errorAlGuardar.message
              : String(errorAlGuardar)
          }`,
        );
        return;
      }

      this.logger.warn(
        `Trabajo ${trabajo.id_trabajo}: excepción durante la transmisión simulada.`,
      );

      return;
    }

    // 5. Guardar el resultado de la respuesta simulada.
    switch (respuesta.resultado) {
      case 'EXITO_SIMULADO':
        await this.guardarResultadoIntento(
          trabajo.id_trabajo,
          intento.id_intento,
          intentosActuales,
          {
            estado: EstadoTrabajoFacturacion.SIMULADO,
            respuesta_proveedor: { ...respuesta },
            ultimo_error: null,
            proximo_intento: null,
          },
          {
            resultado: 'EXITO_SIMULADO',
            codigo_respuesta: respuesta.codigo,
            mensaje_respuesta: respuesta.mensaje,
            error: null,
          },
        );

        this.logger.warn(
          `Trabajo ${trabajo.id_trabajo}: simulación exitosa. No es una aceptación real de la DIAN.`,
        );
        return;

      case 'ERROR_TEMPORAL': {
        const agotados = intentosActuales >= trabajoActualizado.max_intentos;

        const esperaMs = Math.min(
          30_000 * 2 ** (intentosActuales - 1),
          60 * 60 * 1000,
        );

        await this.guardarResultadoIntento(
          trabajo.id_trabajo,
          intento.id_intento,
          intentosActuales,
          {
            estado: agotados
              ? EstadoTrabajoFacturacion.ERROR_PERMANENTE
              : EstadoTrabajoFacturacion.REINTENTO,
            respuesta_proveedor: { ...respuesta },
            ultimo_error: respuesta.mensaje,
            proximo_intento: agotados ? null : new Date(Date.now() + esperaMs),
          },
          {
            resultado: 'ERROR_TEMPORAL',
            codigo_respuesta: respuesta.codigo,
            mensaje_respuesta: respuesta.mensaje,
            error: respuesta.mensaje,
          },
        );

        if (agotados) {
          this.logger.error(
            `Trabajo ${trabajo.id_trabajo}: se agotaron los intentos.`,
          );
        } else {
          this.logger.warn(
            `Trabajo ${trabajo.id_trabajo}: error temporal. Nuevo intento en ${Math.round(esperaMs / 1000)} segundos.`,
          );
        }

        return;
      }

      case 'RECHAZO_PERMANENTE':
        await this.guardarResultadoIntento(
          trabajo.id_trabajo,
          intento.id_intento,
          intentosActuales,
          {
            estado: EstadoTrabajoFacturacion.ERROR_PERMANENTE,
            respuesta_proveedor: { ...respuesta },
            ultimo_error: respuesta.mensaje,
            proximo_intento: null,
          },
          {
            resultado: 'RECHAZO_PERMANENTE',
            codigo_respuesta: respuesta.codigo,
            mensaje_respuesta: respuesta.mensaje,
            error: respuesta.mensaje,
          },
        );

        this.logger.error(
          `Trabajo ${trabajo.id_trabajo}: rechazo permanente simulado.`,
        );
        return;
    }
  }
  @Cron('0 * * * * *')
  async recuperarTrabajosBloqueados(): Promise<void> {
    const ahora = new Date();

    try {
      const agotados = await this.trabajoRepository
        .createQueryBuilder()
        .update(TrabajoFacturacion)
        .set({
          estado: EstadoTrabajoFacturacion.ERROR_PERMANENTE,
          bloqueado_hasta: null,
          proximo_intento: null,
          ultimo_error:
            'Trabajo recuperado después de vencer su bloqueo; se agotaron los intentos.',
        })
        .where('estado = :estado', {
          estado: EstadoTrabajoFacturacion.PROCESANDO,
        })
        .andWhere('bloqueado_hasta IS NOT NULL')
        .andWhere('bloqueado_hasta <= :ahora', { ahora })
        .andWhere('intentos >= max_intentos')
        .execute();

      const recuperados = await this.trabajoRepository
        .createQueryBuilder()
        .update(TrabajoFacturacion)
        .set({
          estado: EstadoTrabajoFacturacion.REINTENTO,
          bloqueado_hasta: null,
          proximo_intento: ahora,
          ultimo_error:
            'Trabajo recuperado automáticamente después de vencer su bloqueo.',
        })
        .where('estado = :estado', {
          estado: EstadoTrabajoFacturacion.PROCESANDO,
        })
        .andWhere('bloqueado_hasta IS NOT NULL')
        .andWhere('bloqueado_hasta <= :ahora', { ahora })
        .andWhere('intentos < max_intentos')
        .execute();

      const cantidadAgotados = agotados.affected ?? 0;
      const cantidadRecuperados = recuperados.affected ?? 0;

      if (cantidadAgotados > 0 || cantidadRecuperados > 0) {
        this.logger.warn(
          `Recuperación de cola: ${cantidadRecuperados} trabajo(s) reprogramado(s), ${cantidadAgotados} con intentos agotados.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `No fue posible recuperar trabajos bloqueados: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async reintentarTrabajo(idTrabajo: number): Promise<void> {
    const trabajo = await this.trabajoRepository.findOne({
      where: { id_trabajo: idTrabajo },
    });

    if (!trabajo) {
      throw new NotFoundException(
        `No existe el trabajo de facturación ${idTrabajo}.`,
      );
    }

    if (trabajo.estado !== EstadoTrabajoFacturacion.ERROR_PERMANENTE) {
      throw new BadRequestException(
        'Solo se pueden reintentar trabajos en ERROR_PERMANENTE.',
      );
    }

    const resultado = await this.trabajoRepository
      .createQueryBuilder()
      .update(TrabajoFacturacion)
      .set({
        estado: EstadoTrabajoFacturacion.PENDIENTE,
        max_intentos: () =>
          'CASE WHEN `intentos` >= `max_intentos` ' +
          'THEN `max_intentos` + 10 ELSE `max_intentos` END',
        proximo_intento: new Date(),
        ultimo_error: null,
      })
      .where('id_trabajo = :id', { id: idTrabajo })
      .andWhere('estado = :estado', {
        estado: EstadoTrabajoFacturacion.ERROR_PERMANENTE,
      })
      .execute();

    if (resultado.affected !== 1) {
      throw new BadRequestException(
        'El trabajo cambió de estado. Consulta su estado actual antes de reintentarlo.',
      );
    }

    const presupuestoAmpliado = trabajo.intentos >= trabajo.max_intentos;

    this.logger.warn(
      presupuestoAmpliado
        ? `Trabajo ${idTrabajo} reprogramado manualmente. Se conservaron los intentos históricos y se concedieron 10 intentos adicionales.`
        : `Trabajo ${idTrabajo} reprogramado manualmente. Se conservó el contador de intentos.`,
    );
  }

  private async guardarResultadoIntento(
    idTrabajo: number,
    idIntento: number,
    numeroIntento: number,
    actualizacionTrabajo: Partial<TrabajoFacturacion>,
    actualizacionIntento: Partial<IntentoFacturacion>,
  ): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const resultadoTrabajo = await manager.update(
          TrabajoFacturacion,
          {
            id_trabajo: idTrabajo,
            estado: EstadoTrabajoFacturacion.PROCESANDO,
            intentos: numeroIntento,
          },
          {
            ...actualizacionTrabajo,
            bloqueado_hasta: null,
          },
        );

        if (resultadoTrabajo.affected !== 1) {
          throw new ResultadoTardioError(idTrabajo);
        }

        const resultadoIntento = await manager.update(
          IntentoFacturacion,
          { id_intento: idIntento },
          actualizacionIntento,
        );

        if (resultadoIntento.affected !== 1) {
          throw new Error(
            `No se encontró el intento ${idIntento} para guardar su resultado.`,
          );
        }
      });
    } catch (error) {
      if (!(error instanceof ResultadoTardioError)) {
        throw error;
      }

      const resultadoTardio = await this.dataSource
        .getRepository(IntentoFacturacion)
        .update(
          { id_intento: idIntento },
          {
            ...actualizacionIntento,
            resultado: 'RESULTADO_TARDIO',
          },
        );

      if (resultadoTardio.affected !== 1) {
        throw new Error(
          `No se pudo registrar el resultado tardío del intento ${idIntento}.`,
        );
      }

      this.logger.warn(
        `El intento ${numeroIntento} del trabajo ${idTrabajo} recibió una respuesta tardía. Se registró en el historial sin modificar el trabajo.`,
      );
    }
  }
}

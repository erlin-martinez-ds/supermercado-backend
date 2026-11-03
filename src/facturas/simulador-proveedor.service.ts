import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrabajoFacturacion } from './entities/trabajo-facturacion.entity';

export type ResultadoSimulado =
  'EXITO_SIMULADO' | 'ERROR_TEMPORAL' | 'RECHAZO_PERMANENTE';

export interface RespuestaSimulada {
  resultado: ResultadoSimulado;
  mensaje: string;
  codigo: string;
  fecha_respuesta: string;
  clave_idempotencia: string;
}

@Injectable()
export class SimuladorProveedorService {
  constructor(
    @InjectRepository(TrabajoFacturacion)
    private readonly trabajoRepository: Repository<TrabajoFacturacion>,
  ) {}

  async transmitir(
    idFactura: number,
    claveIdempotencia: string,
  ): Promise<RespuestaSimulada> {
    // 1. Buscar el trabajo asociado a la clave.
    const trabajo = await this.trabajoRepository.findOne({
      where: { clave_idempotencia: claveIdempotencia },
    });

    if (!trabajo) {
      throw new Error(
        'No existe un trabajo de facturación asociado a esta clave.',
      );
    }

    if (trabajo.id_factura !== idFactura) {
      throw new Error(
        'La clave de idempotencia ya está asociada a otra factura.',
      );
    }

    // 2. Recuperar una respuesta definitiva si ya existe.
    const respuestaAnterior =
      trabajo.respuesta_proveedor as RespuestaSimulada | null;

    if (
      respuestaAnterior &&
      (respuestaAnterior.resultado === 'EXITO_SIMULADO' ||
        respuestaAnterior.resultado === 'RECHAZO_PERMANENTE') &&
      respuestaAnterior.clave_idempotencia === claveIdempotencia
    ) {
      return respuestaAnterior;
    }

    // 3. Determinar el resultado de la simulación.
    const resultado = this.obtenerResultado(idFactura);

    const respuesta: RespuestaSimulada = {
      resultado,
      codigo:
        resultado === 'EXITO_SIMULADO'
          ? 'SIM-200'
          : resultado === 'ERROR_TEMPORAL'
            ? 'SIM-503'
            : 'SIM-422',
      mensaje:
        resultado === 'EXITO_SIMULADO'
          ? 'Respuesta simulada exitosa. No representa una aceptación real de la DIAN.'
          : resultado === 'ERROR_TEMPORAL'
            ? 'Error temporal simulado de conexión con el proveedor.'
            : 'Rechazo permanente simulado. Se requiere revisar los datos del documento.',
      fecha_respuesta: new Date().toISOString(),
      clave_idempotencia: claveIdempotencia,
    };

    // 4. Persistir solamente los resultados definitivos.
    if (resultado === 'EXITO_SIMULADO' || resultado === 'RECHAZO_PERMANENTE') {
      const actualizacion = await this.trabajoRepository.update(
        {
          id_trabajo: trabajo.id_trabajo,
          id_factura: idFactura,
          clave_idempotencia: claveIdempotencia,
        },
        {
          respuesta_proveedor: respuesta,
        },
      );

      if (actualizacion.affected !== 1) {
        throw new Error(
          `No fue posible guardar la respuesta del trabajo ${trabajo.id_trabajo}.`,
        );
      }
    }

    return respuesta;
  }

  private obtenerResultado(idFactura: number): ResultadoSimulado {
    if (idFactura % 2 === 0) {
      return 'EXITO_SIMULADO';
    }

    if (idFactura % 3 === 0) {
      return 'ERROR_TEMPORAL';
    }

    return 'RECHAZO_PERMANENTE';
  }
}

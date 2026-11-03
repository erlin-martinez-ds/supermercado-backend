import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Factura } from './entities/factura.entity';
import { Venta } from '../ventas/entities/venta.entity/venta.entity';
import { DetalleVenta } from '../ventas/entities/detalle-venta.entity/detalle-venta.entity';
import { Inventario } from '../inventarios/entities/inventario.entity/inventario.entity';
import { MovimientoInventario } from '../movimientos-inventario/entities/movimiento-inventario.entity/movimiento-inventario.entity';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';
import { UsuarioSucursal } from '../usuario-sucursal/entities/usuario-sucursal.entity/usuario-sucursal.entity';
import { AuditoriasService } from '../auditorias/auditorias.service';
import {
  EstadoTrabajoFacturacion,
  TrabajoFacturacion,
} from './entities/trabajo-facturacion.entity';
@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    private readonly dataSource: DataSource,

    private readonly auditoriasService: AuditoriasService,
  ) {}

  private async obtenerAccesoSucursales(idUsuario: number) {
    const usuarioRolRepository = this.dataSource.getRepository(UsuarioRol);

    const usuarioSucursalRepository =
      this.dataSource.getRepository(UsuarioSucursal);

    const usuarioRoles = await usuarioRolRepository.find({
      where: { id_usuario: idUsuario },
      relations: { rol: true },
    });

    const nombresRoles = usuarioRoles.map(
      (usuarioRol) => usuarioRol.rol.nombre,
    );

    const tieneAccesoGlobal = [
      'Administrador',
      'Coordinador',
      'Contador',
      'Fiscal',
    ].some((rol) => nombresRoles.includes(rol));

    if (tieneAccesoGlobal) {
      return {
        tieneAccesoGlobal: true,
        idsSucursales: [] as number[],
      };
    }

    const asignaciones = await usuarioSucursalRepository.find({
      where: { id_usuario: idUsuario },
    });

    return {
      tieneAccesoGlobal: false,
      idsSucursales: asignaciones.map((asignacion) => asignacion.id_sucursal),
    };
  }

  async findAll(idUsuario: number): Promise<Factura[]> {
    const acceso = await this.obtenerAccesoSucursales(idUsuario);

    if (acceso.tieneAccesoGlobal) {
      return this.facturaRepository.find({
        relations: { venta: true },
        order: { id_factura: 'DESC' },
      });
    }

    if (acceso.idsSucursales.length === 0) {
      return [];
    }

    return this.facturaRepository
      .createQueryBuilder('factura')
      .leftJoinAndSelect('factura.venta', 'venta')
      .where('venta.id_sucursal IN (:...idsSucursales)', {
        idsSucursales: acceso.idsSucursales,
      })
      .orderBy('factura.id_factura', 'DESC')
      .getMany();
  }

  async findOne(id: number, idUsuario: number): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { id_factura: id },
      relations: { venta: true },
    });

    if (!factura) {
      throw new NotFoundException(`No se encontró la factura ${id}`);
    }

    const tieneAcceso = await this.usuarioTieneAccesoSucursal(
      idUsuario,
      factura.venta.id_sucursal,
    );

    if (!tieneAcceso) {
      throw new ForbiddenException(
        'No tiene acceso a las facturas de esta sucursal',
      );
    }

    return factura;
  }

  async findByVenta(idVenta: number, idUsuario: number): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { id_venta: idVenta },
      relations: { venta: true },
    });

    if (!factura) {
      throw new NotFoundException(
        `No existe una factura para la venta ${idVenta}`,
      );
    }

    const tieneAcceso = await this.usuarioTieneAccesoSucursal(
      idUsuario,
      factura.venta.id_sucursal,
    );

    if (!tieneAcceso) {
      throw new ForbiddenException(
        'No tiene acceso a las facturas de esta sucursal',
      );
    }

    return factura;
  }

  private async usuarioTieneAccesoSucursal(
    idUsuario: number,
    idSucursal: number,
  ): Promise<boolean> {
    const acceso = await this.obtenerAccesoSucursales(idUsuario);

    if (acceso.tieneAccesoGlobal) {
      return true;
    }

    return acceso.idsSucursales.includes(idSucursal);
  }

  async anular(idFactura: number, idUsuario: number): Promise<Factura> {
    return this.dataSource.transaction(async (manager) => {
      const factura = await manager.findOne(Factura, {
        where: { id_factura: idFactura },
        relations: { venta: true },
      });

      if (!factura) {
        throw new NotFoundException(`No se encontró la factura ${idFactura}`);
      }

      const tieneAcceso = await this.usuarioTieneAccesoSucursal(
        idUsuario,
        factura.venta.id_sucursal,
      );

      if (!tieneAcceso) {
        throw new ForbiddenException(
          'No tiene autorización para anular facturas de esta sucursal',
        );
      }

      return this.anularDesdeVenta(manager, factura.id_venta, idUsuario);
    });
  }

  async crearDesdeVenta(
    manager: EntityManager,
    idVenta: number,
    subtotal: number,
    totalDescuento: number,
    totalImpuesto: number,
    total: number,
  ): Promise<Factura> {
    const facturaExistente = await manager.findOne(Factura, {
      where: { id_venta: idVenta },
    });

    if (facturaExistente) {
      throw new BadRequestException(`La venta ${idVenta} ya tiene una factura`);
    }

    const numeroFactura = `FAC-${idVenta}`;

    const factura = manager.create(Factura, {
      id_venta: idVenta,
      numero_factura: numeroFactura,
      fecha_emision: new Date(),
      subtotal,
      total_descuento: totalDescuento,
      total_impuesto: totalImpuesto,
      total,
      estado: 'EMITIDA',
    });

    const facturaGuardada = await manager.save(Factura, factura);

    const trabajo = manager.create(TrabajoFacturacion, {
      id_factura: facturaGuardada.id_factura,
      clave_idempotencia: `FACTURA-${facturaGuardada.id_factura}`,
      estado: EstadoTrabajoFacturacion.PENDIENTE,
      intentos: 0,
      max_intentos: 10,
      proximo_intento: new Date(),
      ultimo_intento: null,
      ultimo_error: null,
      respuesta_proveedor: null,
    });

    await manager.save(TrabajoFacturacion, trabajo);

    return facturaGuardada;
  }

  async anularDesdeVenta(
    manager: EntityManager,
    idVenta: number,
    idUsuario: number,
  ): Promise<Factura> {
    const venta = await manager.findOne(Venta, {
      where: { id_venta: idVenta },
      lock: { mode: 'pessimistic_write' },
    });

    if (!venta) {
      throw new NotFoundException(`No se encontró la venta ${idVenta}`);
    }

    const factura = await manager.findOne(Factura, {
      where: { id_venta: idVenta },
    });

    if (!factura) {
      throw new NotFoundException(
        `No existe una factura para la venta ${idVenta}`,
      );
    }

    if (venta.estado === 'ANULADA' && factura.estado === 'ANULADA') {
      throw new BadRequestException(
        `La venta ${idVenta} y su factura ya están anuladas`,
      );
    }

    const ventaYaAnulada = venta.estado === 'ANULADA';

    if (!ventaYaAnulada) {
      const detalles = await manager.find(DetalleVenta, {
        where: { id_venta: idVenta },
      });

      for (const detalle of detalles) {
        const inventario = await manager.findOne(Inventario, {
          where: {
            id_producto: detalle.id_producto,
            id_sucursal: venta.id_sucursal,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!inventario) {
          throw new NotFoundException(
            `No existe inventario para el producto ${detalle.id_producto}`,
          );
        }

        const stockAnterior = Number(inventario.cantidad);
        const cantidad = Number(detalle.cantidad);
        const stockNuevo = Number((stockAnterior + cantidad).toFixed(3));

        inventario.cantidad = stockNuevo;
        await manager.save(Inventario, inventario);

        const movimiento = manager.create(MovimientoInventario, {
          id_producto: detalle.id_producto,
          id_sucursal: venta.id_sucursal,
          id_usuario: idUsuario,
          tipo_movimiento: 'AJUSTE_ENTRADA',
          cantidad,
          cantidad_anterior: stockAnterior,
          cantidad_nueva: stockNuevo,
          observacion: `Anulación de venta ${idVenta}`,
        });

        await manager.save(MovimientoInventario, movimiento);
      }

      venta.estado = 'ANULADA';
      await manager.save(Venta, venta);
    }

    factura.estado = 'ANULADA';

    const facturaAnulada = await manager.save(Factura, factura);

    await this.auditoriasService.registrar(manager, {
      id_usuario: idUsuario,
      id_sucursal: venta.id_sucursal,
      accion: 'ANULAR',
      entidad: 'ventas',
      id_registro: String(venta.id_venta),
      datos_anteriores: { estado: ventaYaAnulada ? 'ANULADA' : 'CONFIRMADA' },
      datos_nuevos: { estado: 'ANULADA' },
      observacion: ventaYaAnulada
        ? `Factura de la venta ${venta.id_venta} anulada`
        : `Venta ${venta.id_venta} anulada y stock restaurado`,
    });

    return facturaAnulada;
  }
}

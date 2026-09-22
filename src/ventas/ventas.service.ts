import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, EntityManager, Repository } from 'typeorm';

import { Venta } from './entities/venta.entity/venta.entity';
import { DetalleVenta } from './entities/detalle-venta.entity/detalle-venta.entity';
import { PagoVenta } from './entities/pago-venta.entity/pago-venta.entity';

import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Inventario } from '../inventarios/entities/inventario.entity/inventario.entity';
import { MovimientoInventario } from '../movimientos-inventario/entities/movimiento-inventario.entity/movimiento-inventario.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { UsuarioSucursal } from '../usuario-sucursal/entities/usuario-sucursal.entity/usuario-sucursal.entity';
import { MetodoPago } from '../metodos-pago/entities/metodo-pago.entity/metodo-pago.entity';

import { CreateVentaDto } from './dto/create-venta.dto';

import { AuditoriasService } from '../auditorias/auditorias.service';
import { Impuesto } from '../impuestos/entities/impuesto.entity/impuesto.entity';
import { FacturasService } from '../facturas/facturas.service';
import { SesionCaja } from '../sesiones-caja/entities/sesion-caja.entity/sesion-caja.entity';

type DetalleVentaCalculado = {
  id_producto: number;
  id_impuesto: number;
  cantidad: number;
  precio_unitario: number;
  porcentaje_descuento: number;
  subtotal: number;
  valor_descuento: number;
  porcentaje_impuesto: number;
  valor_impuesto: number;
  total: number;
};

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,

    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository: Repository<DetalleVenta>,

    @InjectRepository(PagoVenta)
    private readonly pagoVentaRepository: Repository<PagoVenta>,

    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,

    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,

    @InjectRepository(MovimientoInventario)
    private readonly movimientoRepository: Repository<MovimientoInventario>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(UsuarioSucursal)
    private readonly usuarioSucursalRepository: Repository<UsuarioSucursal>,

    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,

    private readonly dataSource: DataSource,

    private readonly auditoriasService: AuditoriasService,

    @InjectRepository(Impuesto)
    private readonly impuestoRepository: Repository<Impuesto>,

    private readonly facturasService: FacturasService,

    @InjectRepository(SesionCaja)
    private readonly sesionCajaRepository: Repository<SesionCaja>,
  ) {}

  async findAll() {
    return this.ventaRepository.find({
      relations: { sucursal: true, usuario: true },
      order: {
        id_venta: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const venta = await this.ventaRepository.findOne({
      where: {
        id_venta: id,
      },
      relations: { sucursal: true, usuario: true },
    });

    if (!venta) {
      throw new NotFoundException(`No se encontró la venta ${id}`);
    }

    const detalles = await this.detalleVentaRepository.find({
      where: {
        id_venta: id,
      },
      relations: {
        producto: true,
        impuesto: true,
      },
    });

    const pagos = await this.pagoVentaRepository.find({
      where: {
        id_venta: id,
      },
      relations: { metodo_pago: true },
    });

    return {
      ...venta,
      detalles,
      pagos,
    };
  }

  async create(dto: CreateVentaDto, idUsuario: number) {
    if (!dto.detalles || dto.detalles.length === 0) {
      throw new BadRequestException('La venta debe tener al menos un detalle');
    }

    if (!dto.pagos || dto.pagos.length === 0) {
      throw new BadRequestException('La venta debe tener al menos un pago');
    }

    const sucursal = await this.sucursalRepository.findOne({
      where: {
        id_sucursal: dto.id_sucursal,
      },
    });

    if (!sucursal) {
      throw new NotFoundException(
        `No se encontró la sucursal ${dto.id_sucursal}`,
      );
    }

    const usuario = await this.usuarioRepository.findOne({
      where: {
        id_usuario: idUsuario,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`No se encontró el usuario ${idUsuario}`);
    }

    const accesoSucursal = await this.usuarioSucursalRepository.findOne({
      where: {
        id_usuario: idUsuario,
        id_sucursal: dto.id_sucursal,
      },
    });

    if (!accesoSucursal) {
      throw new ForbiddenException(
        'El usuario no tiene acceso a la sucursal indicada',
      );
    }

    const productos = new Map<number, Producto>();

    for (const detalle of dto.detalles) {
      if (productos.has(detalle.id_producto)) {
        throw new ConflictException(
          `El producto ${detalle.id_producto} está repetido en la venta`,
        );
      }

      const producto = await this.productoRepository.findOne({
        where: {
          id_producto: detalle.id_producto,
        },
      });

      if (!producto) {
        throw new NotFoundException(
          `No se encontró el producto ${detalle.id_producto}`,
        );
      }

      productos.set(detalle.id_producto, producto);
    }

    let total = 0;

    const detallesCalculados: DetalleVentaCalculado[] = [];

    for (const detalle of dto.detalles) {
      const producto = productos.get(detalle.id_producto);

      if (!producto) {
        throw new NotFoundException(
          `No se encontró el producto ${detalle.id_producto}`,
        );
      }

      const impuesto = await this.impuestoRepository.findOne({
        where: {
          id_impuesto: detalle.id_impuesto,
        },
      });

      if (!impuesto) {
        throw new NotFoundException(
          `No se encontró el impuesto ${detalle.id_impuesto}`,
        );
      }

      if (impuesto.estado !== 'ACTIVO') {
        throw new BadRequestException(
          `El impuesto "${impuesto.nombre}" está inactivo`,
        );
      }

      const precioUnitario = Number(producto.precio_venta);
      const subtotal = Number((detalle.cantidad * precioUnitario).toFixed(2));

      const porcentajeDescuento = Number(
        detalle.porcentaje_descuento.toFixed(2),
      );

      const valorDescuento = Number(
        ((subtotal * porcentajeDescuento) / 100).toFixed(2),
      );

      const baseImponible = Number((subtotal - valorDescuento).toFixed(2));
      const porcentajeImpuesto = Number(impuesto.porcentaje);

      const valorImpuesto = Number(
        ((baseImponible * porcentajeImpuesto) / 100).toFixed(2),
      );

      const totalDetalle = Number((baseImponible + valorImpuesto).toFixed(2));

      total += totalDetalle;
      detallesCalculados.push({
        ...detalle,
        precio_unitario: precioUnitario,
        subtotal,
        valor_descuento: valorDescuento,
        porcentaje_impuesto: porcentajeImpuesto,
        valor_impuesto: valorImpuesto,
        total: totalDetalle,
      });
    }

    total = Number(total.toFixed(2));
    const subtotalFactura = Number(
      detallesCalculados
        .reduce((acumulado, detalle) => acumulado + detalle.subtotal, 0)
        .toFixed(2),
    );

    const totalDescuentoFactura = Number(
      detallesCalculados
        .reduce((acumulado, detalle) => acumulado + detalle.valor_descuento, 0)
        .toFixed(2),
    );

    const totalImpuestoFactura = Number(
      detallesCalculados
        .reduce((acumulado, detalle) => acumulado + detalle.valor_impuesto, 0)
        .toFixed(2),
    );
    let totalPagos = 0;

    for (const pago of dto.pagos) {
      const metodoPago = await this.metodoPagoRepository.findOne({
        where: {
          id_metodo_pago: pago.id_metodo_pago,
        },
      });

      if (!metodoPago) {
        throw new NotFoundException(
          `No se encontró el método de pago ${pago.id_metodo_pago}`,
        );
      }

      if (metodoPago.estado !== 'ACTIVO') {
        throw new BadRequestException(
          `El método de pago "${metodoPago.nombre}" está inactivo`,
        );
      }

      totalPagos += pago.monto;

      if (
        metodoPago.nombre.toLowerCase() === 'transferencia' &&
        !pago.referencia
      ) {
        throw new BadRequestException(
          'La transferencia requiere una referencia',
        );
      }
    }

    totalPagos = Number(totalPagos.toFixed(2));

    if (totalPagos !== total) {
      throw new BadRequestException(
        `El total de los pagos (${totalPagos}) debe coincidir con el total de la venta (${total})`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const sesionCaja = await manager.findOne(SesionCaja, {
        where: {
          id_sesion_caja: dto.id_sesion_caja,
        },
        relations: {
          caja: true,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!sesionCaja) {
        throw new NotFoundException(
          `No se encontró la sesión de caja con ID ${dto.id_sesion_caja}`,
        );
      }

      if (sesionCaja.estado !== 'ABIERTA') {
        throw new BadRequestException(
          'No se puede registrar una venta en una sesión de caja cerrada',
        );
      }

      if (sesionCaja.caja.id_sucursal !== dto.id_sucursal) {
        throw new BadRequestException(
          'La sesión de caja no pertenece a la sucursal indicada',
        );
      }

      const venta = manager.create(Venta, {
        id_sucursal: dto.id_sucursal,
        id_sesion_caja: dto.id_sesion_caja,
        id_usuario: idUsuario,
        total,
        estado: 'CONFIRMADA',
        observaciones: dto.observaciones ?? null,
      });

      const ventaGuardada = await manager.save(Venta, venta);

      for (const detalle of detallesCalculados) {
        const inventario = await manager.findOne(Inventario, {
          where: {
            id_producto: detalle.id_producto,
            id_sucursal: dto.id_sucursal,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (!inventario) {
          throw new NotFoundException(
            `No existe inventario para el producto ${detalle.id_producto} en la sucursal ${dto.id_sucursal}`,
          );
        }

        const stockAnterior = Number(inventario.cantidad);

        if (stockAnterior < detalle.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para el producto ${detalle.id_producto}. Disponible: ${stockAnterior}, solicitado: ${detalle.cantidad}`,
          );
        }

        const stockNuevo = Number(
          (stockAnterior - detalle.cantidad).toFixed(3),
        );

        inventario.cantidad = stockNuevo;

        await manager.save(Inventario, inventario);

        const detalleVenta = manager.create(DetalleVenta, {
          id_venta: ventaGuardada.id_venta,
          id_producto: detalle.id_producto,
          id_impuesto: detalle.id_impuesto,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          subtotal: detalle.subtotal,
          porcentaje_descuento: detalle.porcentaje_descuento,
          valor_descuento: detalle.valor_descuento,
          porcentaje_impuesto: detalle.porcentaje_impuesto,
          valor_impuesto: detalle.valor_impuesto,
          total: detalle.total,
        });

        await manager.save(DetalleVenta, detalleVenta);

        const movimiento = manager.create(MovimientoInventario, {
          id_producto: detalle.id_producto,
          id_sucursal: dto.id_sucursal,
          id_usuario: idUsuario,
          tipo_movimiento: 'VENTA',
          cantidad: detalle.cantidad,
          cantidad_anterior: stockAnterior,
          cantidad_nueva: stockNuevo,
          observacion: `Venta ${ventaGuardada.id_venta}`,
        });

        await manager.save(MovimientoInventario, movimiento);
      }

      for (const pago of dto.pagos) {
        const pagoVenta = manager.create(PagoVenta, {
          id_venta: ventaGuardada.id_venta,
          id_metodo_pago: pago.id_metodo_pago,
          monto: pago.monto,
          referencia: pago.referencia ?? null,
        });

        await manager.save(PagoVenta, pagoVenta);
      }
      await this.facturasService.crearDesdeVenta(
        manager,
        ventaGuardada.id_venta,
        subtotalFactura,
        totalDescuentoFactura,
        totalImpuestoFactura,
        total,
      );

      await this.auditoriasService.registrar(manager, {
        id_usuario: ventaGuardada.id_usuario,
        id_sucursal: ventaGuardada.id_sucursal,
        accion: 'CREATE',
        entidad: 'ventas',
        id_registro: String(ventaGuardada.id_venta),
        datos_nuevos: {
          estado: ventaGuardada.estado,
          total: ventaGuardada.total,
        },
        observacion: `Venta ${ventaGuardada.id_venta} registrada y confirmada`,
      });

      return this.findOneWithManager(manager, ventaGuardada.id_venta);
    });
  }

  async anular(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const venta = await manager.findOne(Venta, {
        where: {
          id_venta: id,
        },
      });

      if (!venta) {
        throw new NotFoundException(`No se encontró la venta ${id}`);
      }

      if (venta.estado === 'ANULADA') {
        throw new BadRequestException('La venta ya se encuentra anulada');
      }

      const detalles = await manager.find(DetalleVenta, {
        where: {
          id_venta: id,
        },
      });

      for (const detalle of detalles) {
        const inventario = await manager.findOne(Inventario, {
          where: {
            id_producto: detalle.id_producto,
            id_sucursal: venta.id_sucursal,
          },
        });

        if (!inventario) {
          throw new NotFoundException(
            `No existe inventario para el producto ${detalle.id_producto}`,
          );
        }

        const stockAnterior = Number(inventario.cantidad);

        const stockNuevo = Number(
          (stockAnterior + Number(detalle.cantidad)).toFixed(3),
        );

        inventario.cantidad = stockNuevo;

        await manager.save(Inventario, inventario);

        const movimiento = manager.create(MovimientoInventario, {
          id_producto: detalle.id_producto,
          id_sucursal: venta.id_sucursal,
          id_usuario: venta.id_usuario,
          tipo_movimiento: 'AJUSTE_ENTRADA',
          cantidad: Number(detalle.cantidad),
          cantidad_anterior: stockAnterior,
          cantidad_nueva: stockNuevo,
          observacion: `Anulación de venta ${id}`,
        });

        await manager.save(MovimientoInventario, movimiento);
      }

      venta.estado = 'ANULADA';

      await manager.save(Venta, venta);
      await this.facturasService.anularDesdeVenta(manager, venta.id_venta);
      await this.auditoriasService.registrar(manager, {
        id_usuario: venta.id_usuario,
        id_sucursal: venta.id_sucursal,
        accion: 'ANULAR',
        entidad: 'ventas',
        id_registro: String(venta.id_venta),
        datos_anteriores: {
          estado: 'CONFIRMADA',
        },
        datos_nuevos: {
          estado: 'ANULADA',
        },
        observacion: `Venta ${venta.id_venta} anulada y stock restaurado`,
      });

      return this.findOneWithManager(manager, id);
    });
  }

  private async findOneWithManager(manager: EntityManager, id: number) {
    const venta = await manager.findOne(Venta, {
      where: {
        id_venta: id,
      },
      relations: { sucursal: true, usuario: true },
    });

    const detalles = await manager.find(DetalleVenta, {
      where: {
        id_venta: id,
      },
      relations: {
        producto: true,
        impuesto: true,
      },
    });

    const pagos = await manager.find(PagoVenta, {
      where: {
        id_venta: id,
      },
      relations: { metodo_pago: true },
    });

    return {
      ...venta,
      detalles,
      pagos,
    };
  }
}

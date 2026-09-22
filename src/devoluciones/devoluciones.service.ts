import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { Devolucion } from './entities/devolucion.entity/devolucion.entity';
import { DetalleDevolucion } from './entities/detalle-devolucion.entity/detalle-devolucion.entity';

import { Venta } from '../ventas/entities/venta.entity/venta.entity';
import { Compra } from '../compras/entities/compra.entity/compra.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { Inventario } from '../inventarios/entities/inventario.entity/inventario.entity';
import { MovimientoInventario } from '../movimientos-inventario/entities/movimiento-inventario.entity/movimiento-inventario.entity';

import { CreateDevolucionDto } from './dto/create-devolucion.dto';

import { AuditoriasService } from '../auditorias/auditorias.service';

@Injectable()
export class DevolucionesService {
  constructor(
    @InjectRepository(Devolucion)
    private readonly devolucionRepository: Repository<Devolucion>,

    @InjectRepository(DetalleDevolucion)
    private readonly detalleDevolucionRepository: Repository<DetalleDevolucion>,

    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,

    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,

    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,

    @InjectRepository(MovimientoInventario)
    private readonly movimientoInventarioRepository: Repository<MovimientoInventario>,

    private readonly dataSource: DataSource,

    private readonly auditoriasService: AuditoriasService,
  ) {}

  async findAll() {
    return this.devolucionRepository.find({
      relations: { sucursal: true, usuario: true, venta: true, compra: true },
      order: {
        id_devolucion: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const devolucion = await this.devolucionRepository.findOne({
      where: {
        id_devolucion: id,
      },
      relations: { sucursal: true, usuario: true, venta: true, compra: true },
    });

    if (!devolucion) {
      throw new NotFoundException(`No se encontró la devolución con ID ${id}`);
    }

    const detalles = await this.detalleDevolucionRepository.find({
      where: {
        id_devolucion: id,
      },
      relations: { producto: true },
    });

    return {
      ...devolucion,
      detalles,
    };
  }

  async create(dto: CreateDevolucionDto) {
    const {
      id_sucursal,
      id_usuario,
      id_venta,
      id_compra,
      tipo,
      observaciones,
      detalles,
    } = dto;

    if (!detalles || detalles.length === 0) {
      throw new BadRequestException(
        'La devolución debe tener al menos un detalle',
      );
    }

    /*
     * Una devolución debe estar asociada
     * a una venta o a una compra, pero no a ambas.
     */
    if (!id_venta && !id_compra) {
      throw new BadRequestException(
        'La devolución debe estar asociada a una venta o a una compra',
      );
    }

    if (id_venta && id_compra) {
      throw new ConflictException(
        'La devolución no puede estar asociada simultáneamente a una venta y a una compra',
      );
    }

    /*
     * CLIENTE -> debe existir una venta.
     * PROVEEDOR -> debe existir una compra.
     */
    if (tipo === 'CLIENTE' && !id_venta) {
      throw new BadRequestException(
        'Una devolución de tipo CLIENTE debe estar asociada a una venta',
      );
    }

    if (tipo === 'PROVEEDOR' && !id_compra) {
      throw new BadRequestException(
        'Una devolución de tipo PROVEEDOR debe estar asociada a una compra',
      );
    }

    if (tipo === 'CLIENTE' && id_compra) {
      throw new ConflictException(
        'Una devolución de tipo CLIENTE no puede estar asociada a una compra',
      );
    }

    if (tipo === 'PROVEEDOR' && id_venta) {
      throw new ConflictException(
        'Una devolución de tipo PROVEEDOR no puede estar asociada a una venta',
      );
    }

    const sucursal = await this.sucursalRepository.findOne({
      where: {
        id_sucursal,
      },
    });

    if (!sucursal) {
      throw new NotFoundException(
        `No se encontró la sucursal con ID ${id_sucursal}`,
      );
    }

    const usuario = await this.usuarioRepository.findOne({
      where: {
        id_usuario,
      },
    });

    if (!usuario) {
      throw new NotFoundException(
        `No se encontró el usuario con ID ${id_usuario}`,
      );
    }

    let venta: Venta | null = null;
    let compra: Compra | null = null;

    if (id_venta) {
      venta = await this.ventaRepository.findOne({
        where: {
          id_venta,
        },
      });

      if (!venta) {
        throw new NotFoundException(
          `No se encontró la venta con ID ${id_venta}`,
        );
      }

      if (venta.estado === 'ANULADA') {
        throw new ConflictException(
          'No se puede registrar una devolución sobre una venta anulada',
        );
      }
    }

    if (id_compra) {
      compra = await this.compraRepository.findOne({
        where: {
          id_compra,
        },
      });

      if (!compra) {
        throw new NotFoundException(
          `No se encontró la compra con ID ${id_compra}`,
        );
      }

      if (compra.estado !== 'CONFIRMADA') {
        throw new ConflictException(
          'Solo se puede devolver una compra confirmada',
        );
      }
    }

    const productosIds = detalles.map((detalle) => detalle.id_producto);

    const idsUnicos = new Set(productosIds);

    if (idsUnicos.size !== productosIds.length) {
      throw new ConflictException(
        'No se puede repetir el mismo producto dentro de una devolución',
      );
    }

    const productos = await this.productoRepository.find({
      where: { id_producto: In([...idsUnicos]) },
    });

    if (productos.length !== idsUnicos.size) {
      const idsEncontrados = productos.map((producto) => producto.id_producto);

      const productoNoEncontrado = [...idsUnicos].find(
        (id) => !idsEncontrados.includes(id),
      );

      throw new NotFoundException(
        `No se encontró el producto con ID ${productoNoEncontrado}`,
      );
    }

    /*
     * Obtenemos los detalles originales de la venta
     * o compra para poder validar cantidades y precios.
     */

    type DetalleOriginal = {
      id_producto: number;
      cantidad: number;
      precio_unitario: number;
    };

    let detallesOriginales: DetalleOriginal[] = [];

    if (venta) {
      detallesOriginales = (await this.dataSource
        .getRepository('detalle_ventas')
        .find({
          where: {
            id_venta: venta.id_venta,
          },
        })) as DetalleOriginal[];
    }

    if (compra) {
      detallesOriginales = (await this.dataSource
        .getRepository('detalle_compras')
        .find({
          where: {
            id_compra: compra.id_compra,
          },
        })) as DetalleOriginal[];
    }

    const detallesMap = new Map<number, DetalleOriginal>();

    for (const detalleOriginal of detallesOriginales) {
      detallesMap.set(Number(detalleOriginal.id_producto), detalleOriginal);
    }

    const detallesARegistrar: {
      id_producto: number;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
    }[] = [];

    for (const detalleDto of detalles) {
      const detalleOriginal = detallesMap.get(detalleDto.id_producto);

      if (!detalleOriginal) {
        throw new ConflictException(
          `El producto ${detalleDto.id_producto} no pertenece al documento original`,
        );
      }

      const cantidadOriginal = Number(detalleOriginal.cantidad);

      const cantidadDevolucion = Number(detalleDto.cantidad);

      if (cantidadDevolucion > cantidadOriginal) {
        throw new ConflictException(
          `La cantidad a devolver del producto ${detalleDto.id_producto} no puede superar la cantidad original (${cantidadOriginal})`,
        );
      }

      const precioUnitario = Number(detalleOriginal.precio_unitario);

      const subtotal = Number((cantidadDevolucion * precioUnitario).toFixed(2));

      detallesARegistrar.push({
        id_producto: detalleDto.id_producto,
        cantidad: cantidadDevolucion,
        precio_unitario: precioUnitario,
        subtotal,
      });
    }

    return this.dataSource.transaction(async (manager) => {
      const devolucion = manager.create(Devolucion, {
        id_sucursal,
        id_usuario,
        id_venta: id_venta ?? null,
        id_compra: id_compra ?? null,
        tipo,
        estado: 'REGISTRADA',
        observaciones: observaciones ?? null,
      });

      const devolucionGuardada = await manager.save(Devolucion, devolucion);

      for (const detalle of detallesARegistrar) {
        const detalleGuardado = manager.create(DetalleDevolucion, {
          id_devolucion: devolucionGuardada.id_devolucion,
          id_producto: detalle.id_producto,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          subtotal: detalle.subtotal,
        });

        await manager.save(DetalleDevolucion, detalleGuardado);
      }

      const devolucionCreada = await manager.findOne(Devolucion, {
        where: {
          id_devolucion: devolucionGuardada.id_devolucion,
        },
        relations: {
          sucursal: true,
          usuario: true,
          venta: true,
          compra: true,
        },
      });

      const detallesGuardados = await manager.find(DetalleDevolucion, {
        where: {
          id_devolucion: devolucionGuardada.id_devolucion,
        },
        relations: { producto: true },
      });

      await this.auditoriasService.registrar(manager, {
        id_usuario: devolucionGuardada.id_usuario,
        id_sucursal: devolucionGuardada.id_sucursal,
        accion: 'CREATE',
        entidad: 'devoluciones',
        id_registro: String(devolucionGuardada.id_devolucion),
        datos_nuevos: {
          estado: devolucionGuardada.estado,
          tipo: devolucionGuardada.tipo,
          id_venta: devolucionGuardada.id_venta,
          id_compra: devolucionGuardada.id_compra,
        },
        observacion: `Devolución ${devolucionGuardada.id_devolucion} registrada`,
      });

      return {
        ...devolucionCreada,
        detalles: detallesGuardados,
      };
    });
  }

  async confirmar(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const devolucion = await manager.findOne(Devolucion, {
        where: {
          id_devolucion: id,
        },
      });

      if (!devolucion) {
        throw new NotFoundException(
          `No se encontró la devolución con ID ${id}`,
        );
      }

      if (devolucion.estado !== 'REGISTRADA') {
        throw new ConflictException(
          `La devolución no se puede confirmar porque está en estado ${devolucion.estado}`,
        );
      }

      const detalles = await manager.find(DetalleDevolucion, {
        where: {
          id_devolucion: id,
        },
      });

      if (detalles.length === 0) {
        throw new BadRequestException('La devolución no tiene detalles');
      }

      for (const detalle of detalles) {
        const inventario = await manager.findOne(Inventario, {
          where: {
            id_producto: detalle.id_producto,
            id_sucursal: devolucion.id_sucursal,
          },
        });

        if (!inventario) {
          throw new NotFoundException(
            `No existe inventario para el producto ${detalle.id_producto} en la sucursal ${devolucion.id_sucursal}`,
          );
        }

        const stockAnterior = Number(inventario.cantidad);

        const cantidad = Number(detalle.cantidad);

        let nuevoStock: number;

        if (devolucion.tipo === 'CLIENTE') {
          nuevoStock = Number((stockAnterior + cantidad).toFixed(3));
        } else {
          if (stockAnterior < cantidad) {
            throw new ConflictException(
              `Stock insuficiente para devolver al proveedor el producto ${detalle.id_producto}. Disponible: ${stockAnterior}, solicitado: ${cantidad}`,
            );
          }

          nuevoStock = Number((stockAnterior - cantidad).toFixed(3));
        }

        inventario.cantidad = nuevoStock;

        await manager.save(Inventario, inventario);

        const tipoMovimiento =
          devolucion.tipo === 'CLIENTE'
            ? 'DEVOLUCION_CLIENTE'
            : 'DEVOLUCION_PROVEEDOR';

        const movimiento = manager.create(MovimientoInventario, {
          id_producto: detalle.id_producto,
          id_sucursal: devolucion.id_sucursal,
          id_usuario: devolucion.id_usuario,
          tipo_movimiento: tipoMovimiento,
          cantidad,
          cantidad_anterior: stockAnterior,
          cantidad_nueva: nuevoStock,
          observacion: `Confirmación de devolución ${id}`,
        });

        await manager.save(MovimientoInventario, movimiento);
      }

      devolucion.estado = 'CONFIRMADA';

      await manager.save(Devolucion, devolucion);

      await this.auditoriasService.registrar(manager, {
        id_usuario: devolucion.id_usuario,
        id_sucursal: devolucion.id_sucursal,
        accion: 'CONFIRMAR',
        entidad: 'devoluciones',
        id_registro: String(devolucion.id_devolucion),
        datos_anteriores: {
          estado: 'REGISTRADA',
        },
        datos_nuevos: {
          estado: 'CONFIRMADA',
          tipo: devolucion.tipo,
          id_venta: devolucion.id_venta,
          id_compra: devolucion.id_compra,
        },
        observacion: `Devolución ${devolucion.id_devolucion} confirmada y movimiento de inventario registrado`,
      });

      return {
        message: 'Devolución confirmada correctamente',
        devolucion,
      };
    });
  }

  async anular(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const devolucion = await manager.findOne(Devolucion, {
        where: {
          id_devolucion: id,
        },
      });

      if (!devolucion) {
        throw new NotFoundException(
          `No se encontró la devolución con ID ${id}`,
        );
      }

      if (devolucion.estado !== 'REGISTRADA') {
        throw new ConflictException(
          `La devolución no se puede anular porque está en estado ${devolucion.estado}`,
        );
      }

      devolucion.estado = 'ANULADA';

      await manager.save(Devolucion, devolucion);

      await this.auditoriasService.registrar(manager, {
        id_usuario: devolucion.id_usuario,
        id_sucursal: devolucion.id_sucursal,
        accion: 'ANULAR',
        entidad: 'devoluciones',
        id_registro: String(devolucion.id_devolucion),
        datos_anteriores: {
          estado: 'REGISTRADA',
        },
        datos_nuevos: {
          estado: 'ANULADA',
          tipo: devolucion.tipo,
          id_venta: devolucion.id_venta,
          id_compra: devolucion.id_compra,
        },
        observacion: `Devolución ${devolucion.id_devolucion} anulada`,
      });

      return devolucion;
    });
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { Transferencia } from './entities/transferencia.entity/transferencia.entity';
import { DetalleTransferencia } from './entities/detalle-transferencia.entity/detalle-transferencia.entity';

import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';

import { Inventario } from '../inventarios/entities/inventario.entity/inventario.entity';

import { MovimientoInventario } from '../movimientos-inventario/entities/movimiento-inventario.entity/movimiento-inventario.entity';

import { CreateTransferenciaDto } from './dto/create-transferencia.dto';

import { AuditoriasService } from '../auditorias/auditorias.service';

@Injectable()
export class TransferenciasService {
  constructor(
    @InjectRepository(Transferencia)
    private readonly transferenciaRepository: Repository<Transferencia>,

    @InjectRepository(DetalleTransferencia)
    private readonly detalleTransferenciaRepository: Repository<DetalleTransferencia>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,

    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,

    @InjectRepository(MovimientoInventario)
    private readonly movimientoInventarioRepository: Repository<MovimientoInventario>,

    private readonly dataSource: DataSource,

    private readonly auditoriasService: AuditoriasService,
  ) {}

  async findAll() {
    return this.transferenciaRepository.find({
      relations: {
        sucursal_origen: true,
        sucursal_destino: true,
        usuario: true,
      },
      order: {
        id_transferencia: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const transferencia = await this.transferenciaRepository.findOne({
      where: {
        id_transferencia: id,
      },
      relations: {
        sucursal_origen: true,
        sucursal_destino: true,
        usuario: true,
      },
    });

    if (!transferencia) {
      throw new NotFoundException(
        `No se encontró la transferencia con ID ${id}`,
      );
    }

    const detalles = await this.detalleTransferenciaRepository.find({
      where: {
        id_transferencia: id,
      },
      relations: { producto: true },
    });

    return {
      ...transferencia,
      detalles,
    };
  }

  async create(dto: CreateTransferenciaDto) {
    const {
      id_sucursal_origen,
      id_sucursal_destino,
      id_usuario,
      observaciones,
      detalles,
    } = dto;

    if (!detalles || detalles.length === 0) {
      throw new BadRequestException(
        'La transferencia debe tener al menos un detalle',
      );
    }

    if (id_sucursal_origen === id_sucursal_destino) {
      throw new ConflictException(
        'La sucursal de origen y destino no pueden ser la misma',
      );
    }

    const sucursalOrigen = await this.sucursalRepository.findOne({
      where: {
        id_sucursal: id_sucursal_origen,
      },
    });

    if (!sucursalOrigen) {
      throw new NotFoundException(
        `No se encontró la sucursal de origen con ID ${id_sucursal_origen}`,
      );
    }

    const sucursalDestino = await this.sucursalRepository.findOne({
      where: {
        id_sucursal: id_sucursal_destino,
      },
    });

    if (!sucursalDestino) {
      throw new NotFoundException(
        `No se encontró la sucursal de destino con ID ${id_sucursal_destino}`,
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

    const productosIds = detalles.map((detalle) => detalle.id_producto);

    const idsUnicos = new Set(productosIds);

    if (idsUnicos.size !== productosIds.length) {
      throw new ConflictException(
        'No se puede repetir el mismo producto dentro de una transferencia',
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

    return this.dataSource.transaction(async (manager) => {
      const transferencia = manager.create(Transferencia, {
        id_sucursal_origen,
        id_sucursal_destino,
        id_usuario,
        estado: 'RECIBIDA',
        observaciones: observaciones ?? null,
      });

      const transferenciaGuardada = await manager.save(
        Transferencia,
        transferencia,
      );

      for (const detalleDto of detalles) {
        const inventarioOrigen = await manager.findOne(Inventario, {
          where: {
            id_producto: detalleDto.id_producto,
            id_sucursal: id_sucursal_origen,
          },
        });

        if (!inventarioOrigen) {
          throw new NotFoundException(
            `No existe inventario para el producto ${detalleDto.id_producto} en la sucursal de origen`,
          );
        }

        const inventarioDestino = await manager.findOne(Inventario, {
          where: {
            id_producto: detalleDto.id_producto,
            id_sucursal: id_sucursal_destino,
          },
        });

        if (!inventarioDestino) {
          throw new NotFoundException(
            `No existe inventario para el producto ${detalleDto.id_producto} en la sucursal de destino`,
          );
        }

        const stockOrigen = Number(inventarioOrigen.cantidad);

        const cantidadTransferir = Number(detalleDto.cantidad);

        if (stockOrigen < cantidadTransferir) {
          throw new ConflictException(
            `Stock insuficiente para el producto ${detalleDto.id_producto}. Disponible: ${stockOrigen}, solicitado: ${cantidadTransferir}`,
          );
        }

        const stockDestino = Number(inventarioDestino.cantidad);

        const nuevoStockOrigen = Number(
          (stockOrigen - cantidadTransferir).toFixed(3),
        );

        const nuevoStockDestino = Number(
          (stockDestino + cantidadTransferir).toFixed(3),
        );

        inventarioOrigen.cantidad = nuevoStockOrigen;

        inventarioDestino.cantidad = nuevoStockDestino;

        await manager.save(Inventario, inventarioOrigen);

        await manager.save(Inventario, inventarioDestino);

        const detalle = manager.create(DetalleTransferencia, {
          id_transferencia: transferenciaGuardada.id_transferencia,
          id_producto: detalleDto.id_producto,
          cantidad: cantidadTransferir,
        });

        await manager.save(DetalleTransferencia, detalle);

        const movimientoSalida = manager.create(MovimientoInventario, {
          id_producto: detalleDto.id_producto,
          id_sucursal: id_sucursal_origen,
          id_usuario,
          tipo_movimiento: 'TRANSFERENCIA_SALIDA',
          cantidad: cantidadTransferir,
          cantidad_anterior: stockOrigen,
          cantidad_nueva: nuevoStockOrigen,
          observacion: `Transferencia ${transferenciaGuardada.id_transferencia} hacia sucursal ${id_sucursal_destino}`,
        });

        await manager.save(MovimientoInventario, movimientoSalida);

        const movimientoEntrada = manager.create(MovimientoInventario, {
          id_producto: detalleDto.id_producto,
          id_sucursal: id_sucursal_destino,
          id_usuario,
          tipo_movimiento: 'TRANSFERENCIA_ENTRADA',
          cantidad: cantidadTransferir,
          cantidad_anterior: stockDestino,
          cantidad_nueva: nuevoStockDestino,
          observacion: `Transferencia ${transferenciaGuardada.id_transferencia} desde sucursal ${id_sucursal_origen}`,
        });

        await manager.save(MovimientoInventario, movimientoEntrada);
      }

      const transferenciaCreada = await manager.findOne(Transferencia, {
        where: {
          id_transferencia: transferenciaGuardada.id_transferencia,
        },
        relations: {
          sucursal_origen: true,
          sucursal_destino: true,
          usuario: true,
        },
      });

      const detallesGuardados = await manager.find(DetalleTransferencia, {
        where: {
          id_transferencia: transferenciaGuardada.id_transferencia,
        },
        relations: { producto: true },
      });

      await this.auditoriasService.registrar(manager, {
        id_usuario: transferenciaGuardada.id_usuario,
        id_sucursal: transferenciaGuardada.id_sucursal_origen,
        accion: 'CREATE',
        entidad: 'transferencias',
        id_registro: String(transferenciaGuardada.id_transferencia),
        datos_nuevos: {
          estado: transferenciaGuardada.estado,
          id_sucursal_origen: transferenciaGuardada.id_sucursal_origen,
          id_sucursal_destino: transferenciaGuardada.id_sucursal_destino,
        },
        observacion: `Transferencia ${transferenciaGuardada.id_transferencia} realizada correctamente`,
      });

      return {
        ...transferenciaCreada,
        detalles: detallesGuardados,
      };
    });
  }
}

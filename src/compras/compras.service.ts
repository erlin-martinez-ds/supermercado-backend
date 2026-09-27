import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Compra } from './entities/compra.entity/compra.entity';
import { DetalleCompra } from './entities/detalle-compra.entity/detalle-compra.entity';

import { Proveedor } from '../proveedores/entities/proveedor.entity/proveedor.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Inventario } from '../inventarios/entities/inventario.entity/inventario.entity';
import { MovimientoInventario } from '../movimientos-inventario/entities/movimiento-inventario.entity/movimiento-inventario.entity';
import { UsuarioSucursal } from '../usuario-sucursal/entities/usuario-sucursal.entity/usuario-sucursal.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';

import { AuditoriasService } from '../auditorias/auditorias.service';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly comprasRepository: Repository<Compra>,

    @InjectRepository(DetalleCompra)
    private readonly detallesRepository: Repository<DetalleCompra>,

    @InjectRepository(Proveedor)
    private readonly proveedoresRepository: Repository<Proveedor>,

    @InjectRepository(Sucursal)
    private readonly sucursalesRepository: Repository<Sucursal>,

    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,

    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,

    @InjectRepository(Inventario)
    private readonly inventariosRepository: Repository<Inventario>,

    @InjectRepository(MovimientoInventario)
    private readonly movimientosRepository: Repository<MovimientoInventario>,

    private readonly dataSource: DataSource,
    private readonly auditoriasService: AuditoriasService,

    @InjectRepository(UsuarioSucursal)
    private readonly usuarioSucursalRepository: Repository<UsuarioSucursal>,

    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepository: Repository<UsuarioRol>,
  ) {}

  async findAll(idUsuario: number): Promise<Compra[]> {
    const rolesGlobales = [
      'Administrador',
      'Coordinador',
      'Contador',
      'Fiscal',
    ];

    const rolesUsuario = await this.usuarioRolRepository.find({
      where: { id_usuario: idUsuario },
      relations: { rol: true },
    });

    const tieneAccesoGlobal = rolesUsuario.some((usuarioRol) =>
      rolesGlobales.includes(usuarioRol.rol.nombre),
    );

    // Usuarios con acceso global pueden consultar todas las compras
    if (tieneAccesoGlobal) {
      return this.comprasRepository.find({
        relations: {
          proveedor: true,
          sucursal: true,
          usuario: true,
        },
        order: {
          id_compra: 'DESC',
        },
      });
    }

    // Usuarios operativos: solamente sucursales asignadas
    const asignaciones = await this.usuarioSucursalRepository.find({
      where: {
        id_usuario: idUsuario,
      },
    });

    const idsSucursales = asignaciones.map(
      (asignacion) => asignacion.id_sucursal,
    );

    if (idsSucursales.length === 0) {
      return [];
    }

    return this.comprasRepository
      .createQueryBuilder('compra')
      .leftJoinAndSelect('compra.proveedor', 'proveedor')
      .leftJoinAndSelect('compra.sucursal', 'sucursal')
      .leftJoinAndSelect('compra.usuario', 'usuario')
      .where('compra.id_sucursal IN (:...idsSucursales)', {
        idsSucursales,
      })
      .orderBy('compra.id_compra', 'DESC')
      .getMany();
  }

  async findOne(id: number, idUsuario: number): Promise<Compra> {
    const compra = await this.comprasRepository.findOne({
      where: {
        id_compra: id,
      },
      relations: {
        proveedor: true,
        sucursal: true,
        usuario: true,
      },
    });

    if (!compra) {
      throw new NotFoundException(`La compra con ID ${id} no existe`);
    }

    const rolesGlobales = [
      'Administrador',
      'Coordinador',
      'Contador',
      'Fiscal',
    ];

    const rolesUsuario = await this.usuarioRolRepository.find({
      where: {
        id_usuario: idUsuario,
      },
      relations: {
        rol: true,
      },
    });

    const tieneAccesoGlobal = rolesUsuario.some((usuarioRol) =>
      rolesGlobales.includes(usuarioRol.rol.nombre),
    );

    if (tieneAccesoGlobal) {
      return compra;
    }

    const accesoSucursal = await this.usuarioSucursalRepository.findOne({
      where: {
        id_usuario: idUsuario,
        id_sucursal: compra.id_sucursal,
      },
    });

    if (!accesoSucursal) {
      throw new ForbiddenException(
        'El usuario no tiene acceso a la sucursal de esta compra',
      );
    }

    return compra;
  }

  async create(
    createCompraDto: CreateCompraDto,
    idUsuario: number,
  ): Promise<Compra> {
    const { id_proveedor, id_sucursal, observaciones, detalles } =
      createCompraDto;

    if (!detalles || detalles.length === 0) {
      throw new BadRequestException('La compra debe tener al menos un detalle');
    }

    const proveedor = await this.proveedoresRepository.findOne({
      where: { id_proveedor },
    });

    if (!proveedor) {
      throw new NotFoundException(
        `El proveedor con ID ${id_proveedor} no existe`,
      );
    }

    const sucursal = await this.sucursalesRepository.findOne({
      where: { id_sucursal },
    });

    if (!sucursal) {
      throw new NotFoundException(
        `La sucursal con ID ${id_sucursal} no existe`,
      );
    }

    const usuario = await this.usuariosRepository.findOne({
      where: { id_usuario: idUsuario },
    });

    if (!usuario) {
      throw new NotFoundException(`El usuario con ID ${idUsuario} no existe`);
    }
    const accesoSucursal = await this.usuarioSucursalRepository.findOne({
      where: {
        id_usuario: idUsuario,
        id_sucursal,
      },
    });

    if (!accesoSucursal) {
      throw new ForbiddenException(
        'El usuario no tiene acceso a la sucursal indicada',
      );
    }
    const productos = new Map<number, Producto>();

    for (const detalle of detalles) {
      const producto = await this.productosRepository.findOne({
        where: {
          id_producto: detalle.id_producto,
        },
      });

      if (!producto) {
        throw new NotFoundException(
          `El producto con ID ${detalle.id_producto} no existe`,
        );
      }

      if (productos.has(detalle.id_producto)) {
        throw new BadRequestException(
          `El producto ${detalle.id_producto} está repetido en la compra`,
        );
      }

      productos.set(detalle.id_producto, producto);
    }

    let total = 0;

    for (const detalle of detalles) {
      total += Number(detalle.cantidad) * Number(detalle.precio_unitario);
    }

    total = Number(total.toFixed(2));

    return this.dataSource.transaction(async (manager) => {
      const compra = manager.create(Compra, {
        id_proveedor,
        id_sucursal,
        id_usuario: idUsuario,
        total,
        estado: 'REGISTRADA',
        observaciones: observaciones ?? null,
      });

      const compraGuardada = await manager.save(Compra, compra);

      for (const detalleDto of detalles) {
        const subtotal = Number(
          (
            Number(detalleDto.cantidad) * Number(detalleDto.precio_unitario)
          ).toFixed(2),
        );

        const detalle = manager.create(DetalleCompra, {
          id_compra: compraGuardada.id_compra,
          id_producto: detalleDto.id_producto,
          cantidad: detalleDto.cantidad,
          precio_unitario: detalleDto.precio_unitario,
          subtotal,
        });

        await manager.save(DetalleCompra, detalle);
      }

      await this.auditoriasService.registrar(manager, {
        id_usuario: idUsuario,
        id_sucursal,
        accion: 'REGISTRAR',
        entidad: 'COMPRA',
        id_registro: String(compraGuardada.id_compra),
        datos_nuevos: {
          id_proveedor,
          id_sucursal,
          total,
          estado: 'REGISTRADA',
        },
        observacion: 'Compra registrada',
      });

      return compraGuardada;
    });
  }

  async confirmar(id: number, idUsuario: number): Promise<Compra> {
    return this.dataSource.transaction(async (manager) => {
      const compra = await manager.findOne(Compra, {
        where: {
          id_compra: id,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!compra) {
        throw new NotFoundException(`La compra con ID ${id} no existe`);
      }

      const rolesGlobales = ['Administrador', 'Coordinador'];
      const rolesUsuario = await this.usuarioRolRepository.find({
        where: { id_usuario: idUsuario },
        relations: { rol: true },
      });
      const tieneAccesoGlobal = rolesUsuario.some((usuarioRol) =>
        rolesGlobales.includes(usuarioRol.rol.nombre),
      );

      if (!tieneAccesoGlobal) {
        const accesoSucursal = await this.usuarioSucursalRepository.findOne({
          where: {
            id_usuario: idUsuario,
            id_sucursal: compra.id_sucursal,
          },
        });

        if (!accesoSucursal) {
          throw new ForbiddenException(
            'El usuario no tiene acceso a la sucursal de esta compra',
          );
        }
      }

      if (compra.estado !== 'REGISTRADA') {
        throw new BadRequestException(
          `La compra ${id} no se puede confirmar porque está en estado ${compra.estado}`,
        );
      }

      const detalles = await manager.find(DetalleCompra, {
        where: {
          id_compra: id,
        },
      });

      if (detalles.length === 0) {
        throw new BadRequestException('La compra no tiene detalles');
      }

      for (const detalle of detalles) {
        const inventario = await manager.findOne(Inventario, {
          where: {
            id_producto: detalle.id_producto,
            id_sucursal: compra.id_sucursal,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (!inventario) {
          throw new NotFoundException(
            `No existe inventario para el producto ${detalle.id_producto} en la sucursal ${compra.id_sucursal}`,
          );
        }

        const cantidadAnterior = Number(inventario.cantidad);

        const cantidadNueva = Number(
          (cantidadAnterior + Number(detalle.cantidad)).toFixed(3),
        );

        inventario.cantidad = cantidadNueva;

        await manager.save(Inventario, inventario);

        const movimiento = manager.create(MovimientoInventario, {
          id_producto: detalle.id_producto,
          id_sucursal: compra.id_sucursal,
          id_usuario: idUsuario,
          tipo_movimiento: 'COMPRA',
          cantidad: detalle.cantidad,
          cantidad_anterior: cantidadAnterior,
          cantidad_nueva: cantidadNueva,
          observacion: `Compra #${compra.id_compra}`,
        });

        await manager.save(MovimientoInventario, movimiento);
      }
      compra.estado = 'CONFIRMADA';
      await manager.save(Compra, compra);

      await this.auditoriasService.registrar(manager, {
        id_usuario: idUsuario,
        id_sucursal: compra.id_sucursal,
        accion: 'CONFIRMAR',
        entidad: 'compras',
        id_registro: String(compra.id_compra),
        datos_anteriores: {
          estado: 'REGISTRADA',
        },
        datos_nuevos: {
          estado: 'CONFIRMADA',
          total: compra.total,
        },
        observacion: `Compra ${compra.id_compra} confirmada y entrada de inventario registrada`,
      });

      return compra;
    });
  }
}

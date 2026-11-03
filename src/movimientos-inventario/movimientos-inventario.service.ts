import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { MovimientoInventario } from './entities/movimiento-inventario.entity/movimiento-inventario.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { CreateMovimientoInventarioDto } from './dto/create-movimiento-inventario.dto';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';
import { UsuarioSucursal } from '../usuario-sucursal/entities/usuario-sucursal.entity/usuario-sucursal.entity';
import { Inventario } from '../inventarios/entities/inventario.entity/inventario.entity';
@Injectable()
export class MovimientosInventarioService {
  constructor(
    @InjectRepository(MovimientoInventario)
    private readonly movimientosRepository: Repository<MovimientoInventario>,

    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,

    @InjectRepository(Sucursal)
    private readonly sucursalesRepository: Repository<Sucursal>,

    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepository: Repository<UsuarioRol>,

    @InjectRepository(UsuarioSucursal)
    private readonly usuarioSucursalRepository: Repository<UsuarioSucursal>,

    @InjectRepository(Inventario)
    private readonly inventariosRepository: Repository<Inventario>,

    private readonly dataSource: DataSource,
  ) {}
  private async usuarioTieneAccesoSucursal(
    idUsuario: number,
    idSucursal: number,
  ): Promise<boolean> {
    const usuarioRoles = await this.usuarioRolRepository.find({
      where: {
        id_usuario: idUsuario,
      },
      relations: {
        rol: true,
      },
    });

    const nombresRoles = usuarioRoles.map(
      (usuarioRol) => usuarioRol.rol.nombre,
    );

    const tieneAccesoGlobal =
      nombresRoles.includes('Administrador') ||
      nombresRoles.includes('Coordinador') ||
      nombresRoles.includes('Contador') ||
      nombresRoles.includes('Fiscal');

    if (tieneAccesoGlobal) {
      return true;
    }

    const asignacion = await this.usuarioSucursalRepository.findOne({
      where: {
        id_usuario: idUsuario,
        id_sucursal: idSucursal,
      },
    });

    return !!asignacion;
  }

  async findAll(idUsuario: number): Promise<MovimientoInventario[]> {
    const usuarioRoles = await this.usuarioRolRepository.find({
      where: {
        id_usuario: idUsuario,
      },
      relations: {
        rol: true,
      },
    });

    const nombresRoles = usuarioRoles.map(
      (usuarioRol) => usuarioRol.rol.nombre,
    );

    const tieneAccesoGlobal =
      nombresRoles.includes('Administrador') ||
      nombresRoles.includes('Coordinador') ||
      nombresRoles.includes('Contador') ||
      nombresRoles.includes('Fiscal');

    if (tieneAccesoGlobal) {
      return this.movimientosRepository.find({
        relations: {
          producto: true,
          sucursal: true,
          usuario: true,
        },
        order: {
          id_movimiento: 'DESC',
        },
      });
    }

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

    return this.movimientosRepository
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.producto', 'producto')
      .leftJoinAndSelect('movimiento.sucursal', 'sucursal')
      .leftJoinAndSelect('movimiento.usuario', 'usuario')
      .where('movimiento.id_sucursal IN (:...idsSucursales)', {
        idsSucursales,
      })
      .orderBy('movimiento.id_movimiento', 'DESC')
      .getMany();
  }

  async findOne(id: number, idUsuario: number): Promise<MovimientoInventario> {
    const movimiento = await this.movimientosRepository.findOne({
      where: {
        id_movimiento: id,
      },
      relations: {
        producto: true,
        sucursal: true,
        usuario: true,
      },
    });

    if (!movimiento) {
      throw new NotFoundException(`El movimiento con ID ${id} no existe`);
    }

    const tieneAcceso = await this.usuarioTieneAccesoSucursal(
      idUsuario,
      movimiento.id_sucursal,
    );

    if (!tieneAcceso) {
      throw new ForbiddenException(
        'No tiene acceso al movimiento de esta sucursal',
      );
    }

    return movimiento;
  }
  async create(
    createMovimientoInventarioDto: CreateMovimientoInventarioDto,
    idUsuario: number,
  ): Promise<MovimientoInventario> {
    const { id_producto, id_sucursal, tipo_movimiento, cantidad, observacion } =
      createMovimientoInventarioDto;

    const producto = await this.productosRepository.findOne({
      where: { id_producto },
    });

    if (!producto) {
      throw new NotFoundException(
        `El producto con ID ${id_producto} no existe`,
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

    const tieneAcceso = await this.usuarioTieneAccesoSucursal(
      idUsuario,
      id_sucursal,
    );

    if (!tieneAcceso) {
      throw new ForbiddenException('No tiene acceso a esta sucursal');
    }

    return this.dataSource.transaction(async (manager) => {
      const inventarioRepository = manager.getRepository(Inventario);

      const movimientoRepository = manager.getRepository(MovimientoInventario);

      const inventario = await inventarioRepository
        .createQueryBuilder('inventario')
        .setLock('pessimistic_write')
        .where('inventario.id_producto = :id_producto', { id_producto })
        .andWhere('inventario.id_sucursal = :id_sucursal', { id_sucursal })
        .getOne();

      if (!inventario) {
        throw new NotFoundException(
          'No existe inventario para este producto en esta sucursal',
        );
      }

      const cantidadAnterior = Number(inventario.cantidad);

      let cantidadNueva: number;

      if (tipo_movimiento === 'AJUSTE_ENTRADA') {
        cantidadNueva = cantidadAnterior + cantidad;
      } else {
        cantidadNueva = cantidadAnterior - cantidad;
      }

      if (cantidadNueva < 0) {
        throw new ForbiddenException(
          'El ajuste de salida no puede dejar el inventario en una cantidad negativa',
        );
      }

      inventario.cantidad = cantidadNueva;

      await inventarioRepository.save(inventario);

      const movimiento = movimientoRepository.create({
        id_producto,
        id_sucursal,
        id_usuario: idUsuario,
        tipo_movimiento,
        cantidad,
        cantidad_anterior: cantidadAnterior,
        cantidad_nueva: cantidadNueva,
        observacion: observacion ?? null,
      });

      return movimientoRepository.save(movimiento);
    });
  }
}

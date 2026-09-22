import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MovimientoInventario } from './entities/movimiento-inventario.entity/movimiento-inventario.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { CreateMovimientoInventarioDto } from './dto/create-movimiento-inventario.dto';

@Injectable()
export class MovimientosInventarioService {
  constructor(
    @InjectRepository(MovimientoInventario)
    private readonly movimientosRepository: Repository<MovimientoInventario>,

    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,

    @InjectRepository(Sucursal)
    private readonly sucursalesRepository: Repository<Sucursal>,

    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<MovimientoInventario[]> {
    return this.movimientosRepository.find({
      relations: { producto: true, sucursal: true, usuario: true },
      order: {
        id_movimiento: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<MovimientoInventario> {
    const movimiento =
      await this.movimientosRepository.findOne({
        where: {
          id_movimiento: id,
        },
        relations: { producto: true, sucursal: true, usuario: true },
      });

    if (!movimiento) {
      throw new NotFoundException(
        `El movimiento con ID ${id} no existe`,
      );
    }

    return movimiento;
  }

  async create(
    createMovimientoInventarioDto: CreateMovimientoInventarioDto,
  ): Promise<MovimientoInventario> {
    const {
      id_producto,
      id_sucursal,
      id_usuario,
    } = createMovimientoInventarioDto;

    const producto =
      await this.productosRepository.findOne({
        where: { id_producto },
      });

    if (!producto) {
      throw new NotFoundException(
        `El producto con ID ${id_producto} no existe`,
      );
    }

    const sucursal =
      await this.sucursalesRepository.findOne({
        where: { id_sucursal },
      });

    if (!sucursal) {
      throw new NotFoundException(
        `La sucursal con ID ${id_sucursal} no existe`,
      );
    }

    const usuario =
      await this.usuariosRepository.findOne({
        where: { id_usuario },
      });

    if (!usuario) {
      throw new NotFoundException(
        `El usuario con ID ${id_usuario} no existe`,
      );
    }

    const movimiento =
      this.movimientosRepository.create(
        createMovimientoInventarioDto,
      );

    return this.movimientosRepository.save(movimiento);
  }
}
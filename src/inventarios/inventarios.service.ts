import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Inventario } from './entities/inventario.entity/inventario.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { CreateInventarioDto } from './dto/create-inventario.dto';

@Injectable()
export class InventariosService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventariosRepository: Repository<Inventario>,

    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,

    @InjectRepository(Sucursal)
    private readonly sucursalesRepository: Repository<Sucursal>,
  ) {}

  async findAll(): Promise<Inventario[]> {
    return this.inventariosRepository.find({
      relations: {
        producto: true,
        sucursal: true,
      },
    });
  }

  async findOne(id: number): Promise<Inventario> {
    const inventario = await this.inventariosRepository.findOne({
      where: { id_inventario: id },
      relations: {
        producto: true,
        sucursal: true,
      },
    });

    if (!inventario) {
      throw new NotFoundException(`El inventario con ID ${id} no existe`);
    }

    return inventario;
  }

  async create(createInventarioDto: CreateInventarioDto): Promise<Inventario> {
    const producto = await this.productosRepository.findOne({
      where: {
        id_producto: createInventarioDto.id_producto,
      },
    });

    if (!producto) {
      throw new NotFoundException(
        `El producto con ID ${createInventarioDto.id_producto} no existe`,
      );
    }

    const sucursal = await this.sucursalesRepository.findOne({
      where: {
        id_sucursal: createInventarioDto.id_sucursal,
      },
    });

    if (!sucursal) {
      throw new NotFoundException(
        `La sucursal con ID ${createInventarioDto.id_sucursal} no existe`,
      );
    }

    const inventario = this.inventariosRepository.create(createInventarioDto);

    return this.inventariosRepository.save(inventario);
  }
}

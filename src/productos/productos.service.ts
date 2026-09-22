import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Producto } from './entities/producto.entity/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Categoria } from '../categorias/entities/categoria.entity/categoria.entity';
import { UnidadMedida } from '../unidades-medida/entities/unidad-medida.entity/unidad-medida.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,

    @InjectRepository(Categoria)
    private readonly categoriasRepository: Repository<Categoria>,

    @InjectRepository(UnidadMedida)
    private readonly unidadesMedidaRepository: Repository<UnidadMedida>,
  ) {}

  async findAll(): Promise<Producto[]> {
    return this.productosRepository.find({
      relations: {
        categoria: true,
        unidad_medida: true,
      },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOne({
      where: { id_producto: id },
      relations: {
        categoria: true,
        unidad_medida: true,
      },
    });

    if (!producto) {
      throw new NotFoundException(`El producto con ID ${id} no existe`);
    }

    return producto;
  }

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const categoria = await this.categoriasRepository.findOne({
      where: {
        id_categoria: createProductoDto.id_categoria,
      },
    });

    if (!categoria) {
      throw new NotFoundException(
        `La categoría con ID ${createProductoDto.id_categoria} no existe`,
      );
    }

    const unidadMedida = await this.unidadesMedidaRepository.findOne({
      where: {
        id_unidad_medida: createProductoDto.id_unidad_medida,
      },
    });

    if (!unidadMedida) {
      throw new NotFoundException(
        `La unidad de medida con ID ${createProductoDto.id_unidad_medida} no existe`,
      );
    }

    const producto = this.productosRepository.create(createProductoDto);

    return this.productosRepository.save(producto);
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const producto = await this.findOne(id);

    if (updateProductoDto.id_categoria !== undefined) {
      const categoria = await this.categoriasRepository.findOne({
        where: {
          id_categoria: updateProductoDto.id_categoria,
        },
      });

      if (!categoria) {
        throw new NotFoundException(
          `La categoría con ID ${updateProductoDto.id_categoria} no existe`,
        );
      }
    }

    if (updateProductoDto.id_unidad_medida !== undefined) {
      const unidadMedida = await this.unidadesMedidaRepository.findOne({
        where: {
          id_unidad_medida: updateProductoDto.id_unidad_medida,
        },
      });

      if (!unidadMedida) {
        throw new NotFoundException(
          `La unidad de medida con ID ${updateProductoDto.id_unidad_medida} no existe`,
        );
      }
    }

    Object.assign(producto, updateProductoDto);

    return this.productosRepository.save(producto);
  }
}

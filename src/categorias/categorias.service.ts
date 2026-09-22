import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Categoria } from './entities/categoria.entity/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriasRepository: Repository<Categoria>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    return this.categoriasRepository.find();
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriasRepository.findOne({
      where: { id_categoria: id },
    });

    if (!categoria) {
      throw new NotFoundException(
        `La categoría con ID ${id} no existe`,
      );
    }

    return categoria;
  }

  async create(
    createCategoriaDto: CreateCategoriaDto,
  ): Promise<Categoria> {
    const categoria =
      this.categoriasRepository.create(createCategoriaDto);

    return this.categoriasRepository.save(categoria);
  }

  async update(
    id: number,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    const categoria = await this.findOne(id);

    Object.assign(categoria, updateCategoriaDto);

    return this.categoriasRepository.save(categoria);
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UnidadMedida } from './entities/unidad-medida.entity/unidad-medida.entity';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';

@Injectable()
export class UnidadesMedidaService {
  constructor(
    @InjectRepository(UnidadMedida)
    private readonly unidadesMedidaRepository: Repository<UnidadMedida>,
  ) {}

  async findAll(): Promise<UnidadMedida[]> {
    return this.unidadesMedidaRepository.find();
  }

  async findOne(id: number): Promise<UnidadMedida> {
    const unidad = await this.unidadesMedidaRepository.findOne({
      where: { id_unidad_medida: id },
    });

    if (!unidad) {
      throw new NotFoundException(
        `La unidad de medida con ID ${id} no existe`,
      );
    }

    return unidad;
  }

  async create(
    createUnidadMedidaDto: CreateUnidadMedidaDto,
  ): Promise<UnidadMedida> {
    const unidad = this.unidadesMedidaRepository.create(
      createUnidadMedidaDto,
    );

    return this.unidadesMedidaRepository.save(unidad);
  }

  async update(
    id: number,
    updateUnidadMedidaDto: UpdateUnidadMedidaDto,
  ): Promise<UnidadMedida> {
    const unidad = await this.findOne(id);

    Object.assign(unidad, updateUnidadMedidaDto);

    return this.unidadesMedidaRepository.save(unidad);
  }
}
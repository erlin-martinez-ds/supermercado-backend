import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Impuesto } from './entities/impuesto.entity/impuesto.entity';
import { CreateImpuestoDto } from './dto/create-impuesto.dto';
import { UpdateImpuestoDto } from './dto/update-impuesto.dto';

@Injectable()
export class ImpuestosService {
  constructor(
    @InjectRepository(Impuesto)
    private readonly impuestoRepository: Repository<Impuesto>,
  ) {}

  async findAll(): Promise<Impuesto[]> {
    return this.impuestoRepository.find({
      order: {
        id_impuesto: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Impuesto> {
    const impuesto = await this.impuestoRepository.findOne({
      where: {
        id_impuesto: id,
      },
    });

    if (!impuesto) {
      throw new NotFoundException(
        `No se encontró el impuesto con ID ${id}`,
      );
    }

    return impuesto;
  }

  async create(dto: CreateImpuestoDto): Promise<Impuesto> {
    const impuestoExistente = await this.impuestoRepository.findOne({
      where: {
        nombre: dto.nombre,
      },
    });

    if (impuestoExistente) {
      throw new ConflictException(
        'Ya existe un impuesto con ese nombre',
      );
    }

    const impuesto = this.impuestoRepository.create(dto);

    return this.impuestoRepository.save(impuesto);
  }

  async update(
    id: number,
    dto: UpdateImpuestoDto,
  ): Promise<Impuesto> {
    const impuesto = await this.findOne(id);

    if (dto.nombre && dto.nombre !== impuesto.nombre) {
      const impuestoExistente =
        await this.impuestoRepository.findOne({
          where: {
            nombre: dto.nombre,
          },
        });

      if (impuestoExistente) {
        throw new ConflictException(
          'Ya existe un impuesto con ese nombre',
        );
      }
    }

    Object.assign(impuesto, dto);

    return this.impuestoRepository.save(impuesto);
  }
}
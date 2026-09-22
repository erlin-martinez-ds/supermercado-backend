import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Caja } from './entities/caja.entity/caja.entity';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';

import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';

@Injectable()
export class CajasService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  async findAll(): Promise<Caja[]> {
    return this.cajaRepository.find({
      relations: {
        sucursal: true,
      },
      order: {
        id_caja: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Caja> {
    const caja = await this.cajaRepository.findOne({
      where: {
        id_caja: id,
      },
      relations: {
        sucursal: true,
      },
    });

    if (!caja) {
      throw new NotFoundException(
        `No se encontró la caja con ID ${id}`,
      );
    }

    return caja;
  }

  async create(dto: CreateCajaDto): Promise<Caja> {
    const sucursal = await this.sucursalRepository.findOne({
      where: {
        id_sucursal: dto.id_sucursal,
      },
    });

    if (!sucursal) {
      throw new NotFoundException(
        `No se encontró la sucursal con ID ${dto.id_sucursal}`,
      );
    }

    const cajaExistente = await this.cajaRepository.findOne({
      where: {
        codigo: dto.codigo,
      },
    });

    if (cajaExistente) {
      throw new ConflictException(
        'Ya existe una caja con ese código',
      );
    }

    const caja = this.cajaRepository.create(dto);

    return this.cajaRepository.save(caja);
  }

  async update(
    id: number,
    dto: UpdateCajaDto,
  ): Promise<Caja> {
    const caja = await this.findOne(id);

    if (
      dto.id_sucursal !== undefined &&
      dto.id_sucursal !== caja.id_sucursal
    ) {
      const sucursal = await this.sucursalRepository.findOne({
        where: {
          id_sucursal: dto.id_sucursal,
        },
      });

      if (!sucursal) {
        throw new NotFoundException(
          `No se encontró la sucursal con ID ${dto.id_sucursal}`,
        );
      }
    }

    if (
      dto.codigo !== undefined &&
      dto.codigo !== caja.codigo
    ) {
      const cajaExistente = await this.cajaRepository.findOne({
        where: {
          codigo: dto.codigo,
        },
      });

      if (cajaExistente) {
        throw new ConflictException(
          'Ya existe una caja con ese código',
        );
      }
    }

    Object.assign(caja, dto);

    return this.cajaRepository.save(caja);
  }
}
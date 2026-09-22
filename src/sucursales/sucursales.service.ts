import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Sucursal } from './entities/sucursal.entity/sucursal.entity';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

@Injectable()
export class SucursalesService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalesRepository: Repository<Sucursal>,
  ) {}

  async findAll(): Promise<Sucursal[]> {
    return this.sucursalesRepository.find();
  }

  async findOne(id: number): Promise<Sucursal> {
    const sucursal = await this.sucursalesRepository.findOne({
      where: { id_sucursal: id },
    });

    if (!sucursal) {
      throw new NotFoundException(
        `La sucursal con ID ${id} no existe`,
      );
    }

    return sucursal;
  }

  async create(
    createSucursalDto: CreateSucursalDto,
  ): Promise<Sucursal> {
    const sucursal = this.sucursalesRepository.create(
      createSucursalDto,
    );

    return this.sucursalesRepository.save(sucursal);
  }

  async update(
    id: number,
    updateSucursalDto: UpdateSucursalDto,
  ): Promise<Sucursal> {
    const sucursal = await this.findOne(id);

    Object.assign(sucursal, updateSucursalDto);

    return this.sucursalesRepository.save(sucursal);
  }
}
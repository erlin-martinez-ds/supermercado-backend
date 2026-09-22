import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Proveedor } from './entities/proveedor.entity/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedoresRepository: Repository<Proveedor>,
  ) {}

  async findAll(): Promise<Proveedor[]> {
    return this.proveedoresRepository.find();
  }

  async findOne(id: number): Promise<Proveedor> {
    const proveedor = await this.proveedoresRepository.findOne({
      where: { id_proveedor: id },
    });

    if (!proveedor) {
      throw new NotFoundException(
        `El proveedor con ID ${id} no existe`,
      );
    }

    return proveedor;
  }

  async create(
    createProveedorDto: CreateProveedorDto,
  ): Promise<Proveedor> {
    const proveedor = this.proveedoresRepository.create(
      createProveedorDto,
    );

    return this.proveedoresRepository.save(proveedor);
  }

  async update(
    id: number,
    updateProveedorDto: UpdateProveedorDto,
  ): Promise<Proveedor> {
    const proveedor = await this.findOne(id);

    Object.assign(proveedor, updateProveedorDto);

    return this.proveedoresRepository.save(proveedor);
  }
}
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permiso } from './entities/permiso.entity/permiso.entity';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisosRepository: Repository<Permiso>,
  ) {}

  async findAll(): Promise<Permiso[]> {
    return this.permisosRepository.find();
  }

  async findOne(id: number): Promise<Permiso> {
    const permiso = await this.permisosRepository.findOne({
      where: { id_permiso: id },
    });

    if (!permiso) {
      throw new NotFoundException(
        `El permiso con ID ${id} no existe`,
      );
    }

    return permiso;
  }

  async create(
    createPermisoDto: CreatePermisoDto,
  ): Promise<Permiso> {
    const permiso = this.permisosRepository.create(
      createPermisoDto,
    );

    return this.permisosRepository.save(permiso);
  }

  async update(
    id: number,
    updatePermisoDto: UpdatePermisoDto,
  ): Promise<Permiso> {
    const permiso = await this.findOne(id);

    Object.assign(permiso, updatePermisoDto);

    return this.permisosRepository.save(permiso);
  }
}
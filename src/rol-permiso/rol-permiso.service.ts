import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RolPermiso } from './entities/rol-permiso.entity/rol-permiso.entity';
import { Rol } from '../roles/entities/rol.entity/rol.entity';
import { Permiso } from '../permisos/entities/permiso.entity/permiso.entity';
import { CreateRolPermisoDto } from './dto/create-rol-permiso.dto';

@Injectable()
export class RolPermisoService {
  constructor(
    @InjectRepository(RolPermiso)
    private readonly rolPermisoRepository: Repository<RolPermiso>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
  ) {}

  async findAll(): Promise<RolPermiso[]> {
    return this.rolPermisoRepository.find({
      relations: { rol: true, permiso: true },
    });
  }

  async findOne(id_rol: number, id_permiso: number): Promise<RolPermiso> {
    const relacion = await this.rolPermisoRepository.findOne({
      where: {
        id_rol,
        id_permiso,
      },
      relations: { rol: true, permiso: true },
    });

    if (!relacion) {
      throw new NotFoundException(
        `No existe la relación entre el rol ${id_rol} y el permiso ${id_permiso}`,
      );
    }

    return relacion;
  }

  async create(createRolPermisoDto: CreateRolPermisoDto): Promise<RolPermiso> {
    const { id_rol, id_permiso } = createRolPermisoDto;

    const relacionExistente = await this.rolPermisoRepository.findOne({
      where: { id_rol, id_permiso },
    });

    if (relacionExistente) {
      throw new ConflictException(
        `La relación entre el rol ${id_rol} y el permiso ${id_permiso} ya existe`,
      );
    }

    const rol = await this.rolRepository.findOne({
      where: { id_rol },
    });

    if (!rol) {
      throw new NotFoundException(`El rol con ID ${id_rol} no existe`);
    }

    const permiso = await this.permisoRepository.findOne({
      where: { id_permiso },
    });

    if (!permiso) {
      throw new NotFoundException(`El permiso con ID ${id_permiso} no existe`);
    }

    const relacion = this.rolPermisoRepository.create({
      id_rol,
      id_permiso,
    });

    return this.rolPermisoRepository.save(relacion);
  }

  async remove(id_rol: number, id_permiso: number): Promise<void> {
    const relacion = await this.findOne(id_rol, id_permiso);

    await this.rolPermisoRepository.remove(relacion);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolesRepository: Repository<Rol>,
  ) {}

  async findAll(): Promise<Rol[]> {
    return this.rolesRepository.find();
  }

  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolesRepository.findOne({
      where: { id_rol: id },
    });

    if (!rol) {
      throw new NotFoundException(`El rol con ID ${id} no existe`);
    }

    return rol;
  }

  async create(createRolDto: CreateRolDto): Promise<Rol> {
    const rol = this.rolesRepository.create(createRolDto);

    return this.rolesRepository.save(rol);
  }

  async update(id: number, updateRolDto: UpdateRolDto): Promise<Rol> {
    const rol = await this.findOne(id);

    Object.assign(rol, updateRolDto);

    return this.rolesRepository.save(rol);
  }
}

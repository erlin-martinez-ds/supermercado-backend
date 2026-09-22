import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsuarioSucursal } from './entities/usuario-sucursal.entity/usuario-sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { CreateUsuarioSucursalDto } from './dto/create-usuario-sucursal.dto';

@Injectable()
export class UsuarioSucursalService {
  constructor(
    @InjectRepository(UsuarioSucursal)
    private readonly usuarioSucursalRepository: Repository<UsuarioSucursal>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  async findAll(): Promise<UsuarioSucursal[]> {
    return this.usuarioSucursalRepository.find({
      relations: { usuario: true, sucursal: true },
    });
  }

  async findOne(
    id_usuario: number,
    id_sucursal: number,
  ): Promise<UsuarioSucursal> {
    const relacion = await this.usuarioSucursalRepository.findOne({
      where: {
        id_usuario,
        id_sucursal,
      },
      relations: { usuario: true, sucursal: true },
    });

    if (!relacion) {
      throw new NotFoundException(
        `No existe la relación entre el usuario ${id_usuario} y la sucursal ${id_sucursal}`,
      );
    }

    return relacion;
  }

  async create(
    createUsuarioSucursalDto: CreateUsuarioSucursalDto,
  ): Promise<UsuarioSucursal> {
    const { id_usuario, id_sucursal } = createUsuarioSucursalDto;

    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario },
    });

    if (!usuario) {
      throw new NotFoundException(`El usuario con ID ${id_usuario} no existe`);
    }

    const sucursal = await this.sucursalRepository.findOne({
      where: { id_sucursal },
    });

    if (!sucursal) {
      throw new NotFoundException(
        `La sucursal con ID ${id_sucursal} no existe`,
      );
    }

    const relacionExistente = await this.usuarioSucursalRepository.findOne({
      where: {
        id_usuario,
        id_sucursal,
      },
    });

    if (relacionExistente) {
      throw new ConflictException(
        `El usuario ${id_usuario} ya está asignado a la sucursal ${id_sucursal}`,
      );
    }

    const relacion = this.usuarioSucursalRepository.create({
      id_usuario,
      id_sucursal,
    });

    return this.usuarioSucursalRepository.save(relacion);
  }

  async remove(id_usuario: number, id_sucursal: number): Promise<void> {
    const relacion = await this.findOne(id_usuario, id_sucursal);

    await this.usuarioSucursalRepository.remove(relacion);
  }
}

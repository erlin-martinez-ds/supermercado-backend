import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsuarioRol } from './entities/usuario-rol.entity/usuario-rol.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { Rol } from '../roles/entities/rol.entity/rol.entity';
import { CreateUsuarioRolDto } from './dto/create-usuario-rol.dto';

@Injectable()
export class UsuarioRolService {
  constructor(
    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepository: Repository<UsuarioRol>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async findAll(): Promise<UsuarioRol[]> {
    return this.usuarioRolRepository.find({
      relations: { usuario: true, rol: true },
    });
  }

  async findOne(id_usuario: number, id_rol: number): Promise<UsuarioRol> {
    const relacion = await this.usuarioRolRepository.findOne({
      where: {
        id_usuario,
        id_rol,
      },
      relations: { usuario: true, rol: true },
    });

    if (!relacion) {
      throw new NotFoundException(
        `No existe la relación entre el usuario ${id_usuario} y el rol ${id_rol}`,
      );
    }

    return relacion;
  }

  async create(createUsuarioRolDto: CreateUsuarioRolDto): Promise<UsuarioRol> {
    const { id_usuario, id_rol } = createUsuarioRolDto;

    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario },
    });

    if (!usuario) {
      throw new NotFoundException(`El usuario con ID ${id_usuario} no existe`);
    }

    const rol = await this.rolRepository.findOne({
      where: { id_rol },
    });

    if (!rol) {
      throw new NotFoundException(`El rol con ID ${id_rol} no existe`);
    }
    const relacionExistente = await this.usuarioRolRepository.findOne({
      where: {
        id_usuario,
        id_rol,
      },
    });

    if (relacionExistente) {
      throw new ConflictException('El usuario ya tiene asignado este rol');
    }
    const rolesPrincipales = [
      'Administrador',
      'Coordinador',
      'Secretario',
      'Contador',
      'Fiscal',
    ];

    if (rolesPrincipales.includes(rol.nombre)) {
      const rolesActuales = await this.usuarioRolRepository.find({
        where: {
          id_usuario,
        },
        relations: {
          rol: true,
        },
      });

      const tieneRolPrincipal = rolesActuales.some((usuarioRol) =>
        rolesPrincipales.includes(usuarioRol.rol.nombre),
      );

      if (tieneRolPrincipal) {
        throw new ConflictException(
          'El usuario ya tiene un rol principal asignado',
        );
      }
    }

    const relacion = this.usuarioRolRepository.create({
      id_usuario,
      id_rol,
    });

    return this.usuarioRolRepository.save(relacion);
  }

  async remove(id_usuario: number, id_rol: number): Promise<void> {
    const relacion = await this.findOne(id_usuario, id_rol);

    await this.usuarioRolRepository.remove(relacion);
  }
}

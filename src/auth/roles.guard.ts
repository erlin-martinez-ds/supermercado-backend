import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';
import { ROLES_KEY } from './decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepository: Repository<UsuarioRol>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Usuario no identificado');
    }

    const rolesUsuario = await this.usuarioRolRepository.find({
      where: {
        id_usuario: usuario.id_usuario,
      },
      relations: {
        rol: true,
      },
    });

    const nombresRoles = rolesUsuario.map(
      (usuarioRol) => usuarioRol.rol.nombre,
    );

    const tieneRol = rolesRequeridos.some((rolRequerido) =>
      nombresRoles.includes(rolRequerido),
    );

    if (!tieneRol) {
      throw new ForbiddenException(
        'No tiene permisos suficientes para realizar esta acción',
      );
    }

    return true;
  }
}
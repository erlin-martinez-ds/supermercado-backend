import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .where('usuario.email = :email', {
        email: dto.email,
      })
      .getOne();

    if (!usuario) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    if (usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.password);

    if (!passwordValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const payload = {
      sub: usuario.id_usuario,
      email: usuario.email,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
      },
    };
  }
}

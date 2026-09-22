import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuarioRol } from './entities/usuario-rol.entity/usuario-rol.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { Rol } from '../roles/entities/rol.entity/rol.entity';
import { UsuarioRolController } from './usuario-rol.controller';
import { UsuarioRolService } from './usuario-rol.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsuarioRol,
      Usuario,
      Rol,
    ]),
  ],
  controllers: [UsuarioRolController],
  providers: [UsuarioRolService],
})
export class UsuarioRolModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuarioSucursalController } from './usuario-sucursal.controller';
import { UsuarioSucursalService } from './usuario-sucursal.service';
import { UsuarioSucursal } from './entities/usuario-sucursal.entity/usuario-sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioSucursal, Usuario, Sucursal])],
  controllers: [UsuarioSucursalController],
  providers: [UsuarioSucursalService],
})
export class UsuarioSucursalModule {}

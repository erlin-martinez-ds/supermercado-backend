import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inventario } from './entities/inventario.entity/inventario.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';

import { InventariosController } from './inventarios.controller';
import { InventariosService } from './inventarios.service';
import { AuthModule } from '../auth/auth.module';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';
import { RolesGuard } from '../auth/roles.guard';
import { UsuarioSucursal } from '../usuario-sucursal/entities/usuario-sucursal.entity/usuario-sucursal.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventario,
      Producto,
      Sucursal,
      UsuarioRol,
      UsuarioSucursal,
    ]),
    AuthModule,
  ],
  controllers: [InventariosController],
  providers: [InventariosService, RolesGuard],
})
export class InventariosModule {}

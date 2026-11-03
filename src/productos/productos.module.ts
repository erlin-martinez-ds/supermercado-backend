import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Producto } from './entities/producto.entity/producto.entity';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

import { Categoria } from '../categorias/entities/categoria.entity/categoria.entity';
import { UnidadMedida } from '../unidades-medida/entities/unidad-medida.entity/unidad-medida.entity';
import { AuthModule } from '../auth/auth.module';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Categoria, UnidadMedida, UsuarioRol]),
    AuthModule,
  ],
  controllers: [ProductosController],
  providers: [ProductosService, RolesGuard],
})
export class ProductosModule {}

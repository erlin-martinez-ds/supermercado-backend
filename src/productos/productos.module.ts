import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Producto } from './entities/producto.entity/producto.entity';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

import { Categoria } from '../categorias/entities/categoria.entity/categoria.entity';
import { UnidadMedida } from '../unidades-medida/entities/unidad-medida.entity/unidad-medida.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Producto,
      Categoria,
      UnidadMedida,
    ]),
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
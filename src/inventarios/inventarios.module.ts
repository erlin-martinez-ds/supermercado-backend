import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inventario } from './entities/inventario.entity/inventario.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';

import { InventariosController } from './inventarios.controller';
import { InventariosService } from './inventarios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventario,
      Producto,
      Sucursal,
    ]),
  ],
  controllers: [InventariosController],
  providers: [InventariosService],
})
export class InventariosModule {}
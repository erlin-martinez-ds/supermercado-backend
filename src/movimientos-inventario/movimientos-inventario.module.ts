import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MovimientoInventario } from './entities/movimiento-inventario.entity/movimiento-inventario.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { MovimientosInventarioController } from './movimientos-inventario.controller';
import { MovimientosInventarioService } from './movimientos-inventario.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovimientoInventario,
      Producto,
      Sucursal,
      Usuario,
    ]),
  ],
  controllers: [MovimientosInventarioController],
  providers: [MovimientosInventarioService],
})
export class MovimientosInventarioModule {}
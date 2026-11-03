import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MovimientoInventario } from './entities/movimiento-inventario.entity/movimiento-inventario.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { MovimientosInventarioController } from './movimientos-inventario.controller';
import { MovimientosInventarioService } from './movimientos-inventario.service';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';
import { UsuarioSucursal } from '../usuario-sucursal/entities/usuario-sucursal.entity/usuario-sucursal.entity';
import { Inventario } from '../inventarios/entities/inventario.entity/inventario.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovimientoInventario,
      Producto,
      Sucursal,
      UsuarioRol,
      UsuarioSucursal,
      Inventario,
    ]),
  ],
  controllers: [MovimientosInventarioController],
  providers: [MovimientosInventarioService],
})
export class MovimientosInventarioModule {}

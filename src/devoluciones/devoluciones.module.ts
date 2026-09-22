import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Devolucion } from './entities/devolucion.entity/devolucion.entity';
import { DetalleDevolucion } from './entities/detalle-devolucion.entity/detalle-devolucion.entity';

import { Venta } from '../ventas/entities/venta.entity/venta.entity';
import { Compra } from '../compras/entities/compra.entity/compra.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { Inventario } from '../inventarios/entities/inventario.entity/inventario.entity';
import { MovimientoInventario } from '../movimientos-inventario/entities/movimiento-inventario.entity/movimiento-inventario.entity';

import { DevolucionesController } from './devoluciones.controller';
import { DevolucionesService } from './devoluciones.service';

import { AuditoriasModule } from '../auditorias/auditorias.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Devolucion,
      DetalleDevolucion,
      Venta,
      Compra,
      Producto,
      Sucursal,
      Usuario,
      Inventario,
      MovimientoInventario,
    ]),
    AuditoriasModule,
  ],
  controllers: [DevolucionesController],
  providers: [DevolucionesService],
})
export class DevolucionesModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';
import { Venta } from './entities/venta.entity/venta.entity';
import { DetalleVenta } from './entities/detalle-venta.entity/detalle-venta.entity';
import { PagoVenta } from './entities/pago-venta.entity/pago-venta.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Inventario } from '../inventarios/entities/inventario.entity/inventario.entity';
import { MovimientoInventario } from '../movimientos-inventario/entities/movimiento-inventario.entity/movimiento-inventario.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { UsuarioSucursal } from '../usuario-sucursal/entities/usuario-sucursal.entity/usuario-sucursal.entity';
import { MetodoPago } from '../metodos-pago/entities/metodo-pago.entity/metodo-pago.entity';

import { AuditoriasModule } from '../auditorias/auditorias.module';
import { Impuesto } from '../impuestos/entities/impuesto.entity/impuesto.entity';
import { FacturasModule } from '../facturas/facturas.module';
import { SesionCaja } from '../sesiones-caja/entities/sesion-caja.entity/sesion-caja.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta,
      DetalleVenta,
      PagoVenta,
      Producto,
      Inventario,
      MovimientoInventario,
      Sucursal,
      Usuario,
      UsuarioSucursal,
      MetodoPago,
      Impuesto,
      SesionCaja,
    ]),
    AuditoriasModule,
    FacturasModule,
  ],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}

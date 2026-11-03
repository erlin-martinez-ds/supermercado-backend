import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Factura } from './entities/factura.entity';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';
import { UsuarioSucursal } from '../usuario-sucursal/entities/usuario-sucursal.entity/usuario-sucursal.entity';
import { Venta } from '../ventas/entities/venta.entity/venta.entity';
import { DetalleVenta } from '../ventas/entities/detalle-venta.entity/detalle-venta.entity';
import { Inventario } from '../inventarios/entities/inventario.entity/inventario.entity';
import { MovimientoInventario } from '../movimientos-inventario/entities/movimiento-inventario.entity/movimiento-inventario.entity';
import { AuditoriasModule } from '../auditorias/auditorias.module';
import { TrabajoFacturacion } from './entities/trabajo-facturacion.entity';
import { ProcesadorFacturacionService } from './procesador-facturacion/procesador-facturacion.service';
import { SimuladorProveedorService } from './simulador-proveedor.service';
import { IntentoFacturacion } from './entities/intento-facturacion.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Factura,
      Venta,
      DetalleVenta,
      Inventario,
      MovimientoInventario,
      UsuarioRol,
      UsuarioSucursal,
      TrabajoFacturacion,
      IntentoFacturacion,
    ]),
    AuditoriasModule,
  ],
  controllers: [FacturasController],
  providers: [FacturasService, ProcesadorFacturacionService, SimuladorProveedorService],
  exports: [FacturasService],
})
export class FacturasModule {}

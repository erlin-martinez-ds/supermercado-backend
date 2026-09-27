import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Compra } from './entities/compra.entity/compra.entity';
import { DetalleCompra } from './entities/detalle-compra.entity/detalle-compra.entity';

import { Proveedor } from '../proveedores/entities/proveedor.entity/proveedor.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Inventario } from '../inventarios/entities/inventario.entity/inventario.entity';
import { MovimientoInventario } from '../movimientos-inventario/entities/movimiento-inventario.entity/movimiento-inventario.entity';
import { UsuarioSucursal } from '../usuario-sucursal/entities/usuario-sucursal.entity/usuario-sucursal.entity';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';

import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';

import { AuditoriasModule } from '../auditorias/auditorias.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Compra,
      DetalleCompra,
      Proveedor,
      Sucursal,
      Usuario,
      Producto,
      Inventario,
      MovimientoInventario,
      UsuarioSucursal,
      UsuarioRol,
    ]),
    AuditoriasModule,
  ],
  controllers: [ComprasController],
  providers: [ComprasService],
})
export class ComprasModule {}

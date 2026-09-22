import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transferencia } from './entities/transferencia.entity/transferencia.entity';
import { DetalleTransferencia } from './entities/detalle-transferencia.entity/detalle-transferencia.entity';

import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';

import { Inventario } from '../inventarios/entities/inventario.entity/inventario.entity';

import { MovimientoInventario } from '../movimientos-inventario/entities/movimiento-inventario.entity/movimiento-inventario.entity';

import { TransferenciasController } from './transferencias.controller';
import { TransferenciasService } from './transferencias.service';

import { AuditoriasModule } from '../auditorias/auditorias.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transferencia,
      DetalleTransferencia,
      Sucursal,
      Usuario,
      Producto,
      Inventario,
      MovimientoInventario,
    ]),
    AuditoriasModule,
  ],
  controllers: [TransferenciasController],
  providers: [TransferenciasService],
})
export class TransferenciasModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SesionCaja } from './entities/sesion-caja.entity/sesion-caja.entity';
import { SesionesCajaController } from './sesiones-caja.controller';
import { SesionesCajaService } from './sesiones-caja.service';

import { Caja } from '../cajas/entities/caja.entity/caja.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { UsuarioSucursal } from '../usuario-sucursal/entities/usuario-sucursal.entity/usuario-sucursal.entity';
import { Venta } from '../ventas/entities/venta.entity/venta.entity';
import { PagoVenta } from '../ventas/entities/pago-venta.entity/pago-venta.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/roles.guard';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      SesionCaja,
      Caja,
      Usuario,
      UsuarioSucursal,
      Venta,
      PagoVenta,
      UsuarioRol,
    ]),
  ],
  controllers: [SesionesCajaController],
  providers: [SesionesCajaService, RolesGuard],
  exports: [SesionesCajaService],
})
export class SesionesCajaModule {}

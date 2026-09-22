import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Caja } from './entities/caja.entity/caja.entity';
import { CajasController } from './cajas.controller';
import { CajasService } from './cajas.service';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Caja, Sucursal])],
  controllers: [CajasController],
  providers: [CajasService],
  exports: [CajasService],
})
export class CajasModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Auditoria } from './entities/auditoria.entity/auditoria.entity';

import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';

import { AuditoriasController } from './auditorias.controller';
import { AuditoriasService } from './auditorias.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Auditoria,
      Usuario,
      Sucursal,
    ]),
  ],
  controllers: [AuditoriasController],
  providers: [AuditoriasService],
  exports: [AuditoriasService],
})
export class AuditoriasModule {}
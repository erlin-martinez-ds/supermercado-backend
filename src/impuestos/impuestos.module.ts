import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Impuesto } from './entities/impuesto.entity/impuesto.entity';
import { ImpuestosController } from './impuestos.controller';
import { ImpuestosService } from './impuestos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Impuesto])],
  controllers: [ImpuestosController],
  providers: [ImpuestosService],
  exports: [ImpuestosService],
})
export class ImpuestosModule {}
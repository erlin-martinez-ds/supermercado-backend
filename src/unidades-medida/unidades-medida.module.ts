import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UnidadMedida } from './entities/unidad-medida.entity/unidad-medida.entity';
import { UnidadesMedidaController } from './unidades-medida.controller';
import { UnidadesMedidaService } from './unidades-medida.service';

@Module({
  imports: [TypeOrmModule.forFeature([UnidadMedida])],
  controllers: [UnidadesMedidaController],
  providers: [UnidadesMedidaService],
})
export class UnidadesMedidaModule {}
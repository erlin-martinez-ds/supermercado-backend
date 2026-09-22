import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PagoVenta } from '../ventas/entities/pago-venta.entity/pago-venta.entity';
import { Venta } from '../ventas/entities/venta.entity/venta.entity';
import { MetodoPago } from '../metodos-pago/entities/metodo-pago.entity/metodo-pago.entity';

import { PagosVentaController } from './pagos-venta.controller';
import { PagosVentaService } from './pagos-venta.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PagoVenta,
      Venta,
      MetodoPago,
    ]),
  ],
  controllers: [PagosVentaController],
  providers: [PagosVentaService],
})
export class PagosVentaModule {}
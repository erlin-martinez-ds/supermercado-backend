import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { PagosVentaService } from './pagos-venta.service';
import { CreatePagoVentaDto } from './dto/create-pago-venta.dto';

@Controller('pagos-venta')
export class PagosVentaController {
  constructor(
    private readonly pagosVentaService: PagosVentaService,
  ) {}

  @Get()
  findAll() {
    return this.pagosVentaService.findAll();
  }

  @Get('venta/:idVenta')
  findByVenta(
    @Param('idVenta', ParseIntPipe) idVenta: number,
  ) {
    return this.pagosVentaService.findByVenta(
      idVenta,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pagosVentaService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreatePagoVentaDto,
  ) {
    return this.pagosVentaService.create(dto);
  }
}
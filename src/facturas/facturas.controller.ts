import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { FacturasService } from './facturas.service';

@Controller('facturas')
export class FacturasController {
  constructor(
    private readonly facturasService: FacturasService,
  ) {}

  @Get()
  findAll() {
    return this.facturasService.findAll();
  }

  @Get('venta/:idVenta')
  findByVenta(
    @Param('idVenta', ParseIntPipe) idVenta: number,
  ) {
    return this.facturasService.findByVenta(idVenta);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.findOne(id);
  }
}
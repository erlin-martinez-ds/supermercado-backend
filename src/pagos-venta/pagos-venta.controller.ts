import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('pagos-venta')
@Controller('pagos-venta')
export class PagosVentaController {
  constructor(private readonly pagosVentaService: PagosVentaService) {}

  @ApiOperation({ summary: 'Listar pagos-venta' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get()
  findAll() {
    return this.pagosVentaService.findAll();
  }

  @ApiOperation({ summary: 'Consultar pagos-venta por venta' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get('venta/:idVenta')
  findByVenta(@Param('idVenta', ParseIntPipe) idVenta: number) {
    return this.pagosVentaService.findByVenta(idVenta);
  }

  @ApiOperation({ summary: 'Consultar pagos-venta' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagosVentaService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear registro en pagos-venta' })
  @ApiResponse({ status: 201, description: 'Respuesta exitosa' })
  @Post()
  create(@Body() dto: CreatePagoVentaDto) {
    return this.pagosVentaService.create(dto);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { MovimientosInventarioService } from './movimientos-inventario.service';
import { CreateMovimientoInventarioDto } from './dto/create-movimiento-inventario.dto';

@Controller('movimientos-inventario')
export class MovimientosInventarioController {
  constructor(
    private readonly movimientosService: MovimientosInventarioService,
  ) {}

  @Get()
  findAll() {
    return this.movimientosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movimientosService.findOne(id);
  }

  @Post()
  create(
    @Body()
    createMovimientoInventarioDto: CreateMovimientoInventarioDto,
  ) {
    return this.movimientosService.create(
      createMovimientoInventarioDto,
    );
  }
}
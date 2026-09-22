import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { DevolucionesService } from './devoluciones.service';
import { CreateDevolucionDto } from './dto/create-devolucion.dto';

@Controller('devoluciones')
export class DevolucionesController {
  constructor(
    private readonly devolucionesService: DevolucionesService,
  ) {}

  @Get()
  findAll() {
    return this.devolucionesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.devolucionesService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateDevolucionDto,
  ) {
    return this.devolucionesService.create(dto);
  }

  @Patch(':id/confirmar')
  confirmar(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.devolucionesService.confirmar(id);
  }

  @Patch(':id/anular')
  anular(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.devolucionesService.anular(id);
  }
}
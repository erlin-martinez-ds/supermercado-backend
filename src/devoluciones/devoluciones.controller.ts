import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('devoluciones')
@Controller('devoluciones')
export class DevolucionesController {
  constructor(private readonly devolucionesService: DevolucionesService) {}

  @ApiOperation({ summary: 'Listar devoluciones' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get()
  findAll() {
    return this.devolucionesService.findAll();
  }

  @ApiOperation({ summary: 'Consultar devoluciones' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.devolucionesService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear registro en devoluciones' })
  @ApiResponse({ status: 201, description: 'Respuesta exitosa' })
  @Post()
  create(@Body() dto: CreateDevolucionDto) {
    return this.devolucionesService.create(dto);
  }

  @ApiOperation({ summary: 'Confirmar devoluciones' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Patch(':id/confirmar')
  confirmar(@Param('id', ParseIntPipe) id: number) {
    return this.devolucionesService.confirmar(id);
  }

  @ApiOperation({ summary: 'Anular devoluciones' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Patch(':id/anular')
  anular(@Param('id', ParseIntPipe) id: number) {
    return this.devolucionesService.anular(id);
  }
}

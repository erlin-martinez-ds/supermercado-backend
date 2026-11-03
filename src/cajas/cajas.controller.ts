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

import { CajasService } from './cajas.service';

import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';

@ApiTags('cajas')
@Controller('cajas')
export class CajasController {
  constructor(private readonly cajasService: CajasService) {}

  @ApiOperation({ summary: 'Listar cajas' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get()
  findAll() {
    return this.cajasService.findAll();
  }

  @ApiOperation({ summary: 'Consultar cajas' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cajasService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear registro en cajas' })
  @ApiResponse({ status: 201, description: 'Respuesta exitosa' })
  @Post()
  create(@Body() dto: CreateCajaDto) {
    return this.cajasService.create(dto);
  }

  @ApiOperation({ summary: 'Actualizar registro en cajas' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCajaDto) {
    return this.cajasService.update(id, dto);
  }
}

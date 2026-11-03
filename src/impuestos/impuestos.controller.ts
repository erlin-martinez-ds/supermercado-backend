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

import { ImpuestosService } from './impuestos.service';
import { CreateImpuestoDto } from './dto/create-impuesto.dto';
import { UpdateImpuestoDto } from './dto/update-impuesto.dto';

@ApiTags('impuestos')
@Controller('impuestos')
export class ImpuestosController {
  constructor(private readonly impuestosService: ImpuestosService) {}

  @ApiOperation({ summary: 'Listar impuestos' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get()
  findAll() {
    return this.impuestosService.findAll();
  }

  @ApiOperation({ summary: 'Consultar impuestos' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.impuestosService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear registro en impuestos' })
  @ApiResponse({ status: 201, description: 'Respuesta exitosa' })
  @Post()
  create(@Body() dto: CreateImpuestoDto) {
    return this.impuestosService.create(dto);
  }

  @ApiOperation({ summary: 'Actualizar registro en impuestos' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateImpuestoDto,
  ) {
    return this.impuestosService.update(id, dto);
  }
}

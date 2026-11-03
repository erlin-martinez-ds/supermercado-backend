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

import { MetodosPagoService } from './metodos-pago.service';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';

@ApiTags('metodos-pago')
@Controller('metodos-pago')
export class MetodosPagoController {
  constructor(private readonly metodosPagoService: MetodosPagoService) {}

  @ApiOperation({ summary: 'Listar metodos-pago' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get()
  findAll() {
    return this.metodosPagoService.findAll();
  }

  @ApiOperation({ summary: 'Consultar metodos-pago' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.metodosPagoService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear registro en metodos-pago' })
  @ApiResponse({ status: 201, description: 'Respuesta exitosa' })
  @Post()
  create(@Body() createMetodoPagoDto: CreateMetodoPagoDto) {
    return this.metodosPagoService.create(createMetodoPagoDto);
  }

  @ApiOperation({ summary: 'Actualizar registro en metodos-pago' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMetodoPagoDto: UpdateMetodoPagoDto,
  ) {
    return this.metodosPagoService.update(id, updateMetodoPagoDto);
  }
}

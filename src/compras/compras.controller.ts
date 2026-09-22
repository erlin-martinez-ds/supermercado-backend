import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';

@Controller('compras')
export class ComprasController {
  constructor(
    private readonly comprasService: ComprasService,
  ) {}

  @Get()
  findAll() {
    return this.comprasService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.comprasService.findOne(id);
  }

  @Post()
  create(
    @Body() createCompraDto: CreateCompraDto,
  ) {
    return this.comprasService.create(
      createCompraDto,
    );
  }

  @Patch(':id/confirmar')
  confirmar(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.comprasService.confirmar(id);
  }

  @Patch(':id/anular')
  anular(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.comprasService.anular(id);
  }
}
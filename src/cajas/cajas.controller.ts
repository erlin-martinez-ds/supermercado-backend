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

@Controller('cajas')
export class CajasController {
  constructor(
    private readonly cajasService: CajasService,
  ) {}

  @Get()
  findAll() {
    return this.cajasService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cajasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCajaDto) {
    return this.cajasService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCajaDto,
  ) {
    return this.cajasService.update(id, dto);
  }
}
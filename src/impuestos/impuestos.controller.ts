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

@Controller('impuestos')
export class ImpuestosController {
  constructor(
    private readonly impuestosService: ImpuestosService,
  ) {}

  @Get()
  findAll() {
    return this.impuestosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.impuestosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateImpuestoDto) {
    return this.impuestosService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateImpuestoDto,
  ) {
    return this.impuestosService.update(id, dto);
  }
}
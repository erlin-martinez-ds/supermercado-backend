import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { InventariosService } from './inventarios.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';

@Controller('inventarios')
export class InventariosController {
  constructor(
    private readonly inventariosService: InventariosService,
  ) {}

  @Get()
  findAll() {
    return this.inventariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventariosService.findOne(id);
  }

  @Post()
  create(
    @Body() createInventarioDto: CreateInventarioDto,
  ) {
    return this.inventariosService.create(
      createInventarioDto,
    );
  }
}
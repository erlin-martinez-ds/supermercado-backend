import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { SucursalesService } from './sucursales.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

@Controller('sucursales')
export class SucursalesController {
  constructor(
    private readonly sucursalesService: SucursalesService,
  ) {}

  @Get()
  findAll() {
    return this.sucursalesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sucursalesService.findOne(id);
  }

  @Post()
  create(@Body() createSucursalDto: CreateSucursalDto) {
    return this.sucursalesService.create(
      createSucursalDto,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSucursalDto: UpdateSucursalDto,
  ) {
    return this.sucursalesService.update(
      id,
      updateSucursalDto,
    );
  }
}
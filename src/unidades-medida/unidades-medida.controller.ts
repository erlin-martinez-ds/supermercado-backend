import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { UnidadesMedidaService } from './unidades-medida.service';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';

@Controller('unidades-medida')
export class UnidadesMedidaController {
  constructor(
    private readonly unidadesMedidaService: UnidadesMedidaService,
  ) {}

  @Get()
  findAll() {
    return this.unidadesMedidaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unidadesMedidaService.findOne(id);
  }

  @Post()
  create(@Body() createUnidadMedidaDto: CreateUnidadMedidaDto) {
    return this.unidadesMedidaService.create(
      createUnidadMedidaDto,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnidadMedidaDto: UpdateUnidadMedidaDto,
  ) {
    return this.unidadesMedidaService.update(
      id,
      updateUnidadMedidaDto,
    );
  }
}
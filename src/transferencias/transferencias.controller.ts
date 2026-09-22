import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { TransferenciasService } from './transferencias.service';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';

@Controller('transferencias')
export class TransferenciasController {
  constructor(
    private readonly transferenciasService: TransferenciasService,
  ) {}

  @Get()
  findAll() {
    return this.transferenciasService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transferenciasService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateTransferenciaDto,
  ) {
    return this.transferenciasService.create(dto);
  }
}
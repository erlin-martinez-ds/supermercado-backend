import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { AuditoriasService } from './auditorias.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';

@Controller('auditorias')
export class AuditoriasController {
  constructor(
    private readonly auditoriasService: AuditoriasService,
  ) {}

  @Get()
  findAll() {
    return this.auditoriasService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.auditoriasService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateAuditoriaDto,
  ) {
    return this.auditoriasService.create(dto);
  }
}
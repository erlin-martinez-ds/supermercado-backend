import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { RolPermisoService } from './rol-permiso.service';
import { CreateRolPermisoDto } from './dto/create-rol-permiso.dto';

@Controller('rol-permiso')
export class RolPermisoController {
  constructor(
    private readonly rolPermisoService: RolPermisoService,
  ) {}

  @Get()
  findAll() {
    return this.rolPermisoService.findAll();
  }

  @Get(':id_rol/:id_permiso')
  findOne(
    @Param('id_rol', ParseIntPipe) id_rol: number,
    @Param('id_permiso', ParseIntPipe) id_permiso: number,
  ) {
    return this.rolPermisoService.findOne(
      id_rol,
      id_permiso,
    );
  }

  @Post()
  create(@Body() createRolPermisoDto: CreateRolPermisoDto) {
    return this.rolPermisoService.create(
      createRolPermisoDto,
    );
  }

  @Delete(':id_rol/:id_permiso')
  remove(
    @Param('id_rol', ParseIntPipe) id_rol: number,
    @Param('id_permiso', ParseIntPipe) id_permiso: number,
  ) {
    return this.rolPermisoService.remove(
      id_rol,
      id_permiso,
    );
  }
}
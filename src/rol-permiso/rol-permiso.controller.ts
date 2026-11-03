import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('rol-permiso')
@Controller('rol-permiso')
export class RolPermisoController {
  constructor(private readonly rolPermisoService: RolPermisoService) {}

  @ApiOperation({ summary: 'Listar rol-permiso' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get()
  findAll() {
    return this.rolPermisoService.findAll();
  }

  @ApiOperation({ summary: 'Consultar rol-permiso' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get(':id_rol/:id_permiso')
  findOne(
    @Param('id_rol', ParseIntPipe) id_rol: number,
    @Param('id_permiso', ParseIntPipe) id_permiso: number,
  ) {
    return this.rolPermisoService.findOne(id_rol, id_permiso);
  }

  @ApiOperation({ summary: 'Crear registro en rol-permiso' })
  @ApiResponse({ status: 201, description: 'Respuesta exitosa' })
  @Post()
  create(@Body() createRolPermisoDto: CreateRolPermisoDto) {
    return this.rolPermisoService.create(createRolPermisoDto);
  }

  @ApiOperation({ summary: 'Eliminar registro de rol-permiso' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Delete(':id_rol/:id_permiso')
  remove(
    @Param('id_rol', ParseIntPipe) id_rol: number,
    @Param('id_permiso', ParseIntPipe) id_permiso: number,
  ) {
    return this.rolPermisoService.remove(id_rol, id_permiso);
  }
}

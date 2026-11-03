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

import { UsuarioSucursalService } from './usuario-sucursal.service';
import { CreateUsuarioSucursalDto } from './dto/create-usuario-sucursal.dto';

@ApiTags('usuario-sucursal')
@Controller('usuario-sucursal')
export class UsuarioSucursalController {
  constructor(
    private readonly usuarioSucursalService: UsuarioSucursalService,
  ) {}

  @ApiOperation({ summary: 'Listar usuario-sucursal' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get()
  findAll() {
    return this.usuarioSucursalService.findAll();
  }

  @ApiOperation({ summary: 'Consultar usuario-sucursal' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get(':id_usuario/:id_sucursal')
  findOne(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_sucursal', ParseIntPipe) id_sucursal: number,
  ) {
    return this.usuarioSucursalService.findOne(id_usuario, id_sucursal);
  }

  @ApiOperation({ summary: 'Crear registro en usuario-sucursal' })
  @ApiResponse({ status: 201, description: 'Respuesta exitosa' })
  @Post()
  create(@Body() createUsuarioSucursalDto: CreateUsuarioSucursalDto) {
    return this.usuarioSucursalService.create(createUsuarioSucursalDto);
  }

  @ApiOperation({ summary: 'Eliminar registro de usuario-sucursal' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Delete(':id_usuario/:id_sucursal')
  remove(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_sucursal', ParseIntPipe) id_sucursal: number,
  ) {
    return this.usuarioSucursalService.remove(id_usuario, id_sucursal);
  }
}

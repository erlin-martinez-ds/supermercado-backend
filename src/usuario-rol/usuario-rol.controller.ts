import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { UsuarioRolService } from './usuario-rol.service';
import { CreateUsuarioRolDto } from './dto/create-usuario-rol.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('usuario-rol')
@Controller('usuario-rol')
export class UsuarioRolController {
  constructor(private readonly usuarioRolService: UsuarioRolService) {}

  @ApiOperation({ summary: 'Listar usuario-rol' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador', 'Coordinador', 'Contador', 'Fiscal')
  findAll() {
    return this.usuarioRolService.findAll();
  }

  @ApiOperation({ summary: 'Consultar usuario-rol' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Get(':id_usuario/:id_rol')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador', 'Coordinador', 'Contador', 'Fiscal')
  findOne(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_rol', ParseIntPipe) id_rol: number,
  ) {
    return this.usuarioRolService.findOne(id_usuario, id_rol);
  }

  @ApiOperation({ summary: 'Crear registro en usuario-rol' })
  @ApiResponse({ status: 201, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  create(@Body() createUsuarioRolDto: CreateUsuarioRolDto) {
    return this.usuarioRolService.create(createUsuarioRolDto);
  }

  @ApiOperation({ summary: 'Eliminar registro de usuario-rol' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Delete(':id_usuario/:id_rol')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador')
  remove(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_rol', ParseIntPipe) id_rol: number,
  ) {
    return this.usuarioRolService.remove(id_usuario, id_rol);
  }
}

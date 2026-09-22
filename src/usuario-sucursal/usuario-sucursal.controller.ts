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

@Controller('usuario-sucursal')
export class UsuarioSucursalController {
  constructor(
    private readonly usuarioSucursalService: UsuarioSucursalService,
  ) {}

  @Get()
  findAll() {
    return this.usuarioSucursalService.findAll();
  }

  @Get(':id_usuario/:id_sucursal')
  findOne(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_sucursal', ParseIntPipe) id_sucursal: number,
  ) {
    return this.usuarioSucursalService.findOne(
      id_usuario,
      id_sucursal,
    );
  }

  @Post()
  create(
    @Body() createUsuarioSucursalDto: CreateUsuarioSucursalDto,
  ) {
    return this.usuarioSucursalService.create(
      createUsuarioSucursalDto,
    );
  }

  @Delete(':id_usuario/:id_sucursal')
  remove(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_sucursal', ParseIntPipe) id_sucursal: number,
  ) {
    return this.usuarioSucursalService.remove(
      id_usuario,
      id_sucursal,
    );
  }
}
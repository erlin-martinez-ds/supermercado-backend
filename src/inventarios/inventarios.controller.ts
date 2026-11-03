import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import { Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('inventarios')
@Controller('inventarios')
export class InventariosController {
  constructor(private readonly inventariosService: InventariosService) {}

  @ApiOperation({ summary: 'Listar inventarios' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'Administrador',
    'Coordinador',
    'Contador',
    'Fiscal',
    'Encargado de sucursal',
    'Cajero',
  )
  findAll(@Request() req: any) {
    return this.inventariosService.findAll(Number(req.user.id_usuario));
  }

  @ApiOperation({ summary: 'Consultar inventarios' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'Administrador',
    'Coordinador',
    'Contador',
    'Fiscal',
    'Encargado de sucursal',
    'Cajero',
  )
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.inventariosService.findOne(id, Number(req.user.id_usuario));
  }

  @ApiOperation({ summary: 'Crear registro en inventarios' })
  @ApiResponse({ status: 201, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador', 'Coordinador', 'Encargado de sucursal')
  create(
    @Body() createInventarioDto: CreateInventarioDto,
    @Request() req: any,
  ) {
    return this.inventariosService.create(
      createInventarioDto,
      Number(req.user.id_usuario),
    );
  }
}

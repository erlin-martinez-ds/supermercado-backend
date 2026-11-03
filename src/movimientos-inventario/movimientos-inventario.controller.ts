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
  Request,
  UseGuards,
} from '@nestjs/common';

import { MovimientosInventarioService } from './movimientos-inventario.service';

import { CreateMovimientoInventarioDto } from './dto/create-movimiento-inventario.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('movimientos-inventario')
@Controller('movimientos-inventario')
export class MovimientosInventarioController {
  constructor(
    private readonly movimientosService: MovimientosInventarioService,
  ) {}

  @ApiOperation({ summary: 'Listar movimientos-inventario' })
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
  )
  findAll(@Request() req: any) {
    return this.movimientosService.findAll(Number(req.user.id_usuario));
  }

  @ApiOperation({ summary: 'Consultar movimientos-inventario' })
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
  )
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.movimientosService.findOne(id, Number(req.user.id_usuario));
  }

  @ApiOperation({ summary: 'Crear registro en movimientos-inventario' })
  @ApiResponse({ status: 201, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador', 'Coordinador', 'Encargado de sucursal')
  create(
    @Body()
    createMovimientoInventarioDto: CreateMovimientoInventarioDto,
    @Request() req: any,
  ) {
    return this.movimientosService.create(
      createMovimientoInventarioDto,
      Number(req.user.id_usuario),
    );
  }
}

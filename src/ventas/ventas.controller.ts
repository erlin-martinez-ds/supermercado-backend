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
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('ventas')
@Controller('ventas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @ApiOperation({ summary: 'Listar ventas' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Get()
  @Roles(
    'Administrador',
    'Coordinador',
    'Contador',
    'Fiscal',
    'Encargado de sucursal',
    'Cajero',
  )
  findAll(@Request() req: any) {
    return this.ventasService.findAll(Number(req.user.id_usuario));
  }

  @ApiOperation({ summary: 'Consultar ventas' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Get(':id')
  @Roles(
    'Administrador',
    'Coordinador',
    'Contador',
    'Fiscal',
    'Encargado de sucursal',
    'Cajero',
  )
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ventasService.findOne(id, Number(req.user.id_usuario));
  }

  @ApiOperation({ summary: 'Crear registro en ventas' })
  @ApiResponse({ status: 201, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Post()
  @Roles('Administrador', 'Coordinador', 'Encargado de sucursal', 'Cajero')
  create(@Body() dto: CreateVentaDto, @Request() req: any) {
    return this.ventasService.create(dto, Number(req.user.id_usuario));
  }

  @ApiOperation({ summary: 'Anular ventas' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Patch(':id/anular')
  @Roles('Administrador', 'Coordinador', 'Encargado de sucursal')
  anular(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ventasService.anular(id, Number(req.user.id_usuario));
  }
}

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
} from '@nestjs/common';

import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id_usuario: number | string;
  };
}

@ApiTags('compras')
@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @ApiOperation({ summary: 'Listar compras' })
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
  findAll(@Request() req: AuthenticatedRequest) {
    return this.comprasService.findAll(Number(req.user.id_usuario));
  }

  @ApiOperation({ summary: 'Consultar compras' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador', 'Coordinador', 'Encargado de sucursal')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.comprasService.findOne(id, Number(req.user.id_usuario));
  }

  @ApiOperation({ summary: 'Crear registro en compras' })
  @ApiResponse({ status: 201, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador', 'Coordinador', 'Encargado de sucursal')
  create(
    @Body() createCompraDto: CreateCompraDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.comprasService.create(
      createCompraDto,
      Number(req.user.id_usuario),
    );
  }

  @ApiOperation({ summary: 'Confirmar compras' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @ApiBearerAuth()
  @Patch(':id/confirmar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador', 'Coordinador', 'Encargado de sucursal')
  confirmar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.comprasService.confirmar(id, Number(req.user.id_usuario));
  }
}

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import { FacturasService } from './facturas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProcesadorFacturacionService } from './procesador-facturacion/procesador-facturacion.service';
interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id_usuario: number | string;
  };
}

@ApiTags('facturas')
@Controller('facturas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacturasController {
  constructor(
    private readonly facturasService: FacturasService,
    private readonly procesadorFacturacion: ProcesadorFacturacionService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar facturas accesibles para el usuario' })
  @ApiOkResponse({ description: 'Lista de facturas' })
  @Get()
  @Roles(
    'Administrador',
    'Coordinador',
    'Contador',
    'Fiscal',
    'Encargado de sucursal',
    'Cajero',
  )
  findAll(@Request() req: AuthenticatedRequest) {
    return this.facturasService.findAll(Number(req.user.id_usuario));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar la factura de una venta' })
  @ApiParam({ name: 'idVenta', type: Number, description: 'ID de la venta' })
  @ApiOkResponse({ description: 'Factura encontrada' })
  @ApiForbiddenResponse({ description: 'Sin acceso a la sucursal' })
  @ApiNotFoundResponse({ description: 'No existe factura para la venta' })
  @Get('venta/:idVenta')
  @Roles(
    'Administrador',
    'Coordinador',
    'Contador',
    'Fiscal',
    'Encargado de sucursal',
    'Cajero',
  )
  findByVenta(
    @Param('idVenta', ParseIntPipe) idVenta: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.facturasService.findByVenta(
      idVenta,
      Number(req.user.id_usuario),
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar una factura por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la factura' })
  @ApiOkResponse({ description: 'Factura encontrada' })
  @ApiForbiddenResponse({ description: 'Sin acceso a la sucursal' })
  @ApiNotFoundResponse({ description: 'Factura no encontrada' })
  @Get(':id')
  @Roles(
    'Administrador',
    'Coordinador',
    'Contador',
    'Fiscal',
    'Encargado de sucursal',
    'Cajero',
  )
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.facturasService.findOne(id, Number(req.user.id_usuario));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Anular una factura' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la factura' })
  @ApiOkResponse({ description: 'Factura anulada' })
  @ApiBadRequestResponse({ description: 'La factura ya está anulada' })
  @ApiForbiddenResponse({ description: 'Sin autorización para anularla' })
  @ApiNotFoundResponse({ description: 'Factura no encontrada' })
  @Patch(':id/anular')
  @Roles('Administrador', 'Coordinador', 'Encargado de sucursal')
  anular(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.facturasService.anular(id, Number(req.user.id_usuario));
  }

  @ApiBearerAuth()
  @Patch('trabajos/:id/reintentar')
  @Roles('Administrador', 'Coordinador')
  async reintentarTrabajo(@Param('id', ParseIntPipe) id: number) {
    await this.procesadorFacturacion.reintentarTrabajo(id);

    return {
      mensaje: 'Trabajo reprogramado para un nuevo intento.',
      id_trabajo: id,
    };
  }
}

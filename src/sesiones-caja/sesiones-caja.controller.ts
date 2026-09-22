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

import { SesionesCajaService } from './sesiones-caja.service';
import { CreateSesionCajaDto } from './dto/create-sesion-caja.dto';
import { CerrarSesionCajaDto } from './dto/cerrar-sesion-caja.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('sesiones-caja')
export class SesionesCajaController {
  constructor(private readonly sesionesCajaService: SesionesCajaService) {}

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
    return this.sesionesCajaService.findAll(Number(req.user.id_usuario));
  }
  @Get('caja/:idCaja/abierta')
  @UseGuards(JwtAuthGuard)
  findAbiertaPorCaja(
    @Param('idCaja', ParseIntPipe) idCaja: number,
    @Request() req: any,
  ) {
    return this.sesionesCajaService.findAbiertaPorCaja(
      idCaja,
      Number(req.user.id_usuario),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.sesionesCajaService.findOne(id, Number(req.user.id_usuario));
  }

  @Post('abrir')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador', 'Coordinador', 'Encargado de sucursal', 'Cajero')
  abrir(@Body() dto: CreateSesionCajaDto, @Request() req: any) {
    return this.sesionesCajaService.abrir(dto, Number(req.user.id_usuario));
  }

  @Patch(':id/cerrar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrador', 'Coordinador', 'Encargado de sucursal', 'Cajero')
  cerrar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CerrarSesionCajaDto,
    @Request() req: any,
  ) {
    return this.sesionesCajaService.cerrar(
      id,
      dto,
      Number(req.user.id_usuario),
    );
  }
}

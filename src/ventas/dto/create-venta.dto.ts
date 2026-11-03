import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { CreateDetalleVentaDto } from './create-detalle-venta.dto';
import { CreatePagoVentaDto } from './create-pago-venta.dto';

export class CreateVentaDto {
  @IsInt()
  @Min(1)
  @ApiProperty()
  id_sucursal: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  id_sesion_caja: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional()
  observaciones?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleVentaDto)
  @ApiProperty({ type: () => CreateDetalleVentaDto, isArray: true })
  detalles: CreateDetalleVentaDto[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePagoVentaDto)
  @ApiProperty({ type: () => CreatePagoVentaDto, isArray: true })
  pagos: CreatePagoVentaDto[];
}

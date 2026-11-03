import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { CreateDetalleDevolucionDto } from './create-detalle-devolucion.dto';

export class CreateDevolucionDto {
  @IsInt()
  @Min(1)
  @ApiProperty()
  id_sucursal: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  id_usuario: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional()
  id_venta?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional()
  id_compra?: number;

  @IsEnum(['CLIENTE', 'PROVEEDOR'])
  @ApiProperty()
  tipo: 'CLIENTE' | 'PROVEEDOR';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional()
  observaciones?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleDevolucionDto)
  @ApiProperty({ type: () => CreateDetalleDevolucionDto, isArray: true })
  detalles: CreateDetalleDevolucionDto[];
}

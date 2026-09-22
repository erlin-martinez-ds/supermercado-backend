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
  id_sucursal: number;

  @IsInt()
  @Min(1)
  id_usuario: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_venta?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_compra?: number;

  @IsEnum(['CLIENTE', 'PROVEEDOR'])
  tipo: 'CLIENTE' | 'PROVEEDOR';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleDevolucionDto)
  detalles: CreateDetalleDevolucionDto[];
}
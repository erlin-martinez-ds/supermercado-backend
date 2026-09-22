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
  id_sucursal: number;

  @IsInt()
  @Min(1)
  id_sesion_caja: number;
  
  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleVentaDto)
  detalles: CreateDetalleVentaDto[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePagoVentaDto)
  pagos: CreatePagoVentaDto[];
}

import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CreateDetalleCompraDto } from './create-detalle-compra.dto';

export class CreateCompraDto {
  @IsInt()
  @Min(1)
  id_proveedor: number;

  @IsInt()
  @Min(1)
  id_sucursal: number;

  @IsInt()
  @Min(1)
  id_usuario: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleCompraDto)
  detalles: CreateDetalleCompraDto[];
}
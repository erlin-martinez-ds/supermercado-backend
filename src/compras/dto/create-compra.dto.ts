import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty()
  id_proveedor: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  id_sucursal: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional()
  observaciones?: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleCompraDto)
  @ApiProperty({ type: () => CreateDetalleCompraDto, isArray: true })
  detalles: CreateDetalleCompraDto[];
}

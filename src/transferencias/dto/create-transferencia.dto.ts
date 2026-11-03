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
  IsNumber,
} from 'class-validator';

import { Type } from 'class-transformer';

class CreateDetalleTransferenciaDto {
  @IsInt()
  @Min(1)
  id_producto: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  cantidad: number;
}

export class CreateTransferenciaDto {
  @IsInt()
  @Min(1)
  @ApiProperty()
  id_sucursal_origen: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  id_sucursal_destino: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  id_usuario: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional()
  observaciones?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleTransferenciaDto)
  @ApiProperty({ type: () => CreateDetalleTransferenciaDto, isArray: true })
  detalles: CreateDetalleTransferenciaDto[];
}

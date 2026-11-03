import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiPropertyOptional()
  codigo_barras?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @ApiProperty()
  nombre: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  descripcion?: string;

  @IsInt()
  @Min(1)
  @ApiProperty()
  id_categoria: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  id_unidad_medida: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ApiProperty()
  precio_compra: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ApiProperty()
  precio_venta: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @ApiPropertyOptional()
  stock_minimo?: number;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  @ApiPropertyOptional()
  estado?: 'ACTIVO' | 'INACTIVO';
}

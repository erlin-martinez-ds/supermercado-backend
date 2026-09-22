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
  codigo_barras?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsInt()
  @Min(1)
  id_categoria: number;

  @IsInt()
  @Min(1)
  id_unidad_medida: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio_compra: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio_venta: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  stock_minimo?: number;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: 'ACTIVO' | 'INACTIVO';
}
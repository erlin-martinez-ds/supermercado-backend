import {
  IsInt,
  IsNumber,
  Max,
  Min,
} from 'class-validator';

export class CreateDetalleVentaDto {
  @IsInt()
  @Min(1)
  id_producto: number;

  @IsInt()
  @Min(1)
  id_impuesto: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  porcentaje_descuento: number;
}
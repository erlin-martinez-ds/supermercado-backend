import {
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateDetalleCompraDto {
  @IsInt()
  @Min(1)
  id_producto: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  precio_unitario: number;
}
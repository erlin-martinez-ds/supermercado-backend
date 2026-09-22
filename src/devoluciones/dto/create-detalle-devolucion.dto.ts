import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateDetalleDevolucionDto {
  @IsInt()
  @Min(1)
  id_producto: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  cantidad: number;
}
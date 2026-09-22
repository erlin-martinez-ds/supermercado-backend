import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePagoVentaDto {
  @IsInt()
  @Min(1)
  id_venta: number;

  @IsInt()
  @Min(1)
  id_metodo_pago: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  monto: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referencia?: string;
}
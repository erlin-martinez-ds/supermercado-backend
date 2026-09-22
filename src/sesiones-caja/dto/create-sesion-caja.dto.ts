import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSesionCajaDto {
  @IsInt()
  @Min(1)
  id_caja: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monto_inicial: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
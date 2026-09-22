import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CerrarSesionCajaDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monto_final: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty()
  monto_final: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional()
  observaciones?: string;
}

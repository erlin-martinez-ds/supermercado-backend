import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty()
  id_caja: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ApiProperty()
  monto_inicial: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional()
  observaciones?: string;
}

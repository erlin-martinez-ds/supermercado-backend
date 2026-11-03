import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty()
  id_metodo_pago: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @ApiProperty()
  monto: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional()
  referencia?: string;
}

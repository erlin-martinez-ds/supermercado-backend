import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMovimientoInventarioDto {
  @IsInt()
  @Min(1)
  @ApiProperty()
  id_producto: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  id_sucursal: number;

  @IsIn(['AJUSTE_ENTRADA', 'AJUSTE_SALIDA'])
  @ApiProperty()
  tipo_movimiento: 'AJUSTE_ENTRADA' | 'AJUSTE_SALIDA';

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @ApiProperty()
  cantidad: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional()
  observacion?: string;
}

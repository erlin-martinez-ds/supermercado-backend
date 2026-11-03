import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateDetalleVentaDto {
  @IsInt()
  @Min(1)
  @ApiProperty()
  id_producto: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  id_impuesto: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @ApiProperty()
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @ApiProperty()
  porcentaje_descuento: number;
}

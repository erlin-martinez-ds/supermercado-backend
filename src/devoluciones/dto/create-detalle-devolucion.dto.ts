import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateDetalleDevolucionDto {
  @IsInt()
  @Min(1)
  @ApiProperty()
  id_producto: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @ApiProperty()
  cantidad: number;
}

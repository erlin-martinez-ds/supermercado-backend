import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateInventarioDto {
  @IsInt()
  @Min(1)
  @ApiProperty()
  id_producto: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  id_sucursal: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @ApiProperty()
  cantidad: number;
}

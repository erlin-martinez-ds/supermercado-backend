import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateImpuestoDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nombre: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @ApiProperty()
  porcentaje: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  tipo: string;

  @IsIn(['ACTIVO', 'INACTIVO'])
  @ApiProperty()
  estado: 'ACTIVO' | 'INACTIVO';
}

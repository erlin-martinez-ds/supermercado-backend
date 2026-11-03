import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCajaDto {
  @IsInt()
  @Min(1)
  @ApiProperty()
  id_sucursal: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @ApiProperty()
  codigo: string;

  @IsIn(['ACTIVA', 'INACTIVA'])
  @ApiProperty()
  estado: 'ACTIVA' | 'INACTIVA';
}

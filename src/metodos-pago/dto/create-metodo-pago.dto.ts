import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMetodoPagoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty()
  nombre: string;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  @ApiPropertyOptional()
  estado?: 'ACTIVO' | 'INACTIVO';
}

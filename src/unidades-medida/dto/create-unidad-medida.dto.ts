import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUnidadMedidaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @ApiProperty()
  abreviatura: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  permite_decimales?: boolean;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  @ApiPropertyOptional()
  estado?: 'ACTIVO' | 'INACTIVO';
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty()
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional()
  descripcion?: string;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  @ApiPropertyOptional()
  estado?: 'ACTIVO' | 'INACTIVO';
}

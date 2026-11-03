import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @ApiProperty()
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiPropertyOptional()
  documento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiPropertyOptional()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional()
  direccion?: string;

  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  @ApiPropertyOptional()
  estado?: 'ACTIVO' | 'INACTIVO';
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAuditoriaDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional()
  id_usuario?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional()
  id_sucursal?: number;

  @IsString()
  @MaxLength(50)
  @ApiProperty()
  accion: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty()
  entidad: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional()
  id_registro?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional()
  datos_anteriores?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional()
  datos_nuevos?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional()
  observacion?: string;
}

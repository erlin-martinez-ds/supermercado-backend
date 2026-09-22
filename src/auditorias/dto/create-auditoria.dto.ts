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
  id_usuario?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_sucursal?: number;

  @IsString()
  @MaxLength(50)
  accion: string;

  @IsString()
  @MaxLength(100)
  entidad: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  id_registro?: string;

  @IsOptional()
  @IsObject()
  datos_anteriores?: Record<string, any>;

  @IsOptional()
  @IsObject()
  datos_nuevos?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  observacion?: string;
}
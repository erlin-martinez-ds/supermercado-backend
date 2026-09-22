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
  nombre: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  porcentaje: number;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsIn(['ACTIVO', 'INACTIVO'])
  estado: 'ACTIVO' | 'INACTIVO';
}
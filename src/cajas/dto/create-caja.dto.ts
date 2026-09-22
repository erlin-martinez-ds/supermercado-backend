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
  id_sucursal: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  codigo: string;

  @IsIn(['ACTIVA', 'INACTIVA'])
  estado: 'ACTIVA' | 'INACTIVA';
}
import { IsInt, Min } from 'class-validator';

export class CreateUsuarioSucursalDto {
  @IsInt()
  @Min(1)
  id_usuario: number;

  @IsInt()
  @Min(1)
  id_sucursal: number;
}
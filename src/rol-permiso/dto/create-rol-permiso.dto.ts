import { IsInt, Min } from 'class-validator';

export class CreateRolPermisoDto {
  @IsInt()
  @Min(1)
  id_rol: number;

  @IsInt()
  @Min(1)
  id_permiso: number;
}
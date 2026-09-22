import { IsInt, Min } from 'class-validator';

export class CreateUsuarioRolDto {
  @IsInt()
  @Min(1)
  id_usuario: number;

  @IsInt()
  @Min(1)
  id_rol: number;
}
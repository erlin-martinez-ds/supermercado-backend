import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateRolPermisoDto {
  @IsInt()
  @Min(1)
  @ApiProperty()
  id_rol: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  id_permiso: number;
}

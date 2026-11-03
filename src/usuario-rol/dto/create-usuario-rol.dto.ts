import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateUsuarioRolDto {
  @IsInt()
  @Min(1)
  @ApiProperty()
  id_usuario: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  id_rol: number;
}

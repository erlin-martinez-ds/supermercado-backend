import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Usuario } from '../../../usuarios/entities/usuario.entity/usuario.entity';
import { Rol } from '../../../roles/entities/rol.entity/rol.entity';

@Entity('usuario_rol')
export class UsuarioRol {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  id_usuario: number;

  @PrimaryColumn({ type: 'int', unsigned: true })
  id_rol: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'id_rol' })
  rol: Rol;
}
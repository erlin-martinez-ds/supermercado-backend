import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Usuario } from '../../../usuarios/entities/usuario.entity/usuario.entity';
import { Sucursal } from '../../../sucursales/entities/sucursal.entity/sucursal.entity';

@Entity('usuario_sucursal')
export class UsuarioSucursal {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  id_usuario: number;

  @PrimaryColumn({ type: 'int', unsigned: true })
  id_sucursal: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: Sucursal;
}
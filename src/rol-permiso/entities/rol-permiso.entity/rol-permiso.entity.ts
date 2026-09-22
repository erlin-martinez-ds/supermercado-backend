import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Rol } from '../../../roles/entities/rol.entity/rol.entity';
import { Permiso } from '../../../permisos/entities/permiso.entity/permiso.entity';

@Entity('rol_permiso')
@Index(['id_rol', 'id_permiso'], { unique: true })
export class RolPermiso {
  @PrimaryColumn({ type: 'int', unsigned: true })
  id_rol: number;

  @PrimaryColumn({ type: 'int', unsigned: true })
  id_permiso: number;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'id_rol' })
  rol: Rol;

  @ManyToOne(() => Permiso)
  @JoinColumn({ name: 'id_permiso' })
  permiso: Permiso;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../../usuarios/entities/usuario.entity/usuario.entity';
import { Sucursal } from '../../../sucursales/entities/sucursal.entity/sucursal.entity';

@Entity('auditorias')
export class Auditoria {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_auditoria: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  id_usuario: number | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  id_sucursal: number | null;

  @ManyToOne(() => Sucursal, { nullable: true })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: Sucursal | null;

  @Column({ type: 'varchar', length: 50 })
  accion: string;

  @Column({ type: 'varchar', length: 100 })
  entidad: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  id_registro: string | null;

  @Column({ type: 'json', nullable: true })
  datos_anteriores: Record<string, any> | null;

  @Column({ type: 'json', nullable: true })
  datos_nuevos: Record<string, any> | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observacion: string | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}

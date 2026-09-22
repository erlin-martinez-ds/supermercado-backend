import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sucursal } from '../../../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../../../usuarios/entities/usuario.entity/usuario.entity';

@Entity('transferencias')
export class Transferencia {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_transferencia: number;

  @Column({ type: 'int', unsigned: true })
  id_sucursal_origen: number;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'id_sucursal_origen' })
  sucursal_origen: Sucursal;

  @Column({ type: 'int', unsigned: true })
  id_sucursal_destino: number;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'id_sucursal_destino' })
  sucursal_destino: Sucursal;

  @Column({ type: 'bigint', unsigned: true })
  id_usuario: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({
    type: 'enum',
    enum: [
      'REGISTRADA',
      'EN_TRANSITO',
      'RECIBIDA',
      'CANCELADA',
    ],
    default: 'REGISTRADA',
  })
  estado:
    | 'REGISTRADA'
    | 'EN_TRANSITO'
    | 'RECIBIDA'
    | 'CANCELADA';

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
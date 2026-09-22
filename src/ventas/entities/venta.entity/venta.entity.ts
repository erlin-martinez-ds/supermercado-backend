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
import { SesionCaja } from '../../../sesiones-caja/entities/sesion-caja.entity/sesion-caja.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_venta: number;

  @Column({ type: 'int', unsigned: true })
  id_sucursal: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  id_sesion_caja: number | null;

  @ManyToOne(() => SesionCaja)
  @JoinColumn({ name: 'id_sesion_caja' })
  sesion_caja: SesionCaja;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: Sucursal;

  @Column({ type: 'bigint', unsigned: true })
  id_usuario: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  total: number;

  @Column({
    type: 'enum',
    enum: ['CONFIRMADA', 'ANULADA'],
    default: 'CONFIRMADA',
  })
  estado: 'CONFIRMADA' | 'ANULADA';

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}

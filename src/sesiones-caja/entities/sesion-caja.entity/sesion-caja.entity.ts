import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Caja } from '../../../cajas/entities/caja.entity/caja.entity';
import { Usuario } from '../../../usuarios/entities/usuario.entity/usuario.entity';

@Entity('sesiones_caja')
export class SesionCaja {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_sesion_caja: number;

  @Column({ type: 'bigint', unsigned: true })
  id_caja: number;

  @ManyToOne(() => Caja)
  @JoinColumn({ name: 'id_caja' })
  caja: Caja;

  @Column({ type: 'bigint', unsigned: true })
  id_usuario_apertura: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  id_usuario_cierre: number | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario_cierre' })
  usuario_cierre: Usuario | null;
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario_apertura' })
  usuario_apertura: Usuario;

  @CreateDateColumn({ type: 'datetime' })
  fecha_apertura: Date;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  monto_inicial: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  efectivo_esperado: number | null;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  fecha_cierre: Date | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  monto_final: number | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  diferencia: number | null;

  @Column({
    type: 'enum',
    enum: ['ABIERTA', 'CERRADA'],
    default: 'ABIERTA',
  })
  estado: 'ABIERTA' | 'CERRADA';

  @Column({
    type: 'text',
    nullable: true,
  })
  observaciones: string | null;
}

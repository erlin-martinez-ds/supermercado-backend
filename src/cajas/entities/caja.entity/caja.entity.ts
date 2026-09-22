import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Sucursal } from '../../../sucursales/entities/sucursal.entity/sucursal.entity';

@Entity('cajas')
export class Caja {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_caja: number;

  @Column({ type: 'int', unsigned: true })
  id_sucursal: number;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: Sucursal;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  codigo: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVA', 'INACTIVA'],
    default: 'ACTIVA',
  })
  estado: 'ACTIVA' | 'INACTIVA';

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
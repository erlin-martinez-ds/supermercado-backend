import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Venta } from '../../ventas/entities/venta.entity/venta.entity';

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_factura: number;

  @Column({ type: 'bigint', unsigned: true, unique: true })
  id_venta: number;

  @ManyToOne(() => Venta)
  @JoinColumn({ name: 'id_venta' })
  venta: Venta;

  @Column({ type: 'varchar', length: 50, unique: true })
  numero_factura: string;

  @Column({ type: 'datetime' })
  fecha_emision: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_descuento: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_impuesto: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: ['EMITIDA', 'ANULADA'],
    default: 'EMITIDA',
  })
  estado: 'EMITIDA' | 'ANULADA';

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
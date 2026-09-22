import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Venta } from '../venta.entity/venta.entity';
import { MetodoPago } from '../../../metodos-pago/entities/metodo-pago.entity/metodo-pago.entity';

@Entity('pagos_venta')
export class PagoVenta {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_pago_venta: number;

  @Column({ type: 'bigint', unsigned: true })
  id_venta: number;

  @ManyToOne(() => Venta)
  @JoinColumn({ name: 'id_venta' })
  venta: Venta;

  @Column({ type: 'int', unsigned: true })
  id_metodo_pago: number;

  @ManyToOne(() => MetodoPago)
  @JoinColumn({ name: 'id_metodo_pago' })
  metodo_pago: MetodoPago;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  monto: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  referencia: string | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}


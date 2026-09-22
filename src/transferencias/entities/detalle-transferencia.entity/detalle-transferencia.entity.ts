import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transferencia } from '../transferencia.entity/transferencia.entity';
import { Producto } from '../../../productos/entities/producto.entity/producto.entity';

@Entity('detalle_transferencias')
export class DetalleTransferencia {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_detalle_transferencia: number;

  @Column({ type: 'bigint', unsigned: true })
  id_transferencia: number;

  @ManyToOne(() => Transferencia)
  @JoinColumn({ name: 'id_transferencia' })
  transferencia: Transferencia;

  @Column({ type: 'bigint', unsigned: true })
  id_producto: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 3,
  })
  cantidad: number;
}
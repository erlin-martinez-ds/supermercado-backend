import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Compra } from '../compra.entity/compra.entity';
import { Producto } from '../../../productos/entities/producto.entity/producto.entity';

@Entity('detalle_compras')
export class DetalleCompra {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_detalle_compra: number;

  @Column({ type: 'bigint', unsigned: true })
  id_compra: number;

  @ManyToOne(() => Compra)
  @JoinColumn({ name: 'id_compra' })
  compra: Compra;

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

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  precio_unitario: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  subtotal: number;
}
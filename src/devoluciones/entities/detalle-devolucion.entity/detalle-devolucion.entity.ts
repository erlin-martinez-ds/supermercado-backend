import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Devolucion } from '../devolucion.entity/devolucion.entity';
import { Producto } from '../../../productos/entities/producto.entity/producto.entity';

@Entity('detalle_devoluciones')
export class DetalleDevolucion {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_detalle_devolucion: number;

  @Column({ type: 'bigint', unsigned: true })
  id_devolucion: number;

  @ManyToOne(() => Devolucion)
  @JoinColumn({ name: 'id_devolucion' })
  devolucion: Devolucion;

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
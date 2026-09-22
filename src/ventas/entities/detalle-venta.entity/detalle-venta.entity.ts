import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Venta } from '../venta.entity/venta.entity';
import { Producto } from '../../../productos/entities/producto.entity/producto.entity';
import { Impuesto } from '../../../impuestos/entities/impuesto.entity/impuesto.entity';

@Entity('detalle_ventas')
export class DetalleVenta {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_detalle_venta: number;

  @Column({ type: 'bigint', unsigned: true })
  id_venta: number;

  @ManyToOne(() => Venta)
  @JoinColumn({ name: 'id_venta' })
  venta: Venta;

  @Column({ type: 'bigint', unsigned: true })
  id_producto: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;

  @Column({ type: 'int', unsigned: true })
  id_impuesto: number;

  @ManyToOne(() => Impuesto)
  @JoinColumn({ name: 'id_impuesto' })
  impuesto: Impuesto;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precio_unitario: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  porcentaje_descuento: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  valor_descuento: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  porcentaje_impuesto: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  valor_impuesto: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;
}
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { Producto } from '../../../productos/entities/producto.entity/producto.entity';
import { Sucursal } from '../../../sucursales/entities/sucursal.entity/sucursal.entity';

@Entity('inventarios')
@Unique(['id_producto', 'id_sucursal'])
export class Inventario {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_inventario: number;

  @Column({ type: 'bigint', unsigned: true })
  id_producto: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;

  @Column({ type: 'int', unsigned: true })
  id_sucursal: number;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'id_sucursal' })
  sucursal: Sucursal;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 3,
    default: 0,
  })
  cantidad: number;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
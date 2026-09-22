import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Producto } from '../../../productos/entities/producto.entity/producto.entity';
import { Sucursal } from '../../../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../../../usuarios/entities/usuario.entity/usuario.entity';

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_movimiento: number;

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

  @Column({ type: 'bigint', unsigned: true })
  id_usuario: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({
    type: 'enum',
    enum: [
      'COMPRA',
      'VENTA',
      'AJUSTE_ENTRADA',
      'AJUSTE_SALIDA',
      'DEVOLUCION_CLIENTE',
      'DEVOLUCION_PROVEEDOR',
      'TRANSFERENCIA_SALIDA',
      'TRANSFERENCIA_ENTRADA',
    ],
  })
  tipo_movimiento:
    | 'COMPRA'
    | 'VENTA'
    | 'AJUSTE_ENTRADA'
    | 'AJUSTE_SALIDA'
    | 'DEVOLUCION_CLIENTE'
    | 'DEVOLUCION_PROVEEDOR'
    | 'TRANSFERENCIA_SALIDA'
    | 'TRANSFERENCIA_ENTRADA';

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 3,
  })
  cantidad: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 3,
  })
  cantidad_anterior: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 3,
  })
  cantidad_nueva: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observacion: string | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
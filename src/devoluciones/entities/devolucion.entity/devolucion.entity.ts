import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sucursal } from '../../../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../../../usuarios/entities/usuario.entity/usuario.entity';
import { Venta } from '../../../ventas/entities/venta.entity/venta.entity';
import { Compra } from '../../../compras/entities/compra.entity/compra.entity';

@Entity('devoluciones')
export class Devolucion {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_devolucion: number;

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

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  id_venta: number | null;

  @ManyToOne(() => Venta, { nullable: true })
  @JoinColumn({ name: 'id_venta' })
  venta: Venta | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  id_compra: number | null;

  @ManyToOne(() => Compra, { nullable: true })
  @JoinColumn({ name: 'id_compra' })
  compra: Compra | null;

  @Column({
    type: 'enum',
    enum: ['CLIENTE', 'PROVEEDOR'],
  })
  tipo:
    | 'CLIENTE'
    | 'PROVEEDOR';

  @Column({
    type: 'enum',
    enum: ['REGISTRADA', 'CONFIRMADA', 'ANULADA'],
    default: 'REGISTRADA',
  })
  estado:
    | 'REGISTRADA'
    | 'CONFIRMADA'
    | 'ANULADA';

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
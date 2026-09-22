import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Proveedor } from '../../../proveedores/entities/proveedor.entity/proveedor.entity';
import { Sucursal } from '../../../sucursales/entities/sucursal.entity/sucursal.entity';
import { Usuario } from '../../../usuarios/entities/usuario.entity/usuario.entity';

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_compra: number;

  @Column({ type: 'int', unsigned: true })
  id_proveedor: number;

  @ManyToOne(() => Proveedor)
  @JoinColumn({ name: 'id_proveedor' })
  proveedor: Proveedor;

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
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  total: number;

  @Column({
    type: 'enum',
    enum: ['REGISTRADA', 'CONFIRMADA', 'ANULADA'],
    default: 'REGISTRADA',
  })
  estado: 'REGISTRADA' | 'CONFIRMADA' | 'ANULADA';

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
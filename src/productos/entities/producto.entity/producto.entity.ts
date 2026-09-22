import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Categoria } from '../../../categorias/entities/categoria.entity/categoria.entity';
import { UnidadMedida } from '../../../unidades-medida/entities/unidad-medida.entity/unidad-medida.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_producto: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: true,
  })
  codigo_barras: string | null;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'int', unsigned: true })
  id_categoria: number;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;

  @Column({ type: 'int', unsigned: true })
  id_unidad_medida: number;

  @ManyToOne(() => UnidadMedida)
  @JoinColumn({ name: 'id_unidad_medida' })
  unidad_medida: UnidadMedida;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precio_compra: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precio_venta: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 3,
    default: 0,
  })
  stock_minimo: number;

  @Column({
    type: 'enum',
    enum: ['ACTIVO', 'INACTIVO'],
    default: 'ACTIVO',
  })
  estado: 'ACTIVO' | 'INACTIVO';

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}

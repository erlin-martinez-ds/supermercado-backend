import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('metodos_pago')
export class MetodoPago {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_metodo_pago: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombre: string;

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
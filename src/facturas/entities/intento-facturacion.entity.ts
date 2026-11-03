import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('intentos_facturacion')
@Index('IDX_intentos_facturacion_trabajo_numero', [
  'id_trabajo',
  'numero_intento',
])
export class IntentoFacturacion {
  @PrimaryGeneratedColumn()
  id_intento: number;

  @Column({ type: 'int' })
  id_trabajo: number;

  @Column({ type: 'int' })
  numero_intento: number;

  @Column({
    type: 'enum',
    enum: [
      'EN_PROCESO',
      'EXITO_SIMULADO',
      'ERROR_TEMPORAL',
      'RECHAZO_PERMANENTE',
      'EXCEPCION',
      'RESULTADO_TARDIO',
    ],
  })
  resultado: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigo_respuesta: string | null;

  @Column({ type: 'text', nullable: true })
  mensaje_respuesta: string | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn({ type: 'datetime' })
  fecha_intento: Date;
}

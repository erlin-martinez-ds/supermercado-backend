import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoTrabajoFacturacion {
  PENDIENTE = 'PENDIENTE',
  PROCESANDO = 'PROCESANDO',
  REINTENTO = 'REINTENTO',
  COMPLETADO = 'COMPLETADO',
  SIMULADO = 'SIMULADO',
  ERROR_PERMANENTE = 'ERROR_PERMANENTE',
  CANCELADO = 'CANCELADO',
}

@Entity('trabajos_facturacion')
export class TrabajoFacturacion {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id_trabajo: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    unique: true,
  })
  id_factura: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  clave_idempotencia: string;

  @Column({
    type: 'enum',
    enum: EstadoTrabajoFacturacion,
    default: EstadoTrabajoFacturacion.PENDIENTE,
  })
  estado: EstadoTrabajoFacturacion;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
  })
  intentos: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 10,
  })
  max_intentos: number;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  proximo_intento: Date | null;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  ultimo_intento: Date | null;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  bloqueado_hasta: Date | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  ultimo_error: string | null;

  @Column({
    type: 'json',
    nullable: true,
  })
  respuesta_proveedor: object | null;

  @CreateDateColumn({
    type: 'datetime',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'datetime',
  })
  updated_at: Date;
}

import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMovimientoInventarioDto {
  @IsInt()
  @Min(1)
  id_producto: number;

  @IsInt()
  @Min(1)
  id_sucursal: number;

  @IsInt()
  @Min(1)
  id_usuario: number;

  @IsIn([
    'COMPRA',
    'VENTA',
    'AJUSTE_ENTRADA',
    'AJUSTE_SALIDA',
    'DEVOLUCION_CLIENTE',
    'DEVOLUCION_PROVEEDOR',
    'TRANSFERENCIA_SALIDA',
    'TRANSFERENCIA_ENTRADA',
  ])
  tipo_movimiento:
    | 'COMPRA'
    | 'VENTA'
    | 'AJUSTE_ENTRADA'
    | 'AJUSTE_SALIDA'
    | 'DEVOLUCION_CLIENTE'
    | 'DEVOLUCION_PROVEEDOR'
    | 'TRANSFERENCIA_SALIDA'
    | 'TRANSFERENCIA_ENTRADA';

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  cantidad_anterior: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  cantidad_nueva: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  observacion?: string;
}
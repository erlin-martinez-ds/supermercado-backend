import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { PermisosModule } from './permisos/permisos.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { CategoriasModule } from './categorias/categorias.module';
import { UnidadesMedidaModule } from './unidades-medida/unidades-medida.module';
import { ProductosModule } from './productos/productos.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { MetodosPagoModule } from './metodos-pago/metodos-pago.module';
import { InventariosModule } from './inventarios/inventarios.module';
import { MovimientosInventarioModule } from './movimientos-inventario/movimientos-inventario.module';
import { UsuarioRolModule } from './usuario-rol/usuario-rol.module';
import { RolPermisoModule } from './rol-permiso/rol-permiso.module';
import { UsuarioSucursalModule } from './usuario-sucursal/usuario-sucursal.module';
import { ComprasModule } from './compras/compras.module';
import { VentasModule } from './ventas/ventas.module';
import { AuditoriasModule } from './auditorias/auditorias.module';
import { TransferenciasModule } from './transferencias/transferencias.module';
import { DevolucionesModule } from './devoluciones/devoluciones.module';
import { PagosVentaModule } from './pagos-venta/pagos-venta.module';
import { AuthModule } from './auth/auth.module';
import { ImpuestosModule } from './impuestos/impuestos.module';
import { FacturasModule } from './facturas/facturas.module';
import { CajasModule } from './cajas/cajas.module';
import { SesionesCajaModule } from './sesiones-caja/sesiones-caja.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),

        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    UsuariosModule,

    RolesModule,

    PermisosModule,

    SucursalesModule,

    CategoriasModule,

    UnidadesMedidaModule,

    ProductosModule,

    ProveedoresModule,

    MetodosPagoModule,

    InventariosModule,

    MovimientosInventarioModule,

    UsuarioRolModule,

    RolPermisoModule,

    UsuarioSucursalModule,

    ComprasModule,

    VentasModule,

    AuditoriasModule,

    TransferenciasModule,

    DevolucionesModule,

    PagosVentaModule,

    AuthModule,

    ImpuestosModule,

    FacturasModule,

    CajasModule,

    SesionesCajaModule,
  ],
})
export class AppModule {}

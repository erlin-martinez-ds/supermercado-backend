import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TrabajoFacturacion } from './entities/trabajo-facturacion.entity';
import { SimuladorProveedorService } from './simulador-proveedor.service';

const ejecutarPruebaMysql = process.env.RUN_MYSQL_INTEGRATION === 'true';

(ejecutarPruebaMysql ? describe : describe.skip)(
  'SimuladorProveedorService - Integración MySQL',
  () => {
    let moduloPruebas: TestingModule | undefined;
    let servicio: SimuladorProveedorService;
    let trabajoRepository: Repository<TrabajoFacturacion>;

    beforeAll(async () => {
      moduloPruebas = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
          }),

          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              type: 'mysql' as const,
              host: configService.get<string>('DB_HOST'),
              port: configService.get<number>('DB_PORT'),
              username: configService.get<string>('DB_USERNAME'),
              password: configService.get<string>('DB_PASSWORD'),
              database: configService.get<string>('DB_DATABASE'),
              autoLoadEntities: true,
              synchronize: false,
            }),
          }),

          TypeOrmModule.forFeature([TrabajoFacturacion]),
        ],
        providers: [SimuladorProveedorService],
      }).compile();

      servicio = moduloPruebas.get(SimuladorProveedorService);

      trabajoRepository = moduloPruebas.get<Repository<TrabajoFacturacion>>(
        getRepositoryToken(TrabajoFacturacion),
      );
    });

    afterAll(async () => {
      await moduloPruebas?.close();
    });

    it('debe recuperar desde MySQL una respuesta definitiva sin modificarla', async () => {
      const trabajoAntes = await trabajoRepository.findOne({
        where: { id_trabajo: 7 },
      });

      expect(trabajoAntes).not.toBeNull();

      if (!trabajoAntes) {
        throw new Error('No existe el trabajo de facturación 7.');
      }

      expect(trabajoAntes.estado).toBe('SIMULADO');
      expect(trabajoAntes.respuesta_proveedor).not.toBeNull();

      const respuestaGuardada = trabajoAntes.respuesta_proveedor;

      expect(respuestaGuardada?.resultado).toBe('EXITO_SIMULADO');

      const respuesta = await servicio.transmitir(
        trabajoAntes.id_factura,
        trabajoAntes.clave_idempotencia,
      );

      expect(respuesta).toEqual(respuestaGuardada);

      const trabajoDespues = await trabajoRepository.findOne({
        where: { id_trabajo: 7 },
      });

      expect(trabajoDespues).not.toBeNull();

      expect(trabajoDespues?.respuesta_proveedor).toEqual(respuestaGuardada);

      expect(trabajoDespues?.estado).toBe('SIMULADO');
    });
  },
);

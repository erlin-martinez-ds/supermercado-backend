import { Repository } from 'typeorm';
import { TrabajoFacturacion } from './entities/trabajo-facturacion.entity';
import { SimuladorProveedorService } from './simulador-proveedor.service';
import { jest } from '@jest/globals';
describe('SimuladorProveedorService', () => {
  let service: SimuladorProveedorService;
  let trabajo: Partial<TrabajoFacturacion>;
  let repository: {
    findOne: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(() => {
    trabajo = {
      id_trabajo: 1,
      id_factura: 2,
      clave_idempotencia: 'FACTURA-2',
      respuesta_proveedor: null,
    };

    repository = {
      findOne: jest.fn().mockImplementation(async () => trabajo),
      update: jest.fn().mockImplementation(async (_where, values) => {
        Object.assign(trabajo, values);
        return { affected: 1 };
      }),
    };

    service = new SimuladorProveedorService(
      repository as unknown as Repository<TrabajoFacturacion>,
    );
  });

  it('debe devolver la misma respuesta al repetir una clave', async () => {
    const primeraRespuesta = await service.transmitir(2, 'FACTURA-2');

    const segundaRespuesta = await service.transmitir(2, 'FACTURA-2');

    expect(segundaRespuesta).toEqual(primeraRespuesta);
    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledTimes(2);
  });

  it('debe rechazar una clave asociada a otra factura', async () => {
    await expect(service.transmitir(4, 'FACTURA-2')).rejects.toThrow(
      'La clave de idempotencia ya está asociada a otra factura.',
    );

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('debe permitir reintentar un error temporal', async () => {
    trabajo.id_factura = 3;
    trabajo.clave_idempotencia = 'FACTURA-3';

    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date('2026-11-02T20:30:00.000Z'));

      const primeraRespuesta = await service.transmitir(3, 'FACTURA-3');

      jest.setSystemTime(new Date('2026-11-02T20:30:01.000Z'));

      const segundaRespuesta = await service.transmitir(3, 'FACTURA-3');

      expect(primeraRespuesta.resultado).toBe('ERROR_TEMPORAL');
      expect(segundaRespuesta.resultado).toBe('ERROR_TEMPORAL');

      expect(segundaRespuesta.fecha_respuesta).not.toBe(
        primeraRespuesta.fecha_respuesta,
      );

      expect(repository.update).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});

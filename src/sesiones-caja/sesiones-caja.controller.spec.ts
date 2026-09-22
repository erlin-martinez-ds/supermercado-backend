import { Test, TestingModule } from '@nestjs/testing';
import { SesionesCajaController } from './sesiones-caja.controller';

describe('SesionesCajaController', () => {
  let controller: SesionesCajaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SesionesCajaController],
    }).compile();

    controller = module.get<SesionesCajaController>(SesionesCajaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ImpuestosController } from './impuestos.controller';

describe('ImpuestosController', () => {
  let controller: ImpuestosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImpuestosController],
    }).compile();

    controller = module.get<ImpuestosController>(ImpuestosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

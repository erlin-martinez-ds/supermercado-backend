import { Test, TestingModule } from '@nestjs/testing';
import { ImpuestosService } from './impuestos.service';

describe('ImpuestosService', () => {
  let service: ImpuestosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImpuestosService],
    }).compile();

    service = module.get<ImpuestosService>(ImpuestosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

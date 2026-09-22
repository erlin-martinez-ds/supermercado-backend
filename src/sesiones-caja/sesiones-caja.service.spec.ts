import { Test, TestingModule } from '@nestjs/testing';
import { SesionesCajaService } from './sesiones-caja.service';

describe('SesionesCajaService', () => {
  let service: SesionesCajaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SesionesCajaService],
    }).compile();

    service = module.get<SesionesCajaService>(SesionesCajaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

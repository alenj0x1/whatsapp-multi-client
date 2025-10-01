import { Test, TestingModule } from '@nestjs/testing';
import { PrismaMongoService } from './prisma-mongo.service';

describe('PrismaMongoService', () => {
  let service: PrismaMongoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaMongoService],
    }).compile();

    service = module.get<PrismaMongoService>(PrismaMongoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

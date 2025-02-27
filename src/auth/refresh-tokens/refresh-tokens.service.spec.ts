import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokensService } from './refresh-tokens.service';
import { PrismaService } from '../../prisma.service';

describe('RefreshTokensService', () => {
  let service: RefreshTokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshTokensService, PrismaService],
    }).compile();

    service = module.get<RefreshTokensService>(RefreshTokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { MainPostersStorage } from './main-posters.storage';
import { PrismaService } from '../prisma.service';
import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { ExtraPostersStorage } from './extra-posters.storage';

describe('EventsService', () => {
  let service: ActivitiesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        PrismaService,
        MainPostersStorage,
        ExtraPostersStorage,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .overrideProvider(MainPostersStorage)
      .useValue(mockDeep<MainPostersStorage>())
      .overrideProvider(ExtraPostersStorage)
      .useValue(mockDeep<ExtraPostersStorage>())
      .compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

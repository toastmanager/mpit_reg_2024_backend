import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { PostersStorage } from './posters.storage';
import { PrismaService } from '../prisma.service';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('EventsController', () => {
  let controller: ActivitiesController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [ActivitiesService, PrismaService, PostersStorage],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .overrideProvider(PostersStorage)
      .useValue(mockDeep<PostersStorage>())
      .compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

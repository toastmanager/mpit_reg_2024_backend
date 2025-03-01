import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { MainPostersStorage } from './main-posters.storage';
import { PrismaService } from '../prisma.service';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { ExtraPostersStorage } from './extra-posters.storage';
import { UsersService } from '../users/users.service';
import { ActivityReviewsService } from './reviews/activity-reviews.service';
import { AvatarsStorage } from '../users/avatars.storage';

describe('EventsController', () => {
  let controller: ActivitiesController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        ActivitiesService,
        ActivityReviewsService,
        AvatarsStorage,
        UsersService,
        PrismaService,
        MainPostersStorage,
        ExtraPostersStorage,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .overrideProvider(AvatarsStorage)
      .useValue(mockDeep<AvatarsStorage>())
      .overrideProvider(MainPostersStorage)
      .useValue(mockDeep<MainPostersStorage>())
      .overrideProvider(ExtraPostersStorage)
      .useValue(mockDeep<ExtraPostersStorage>())
      .compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

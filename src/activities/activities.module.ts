import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { PrismaService } from '../prisma.service';
import { MainPostersStorage } from './main-posters.storage';
import { ExtraPostersStorage } from './extra-posters.storage';
import { ActivityReviewsService } from './reviews/activity-reviews.service';
import { UsersService } from '../users/users.service';
import { AvatarsStorage } from '../users/avatars.storage';

@Module({
  controllers: [ActivitiesController],
  providers: [
    ActivitiesService,
    PrismaService,
    UsersService,
    AvatarsStorage,
    MainPostersStorage,
    ExtraPostersStorage,
    ActivityReviewsService,
  ],
})
export class ActivitiesModule {}

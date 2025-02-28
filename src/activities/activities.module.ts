import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { PrismaService } from '../prisma.service';
import { MainPostersStorage } from './main-posters.storage';
import { ExtraPostersStorage } from './extra-posters.storage';

@Module({
  controllers: [ActivitiesController],
  providers: [
    ActivitiesService,
    PrismaService,
    MainPostersStorage,
    ExtraPostersStorage,
  ],
})
export class ActivitiesModule {}

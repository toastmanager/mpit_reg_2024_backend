import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { PrismaService } from '../prisma.service';
import { PostersStorage } from './posters.storage';

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService, PrismaService, PostersStorage],
})
export class ActivitiesModule {}

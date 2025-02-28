import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PostersStorage } from './posters.storage';
import { Activity, Prisma } from '@prisma/client';
import { ActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postersStorage: PostersStorage,
  ) {}

  async create(args: Prisma.ActivityCreateArgs) {
    const activity = await this.prisma.activity.create(args);
    return activity;
  }

  async findMany(args?: Prisma.ActivityFindManyArgs) {
    const activitys = await this.prisma.activity.findMany(args);
    return activitys;
  }

  async findFirst(args?: Prisma.ActivityFindFirstArgs) {
    const activity = await this.prisma.activity.findFirst(args);
    return activity;
  }

  async findUnique(args: Prisma.ActivityFindUniqueArgs) {
    const activity = await this.prisma.activity.findUnique(args);
    return activity;
  }

  async update(args: Prisma.ActivityUpdateArgs) {
    const activity = await this.prisma.activity.update(args);
    return activity;
  }

  async remove(args: Prisma.ActivityDeleteArgs) {
    const activity = await this.prisma.activity.delete(args);
    return activity;
  }

  async getOneWithRelatedData(args: {
    activity: Activity;
  }): Promise<ActivityDto> {
    const { activity } = args;
    const mainPosterUrl = await this.postersStorage.getUrl({
      objectKey: activity.mainPosterKey,
    });

    return {
      ...activity,
      mainPosterUrl: mainPosterUrl ?? '',
    };
  }

  async getManyWithRelatedData(args: {
    activities: Activity[];
  }): Promise<ActivityDto[]> {
    const { activities: activties } = args;

    const res: ActivityDto[] = [];
    for (const activity of activties) {
      const activityWithRelatedData = await this.getOneWithRelatedData({
        activity,
      });
      res.push(activityWithRelatedData);
    }

    return res;
  }
}

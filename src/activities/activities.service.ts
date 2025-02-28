import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MainPostersStorage } from './main-posters.storage';
import { Activity, Prisma } from '@prisma/client';
import { ActivityDto } from './dto/activity.dto';
import { ExtraPostersStorage } from './extra-posters.storage';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mainPostersStorage: MainPostersStorage,
    private readonly extraPostersStorage: ExtraPostersStorage,
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

  async getActivityDto(args: { activity: Activity }): Promise<ActivityDto> {
    const { activity } = args;
    const mainPosterUrl = await this.mainPostersStorage.getUrl({
      objectKey: activity.mainPosterKey,
    });

    return {
      ...activity,
      mainPosterUrl: mainPosterUrl ?? '',
    };
  }

  async getActivitiesDto(args: {
    activities: Activity[];
  }): Promise<ActivityDto[]> {
    const { activities: activties } = args;

    const res: ActivityDto[] = [];
    for (const activity of activties) {
      const activityWithRelatedData = await this.getActivityDto({
        activity,
      });
      res.push(activityWithRelatedData);
    }

    return res;
  }

  async putMainPoster(args: {
    id: number;
    file: Express.Multer.File;
  }): Promise<String> {
    const { id, file } = args;
    const objectKey = await this.mainPostersStorage.put({
      filename: id.toString(),
      file: file.buffer,
    });
    return objectKey;
  }

  async removeMainPoster(args: { id: number }): Promise<Boolean> {
    const { id } = args;
    const isDeleted = await this.mainPostersStorage.delete({
      objectKey: id.toString(),
    });
    return isDeleted;
  }

  async addExtraPoster(args: {
    id: number;
    file: Express.Multer.File;
  }): Promise<String> {
    const { id, file } = args;
    const objectKey = await this.extraPostersStorage.put({
      filename: file.filename,
      file: file.buffer,
    });

    await this.prisma.activity.update({
      where: {
        id: id,
      },
      data: {
        extraPosters: {
          push: objectKey,
        },
      },
    });

    return objectKey;
  }

  async removeExtraPoster(args: {
    id: number;
    objectKey: string;
  }): Promise<Boolean> {
    const { id, objectKey } = args;
    const isDeleted = await this.extraPostersStorage.delete({
      objectKey: objectKey,
    });

    if (isDeleted) {
      const activity = await this.prisma.activity.findUnique({
        where: {
          id: id,
        },
      });

      await this.prisma.activity.update({
        where: {
          id: id,
        },
        data: {
          extraPosters: activity!.extraPosters.filter(
            (extraPosterKey) => extraPosterKey != objectKey,
          ),
        },
      });
    }

    return isDeleted;
  }
}

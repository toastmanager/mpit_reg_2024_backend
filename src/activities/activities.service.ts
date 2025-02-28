import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MainPostersStorage } from './main-posters.storage';
import { Activity, ActivityReview, Prisma } from '@prisma/client';
import { ActivityDto } from './dto/activity.dto';
import { ExtraPostersStorage } from './extra-posters.storage';
import { ActivityReviewDto } from './reviews/dto/activity-review.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mainPostersStorage: MainPostersStorage,
    private readonly extraPostersStorage: ExtraPostersStorage,
    private readonly usersService: UsersService,
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
    const extraPostersUrls = await this.extraPostersStorage.getUrls({
      objectKeys: activity.extraPostersKeys,
    });

    return {
      ...activity,
      mainPosterUrl: mainPosterUrl ?? '',
      extraPostersUrls: extraPostersUrls,
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
  }): Promise<string> {
    const { id, file } = args;
    const objectKey = await this.mainPostersStorage.put({
      filename: id.toString(),
      file: file.buffer,
    });
    return objectKey;
  }

  async removeMainPoster(args: { id: number }): Promise<boolean> {
    const { id } = args;
    const isDeleted = await this.mainPostersStorage.delete({
      objectKey: id.toString(),
    });
    return isDeleted;
  }

  async addExtraPoster(args: {
    id: number;
    file: Express.Multer.File;
  }): Promise<string> {
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
        extraPostersKeys: {
          push: objectKey,
        },
      },
    });

    return objectKey;
  }

  async removeExtraPoster(args: {
    id: number;
    objectKey: string;
  }): Promise<boolean> {
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
          extraPostersKeys: activity!.extraPostersKeys.filter(
            (extraPosterKey) => extraPosterKey != objectKey,
          ),
        },
      });
    }

    return isDeleted;
  }

  async checkOwnership(args: { id: number; userId: number }): Promise<boolean> {
    const { id, userId } = args;

    const activity = await this.findUnique({
      where: {
        id: +id,
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with id ${id} not found`);
    }

    if (activity.authorId != userId) {
      return false;
    }

    return true;
  }

  async getActivityReviewDto(args: {
    activityReview: ActivityReview;
  }): Promise<ActivityReviewDto> {
    const { activityReview } = args;

    const author = await this.usersService.findUnique({
      where: {
        id: activityReview.authorId,
      },
    });

    const userDto = await this.usersService.userWithRelatedData({
      user: author!,
    });

    return {
      ...activityReview,
      author: userDto,
    };
  }

  async getActivityReviewesDtos(args: {
    activityReviews: ActivityReview[];
  }): Promise<ActivityReviewDto[]> {
    const { activityReviews } = args;

    const dtos: ActivityReviewDto[] = [];
    for (const review of activityReviews) {
      const reviewDto = await this.getActivityReviewDto({
        activityReview: review,
      });
      dtos.push(reviewDto);
    }

    return dtos;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ActivityReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.ActivityReviewCreateArgs) {
    const activityReview = await this.prisma.activityReview.create(args);
    return activityReview;
  }

  async findMany(args?: Prisma.ActivityReviewFindManyArgs) {
    const activityReviews = await this.prisma.activityReview.findMany(args);
    return activityReviews;
  }

  async findFirst(args?: Prisma.ActivityReviewFindFirstArgs) {
    const activityReview = await this.prisma.activityReview.findFirst(args);
    return activityReview;
  }

  async findUnique(args: Prisma.ActivityReviewFindUniqueArgs) {
    const activityReview = await this.prisma.activityReview.findUnique(args);
    return activityReview;
  }

  async update(args: Prisma.ActivityReviewUpdateArgs) {
    const activityReview = await this.prisma.activityReview.update(args);
    return activityReview;
  }

  async remove(args: Prisma.ActivityReviewDeleteArgs) {
    const activityReview = await this.prisma.activityReview.delete(args);
    return activityReview;
  }

  async checkOwnership(args: { id: number; userId: number }): Promise<boolean> {
    const { id, userId } = args;

    const activityReview = await this.findUnique({
      where: {
        id: +id,
      },
    });

    if (!activityReview) {
      throw new NotFoundException(`ActivityReview with id ${id} not found`);
    }

    if (activityReview.authorId != userId) {
      return false;
    }

    return true;
  }
}

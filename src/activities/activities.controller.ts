import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ActivityDto } from './dto/activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOkResponse({
    type: ActivityDto,
    isArray: true,
  })
  async findAll(): Promise<ActivityDto[]> {
    const activities = await this.activitiesService.findMany();

    if (!activities) {
      return [];
    }

    const activitiesDtos = await this.activitiesService.getActivitiesDto({
      activities,
    });

    return activitiesDtos;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: ActivityDto,
  })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ): Promise<ActivityDto> {
    const { user } = req;

    const activity = await this.activitiesService.findUnique({
      where: {
        id: +id,
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with id ${id} not found`);
    }

    if (activity.authorId != +user.sub) {
      throw new ForbiddenException(
        `You have to be author of activity to update it`,
      );
    }

    const updatedActivity = await this.activitiesService.update({
      data: updateActivityDto,
      where: {
        id: +id,
      },
    });

    if (!updatedActivity) {
      throw new NotFoundException(`Activity with id ${id} not found`);
    }

    const activityDto = await this.activitiesService.getActivityDto({
      activity: updatedActivity,
    });

    return activityDto;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: ActivityDto,
  })
  async create(
    @Request() req: any,
    @Body() createActivityDto: CreateActivityDto,
  ): Promise<ActivityDto> {
    const { user } = req;

    const activity = await this.activitiesService.create({
      data: {
        ...createActivityDto,
        author: {
          connect: {
            id: +user.sub,
          },
        },
      },
    });

    if (!activity) {
      throw new InternalServerErrorException(
        'Failed to create activity with given data',
      );
    }

    const activityDto = await this.activitiesService.getActivityDto({
      activity,
    });

    return activityDto;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: String,
  })
  async delete(@Request() req: any, @Param('id') id: string): Promise<String> {
    const { user } = req;
    const activity = await this.activitiesService.findUnique({
      where: {
        id: +id,
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with id ${id} not found`);
    }

    if (activity.authorId != +user.sub) {
      throw new ForbiddenException(
        `You have to be author of activity to delete it`,
      );
    }

    const removedActivity = await this.activitiesService.remove({
      where: {
        id: +id,
      },
    });

    if (!removedActivity) {
      throw new InternalServerErrorException(
        `Failed to delete activity with id ${id}`,
      );
    }

    return 'Activity successfully deleted';
  }

  @Put(':id/main-poster')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: String,
  })
  async putMainPoster(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<String> {
    // TODO: Add main poster adding functionality as activity id
    return '';
  }

  @Delete(':id/main-poster')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: Boolean,
  })
  async removeMainPoster(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<Boolean> {
    // TODO: Add main poster deleting functionality by activity id
    return false;
  }

  @Post(':id/extra-posters')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: String,
  })
  async addExtraPoster(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<String> {
    // TODO: Add extra poster adding functionality
    return '';
  }

  @Delete(':id/extra-posters/:poster_key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: Boolean,
  })
  async removeExtraPoster(
    @Request() req: any,
    @Param('id') id: string,
    @Param('poster_key') posterKey: string,
  ): Promise<Boolean> {
    // TODO: Add extra poster removing functionality by key
    return false;
  }
}

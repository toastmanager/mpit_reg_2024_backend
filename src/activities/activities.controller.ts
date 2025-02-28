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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ActivityDto } from './dto/activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ExtraPostersStorage } from './extra-posters.storage';
import { FileInterceptor } from '@nestjs/platform-express';
import { MainPostersStorage } from './main-posters.storage';

@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly mainPostersStorage: MainPostersStorage,
    private readonly extraPostersStorage: ExtraPostersStorage,
  ) {}

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

    const isAuthor = await this.activitiesService.checkOwnership({
      id: +id,
      userId: +user.sub,
    });

    if (!isAuthor) {
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

    const isAuthor = await this.activitiesService.checkOwnership({
      id: +id,
      userId: +user.sub,
    });

    if (!isAuthor) {
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async putMainPoster(
    @Request() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<String> {
    const { user } = req;

    const isAuthor = await this.activitiesService.checkOwnership({
      id: +id,
      userId: +user.sub,
    });

    if (!isAuthor) {
      throw new ForbiddenException(
        `You have to be author of activity to put its main poster`,
      );
    }

    const objectKey = await this.activitiesService.putMainPoster({
      id: +id,
      file: file,
    });

    const mainPosterUrl = await this.mainPostersStorage.getUrl({
      objectKey,
    });

    if (!mainPosterUrl) {
      throw new InternalServerErrorException(
        'Failed to generate url for main poster',
      );
    }

    return mainPosterUrl;
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
    const { user } = req;

    const isAuthor = await this.activitiesService.checkOwnership({
      id: +id,
      userId: +user.sub,
    });

    if (!isAuthor) {
      throw new ForbiddenException(
        `You have to be author of activity to remove its main poster`,
      );
    }

    const isDeleted = await this.activitiesService.removeMainPoster({
      id: +id,
    });

    return isDeleted;
  }

  @Post(':id/extra-posters')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    type: String,
  })
  async addExtraPoster(
    @Request() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<String> {
    const { user } = req;

    const isAuthor = await this.activitiesService.checkOwnership({
      id: +id,
      userId: +user.sub,
    });

    if (!isAuthor) {
      throw new ForbiddenException(
        `You have to be author of activity to add extra poster`,
      );
    }

    const objectKey = await this.activitiesService.addExtraPoster({
      id: +id,
      file: file,
    });

    const extraPosterUrl = await this.extraPostersStorage.getUrl({
      objectKey,
    });

    if (!extraPosterUrl) {
      throw new InternalServerErrorException(
        `Failed to generate url for extra poster with key ${objectKey}`,
      );
    }

    return extraPosterUrl;
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
    const { user } = req;

    const isAuthor = await this.activitiesService.checkOwnership({
      id: +id,
      userId: +user.sub,
    });

    if (!isAuthor) {
      throw new ForbiddenException(
        `You have to be author of activity to remove its extra poster`,
      );
    }

    const isDeleted = await this.activitiesService.removeExtraPoster({
      id: +id,
      objectKey: posterKey,
    });

    return isDeleted;
  }
}

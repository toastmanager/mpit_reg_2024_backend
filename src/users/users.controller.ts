import {
  Request,
  Controller,
  Get,
  Put,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PutAvatarResponseDto } from './dto/put-avatar-response.dto';
import { RoleDto } from './dto/role.dto';
import { AvatarsStorage } from './avatars.storage';
import { DeleteAvatarResponseDto } from './dto/delete-avatar-response.dto';
import { UserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly avatarsStorage: AvatarsStorage,
  ) {}

  @Post()
  @Roles(Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: UserDto,
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create({
      data: createUserDto,
    });
  }

  @Get()
  @Roles(Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: UserDto,
    isArray: true,
  })
  async findAll(): Promise<UserDto[]> {
    const users = await this.usersService.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return await this.usersService.usersWithRelatedData({ users: users });
  }

  @Get(':id')
  @ApiOkResponse({
    type: UserDto,
  })
  async findOne(@Param('id') id: string): Promise<UserDto> {
    const user = await this.usersService.findUnique({
      where: {
        id: +id,
      },
    });
    if (user === null) {
      throw new NotFoundException('User not found');
    }
    return await this.usersService.userWithRelatedData({
      user: user,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: UserDto,
  })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    const { user } = req;
    if (
      user.sub == id ||
      (await this.usersService.checkUserRolesExistence(
        [Role.MODERATOR],
        +user.sub,
      ))
    ) {
      try {
        const user = await this.usersService.update({
          where: {
            id: +id,
          },
          data: updateUserDto,
        });
        return await this.usersService.userWithRelatedData({
          user: user,
        });
      } catch (error) {
        throw new NotFoundException();
      }
    }
    throw new ForbiddenException();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: UserDto,
  })
  async remove(@Request() req: any, @Param('id') id: string): Promise<UserDto> {
    const { user } = req;
    if (
      user.sub == id ||
      (await this.usersService.checkUserRolesExistence(
        [Role.MODERATOR],
        +user.sub,
      ))
    ) {
      try {
        return this.usersService.remove({
          where: {
            id: +id,
          },
        });
      } catch (error) {
        throw new NotFoundException();
      }
    }
    throw new ForbiddenException();
  }

  @Put(':id/avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
    type: PutAvatarResponseDto,
  })
  async putAvatarImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PutAvatarResponseDto> {
    if (file === undefined) {
      throw new BadRequestException('Given file is empty');
    }
    await this.avatarsStorage.update({
      objectKey: id,
      file: file.buffer,
    });
    return {
      isUpdated: true,
    };
  }

  @Delete(':id/avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    type: DeleteAvatarResponseDto,
  })
  async deleteAvatarImage(
    @Param('id') id: string,
  ): Promise<DeleteAvatarResponseDto> {
    const isDeleted = await this.avatarsStorage.delete({
      objectKey: id,
    });
    return {
      isDeleted: isDeleted,
    };
  }

  @Post(':id/roles')
  @ApiBearerAuth()
  @Roles(Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({
    type: UserDto,
  })
  async giveRole(
    @Param('id') id: string,
    @Body() roleDto: RoleDto,
  ): Promise<UserDto> {
    const user = await this.usersService.findFirst({
      where: {
        id: +id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = await this.usersService.giveRole({
      where: {
        id: +id,
      },
      role: roleDto.role,
    });

    return result;
  }

  @Delete(':id/roles')
  @ApiBearerAuth()
  @Roles(Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({
    type: RoleDto,
  })
  async removeRole(
    @Param('id') id: string,
    @Body() roleDto: RoleDto,
  ): Promise<UserDto> {
    const user = await this.usersService.findFirst({
      where: {
        id: +id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = await this.usersService.removeRole({
      where: {
        id: +id,
      },
      role: roleDto.role,
    });

    return result;
  }

  @Get(':id/roles')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    type: RoleDto,
    isArray: true,
  })
  async getRoles(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<RoleDto[]> {
    const { user: currentUser } = req;

    if (currentUser.id !== id && !currentUser.roles?.includes(Role.MODERATOR)) {
      throw new ForbiddenException(
        'You do not have permissions to get this user roles',
      );
    }

    const user = await this.usersService.findFirst({
      where: {
        id: +id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let roles: RoleDto[] = [];
    for (const role of user.roles) {
      roles.push({
        role: role,
      });
    }

    return roles;
  }
}

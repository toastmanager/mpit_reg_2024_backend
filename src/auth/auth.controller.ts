import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Response,
  Request,
  UseGuards,
  UnauthorizedException,
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { AuthToken } from './dto/auth-token.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { AvatarsStorage } from '../users/avatars.storage';
import { FileInterceptor } from '@nestjs/platform-express';
import { Prisma } from '@prisma/client';
import { UserSensitiveDto } from '../users/dto/user-sensitive.dto';

const refreshTokenCookieOptions = {
  expires: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // Change according to refresh token expire time
  httpOnly: true,
  sameSite: 'strict',
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly avatarsStorage: AvatarsStorage,
  ) {}

  @Post('login')
  @ApiOkResponse({
    type: AuthToken,
  })
  async login(
    @Request() req,
    @Body() loginDto: LoginDto,
    @Response({ passthrough: true }) response: any,
  ) {
    const fullToken = await this.authService.login(loginDto);
    await this.setCookieRefreshToken(response, fullToken.refresh_token);
    return fullToken;
  }

  @Post('register')
  @ApiOkResponse({
    type: AuthToken,
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Response({ passthrough: true }) response: any,
  ) {
    const fullToken = await this.authService.register(registerDto);
    await this.setCookieRefreshToken(response, fullToken.refresh_token);
    return fullToken;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOkResponse({
    type: typeof {
      message: String,
    },
  })
  async logout(@Response({ passthrough: true }) response: any) {
    await this.clearCookieRefreshToken(response);
    return { message: 'successfully logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('me')
  @ApiOkResponse({
    type: UserSensitiveDto,
  })
  async me(@Request() req: any): Promise<UserSensitiveDto> {
    const { user } = req;
    const dbUser = await this.usersService.findUnique({
      where: {
        id: +user.sub,
      },
      omit: {
        email: false,
      },
    });

    if (dbUser === null) {
      throw new NotFoundException('User not found');
    }

    return await this.usersService.userWithRelatedData({
      user: dbUser,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('me')
  @ApiOkResponse({
    type: UserSensitiveDto,
  })
  async updateMe(@Request() req: any, @Body() updateMeDto: UpdateMeDto) {
    const { user } = req;
    try {
      const updatedUser = await this.usersService.update({
        where: {
          id: +user.sub,
        },
        omit: {
          email: false,
        },
        data: updateMeDto,
      });
      return await this.usersService.userWithRelatedData({
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('User with same data exists');
        }
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('me/avatar')
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
    schema: {
      type: 'string',
      example: 'http://imageURL',
    },
  })
  async updateMeAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    if (file === undefined) {
      throw new BadRequestException('Given file is empty');
    }
    const { user } = req;
    const key = await this.avatarsStorage.put({
      filename: user.sub,
      file: file.buffer,
    });
    const avatarUrl = await this.avatarsStorage.getUrl({
      objectKey: key,
    });

    if (!avatarUrl)
      throw new InternalServerErrorException("Couldn't generate URL");

    return avatarUrl;
  }

  @Post('refresh')
  @ApiOkResponse({
    type: AuthToken,
  })
  async refresh(
    @Request() req: any,
    @Response({
      passthrough: true,
    })
    response: any,
  ) {
    if (req.cookies) {
      const cookieRefreshToken = req.cookies['refresh_token'];
      if (cookieRefreshToken) {
        try {
          const newAuthToken =
            await this.authService.refreshFullToken(cookieRefreshToken);
          await this.setCookieRefreshToken(
            response,
            newAuthToken.refresh_token,
          );
          return newAuthToken;
        } catch (error) {
          this.clearCookieRefreshToken(response);
          throw error;
        }
      }
    }

    throw new UnauthorizedException('Refresh token не предоставлен');
  }

  async setCookieRefreshToken(@Response() response: any, refreshToken: string) {
    await response.cookie(
      'refresh_token',
      refreshToken,
      refreshTokenCookieOptions,
    );
  }

  async clearCookieRefreshToken(@Response() response: any) {
    await response.clearCookie('refresh_token', refreshTokenCookieOptions);
  }
}

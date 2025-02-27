import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RefreshToken, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import {
  comparePasswords,
  createFullToken,
  encodePassword,
} from './auth.utils';
import { LoginDto } from './dto/login.dto';
import { AuthToken } from './dto/auth-token.dto';
import { AuthConfig } from './auth.config';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokensService } from './refresh-tokens/refresh-tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authConfig: AuthConfig,
    private readonly jwtService: JwtService,
    private readonly refreshTokensService: RefreshTokensService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthToken> {
    const user = await this.usersService.findFirst({
      where: {
        username: {
          equals: loginDto.username,
          mode: 'insensitive',
        },
      },
      omit: {
        passwordHash: false,
      },
    });

    const isDataMatch =
      user && (await comparePasswords(loginDto.password, user.passwordHash));

    if (!isDataMatch) {
      throw new UnauthorizedException('Неверный псевдоним или пароль');
    }

    return await this.createUserFullToken(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthToken> {
    const existingUser = await this.usersService.findFirst({
      where: {
        OR: [
          {
            username: {
              equals: registerDto.username,
              mode: 'insensitive',
            },
          },
          {
            email: {
              equals: registerDto.email,
              mode: 'insensitive',
            },
          },
        ],
      },
      omit: {
        email: false,
      },
    });

    if (existingUser) {
      if (
        existingUser.email.toLowerCase() === registerDto.email.toLowerCase()
      ) {
        throw new ConflictException(
          'Пользователь с такой почтой уже существует',
        );
      }

      if (
        existingUser.username.toLowerCase() ===
        registerDto.username.toLowerCase()
      ) {
        throw new ConflictException(
          'Пользователь с таким псевдонимом уже существует',
        );
      }
    }

    const { password, ...createUserDto } = registerDto;
    const hashedPassword = await encodePassword(password);
    const createdUser = await this.usersService.create({
      data: { ...createUserDto, passwordHash: hashedPassword },
    });
    return await this.createUserFullToken(createdUser);
  }

  async refreshFullToken(refreshToken: string): Promise<AuthToken> {
    const payload = await this.jwtService.verifyAsync(refreshToken);
    const existingToken = await this.refreshTokensService.findFirst({
      where: {
        id: payload.jti,
      },
      include: {
        nextToken: true,
      },
    });

    if (existingToken && existingToken.isRevoked) {
      await this.refreshTokensService.revokeNextRelatedTokens(existingToken);

      throw new ForbiddenException(
        "Предоставленный Refresh Token был использован ранее. Все связанные refresh token'ы будут отозваны",
      );
    }

    const user = await this.usersService.findUnique({
      where: {
        id: +payload.sub,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newRefreshToken = await this.createRefreshToken(user);
    await this.refreshTokensService.update({
      where: {
        id: payload.jti,
      },
      data: {
        isRevoked: true,
        nextTokenId: newRefreshToken.id,
      },
    });

    return createFullToken(
      await this.createAccessToken(user),
      newRefreshToken.token,
    );
  }

  getTokenPayload(payload: string): any {
    return this.jwtService.decode(payload);
  }

  async createUserFullToken(user: User): Promise<AuthToken> {
    return createFullToken(
      await this.createAccessToken(user),
      (await this.createRefreshToken(user)).token,
    );
  }

  async createAccessToken(user: User): Promise<string> {
    const payload = {
      email: user.email,
      username: user.username,
      isActive: user.isActive,
    };
    return await this.jwtService.signAsync(payload, {
      subject: user.id.toString(),
    });
  }

  async createRefreshToken(user: User): Promise<RefreshToken> {
    const payload = {
      email: user.email,
      username: user.username,
    };

    let tokenUUID = crypto.randomUUID();
    while (
      await this.refreshTokensService.findUnique({
        where: {
          id: tokenUUID,
        },
      })
    ) {
      tokenUUID = crypto.randomUUID();
    }

    const newRefreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.authConfig.jwtRefreshTokenExpiresIn,
      jwtid: tokenUUID,
      subject: user.id.toString(),
    });

    const refreshToken = await this.refreshTokensService.create({
      data: {
        id: tokenUUID,
        token: newRefreshToken,
      },
    });

    return refreshToken;
  }
}

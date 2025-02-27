import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthConfig } from './auth.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokensService } from './refresh-tokens/refresh-tokens.service';
import { PrismaService } from 'src/prisma.service';
import { AvatarsStorage } from '../users/avatars.storage';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [AuthConfig],
      useFactory: async (authConfig: AuthConfig) => ({
        secret: authConfig.jwtSecret,
        signOptions: {
          expiresIn: authConfig.jwtAccessTokenExpiresIn,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokensService,
    PrismaService,
    AvatarsStorage,
  ],
})
export class AuthModule {}

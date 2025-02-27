import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokensService } from './refresh-tokens/refresh-tokens.service';
import { AuthConfig } from './auth.config';
import {
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, RefreshToken } from '@prisma/client';
import { AuthToken } from './dto/auth-token.dto';
import * as authUtils from './auth.utils';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: DeepMockProxy<UsersService>;
  let jwtService: DeepMockProxy<JwtService>;
  let refreshTokensService: DeepMockProxy<RefreshTokensService>;
  let authConfig: AuthConfig;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        JwtService,
        RefreshTokensService,
        AuthConfig,
      ],
    })
      .overrideProvider(UsersService)
      .useValue(mockDeep<UsersService>())
      .overrideProvider(JwtService)
      .useValue(mockDeep<JwtService>())
      .overrideProvider(RefreshTokensService)
      .useValue(mockDeep<RefreshTokensService>())
      .compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    refreshTokensService = module.get(RefreshTokensService);
    authConfig = module.get(AuthConfig);
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = { username: 'test', password: 'test' };
      usersService.findFirst.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const loginDto: LoginDto = { username: 'test', password: 'test' };
      const user = { username: 'test', passwordHash: 'hashed' } as User;
      usersService.findFirst.mockResolvedValue(user);
      jest.spyOn(authUtils, 'comparePasswords').mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return AuthToken if login is successful', async () => {
      const loginDto: LoginDto = { username: 'test', password: 'test' };
      const user = { username: 'test', passwordHash: 'hashed' } as User;
      const authToken: AuthToken = {
        access_token: 'access',
        refresh_token: 'refresh',
        token_type: 'Bearer',
      };
      usersService.findFirst.mockResolvedValue(user);
      jest.spyOn(authUtils, 'comparePasswords').mockResolvedValue(true);
      jest
        .spyOn(authService, 'createUserFullToken')
        .mockResolvedValue(authToken);

      const result = await authService.login(loginDto);

      expect(result).toEqual(authToken);
    });
  });

  describe('register', () => {
    it('should throw ConflictException if user with email or username exists', async () => {
      const registerDto: RegisterDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
      };
      const existingUser = { email: 'test@test.com', username: 'test' } as User;
      usersService.findFirst.mockResolvedValue(existingUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should return AuthToken if registration is successful', async () => {
      const registerDto: RegisterDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
      };
      const createdUser = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
      } as User;
      const authToken: AuthToken = {
        access_token: 'access',
        refresh_token: 'refresh',
        token_type: 'Bearer',
      };
      usersService.findFirst.mockResolvedValue(null);
      jest.spyOn(authUtils, 'encodePassword').mockResolvedValue('hashed');
      usersService.create.mockResolvedValue(createdUser);
      jest
        .spyOn(authService, 'createUserFullToken')
        .mockResolvedValue(authToken);

      const result = await authService.register(registerDto);

      expect(result).toEqual(authToken);
    });
  });

  describe('refreshFullToken', () => {
    it('should throw ForbiddenException if refresh token is revoked', async () => {
      const refreshToken = 'refreshToken';
      const payload = { jti: 'tokenId', sub: '1' };
      const existingToken = { isRevoked: true } as RefreshToken;
      jwtService.verifyAsync.mockResolvedValue(payload);
      refreshTokensService.findFirst.mockResolvedValue(existingToken);

      await expect(authService.refreshFullToken(refreshToken)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return AuthToken if refresh token is valid', async () => {
      const refreshToken = 'refreshToken';
      const payload = { jti: 'tokenId', sub: '1' };
      const user = { id: 1, username: 'test', email: 'test@test.com' } as User;
      const newRefreshToken = {
        id: 'newTokenId',
        token: 'newRefreshToken',
      } as RefreshToken;
      const authToken: AuthToken = {
        access_token: 'access',
        refresh_token: 'newRefreshToken',
        token_type: 'Bearer',
      };
      jwtService.verifyAsync.mockResolvedValue(payload);
      refreshTokensService.findFirst.mockResolvedValue({
        isRevoked: false,
      } as RefreshToken);
      usersService.findUnique.mockResolvedValue(user);
      jest
        .spyOn(authService, 'createRefreshToken')
        .mockResolvedValue(newRefreshToken);
      jest.spyOn(authService, 'createAccessToken').mockResolvedValue('access');
      jest.spyOn(authUtils, 'createFullToken').mockReturnValue(authToken);

      const result = await authService.refreshFullToken(refreshToken);

      expect(result).toEqual(authToken);
    });
  });

  describe('getTokenPayload', () => {
    it('should return decoded payload', () => {
      const payload = 'payload';
      const decoded = { sub: '1' };
      jwtService.decode.mockReturnValue(decoded);

      const result = authService.getTokenPayload(payload);

      expect(result).toEqual(decoded);
    });
  });

  describe('createUserFullToken', () => {
    it('should return AuthToken', async () => {
      const user = { id: 1, username: 'test', email: 'test@test.com' } as User;
      const authToken: AuthToken = {
        access_token: 'access',
        refresh_token: 'refresh',
        token_type: 'Bearer',
      };
      jest.spyOn(authService, 'createAccessToken').mockResolvedValue('access');
      jest
        .spyOn(authService, 'createRefreshToken')
        .mockResolvedValue({ token: 'refresh' } as RefreshToken);
      jest.spyOn(authUtils, 'createFullToken').mockReturnValue(authToken);

      const result = await authService.createUserFullToken(user);

      expect(result).toEqual(authToken);
    });
  });

  describe('createAccessToken', () => {
    it('should return access token', async () => {
      const user = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
        isActive: true,
      } as User;
      const payload = {
        email: 'test@test.com',
        username: 'test',
        isActive: true,
      };
      jwtService.signAsync.mockResolvedValue('accessToken');

      const result = await authService.createAccessToken(user);

      expect(result).toEqual('accessToken');
      expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
        subject: '1',
      });
    });
  });

  describe('createRefreshToken', () => {
    it('should return refresh token', async () => {
      const user = { id: 1, username: 'test', email: 'test@test.com' } as User;
      const payload = { email: 'test@test.com', username: 'test' };
      const tokenUUID = '00000000-0000-0000-0000-000000000000';
      const newRefreshToken = 'newRefreshToken';
      jest.spyOn(global.crypto, 'randomUUID').mockReturnValue(tokenUUID);
      jwtService.signAsync.mockResolvedValue(newRefreshToken);
      refreshTokensService.create.mockResolvedValue({
        id: tokenUUID,
        token: newRefreshToken,
      } as RefreshToken);

      const result = await authService.createRefreshToken(user);

      expect(result).toEqual({ id: tokenUUID, token: newRefreshToken });
      expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
        expiresIn: authConfig.jwtRefreshTokenExpiresIn,
        jwtid: tokenUUID,
        subject: '1',
      });
    });
  });
});

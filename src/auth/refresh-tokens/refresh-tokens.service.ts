import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, RefreshToken } from '@prisma/client';

@Injectable()
export class RefreshTokensService {
  constructor(private readonly prisma: PrismaService) {}

  async create(args: Prisma.RefreshTokenCreateArgs) {
    const refreshToken = await this.prisma.refreshToken.create(args);
    return refreshToken;
  }

  async findMany(args?: Prisma.RefreshTokenFindManyArgs) {
    const refreshTokens = await this.prisma.refreshToken.findFirst(args);
    return refreshTokens;
  }

  async findFirst(args?: Prisma.RefreshTokenFindFirstArgs) {
    const refreshToken = await this.prisma.refreshToken.findFirst(args);
    return refreshToken;
  }

  async findUnique(args: Prisma.RefreshTokenFindUniqueArgs) {
    const refreshToken = await this.prisma.refreshToken.findUnique(args);
    return refreshToken;
  }

  async update(args: Prisma.RefreshTokenUpdateArgs) {
    const refreshToken = await this.prisma.refreshToken.update(args);
    return refreshToken;
  }

  async remove(args: Prisma.RefreshTokenDeleteArgs) {
    const refreshToken = await this.prisma.refreshToken.delete(args);
    return refreshToken;
  }

  async revokeNextRelatedTokens(refreshToken: RefreshToken) {
    let _refreshToken: RefreshToken | null = refreshToken;
    while (_refreshToken) {
      if (!_refreshToken.isRevoked) {
        await this.update({
          where: {
            id: _refreshToken.id,
          },
          data: {
            isRevoked: true,
          },
        });
      }

      if (_refreshToken.nextTokenId) {
        const foundedRefreshToken = await this.findFirst({
          where: {
            id: _refreshToken.nextTokenId,
          },
        });
      } else {
        _refreshToken = null;
      }
    }
  }
}

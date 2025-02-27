import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const dbUser = await this.prisma.user.findUnique({
      where: {
        id: +user.sub,
      },
    });

    if (!dbUser) {
      throw new UnauthorizedException('User not found');
    }

    if (requiredRoles.some((role) => dbUser.roles?.includes(role))) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have a role to access this action',
    );
  }
}

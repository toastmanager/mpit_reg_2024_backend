import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma.service';
import { AvatarsStorage } from './avatars.storage';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, AvatarsStorage],
  exports: [UsersService],
})
export class UsersModule {}

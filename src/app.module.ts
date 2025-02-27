import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigifyModule } from '@itgorillaz/configify';

@Module({
  imports: [ConfigifyModule.forRootAsync(), UsersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigifyModule } from '@itgorillaz/configify';
import { ActivitiesModule } from './activities/activities.module';

@Module({
  imports: [
    ConfigifyModule.forRootAsync(),
    UsersModule,
    AuthModule,
    ActivitiesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

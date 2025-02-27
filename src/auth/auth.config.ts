import { Configuration, Value } from '@itgorillaz/configify';
import { IsString } from 'class-validator';

@Configuration()
export class AuthConfig {
  @IsString()
  @Value('JWT_SECRET')
  jwtSecret: string;

  @IsString()
  @Value('JWT_ACCESS_TOKEN_EXPIRES_IN')
  jwtAccessTokenExpiresIn: string;

  @IsString()
  @Value('JWT_REFRESH_TOKEN_EXPIRES_IN')
  jwtRefreshTokenExpiresIn: string;
}

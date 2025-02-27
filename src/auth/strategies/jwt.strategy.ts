import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthConfig } from 'src/auth/auth.config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    readonly authConfig: AuthConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtSecret,
    });
  }

  async validate(payload: any) {
    const { sub } = payload;
    const user = await this.usersService.findUnique({
      where: {
        id: +sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}

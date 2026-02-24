import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  user_id: number; // MUST MATCH DJANGO
  email: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') return 'dev-only-secret-change-me';
  throw new Error('JWT_SECRET is required in production');
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: getJwtSecret(),
    });
  }

  validate(payload: any) {
    return {
      userId: payload.user_id ?? payload.userId,
      email: payload.email,
      username: payload.username,
      fullName: payload.fullName,
      avatar: payload.avatar,
    };
  }
}

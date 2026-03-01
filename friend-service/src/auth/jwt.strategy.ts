import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  user_id: number; // MUST MATCH DJANGO
  email: string;
}

function getJwtSecret(): string {
  const rawSecret =
    process.env.JWT_SECRET ||
    process.env.DJANGO_SECRET_KEY ||
    process.env.SECRET_KEY;
  const invalidPlaceholders = new Set([
    'replace-with-strong-random-secret',
    'change-me-in-production',
    'dev-only-secret-change-me',
  ]);
  const secret = (rawSecret || '').trim();
  if (secret && !invalidPlaceholders.has(secret)) return secret;
  if (process.env.NODE_ENV !== 'production') return 'dev-only-secret-change-me';
  throw new Error('JWT secret is invalid or missing in production');
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

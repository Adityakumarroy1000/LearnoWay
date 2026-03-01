import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

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

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: getJwtSecret(),
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}

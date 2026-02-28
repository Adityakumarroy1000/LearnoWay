import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

function getJwtSecret(): string {
  const secret =
    process.env.JWT_SECRET ||
    process.env.DJANGO_SECRET_KEY ||
    process.env.SECRET_KEY;
  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') return 'dev-only-secret-change-me';
  throw new Error('JWT_SECRET is required in production');
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

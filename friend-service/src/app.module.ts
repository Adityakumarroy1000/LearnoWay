import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsModule } from './friends/friends.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL?.trim();
const isVercel = process.env.VERCEL === '1';
const useSqlite =
  process.env.DB_TYPE?.trim().toLowerCase() === 'sqlite' ||
  (!databaseUrl &&
    (!process.env.DB_HOST || process.env.DB_HOST.trim().length === 0));

const useSsl =
  process.env.DB_SSL === 'true' ||
  (databaseUrl ? databaseUrl.includes('sslmode=require') : isProduction);

function getSqlitePath(): string {
  if (process.env.SQLITE_PATH?.trim()) return process.env.SQLITE_PATH.trim();
  // Vercel Serverless FS is read-only except /tmp.
  if (isVercel) return '/tmp/friend-service.sqlite3';
  return 'friend-service.sqlite3';
}

if (isProduction && useSqlite) {
  // Keep the function up, but make this misconfiguration obvious in logs.
  console.warn(
    '[friend-service] Running with SQLite in production. Configure DATABASE_URL for persistent storage.'
  );
}

@Module({
  imports: [
    TypeOrmModule.forRoot(
      useSqlite
        ? {
            type: 'sqlite',
            database: getSqlitePath(),
            autoLoadEntities: true,
            synchronize: true,
          }
        : {
            type: 'postgres',
            ...(databaseUrl
              ? { url: databaseUrl }
              : {
                  host: process.env.DB_HOST || 'localhost',
                  port: Number(process.env.DB_PORT || 5432),
                  username: process.env.DB_USERNAME || 'postgres',
                  password: String(process.env.DB_PASSWORD ?? ''),
                  database: process.env.DB_NAME || 'friends_db',
                }),
            ssl: useSsl ? { rejectUnauthorized: false } : false,
            autoLoadEntities: true,
            synchronize: process.env.DB_SYNCHRONIZE === 'true' && !isProduction,
          }
    ),
    AuthModule,
    UsersModule,
    FriendsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

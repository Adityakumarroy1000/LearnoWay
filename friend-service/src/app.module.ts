import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsModule } from './friends/friends.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL?.trim();

const useSsl =
  process.env.DB_SSL === 'true' ||
  (databaseUrl ? databaseUrl.includes('sslmode=require') : isProduction);


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(databaseUrl
        ? { url: databaseUrl }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 5432),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'friends_db',
          }),
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNCHRONIZE === 'true' && !isProduction,
    }),
    AuthModule,
    UsersModule,
    FriendsModule,
  ],
})
export class AppModule {}

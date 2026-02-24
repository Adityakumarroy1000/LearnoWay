import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function getCorsOrigins(): string[] {
  const fromEnv = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (fromEnv.length) return fromEnv;
  return ['http://localhost:8080', 'http://127.0.0.1:8080'];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = getCorsOrigins();
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  console.log(`friend-service listening on http://localhost:${port}`);
}
bootstrap();

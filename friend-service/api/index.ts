import 'reflect-metadata';

import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { AppModule } from '../src/app.module';

let cachedServer: ReturnType<typeof express> | null = null;

function getCorsOrigins(): string[] {
  const fromEnv = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (fromEnv.length) return fromEnv;
  return ['http://localhost:8080', 'http://127.0.0.1:8080'];
}

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });

  app.enableCors({
    origin: getCorsOrigins(),
    credentials: true,
  });

  await app.init();
  return server;
}

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }

  return cachedServer(req, res);
}

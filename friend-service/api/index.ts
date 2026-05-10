import 'reflect-metadata';

import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { AppModule } from '../src/app.module';

// Some serverless runtimes can be configured to throw on deprecations.
// Express 4 may emit deprecations internally; do not crash the whole function for that.
process.throwDeprecation = false;
process.traceDeprecation = false;

let cachedServer: ReturnType<typeof express> | null = null;
let bootstrapError: unknown = null;

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
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
    bodyParser: false,
  });

  app.enableCors({
    origin: getCorsOrigins(),
    credentials: true,
  });

  await app.init();
  return server;
}

export default async function handler(req: any, res: any) {
  if (bootstrapError) {
    console.error('[friend-service] previous bootstrap error', bootstrapError);
    return res.status(500).json({ error: 'Service failed to initialize' });
  }

  try {
    if (!cachedServer) {
      cachedServer = await bootstrap();
    }
    return cachedServer(req, res);
  } catch (error) {
    bootstrapError = error;
    console.error('[friend-service] bootstrap/handler error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

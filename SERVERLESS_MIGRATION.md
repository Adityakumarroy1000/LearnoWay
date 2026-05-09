# Serverless Migration Guide (LearnoWay LMS)

This repo is now prepared for serverless deployment with Vercel for both backend services.

## What Changed

- Django backend now has a Vercel Python entrypoint: `backend/api/index.py`
- Django backend now has Vercel routing config: `backend/vercel.json`
- Nest friend-service now has a Vercel Node entrypoint: `friend-service/api/index.ts`
- Nest friend-service now has Vercel routing config: `friend-service/vercel.json`
- Frontend API config now defaults to:
  - Local dev: current localhost setup
  - Production: `/api` for Django and `VITE_FRIEND_SERVICE_URL` for friend-service

## Target Architecture

- Frontend (Vercel project #1): static React/Vite app
- Backend (Vercel project #2): Django serverless API
- Friend-service (Vercel project #3): NestJS serverless API

## Required Environment Variables

### Backend (Django)

- `DJANGO_ENV=production`
- `DEBUG=false`
- `SECRET_KEY=<strong-random-secret>`
- `ALLOWED_HOSTS=<backend-domain>`
- `CORS_ALLOWED_ORIGINS=<frontend-domain>`
- `CSRF_TRUSTED_ORIGINS=https://<frontend-domain>`
- `DATABASE_URL=<postgres-connection-string>`
- `DB_SSLMODE=require`
- `GROQ_API_KEY=<if used>`
- `GOOGLE_CLIENT_ID=<if used>`

### Friend-service (NestJS)

- `NODE_ENV=production`
- `JWT_SECRET=<must match token signing secret used by auth system>`
- `DATABASE_URL=<postgres-connection-string>`
- `DB_SSL=true`
- `CORS_ALLOWED_ORIGINS=https://<frontend-domain>`

### Frontend (Vite)

- `VITE_API_BASE_URL=https://<django-backend-domain>/api`
- `VITE_FRIEND_SERVICE_URL=https://<friend-service-domain>`

## Important Notes

- Vercel functions are stateless; do not rely on local filesystem persistence.
- Use managed Postgres (Neon/Supabase/Railway/Render Postgres/etc).
- Keep both backend services on the same JWT strategy/secret to avoid auth mismatch.
- WebSocket gateways in `friend-service` may need a dedicated realtime provider if you need persistent socket features in production.

## Deployment Order

1. Deploy `backend` as a Vercel project with root directory `backend/`.
2. Deploy `friend-service` as a Vercel project with root directory `friend-service/`.
3. Deploy `frontend` as a Vercel project with root directory `frontend/`.
4. Set frontend env vars to the deployed backend URLs.
5. Verify login, buddy finder, request/accept flow, and roadmap/skills APIs.

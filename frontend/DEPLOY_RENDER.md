# Frontend Deploy on Render

## 1) Create Static Site
- New + -> Static Site
- Connect this repo
- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`

## 2) Set Environment Variables
- `VITE_API_BASE_URL=https://learnoway-backend-django.onrender.com/api`
- `VITE_FRIEND_SERVICE_URL=<your-friend-service-url>` (or keep empty/local if not deployed yet)
- `VITE_GOOGLE_CLIENT_ID=<your-google-client-id>`

## 3) Add SPA Rewrite Rule
In Render Static Site settings, add a rewrite:
- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

## 4) Update Django Backend CORS/CSRF
After you get frontend URL from Render (for example `https://learnoway-frontend.onrender.com`), add it to backend env vars:
- `CORS_ALLOWED_ORIGINS=https://learnoway-frontend.onrender.com`
- `CSRF_TRUSTED_ORIGINS=https://learnoway-frontend.onrender.com`

If you already have multiple origins, keep them comma-separated in one line.

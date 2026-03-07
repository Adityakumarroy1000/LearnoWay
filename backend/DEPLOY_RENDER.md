# Backend Deploy on Render

## Important: Free Instance Sleep Behavior
Render free web services spin down after inactivity. This cannot be disabled from Django code.

If you need truly always-on behavior, switch the backend web service to a paid instance type.

## Keep-Warm Option (Free Plan)
You can reduce cold starts by pinging a health endpoint every few minutes.

Health endpoint in this project:
- `GET /api/health/`

Example full URL:
- `https://<your-backend-service>.onrender.com/api/health/`

## Option A: Render Cron Job
Create a Render Cron Job that runs every 5 minutes and calls:
- `curl -fsS https://<your-backend-service>.onrender.com/api/health/ > /dev/null`

## Option B: External Uptime Monitor
Use UptimeRobot or Better Stack to ping the same health URL every 5 minutes.

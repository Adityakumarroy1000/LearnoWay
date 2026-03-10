# Friend Service Deploy on Render

## Important: Free Instance Sleep Behavior
Render free web services spin down after inactivity. This cannot be disabled from NestJS code.

If you need truly always-on behavior, switch the friend-service web service to a paid instance type.

## Keep-Warm Option (Free Plan)
You can reduce cold starts by pinging a health endpoint every few minutes.

Health endpoint in this project:
- `GET /health`

Example full URL:
- `https://<your-friend-service>.onrender.com/health`

## Option A: External Uptime Monitor (Free)
Use UptimeRobot or Better Stack to ping the health URL every 5 minutes.

## Option B: Render Cron Job (Paid)
Create a Render Cron Job that runs:
- `curl -fsS https://<your-friend-service>.onrender.com/health > /dev/null`

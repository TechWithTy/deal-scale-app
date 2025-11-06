# Discord Integration Deployment Guide

## Overview

This guide covers the deployment process for Discord integration components across development, staging, and production environments.

## Pre-Deployment Checklist

### Prerequisites

- [ ] Discord Application created in Developer Portal
- [ ] Bot user created and token obtained
- [ ] Discord server set up with proper channel structure
- [ ] Roles created and IDs obtained
- [ ] Database migrations prepared
- [ ] Environment variables configured
- [ ] SSL certificates configured for production domains
- [ ] Backup strategy in place

### Security Review

- [ ] All secrets stored in secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] OAuth2 state parameter implemented (CSRF protection)
- [ ] Discord tokens encrypted in database
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] HTTPS enforced for all endpoints
- [ ] Webhook signature validation implemented
- [ ] Audit logging enabled

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Production Environment                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Vercel     │      │   Render     │      │  Railway  │ │
│  │  (Frontend)  │◄────►│  (Backend)   │◄────►│  (Bot)    │ │
│  │  Next.js App │      │  FastAPI     │      │  Node.js  │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         │                      │                     │       │
│         │                      │                     │       │
│         └──────────────┬───────┴─────────────────────┘       │
│                        │                                     │
│                   ┌────▼────┐                                │
│                   │ Postgres│                                │
│                   │  RDS    │                                │
│                   └─────────┘                                │
│                        │                                     │
│                   ┌────▼────┐                                │
│                   │  Redis  │                                │
│                   │  Cache  │                                │
│                   └─────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

## Step-by-Step Deployment

### Phase 1: Database Preparation

#### 1.1 Run Migrations (Development)

```bash
cd apps/backend

# Review migration
alembic revision --autogenerate -m "add_discord_integration"

# Inspect generated migration
cat alembic/versions/XXXX_add_discord_integration.py

# Apply to development database
alembic upgrade head

# Verify tables created
psql $DATABASE_URL -c "\dt"
# Should show: users, credit_requests, leaderboard_history, leaderboard_snapshots
```

#### 1.2 Run Migrations (Production)

```bash
# Backup production database first
pg_dump $PROD_DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Create maintenance window notification
# Post to #announcements: "Scheduled maintenance in 5 minutes - 2-3 minute downtime"

# Apply migration
alembic upgrade head

# Verify migration success
alembic current
alembic history
```

### Phase 2: Backend Deployment

#### 2.1 Deploy to Staging

```bash
# Build and test locally
cd apps/backend
poetry install
poetry run pytest

# Build Docker image
docker build -t dealscale-backend:staging .

# Push to container registry
docker tag dealscale-backend:staging registry.example.com/dealscale-backend:staging
docker push registry.example.com/dealscale-backend:staging

# Deploy to staging (Render/Railway/etc)
# Update environment variables in hosting dashboard
```

#### 2.2 Configure Environment (Staging)

```bash
# Set in hosting dashboard or secrets manager
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_REDIRECT_URI=https://staging.dealscale.io/auth/discord/callback
DISCORD_BOT_TOKEN=...
DISCORD_TOKEN_ENCRYPTION_KEY=...
DATABASE_URL=...
REDIS_URL=...
```

#### 2.3 Smoke Test Staging

```bash
# Test health endpoint
curl https://staging-api.dealscale.io/health

# Test Discord OAuth flow
# Visit https://staging.dealscale.io/profile
# Click "Connect Discord" button
# Complete OAuth flow
# Verify account linked successfully

# Test API endpoints
curl -H "Authorization: Bearer $TOKEN" \
  https://staging-api.dealscale.io/api/leaderboard?limit=10
```

#### 2.4 Deploy to Production

```bash
# Tag production release
git tag -a v1.0.0-discord -m "Discord integration release"
git push origin v1.0.0-discord

# Build production image
docker build -t dealscale-backend:v1.0.0 .
docker push registry.example.com/dealscale-backend:v1.0.0

# Deploy via hosting platform
# Render: Auto-deploy on git push
# Railway: railway up
# Custom: kubectl apply -f k8s/backend-deployment.yaml
```

### Phase 3: Discord Bot Deployment

#### 3.1 Register Slash Commands

```bash
cd apps/discord-bot

# Install dependencies
pnpm install

# Build TypeScript
pnpm run build

# Register commands (one-time setup)
node dist/deploy-commands.js
# Output: Successfully registered 5 application commands.
```

#### 3.2 Deploy Bot to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Set environment variables
railway variables set DISCORD_BOT_TOKEN="..."
railway variables set DISCORD_CLIENT_ID="..."
railway variables set DISCORD_GUILD_ID="..."
railway variables set DEALSCALE_API_URL="https://api.dealscale.io"
railway variables set DEALSCALE_API_KEY="..."

# Deploy
railway up
```

**Alternative: Deploy to Fly.io**

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Create app
fly apps create dealscale-discord-bot

# Configure
fly secrets set DISCORD_BOT_TOKEN="..."
fly secrets set DISCORD_CLIENT_ID="..."
# ... set all other secrets

# Deploy
fly deploy

# Monitor
fly logs
```

#### 3.3 Verify Bot is Online

```bash
# Check Discord server
# Bot should appear as online with green status

# Test slash command
# In Discord, type: /leaderboard
# Should return top 10 players
```

### Phase 4: Frontend Deployment

#### 4.1 Update Frontend Configuration

```javascript
// apps/frontend/.env.production
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_client_id
NEXT_PUBLIC_APP_URL=https://app.dealscale.io
NEXT_PUBLIC_API_URL=https://api.dealscale.io
```

#### 4.2 Deploy to Vercel

```bash
cd apps/frontend

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Verify deployment
curl https://app.dealscale.io/health
```

#### 4.3 Configure OAuth Redirect

1. Go to Discord Developer Portal
2. OAuth2 > General
3. Add Redirect URL: `https://app.dealscale.io/auth/discord/callback`
4. Save changes

### Phase 5: Background Jobs Setup

#### 5.1 Leaderboard Sync Job

Create cron job for leaderboard updates every 30 seconds:

**Using APScheduler (Python)**

```python
# apps/backend/app/tasks/leaderboard_sync.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('interval', seconds=30)
async def sync_leaderboard():
    """Recalculate leaderboard every 30 seconds."""
    from app.services.leaderboard import recalculate_leaderboard
    await recalculate_leaderboard()

scheduler.start()
```

**Using Celery Beat (Alternative)**

```python
# apps/backend/app/celery.py
from celery import Celery
from celery.schedules import crontab

app = Celery('dealscale')

@app.task
def recalculate_leaderboard():
    # Leaderboard calculation logic
    pass

app.conf.beat_schedule = {
    'leaderboard-sync': {
        'task': 'app.tasks.recalculate_leaderboard',
        'schedule': 30.0,  # Every 30 seconds
    },
}
```

#### 5.2 Role Sync Job

```python
@scheduler.scheduled_job('interval', minutes=5)
async def sync_discord_roles():
    """Sync Discord roles every 5 minutes."""
    from app.services.discord_roles import sync_all_roles
    await sync_all_roles()
```

#### 5.3 Deploy Background Workers

```bash
# Render: Create background worker
# Service Type: Background Worker
# Build Command: poetry install
# Start Command: python -m app.worker

# Railway: Add worker service
railway add
# Select: Background Worker
# Command: python -m app.worker
```

### Phase 6: Monitoring and Observability

#### 6.1 Set Up Application Monitoring

**Sentry for Error Tracking**

```python
# apps/backend/app/main.py
import sentry_sdk

sentry_sdk.init(
    dsn="your_sentry_dsn",
    environment="production",
    traces_sample_rate=0.1,
)
```

```typescript
// apps/discord-bot/src/index.ts
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production",
})
```

#### 6.2 Configure Logging

**Structured Logging (Python)**

```python
import structlog

logger = structlog.get_logger()

logger.info(
    "discord_account_linked",
    user_id=user.id,
    discord_id=discord_user["id"],
)
```

**Centralized Logging (Loki/CloudWatch)**

```yaml
# Vector configuration for log aggregation
[sinks.loki]
  type = "loki"
  endpoint = "https://loki.example.com"
  labels = { app = "dealscale-backend", env = "production" }
```

#### 6.3 Health Check Endpoints

```python
@router.get("/health/discord")
async def discord_health():
    """Check Discord integration health."""
    checks = {
        "bot_online": await check_bot_status(),
        "oauth_working": await check_oauth(),
        "database_connection": await check_db(),
        "redis_connection": await check_redis(),
    }
    
    all_healthy = all(checks.values())
    status_code = 200 if all_healthy else 503
    
    return JSONResponse(
        status_code=status_code,
        content={"status": "healthy" if all_healthy else "degraded", "checks": checks}
    )
```

#### 6.4 Set Up Alerts

**PagerDuty/Opsgenie Integration**

```yaml
# Alert rules
alerts:
  - name: discord_bot_offline
    condition: bot_status == "offline" for 2m
    severity: critical
    action: page_on_call
    
  - name: high_error_rate
    condition: error_rate > 5% for 5m
    severity: warning
    action: notify_slack
    
  - name: oauth_failure_spike
    condition: oauth_failures > 10 in 1m
    severity: warning
    action: notify_team
```

### Phase 7: Rollout Strategy

#### 7.1 Canary Deployment

1. **10% Traffic** (Day 1)
   - Enable Discord integration for 10% of users
   - Monitor error rates, latency, Discord API usage
   - Collect user feedback

2. **50% Traffic** (Day 3)
   - If metrics are good, increase to 50%
   - Monitor leaderboard performance
   - Check role sync accuracy

3. **100% Traffic** (Day 7)
   - Full rollout to all users
   - Continue monitoring for 48 hours
   - Document any issues and resolutions

#### 7.2 Feature Flags

```python
# Use feature flag service (LaunchDarkly, Unleash, etc.)
from app.core.feature_flags import is_enabled

if is_enabled("discord_integration", user=current_user):
    # Show Discord connect button
    pass
```

### Phase 8: Post-Deployment Validation

#### 8.1 Functional Tests

```bash
# Test complete user journey
1. Sign up new user
2. Link Discord account
3. View leaderboard
4. Submit credit request via Discord
5. Admin approves request
6. Verify credits granted
7. Achieve rank milestone
8. Verify role assigned in Discord
```

#### 8.2 Performance Validation

```bash
# Load testing with k6
k6 run load-test.js

# Targets:
# - Leaderboard endpoint: < 200ms p95
# - OAuth callback: < 1s p95
# - Bot commands: < 2s p95
```

#### 8.3 Monitor Key Metrics

```
Dashboard: Discord Integration Health
┌─────────────────────────────────────────┐
│ Discord Account Links (24h):     +234  │
│ Active Discord Commands (1h):     45   │
│ Credit Requests (24h):            89   │
│ Approval Rate:                    87%  │
│ Bot Uptime:                       99.9%│
│ Average Response Time:            150ms│
│ Error Rate:                       0.2% │
└─────────────────────────────────────────┘
```

## Rollback Procedure

If issues arise, follow this rollback plan:

### Quick Rollback (< 5 minutes)

```bash
# 1. Revert backend deployment
railway rollback dealscale-backend

# 2. Disable Discord bot
fly scale count 0 -a dealscale-discord-bot

# 3. Revert frontend
vercel rollback

# 4. Announce in Discord
# Post to #announcements: "Discord integration temporarily disabled for maintenance"
```

### Database Rollback

```bash
# If migration needs rollback
alembic downgrade -1

# Restore from backup if necessary
psql $DATABASE_URL < backup_20251106_120000.sql
```

## Troubleshooting

### Bot Not Responding

```bash
# Check bot logs
railway logs -s dealscale-discord-bot --tail

# Verify bot token
curl -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
  https://discord.com/api/v10/users/@me

# Restart bot
railway restart -s dealscale-discord-bot
```

### OAuth Flow Failing

```bash
# Check redirect URI configuration
# Verify in Discord Developer Portal matches exactly

# Test OAuth endpoint
curl https://api.dealscale.io/auth/discord/callback?code=test&state=test

# Check backend logs for detailed error
```

### Role Sync Issues

```bash
# Verify bot permissions in Discord server
# Bot must have "Manage Roles" permission
# Bot role must be ABOVE roles it manages

# Manually trigger role sync
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.dealscale.io/admin/discord/sync-roles
```

---

**Deployment Complete! 🎉**

Continue to [Implementation Checklist](./06_implementation_checklist.md) for detailed development tasks.


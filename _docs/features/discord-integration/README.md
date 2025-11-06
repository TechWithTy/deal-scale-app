# Discord Integration for DealScale Leaderboard

<div align="center">

**Transform your competitive leaderboard into a thriving Discord community**

[Features](#features) • [Documentation](#documentation) • [Quick Start](#quick-start) • [Architecture](#architecture)

</div>

---

## Overview

This comprehensive integration connects DealScale's competitive leaderboard system with Discord, enabling real-time rankings, credit management, role synchronization, and community engagement—all within Discord.

### Key Benefits

- 🏆 **Real-time Competition**: Live leaderboard updates every 30 seconds
- 🤖 **Discord Bot**: Native slash commands for seamless interaction
- 🎭 **Automatic Roles**: Dynamic role assignment based on leaderboard performance
- 💰 **Credit Management**: Request and approve credits directly from Discord
- 🔔 **Smart Notifications**: Configurable alerts for rank changes and milestones
- 🔗 **OAuth2 Integration**: Secure one-click account linking
- 📊 **Analytics**: Track engagement and competitive metrics

---

## Features

### For Users
- **One-Click Account Linking**: Secure OAuth2 flow to connect Discord account
- **Discord Bot Commands**: Interact with DealScale without leaving Discord
  - `/leaderboard` - View top players
  - `/profile` - Check your stats and credits
  - `/request` - Request AI or Lead credits
  - `/stats` - View detailed performance metrics
  - `/compare` - Compare your stats with others
- **Real-time Notifications**: Get notified about rank changes, milestones, and credit updates
- **Automatic Roles**: Earn special Discord roles based on your rank
  - 🏆 Champion (Rank #1)
  - 🥈 Silver (Rank #2)
  - 🥉 Bronze (Rank #3)
  - 🔟 Top 10 (Ranks 4-10)
  - ⭐ Elite (Ranks 11-100)

### For Admins
- **Credit Request Dashboard**: Approve/reject requests with one click
- **Bulk Operations**: Process multiple requests simultaneously
- **Admin Commands**: Manage credits and roles via Discord
- **Analytics Dashboard**: Track adoption, engagement, and system health
- **Audit Logs**: Complete history of all Discord operations

### For Developers
- **Webhook System**: Build custom integrations with DealScale events
- **REST API**: Programmatic access to leaderboard and credit data
- **GraphQL Support**: Flexible queries for complex data needs
- **Real-time Updates**: WebSocket support for live data

---

## Documentation

### 📚 Core Documentation

1. **[00_overview.md](./00_overview.md)** - Executive summary and architecture
2. **[01_oauth2_account_linking.md](./01_oauth2_account_linking.md)** - OAuth2 implementation guide
3. **[02_database_schema.md](./02_database_schema.md)** - Database schema and migrations
4. **[03_discord_bot.md](./03_discord_bot.md)** - Discord bot implementation
5. **[04_environment_config.md](./04_environment_config.md)** - Configuration and setup
6. **[05_deployment_guide.md](./05_deployment_guide.md)** - Production deployment
7. **[06_implementation_checklist.md](./06_implementation_checklist.md)** - Complete task list

### 🥒 Gherkin Feature Files (BDD Scenarios)

Located in `features/` directory:

1. **[01_oauth2_account_linking.feature](./features/01_oauth2_account_linking.feature)** - OAuth flow scenarios
2. **[02_discord_bot_commands.feature](./features/02_discord_bot_commands.feature)** - Bot command scenarios
3. **[03_leaderboard_sync.feature](./features/03_leaderboard_sync.feature)** - Real-time sync scenarios
4. **[04_role_synchronization.feature](./features/04_role_synchronization.feature)** - Role management scenarios
5. **[05_credit_request_workflow.feature](./features/05_credit_request_workflow.feature)** - Credit system scenarios
6. **[06_notifications_webhooks.feature](./features/06_notifications_webhooks.feature)** - Notification scenarios
7. **[07_security_edge_cases.feature](./features/07_security_edge_cases.feature)** - Security and edge cases

---

## Quick Start

### Prerequisites

- Node.js 20+ and pnpm (for bot and frontend)
- Python 3.11+ and Poetry (for backend)
- PostgreSQL 15+
- Redis 7+
- Discord account with server admin access

### 1. Discord Application Setup

```bash
# Visit https://discord.com/developers/applications
# Create new application "DealScale"
# Save Application ID, Client Secret, and Bot Token
```

### 2. Environment Configuration

```bash
# Backend (.env)
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback

# Frontend (.env.local)
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_client_id
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Discord Bot (.env)
DISCORD_BOT_TOKEN=your_bot_token
DEALSCALE_API_URL=http://localhost:8000
```

### 3. Database Migration

```bash
cd apps/backend
alembic upgrade head
```

### 4. Start Services

```bash
# Terminal 1: Backend
cd apps/backend
poetry install
poetry run uvicorn app.main:app --reload

# Terminal 2: Frontend
cd apps/frontend
pnpm install
pnpm dev

# Terminal 3: Discord Bot
cd apps/discord-bot
pnpm install
pnpm dev
```

### 5. Test Integration

1. Visit http://localhost:3000/profile
2. Click "Connect Discord"
3. Authorize the application
4. Open Discord and type `/leaderboard`
5. View your linked account in the profile

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐              ┌─────────────────────────┐   │
│  │  Web Browser   │              │   Discord Client        │   │
│  │  (React/Next)  │              │   (Desktop/Mobile)      │   │
│  └────────┬───────┘              └────────────┬────────────┘   │
│           │                                   │                 │
└───────────┼───────────────────────────────────┼─────────────────┘
            │                                   │
            │ HTTPS                             │ WebSocket
            │                                   │
┌───────────▼───────────────────────────────────▼─────────────────┐
│                      Application Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   Next.js      │◄──►│  FastAPI     │◄──►│ Discord Bot   │  │
│  │   Frontend     │    │  Backend     │    │  (discord.js) │  │
│  │                │    │              │    │               │  │
│  │ • Leaderboard  │    │ • Auth       │    │ • Commands    │  │
│  │ • Profile      │    │ • API        │    │ • Events      │  │
│  │ • OAuth UI     │    │ • Business   │    │ • Webhooks    │  │
│  └────────────────┘    └──────────────┘    └───────────────┘  │
│                               │                     │           │
└───────────────────────────────┼─────────────────────┼───────────┘
                                │                     │
                         REST/GraphQL           Discord API
                                │                     │
┌───────────────────────────────▼─────────────────────▼───────────┐
│                          Data Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   PostgreSQL   │    │    Redis     │    │  Discord API  │  │
│  │                │    │              │    │               │  │
│  │ • Users        │    │ • Cache      │    │ • Users       │  │
│  │ • Leaderboard  │    │ • Sessions   │    │ • Guilds      │  │
│  │ • Credits      │    │ • Pub/Sub    │    │ • Roles       │  │
│  │ • Audit Logs   │    │ • Queue      │    │ • Messages    │  │
│  └────────────────┘    └──────────────┘    └───────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Examples

#### OAuth2 Account Linking
```
User → Frontend → Discord OAuth → Backend → Database
  ↓                                  ↓
  ←──────────── Success ─────────────┘
```

#### Credit Request via Discord
```
User → Discord Bot → Backend API → Database
  ↓                       ↓             ↓
  ←─── Confirmation ──────┘             │
                                        │
Admin → Web Dashboard ──────────────────┤
  ↓                                     │
  └─── Approval ────► Backend ──────────┤
                         ↓              │
                    Update Credits      │
                         ↓              │
                    Discord DM ─────────┘
```

#### Leaderboard Real-time Update
```
User Action → Backend → Calculate Scores → Database
                ↓                            ↓
            WebSocket ───────────────────────┤
                ↓                            │
         All Connected Users                 │
                                             │
         Background Job (30s) ───────────────┤
                ↓                            │
         Detect Rank Changes                 │
                ↓                            │
         Discord Role Sync                   │
                ↓                            │
         Notify Users via DM ────────────────┘
```

---

## Testing

### Run Gherkin Feature Tests

```bash
# Backend tests
cd apps/backend
pytest tests/integration/discord/

# Bot tests
cd apps/discord-bot
pnpm test

# E2E tests with Cucumber
cd tests/e2e
pnpm cucumber-js
```

### Manual Testing Checklist

- [ ] Link Discord account via OAuth2
- [ ] View leaderboard in web app
- [ ] Execute `/leaderboard` in Discord
- [ ] Submit credit request via `/request`
- [ ] Admin approves request
- [ ] Verify credits added
- [ ] Trigger rank change
- [ ] Verify role updated in Discord
- [ ] Receive Discord DM notification
- [ ] Disconnect Discord account

---

## Deployment

### Production Checklist

- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Deploy backend (Render/Railway)
- [ ] Deploy bot (Railway/Fly.io)
- [ ] Deploy frontend (Vercel)
- [ ] Set up monitoring (Sentry, Grafana)
- [ ] Configure alerting (PagerDuty)
- [ ] Enable feature flag for 10% users
- [ ] Monitor for 24 hours
- [ ] Gradually increase to 100%

See [05_deployment_guide.md](./05_deployment_guide.md) for detailed instructions.

---

## Monitoring

### Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Discord Account Links (24h) | 100+ | < 50 |
| Bot Command Success Rate | 99%+ | < 95% |
| Leaderboard Response Time | < 200ms | > 500ms |
| OAuth Success Rate | 98%+ | < 90% |
| Role Sync Lag | < 5 min | > 15 min |
| Bot Uptime | 99.9% | < 99% |

### Dashboards

- **Grafana**: Real-time metrics and performance
- **Sentry**: Error tracking and debugging
- **Discord Bot Dashboard**: Command usage and health
- **Admin Analytics**: Credit requests and approvals

---

## Troubleshooting

### Common Issues

**Bot not responding to commands**
```bash
# Check bot is online in Discord
# Verify bot token is correct
# Check bot has proper permissions in server
# View logs: railway logs -s dealscale-discord-bot
```

**OAuth flow failing**
```bash
# Verify redirect URI matches exactly in Discord Portal
# Check DISCORD_CLIENT_SECRET is correct
# Ensure HTTPS in production
# Check backend logs for detailed error
```

**Roles not syncing**
```bash
# Verify bot has "Manage Roles" permission
# Ensure bot role is ABOVE roles it manages
# Check role sync job is running
# Manually trigger: POST /admin/discord/sync-roles
```

---

## Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/discord-xyz`
2. Make changes and write tests
3. Run linters: `pnpm biome check` (frontend), `ruff check` (backend)
4. Run tests: `pytest`, `pnpm test`
5. Create pull request with Gherkin scenarios
6. Request review from team
7. Merge after approval and CI passes

### Code Style

- **Frontend**: Biome formatter (auto-format on save)
- **Backend**: Ruff formatter, PEP 257 docstrings
- **Bot**: Biome formatter, ESLint
- **Max File Size**: 250 lines per file

---

## Security

### Best Practices

- ✅ All Discord tokens encrypted at rest (AES-256)
- ✅ OAuth2 state parameter for CSRF protection
- ✅ Input validation with Zod (frontend) and Pydantic (backend)
- ✅ Rate limiting on all endpoints
- ✅ Webhook signature validation (HMAC)
- ✅ Audit logging for all sensitive operations
- ✅ Regular security scans with Dependabot
- ✅ GDPR compliant data handling

### Reporting Security Issues

Email: security@dealscale.io  
PGP Key: [Link to public key]

---

## Support

- **Documentation**: You're reading it!
- **Issues**: [GitHub Issues](https://github.com/dealscale/deal-scale-app/issues)
- **Discord**: #dev-support channel
- **Email**: dev@dealscale.io

---

## License

This integration is part of the DealScale application.  
© 2025 DealScale. All rights reserved.

---

## Acknowledgments

- **Discord.js** - Powerful Discord API library
- **FastAPI** - Modern Python web framework
- **Next.js** - React framework for production
- **The DealScale Team** - For making this integration possible

---

<div align="center">

**Built with ❤️ by the DealScale Engineering Team**

[Back to Top](#discord-integration-for-dealscale-leaderboard)

</div>


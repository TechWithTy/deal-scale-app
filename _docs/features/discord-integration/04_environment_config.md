# Environment Configuration

## Overview

This document details all environment variables and configuration required for Discord integration across the DealScale stack.

## Discord Application Setup

### Step 1: Create Discord Application

1. Navigate to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "DealScale" (or your preferred name)
4. Save the **Application ID** (this is your `DISCORD_CLIENT_ID`)

### Step 2: Create Bot User

1. Go to "Bot" section in left sidebar
2. Click "Add Bot"
3. **Disable** "Public Bot" (optional, for private servers)
4. **Enable** these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent (if reading messages)
5. Click "Reset Token" and save the **Bot Token** (this is your `DISCORD_BOT_TOKEN`)

### Step 3: Configure OAuth2

1. Go to "OAuth2" > "General"
2. Add Redirect URL: `https://app.dealscale.io/auth/discord/callback`
3. For development: `http://localhost:3000/auth/discord/callback`
4. Save the **Client Secret** (this is your `DISCORD_CLIENT_SECRET`)

### Step 4: Bot Permissions

Required bot permissions (Permission Integer: 268445776):
- **View Channels** (1024)
- **Send Messages** (2048)
- **Manage Roles** (268435456)
- **Read Message History** (65536)
- **Use Slash Commands** (2147483648)

## Environment Variables

### Frontend (.env.local)

```bash
# Discord OAuth2 Configuration
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_application_id_here
NEXT_PUBLIC_APP_URL=https://app.dealscale.io
NEXT_PUBLIC_API_URL=https://api.dealscale.io

# Development
# NEXT_PUBLIC_APP_URL=http://localhost:3000
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```bash
# Discord OAuth2 Configuration
DISCORD_CLIENT_ID=your_application_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=https://app.dealscale.io/auth/discord/callback

# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id_here
DISCORD_ADMIN_CHANNEL_ID=channel_id_for_admin_notifications

# Role IDs (obtain from Discord server)
DISCORD_ROLE_CHAMPION=role_id_for_champion
DISCORD_ROLE_SILVER=role_id_for_silver
DISCORD_ROLE_BRONZE=role_id_for_bronze
DISCORD_ROLE_TOP_10=role_id_for_top_10
DISCORD_ROLE_ELITE=role_id_for_elite

# Encryption (for storing OAuth tokens)
DISCORD_TOKEN_ENCRYPTION_KEY=generate_secure_32_byte_key_here

# Database (existing)
DATABASE_URL=postgresql://user:password@localhost:5432/dealscale

# Redis (for caching and pub/sub)
REDIS_URL=redis://localhost:6379/0

# Development
# DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
```

### Discord Bot (.env)

```bash
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here
DISCORD_GUILD_ID=your_server_id_here

# DealScale API Configuration
DEALSCALE_API_URL=https://api.dealscale.io
DEALSCALE_API_KEY=your_internal_api_key_here

# Bot Channels
DISCORD_ADMIN_CHANNEL_ID=channel_id_for_admin_notifications
DISCORD_LEADERBOARD_CHANNEL_ID=channel_id_for_leaderboard_updates
DISCORD_ANNOUNCEMENTS_CHANNEL_ID=channel_id_for_announcements

# Bot Behavior
BOT_COMMAND_PREFIX=/
BOT_STATUS_MESSAGE=DealScale Leaderboard
BOT_ACTIVITY_TYPE=WATCHING

# Redis (for caching)
REDIS_URL=redis://localhost:6379/1

# Logging
LOG_LEVEL=info
NODE_ENV=production

# Development
# DEALSCALE_API_URL=http://localhost:8000
# LOG_LEVEL=debug
# NODE_ENV=development
```

## Generating Secure Keys

### Generate Token Encryption Key (Python)

```python
import secrets
import base64

# Generate 32-byte key for AES-256
key = secrets.token_bytes(32)
encoded_key = base64.b64encode(key).decode('utf-8')
print(f"DISCORD_TOKEN_ENCRYPTION_KEY={encoded_key}")
```

### Generate API Key (Python)

```python
import secrets

# Generate secure API key
api_key = secrets.token_urlsafe(32)
print(f"DEALSCALE_API_KEY={api_key}")
```

## Discord Server Setup

### Creating Role Hierarchy

1. Open Server Settings > Roles
2. Create roles in this order (top to bottom):
   ```
   @DealScale Bot    (highest - managed by bot)
   @Champion 🏆
   @Silver
   @Bronze
   @Top 10
   @Elite
   @Member          (lowest)
   ```

3. Configure role colors:
   - Champion: Gold (#FFD700)
   - Silver: Silver (#C0C0C0)
   - Bronze: Bronze (#CD7F32)
   - Top 10: Blue (#5865F2)
   - Elite: Purple (#9B59B6)

4. Assign permissions:
   - All leaderboard roles: Basic permissions + access to #champions-lounge
   - Champion only: Additional special channels

### Creating Channels

```
📋 GENERAL
  #general
  #announcements
  
🏆 LEADERBOARD
  #leaderboard-updates     (read-only, bot posts here)
  #champions-lounge        (Top 10 only)
  #elite-club              (Top 100 only)
  
💬 SUPPORT
  #help
  #feedback
  
🔧 ADMIN
  #admin-feed              (admin only)
  #security-alerts         (admin only)
```

### Channel Permissions

**#leaderboard-updates**:
- @everyone: View Channel, Read Message History
- @DealScale Bot: View, Send Messages, Embed Links

**#champions-lounge**:
- @everyone: Deny View Channel
- @Champion, @Silver, @Bronze, @Top 10: Allow View Channel
- @DealScale Bot: View, Send Messages

**#elite-club**:
- @everyone: Deny View Channel
- @Elite, @Top 10, @Bronze, @Silver, @Champion: Allow View Channel

## Configuration Files

### Backend: Discord Settings (Python)

**File**: `apps/backend/app/core/config.py`

```python
from pydantic_settings import BaseSettings

class DiscordSettings(BaseSettings):
    """Discord integration configuration."""
    
    # OAuth2
    discord_client_id: str
    discord_client_secret: str
    discord_redirect_uri: str
    
    # Bot
    discord_bot_token: str
    discord_guild_id: str
    discord_admin_channel_id: str | None = None
    
    # Roles
    discord_role_champion: str | None = None
    discord_role_silver: str | None = None
    discord_role_bronze: str | None = None
    discord_role_top_10: str | None = None
    discord_role_elite: str | None = None
    
    # Security
    discord_token_encryption_key: str
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
discord_settings = DiscordSettings()
```

### Discord Bot: Config (TypeScript)

**File**: `apps/discord-bot/src/config.ts`

```typescript
import { config } from "dotenv"

config()

export const botConfig = {
  // Discord
  token: process.env.DISCORD_BOT_TOKEN!,
  clientId: process.env.DISCORD_CLIENT_ID!,
  guildId: process.env.DISCORD_GUILD_ID!,
  
  // Channels
  adminChannelId: process.env.DISCORD_ADMIN_CHANNEL_ID,
  leaderboardChannelId: process.env.DISCORD_LEADERBOARD_CHANNEL_ID,
  announcementsChannelId: process.env.DISCORD_ANNOUNCEMENTS_CHANNEL_ID,
  
  // DealScale API
  apiUrl: process.env.DEALSCALE_API_URL || "http://localhost:8000",
  apiKey: process.env.DEALSCALE_API_KEY!,
  
  // Redis
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379/1",
  
  // Bot behavior
  commandPrefix: process.env.BOT_COMMAND_PREFIX || "/",
  statusMessage: process.env.BOT_STATUS_MESSAGE || "DealScale Leaderboard",
  activityType: process.env.BOT_ACTIVITY_TYPE || "WATCHING",
  
  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
  nodeEnv: process.env.NODE_ENV || "development",
}

// Validate required config
const requiredVars = [
  "DISCORD_BOT_TOKEN",
  "DISCORD_CLIENT_ID",
  "DISCORD_GUILD_ID",
  "DEALSCALE_API_KEY",
]

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
}
```

## Docker Compose Configuration

```yaml
version: '3.8'

services:
  discord-bot:
    build: ./apps/discord-bot
    environment:
      - DISCORD_BOT_TOKEN=${DISCORD_BOT_TOKEN}
      - DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
      - DISCORD_GUILD_ID=${DISCORD_GUILD_ID}
      - DEALSCALE_API_URL=${DEALSCALE_API_URL}
      - DEALSCALE_API_KEY=${DEALSCALE_API_KEY}
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      - redis
    restart: unless-stopped
    
  backend:
    build: ./apps/backend
    environment:
      - DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
      - DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
      - DISCORD_REDIRECT_URI=${DISCORD_REDIRECT_URI}
      - DISCORD_BOT_TOKEN=${DISCORD_BOT_TOKEN}
      - DISCORD_TOKEN_ENCRYPTION_KEY=${DISCORD_TOKEN_ENCRYPTION_KEY}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
```

## Obtaining Discord IDs

### Get Server (Guild) ID
1. Enable Developer Mode in Discord: User Settings > Advanced > Developer Mode
2. Right-click your server icon
3. Click "Copy Server ID"

### Get Channel IDs
1. Right-click any channel
2. Click "Copy Channel ID"

### Get Role IDs
1. Server Settings > Roles
2. Right-click any role
3. Click "Copy Role ID"

---

**Next**: Deployment and security hardening


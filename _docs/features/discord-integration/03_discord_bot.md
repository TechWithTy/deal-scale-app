# Discord Bot Implementation

## Overview

This document details the Discord bot implementation using discord.js v14, including slash command registration, credit request handling, and leaderboard display functionality.

## Project Structure

```
apps/discord-bot/
├── src/
│   ├── commands/
│   │   ├── request.ts         # /request command handler
│   │   ├── leaderboard.ts     # /leaderboard command handler
│   │   ├── profile.ts         # /profile command handler
│   │   ├── stats.ts           # /stats command handler
│   │   └── compare.ts         # /compare command handler
│   ├── services/
│   │   ├── api.ts             # DealScale API client
│   │   ├── cache.ts           # Redis caching layer
│   │   └── roles.ts           # Role synchronization service
│   ├── utils/
│   │   ├── embeds.ts          # Discord embed builders
│   │   ├── formatting.ts      # Text formatting utilities
│   │   └── validation.ts      # Input validation
│   ├── events/
│   │   ├── ready.ts           # Bot ready event
│   │   └── interactionCreate.ts  # Command interaction handler
│   ├── deploy-commands.ts     # Slash command registration script
│   └── index.ts               # Main bot entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## Core Bot Setup

### 1. Main Bot Entry Point

**File**: `apps/discord-bot/src/index.ts`

```typescript
/**
 * DealScale Discord Bot
 * 
 * Handles slash commands, leaderboard sync, and role management
 * for the DealScale competitive leaderboard system.
 */

import { Client, GatewayIntentBits, Collection } from "discord.js"
import { config } from "dotenv"
import { readdirSync } from "fs"
import { join } from "path"
import type { Command } from "./types"

config()

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
})

// Command collection
client.commands = new Collection<string, Command>()

/**
 * Load all command modules from the commands directory.
 */
async function loadCommands() {
  const commandsPath = join(__dirname, "commands")
  const commandFiles = readdirSync(commandsPath).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js")
  )

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file)
    const command: Command = await import(filePath)

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command)
      console.log(`✓ Loaded command: ${command.data.name}`)
    } else {
      console.warn(`⚠ Skipped ${file}: missing 'data' or 'execute'`)
    }
  }
}

/**
 * Load all event handlers from the events directory.
 */
async function loadEvents() {
  const eventsPath = join(__dirname, "events")
  const eventFiles = readdirSync(eventsPath).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js")
  )

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file)
    const event = await import(filePath)

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args))
    } else {
      client.on(event.name, (...args) => event.execute(...args))
    }

    console.log(`✓ Loaded event: ${event.name}`)
  }
}

/**
 * Initialize bot and connect to Discord.
 */
async function main() {
  try {
    console.log("🤖 Starting DealScale Discord Bot...")

    await loadCommands()
    await loadEvents()

    await client.login(process.env.DISCORD_BOT_TOKEN)
  } catch (error) {
    console.error("❌ Failed to start bot:", error)
    process.exit(1)
  }
}

// Graceful shutdown handling
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...")
  client.destroy()
  process.exit(0)
})

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled promise rejection:", error)
})

main()
```

### 2. Command Type Definitions

**File**: `apps/discord-bot/src/types.ts`

```typescript
import type {
  SlashCommandBuilder,
  CommandInteraction,
  Client,
  Collection,
} from "discord.js"

export interface Command {
  data: SlashCommandBuilder
  execute: (interaction: CommandInteraction) => Promise<void>
}

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>
  }
}

export interface LeaderboardPlayer {
  rank: number
  userId: string
  discordId: string | null
  name: string
  score: number
  rankChange: number
  badge: string
  location: string
  company: string
  isOnline: boolean
}

export interface CreditRequestPayload {
  discordId: string
  type: "ai" | "lead"
  amount: number
  reason?: string
}
```

## Slash Command Implementations

### 1. Credit Request Command

**File**: `apps/discord-bot/src/commands/request.ts`

```typescript
/**
 * /request command - Request AI or lead credits from admins.
 */

import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js"
import { apiClient } from "../services/api"
import type { Command } from "../types"

export const data = new SlashCommandBuilder()
  .setName("request")
  .setDescription("Request DealScale credits from administrators")
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Type of credit to request")
      .setRequired(true)
      .addChoices(
        { name: "AI Credit", value: "ai" },
        { name: "Lead Credit", value: "lead" }
      )
  )
  .addIntegerOption((option) =>
    option
      .setName("amount")
      .setDescription("Number of credits to request")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  )
  .addStringOption((option) =>
    option
      .setName("reason")
      .setDescription("Reason for this request (optional)")
      .setRequired(false)
      .setMaxLength(500)
  )

export async function execute(interaction: CommandInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true })

  const type = interaction.options.get("type", true).value as "ai" | "lead"
  const amount = interaction.options.get("amount", true).value as number
  const reason = interaction.options.get("reason")?.value as string | undefined

  try {
    // Submit credit request to DealScale API
    const response = await apiClient.post("/credits/request", {
      discord_id: interaction.user.id,
      type,
      amount,
      reason,
      discord_message_id: interaction.id,
      discord_channel_id: interaction.channelId,
    })

    const embed = new EmbedBuilder()
      .setColor(0x5865f2) // Discord blurple
      .setTitle("✅ Credit Request Submitted")
      .setDescription(
        `Your request for **${amount} ${type.toUpperCase()} credit(s)** has been submitted to administrators for approval.`
      )
      .addFields(
        { name: "Request ID", value: `#${response.data.id}`, inline: true },
        { name: "Status", value: "⏳ Pending", inline: true }
      )
      .setFooter({
        text: "You'll receive a DM when your request is processed",
      })
      .setTimestamp()

    if (reason) {
      embed.addFields({ name: "Reason", value: reason })
    }

    await interaction.editReply({ embeds: [embed] })

    // Log to admin channel (if configured)
    const adminChannelId = process.env.DISCORD_ADMIN_CHANNEL_ID
    if (adminChannelId) {
      const adminChannel = await interaction.client.channels.fetch(
        adminChannelId
      )
      if (adminChannel?.isTextBased()) {
        const adminEmbed = new EmbedBuilder()
          .setColor(0xffa500) // Orange
          .setTitle("🆕 New Credit Request")
          .addFields(
            { name: "User", value: `<@${interaction.user.id}>`, inline: true },
            { name: "Type", value: type.toUpperCase(), inline: true },
            { name: "Amount", value: amount.toString(), inline: true },
            { name: "Request ID", value: `#${response.data.id}` }
          )
          .setTimestamp()

        if (reason) {
          adminEmbed.addFields({ name: "Reason", value: reason })
        }

        await adminChannel.send({ embeds: [adminEmbed] })
      }
    }
  } catch (error: any) {
    console.error("Credit request error:", error)

    const errorEmbed = new EmbedBuilder()
      .setColor(0xed4245) // Discord red
      .setTitle("❌ Request Failed")
      .setDescription(
        error.response?.data?.detail ||
          "Failed to submit credit request. Please try again later."
      )
      .setTimestamp()

    await interaction.editReply({ embeds: [errorEmbed] })
  }
}

export default { data, execute } as Command
```

### 2. Leaderboard Command

**File**: `apps/discord-bot/src/commands/leaderboard.ts`

```typescript
/**
 * /leaderboard command - Display top players from DealScale.
 */

import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js"
import { apiClient } from "../services/api"
import { formatNumber, getRankEmoji } from "../utils/formatting"
import type { Command, LeaderboardPlayer } from "../types"

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("View the DealScale competitive leaderboard")
  .addIntegerOption((option) =>
    option
      .setName("top")
      .setDescription("Number of top players to display")
      .setRequired(false)
      .setMinValue(5)
      .setMaxValue(25)
  )

export async function execute(interaction: CommandInteraction): Promise<void> {
  await interaction.deferReply()

  const top = (interaction.options.get("top")?.value as number) || 10

  try {
    // Fetch leaderboard data from DealScale API
    const response = await apiClient.get<LeaderboardPlayer[]>(
      `/leaderboard?limit=${top}`
    )
    const players = response.data

    if (!players || players.length === 0) {
      await interaction.editReply("No leaderboard data available.")
      return
    }

    // Build embed
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🏆 DealScale Leaderboard")
      .setDescription(`Top ${top} Players`)
      .setTimestamp()
      .setFooter({ text: "Updated in real-time" })

    // Add player fields
    const leaderboardText = players
      .map((player) => {
        const rankEmoji = getRankEmoji(player.rank)
        const changeIndicator = getChangeIndicator(player.rankChange)
        const onlineStatus = player.isOnline ? "🟢" : "⚪"

        return `${rankEmoji} **${player.rank}.** ${player.name} ${player.badge}\n` +
          `   ${onlineStatus} ${formatNumber(player.score)} pts ${changeIndicator}\n` +
          `   ${player.location} • ${player.company}`
      })
      .join("\n\n")

    embed.setDescription(leaderboardText)

    // Add helpful footer
    const totalPlayers = await apiClient.get<{ total: number }>(
      "/leaderboard/total"
    )
    embed.setFooter({
      text: `Showing top ${top} of ${formatNumber(totalPlayers.data.total)} active players`,
    })

    await interaction.editReply({ embeds: [embed] })
  } catch (error: any) {
    console.error("Leaderboard fetch error:", error)

    const errorEmbed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("❌ Error")
      .setDescription(
        "Failed to fetch leaderboard data. Please try again later."
      )

    await interaction.editReply({ embeds: [errorEmbed] })
  }
}

function getChangeIndicator(rankChange: number): string {
  if (rankChange > 0) return `↗ +${rankChange}`
  if (rankChange < 0) return `↘ ${rankChange}`
  return "—"
}

export default { data, execute } as Command
```

---

**File Size**: Under 250 lines per file  
**Next**: API client, role synchronization, and deployment configuration


# VINNY UO

**Universal's Very Important Notifications** — A Discord bot that monitors Universal Orlando Resort attraction statuses and wait times in real-time.

Built by [Ace Baugh](https://github.com/AceBaugh)

---

## Features

- Monitors all three Universal Orlando theme parks — Universal Studios Florida, Islands of Adventure, and Epic Universe
- Polls live attraction data every 10 seconds via the [ThemeParks.wiki API](https://themeparks.wiki/)
- Sends notifications for:
  - Park opening (`🚀🚀🚀` Code 108)
  - Park closing (`🚫🚫🚫` Code 107)
  - Attraction breakdown during operating hours (`❌❌❌` Code 101)
  - Attraction reopening during operating hours (`🟢🟢🟢` Code 102)
  - Attraction early close during operating hours (`⬛️⬛️⬛️` Code 107)
  - Significant wait time changes (±20 minutes or more)
- Displays live wait times as 3-digit emoji in pinned messages (e.g. `0️⃣4️⃣5️⃣` = 45 min)
- Maintains pinned messages in each park channel and an all-parks overview channel
- Per-attraction dedicated channels with full status history for the day
- Wait time change alerts posted to a general `#wait-change` channel and each attraction's own channel
- Persistent message log (`messageLog.json`) for intelligent cleanup on restart
- Silent restart — on reboot, syncs current state and updates pinned messages without spamming notifications (101 re-alerts for any currently down attractions)
- All messages self-delete or are cleaned up at end of each park's operating day

---

## Status Codes

| Display | Code | Meaning |
|---|---|---|
| `❌❌❌` | **101** | Attraction is **DOWN** — unexpected closure during operating hours |
| `0️⃣0️⃣5️⃣` *(example)* | **102** | Attraction is **OPERATING** — number shown is current wait time in minutes |
| `🔧🔧🔧` | **103** | Attraction is under **REFURBISHMENT** — planned extended closure |
| `⬛️⬛️⬛️` | **107** | **Park or attraction CLOSED** — outside of operating hours or early close |
| `🚀🚀🚀` | **108** | Park is **OPENING** — attractions coming online |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16.9.0 or higher
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))
- A Discord server set up with the channel structure described below

---

## Discord Server Setup

### Required Channel Structure

**Overview**
- One "all parks" status channel with a pinned message
- One "wait change" channel for wait time shift alerts

**Per Park (×3 — UO, IA, EU)**
- One park status channel with a pinned message

**Per Attraction**
- One dedicated channel per attraction (see full list in `.env`)

### Bot Permissions

- Read Messages / View Channels
- Send Messages
- Manage Messages
- Read Message History

### Required Discord Intents

In the [Discord Developer Portal](https://discord.com/developers/applications), enable:
- **Message Content Intent**

### Creating Pinned Messages

1. Enable **Developer Mode** in Discord: `Settings → Advanced → Developer Mode`
2. In each channel, send any placeholder message (e.g. `VINNY loading...`)
3. Pin that message
4. Right-click the message → **Copy Message ID**
5. Add the message ID to your `.env` file

Or use the automated setup scripts:
```bash
node setup-pins.js
node update-env.js
```

### Custom Park Emojis

The bot uses custom server emojis for each park. Update the emoji IDs in the `CONFIG.PARKS` section of `index.js`.

Placeholder names used in the code:
- `:uo:` — Universal Studios Florida
- `:ia:` — Islands of Adventure
- `:eu:` — Epic Universe

---

## Installation

**1. Clone the repository**
```bash
git clone https://github.com/AceBaugh/VINNY-UO.git
cd VINNY-UO
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure your `.env` file**

All channel IDs are pre-filled in the template. Add your `DISCORD_TOKEN` and run setup-pins to get your pinned message IDs.

---

## Running the Bot

```bash
npm start
```

**Development mode** (auto-restarts on file changes):
```bash
npm run dev
```

### On a VPS with PM2

```bash
npm install -g pm2
pm2 start index.js --name "vinny-uo"
pm2 save
pm2 startup
```

**Common PM2 commands:**
```bash
pm2 status
pm2 logs vinny-uo
pm2 restart vinny-uo
pm2 stop vinny-uo
```

---

## Data Storage

| File | Purpose |
|---|---|
| `parkData.json` | Current status, wait times, and park hours for all attractions. Updated every 10 seconds. |
| `messageLog.json` | Discord message IDs and timestamps for all sent notifications. Used for cleanup on restart or at end of park day. |

Both files are safe to delete to reset state — the bot will recreate them on next start.

> ⚠️ Add both files to your `.gitignore`.

---

## How Messages Are Managed

| Message Type | Location | Lifetime |
|---|---|---|
| 101 (DOWN) | Park status channel | Deleted when attraction reopens (102) or at park close |
| 102 / 107 / 108 | Park status channel | Auto-deleted after 5 minutes |
| Status history (101, 102, 108) | Per-attraction channel | Persist all day, deleted at park close |
| Wait time change alerts | `#wait-change` + per-attraction channel | Persist all day, deleted at park close |

---

## API

Live park data is provided by the **[ThemeParks.wiki API](https://themeparks.wiki/)**.

Park entity endpoints used:
```
Universal Studios Florida:  https://api.themeparks.wiki/v1/entity/eb3f4560-2383-4a36-9152-6b3e5ed6bc57/live
Islands of Adventure:       https://api.themeparks.wiki/v1/entity/267615cc-8943-4c2a-ae2c-5da728ca591f/live
Epic Universe:              https://api.themeparks.wiki/v1/entity/12dbb85b-265f-44e6-bccf-f1faa17211fc/live
```

---

## License

ISC

---

*VINNY UO is not affiliated with, endorsed by, or connected to Universal Parks & Resorts or Comcast in any way. This is an independent fan-made project.*

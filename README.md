# discord-bot

A simple Discord bot built with TypeScript, `discord.js`, and PostgreSQL.

This README is written for beginners. Follow it step by step.

## What This Bot Does

- `/ping` - checks if the bot is alive
- `/dbtime` - reads current time from PostgreSQL

## Requirements

Install these first:

- Node.js 20 or newer
- PostgreSQL 14 or newer

Check versions:

```powershell
node -v
npm -v
psql --version
```

## Quick Start (Copy/Paste)

1. Install dependencies:

```powershell
npm install
```

2. Open `config.json` and fill in real values:
- Discord bot token
- Discord client ID
- your Discord user ID in `owners`
- test guild ID (if you use `guild` mode)
- PostgreSQL connection data

3. Build the project:

```powershell
npm run build
```

4. Register slash commands:

```powershell
npm run deploy:commands
```

5. Start the bot:

```powershell
npm start
```

If everything is correct, the bot should log in and show as online in Discord.

## Basic Troubleshooting

- Error: `Unable to read config file`
  - make sure `config.json` exists in the project root
- Error: `Invalid JSON in config file`
  - check commas/quotes in `config.json`
- Discord login fails
  - token is wrong or expired
- `/dbtime` fails
  - PostgreSQL is not running, or DB credentials are wrong

## Configuration

By default, the app reads:

- `config.json`

## Project Structure

- `src/commands` - slash commands
- `src/handlers` - Discord interaction handlers
- `src/services` - cooldowns and permission checks
- `src/database` - PostgreSQL pool and repositories
- `src/config` - config loading and validation

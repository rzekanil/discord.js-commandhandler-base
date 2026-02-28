import { Client, GatewayIntentBits } from "discord.js";
import { loadConfig } from "./config/loadConfig.js";
import { logger } from "./core/logger.js";
import { DatabasePool } from "./database/pool.js";
import { HealthRepository } from "./database/repositories/healthRepository.js";
import { registerInteractionHandler } from "./handlers/interactionHandler.js";
import { CommandRegistry } from "./services/commandRegistry.js";
import { CooldownService } from "./services/cooldownService.js";
import { PermissionService } from "./services/permissionService.js";

export async function bootstrap(): Promise<void> {
  const config = await loadConfig();
  const pool = DatabasePool.getInstance(config.database);
  const repositories = {
    health: new HealthRepository(pool)
  };

  const client = new Client({
    intents: [GatewayIntentBits.Guilds]
  });

  const commandRegistry = new CommandRegistry();
  await commandRegistry.loadFrom();

  if (config.bot.syncCommandsOnStartup) {
    await commandRegistry.registerSlashCommands(config);
  }

  registerInteractionHandler(client, {
    config,
    commandRegistry,
    cooldownService: new CooldownService(),
    permissionService: new PermissionService(),
    repositories
  });

  client.once("ready", () => {
    logger.info(`Bot logged in as ${client.user?.tag ?? "unknown-user"}`);
  });

  client.on("error", (error) => {
    logger.error("Discord client error", error);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", reason);
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", error);
  });

  await client.login(config.bot.token);
}

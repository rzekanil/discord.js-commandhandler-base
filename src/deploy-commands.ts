import { loadConfig } from "./config/loadConfig.js";
import { logger } from "./core/logger.js";
import { CommandRegistry } from "./services/commandRegistry.js";

async function deployCommands(): Promise<void> {
  const config = await loadConfig();
  const commandRegistry = new CommandRegistry();
  await commandRegistry.loadFrom();
  await commandRegistry.registerSlashCommands(config);
}

deployCommands().catch((error: unknown) => {
  logger.error("Slash command deployment failed", error);
  process.exitCode = 1;
});

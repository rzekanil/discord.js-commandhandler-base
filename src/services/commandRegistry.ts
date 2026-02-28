import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { REST, Routes } from "discord.js";
import { BotCommand } from "../commands/types.js";
import { AppConfig } from "../types/config.js";
import { logger } from "../core/logger.js";

async function getCommandFilePaths(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        return getCommandFilePaths(fullPath);
      }
      if (entry.isFile() && entry.name.endsWith(".js")) {
        return [fullPath];
      }
      return [];
    })
  );

  return files.flat();
}

function isBotCommand(value: unknown): value is BotCommand {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<BotCommand>;
  return typeof candidate.execute === "function" && candidate.data !== undefined;
}

export class CommandRegistry {
  private readonly commands = new Map<string, BotCommand>();

  public get(name: string): BotCommand | undefined {
    return this.commands.get(name);
  }

  public getAll(): BotCommand[] {
    return [...this.commands.values()];
  }

  public async loadFrom(directoryRelativeToDist = "commands"): Promise<void> {
    const commandsPath = resolve(process.cwd(), "dist", directoryRelativeToDist);
    const files = await getCommandFilePaths(commandsPath);

    for (const filePath of files) {
      const moduleUrl = pathToFileURL(filePath).href;
      const imported = (await import(moduleUrl)) as { default?: unknown };
      const command = imported.default;

      if (!isBotCommand(command)) {
        logger.warn(`Skipped command file without valid default export: ${filePath}`);
        continue;
      }

      this.commands.set(command.data.name, command);
    }
  }

  public async registerSlashCommands(config: AppConfig): Promise<void> {
    const rest = new REST({ version: "10" }).setToken(config.bot.token);
    const commandBodies = this.getAll().map((command) => command.data.toJSON());

    if (config.bot.commandRegistration.mode === "guild") {
      const guildId = config.bot.commandRegistration.guildId;
      if (!guildId) {
        throw new Error("Missing guildId for guild command registration.");
      }

      await rest.put(Routes.applicationGuildCommands(config.bot.clientId, guildId), {
        body: commandBodies
      });
      logger.info(`Registered ${commandBodies.length} commands in guild: ${guildId}`);
      return;
    }

    await rest.put(Routes.applicationCommands(config.bot.clientId), {
      body: commandBodies
    });
    logger.info(`Registered ${commandBodies.length} commands globally.`);
  }
}

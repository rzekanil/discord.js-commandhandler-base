import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { AppConfig } from "../types/config.js";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(obj: Record<string, unknown>, key: string): string {
  const value = obj[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Config validation error: "${key}" must be a non-empty string.`);
  }
  return value;
}

function getBoolean(obj: Record<string, unknown>, key: string): boolean {
  const value = obj[key];
  if (typeof value !== "boolean") {
    throw new Error(`Config validation error: "${key}" must be a boolean.`);
  }
  return value;
}

function getNumber(obj: Record<string, unknown>, key: string): number {
  const value = obj[key];
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Config validation error: "${key}" must be a number.`);
  }
  return value;
}

function getStringArray(obj: Record<string, unknown>, key: string): string[] {
  const value = obj[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`Config validation error: "${key}" must be a string array.`);
  }
  return value;
}

function parseConfig(raw: unknown): AppConfig {
  if (!isObject(raw)) {
    throw new Error("Config validation error: root config must be an object.");
  }

  const botRaw = raw.bot;
  const databaseRaw = raw.database;

  if (!isObject(botRaw)) {
    throw new Error('Config validation error: "bot" section is required.');
  }
  if (!isObject(databaseRaw)) {
    throw new Error('Config validation error: "database" section is required.');
  }

  const commandRegistrationRaw = botRaw.commandRegistration;
  if (!isObject(commandRegistrationRaw)) {
    throw new Error('Config validation error: "bot.commandRegistration" is required.');
  }

  const mode = getString(commandRegistrationRaw, "mode");
  if (mode !== "global" && mode !== "guild") {
    throw new Error('Config validation error: "bot.commandRegistration.mode" must be "global" or "guild".');
  }

  const guildId = commandRegistrationRaw.guildId;
  if (mode === "guild" && (typeof guildId !== "string" || guildId.trim() === "")) {
    throw new Error(
      'Config validation error: "bot.commandRegistration.guildId" is required when mode is "guild".'
    );
  }

  return {
    bot: {
      token: getString(botRaw, "token"),
      clientId: getString(botRaw, "clientId"),
      owners: getStringArray(botRaw, "owners"),
      syncCommandsOnStartup: getBoolean(botRaw, "syncCommandsOnStartup"),
      commandRegistration:
        typeof guildId === "string"
          ? { mode, guildId }
          : { mode }
    },
    database: {
      host: getString(databaseRaw, "host"),
      port: getNumber(databaseRaw, "port"),
      user: getString(databaseRaw, "user"),
      password: getString(databaseRaw, "password"),
      database: getString(databaseRaw, "database"),
      ssl: getBoolean(databaseRaw, "ssl"),
      max: getNumber(databaseRaw, "max"),
      idleTimeoutMillis: getNumber(databaseRaw, "idleTimeoutMillis"),
      connectionTimeoutMillis: getNumber(databaseRaw, "connectionTimeoutMillis")
    }
  };
}

export async function loadConfig(configPath = "config.json"): Promise<AppConfig> {
  const selectedPath = process.env.BOT_CONFIG_PATH ?? configPath;
  const absolutePath = resolve(process.cwd(), selectedPath);

  let content: string;
  try {
    content = await readFile(absolutePath, "utf8");
  } catch (error) {
    throw new Error(`Unable to read config file at "${absolutePath}".`, { cause: error });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    throw new Error(`Invalid JSON in config file "${absolutePath}".`, { cause: error });
  }

  return parseConfig(parsed);
}

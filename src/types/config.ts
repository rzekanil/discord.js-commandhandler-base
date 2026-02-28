export interface BotCommandRegistrationConfig {
  mode: "global" | "guild";
  guildId?: string;
}

export interface BotConfig {
  token: string;
  clientId: string;
  owners: string[];
  syncCommandsOnStartup: boolean;
  commandRegistration: BotCommandRegistrationConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

export interface AppConfig {
  bot: BotConfig;
  database: DatabaseConfig;
}

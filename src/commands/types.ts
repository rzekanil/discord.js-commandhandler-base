import {
  ChatInputCommandInteraction,
  PermissionResolvable,
  SlashCommandBuilder
} from "discord.js";
import { AppConfig } from "../types/config.js";
import { HealthRepository } from "../database/repositories/healthRepository.js";

export interface CommandContext {
  interaction: ChatInputCommandInteraction;
  config: AppConfig;
  repositories: {
    health: HealthRepository;
  };
}

export interface CommandAccess {
  ownerOnly?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: PermissionResolvable[];
}

export interface BotCommand {
  data: SlashCommandBuilder;
  cooldownSeconds?: number;
  access?: CommandAccess;
  execute: (context: CommandContext) => Promise<void>;
}

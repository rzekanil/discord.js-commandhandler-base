import { Client, Interaction } from "discord.js";
import { AppConfig } from "../types/config.js";
import { CommandRegistry } from "../services/commandRegistry.js";
import { CooldownService } from "../services/cooldownService.js";
import { PermissionService } from "../services/permissionService.js";
import { embedFactory } from "../core/embeds.js";
import { logger } from "../core/logger.js";
import { HealthRepository } from "../database/repositories/healthRepository.js";

interface InteractionHandlerDeps {
  config: AppConfig;
  commandRegistry: CommandRegistry;
  cooldownService: CooldownService;
  permissionService: PermissionService;
  repositories: {
    health: HealthRepository;
  };
}

export function registerInteractionHandler(client: Client, deps: InteractionHandlerDeps): void {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = deps.commandRegistry.get(interaction.commandName);
    if (!command) {
      await interaction.reply({
        embeds: [embedFactory.error("Command not found.")],
        ephemeral: true
      });
      return;
    }

    const permissionCheck = deps.permissionService.check(interaction, command.access, deps.config.bot.owners);
    if (!permissionCheck.allowed) {
      await interaction.reply({
        embeds: [embedFactory.error(permissionCheck.reason ?? "Insufficient permissions.")],
        ephemeral: true
      });
      return;
    }

    const cooldownResult = deps.cooldownService.check(
      interaction.commandName,
      interaction.user.id,
      command.cooldownSeconds ?? 0
    );
    if (!cooldownResult.allowed) {
      await interaction.reply({
        embeds: [embedFactory.error(`Please wait ${cooldownResult.retryAfterSeconds}s before using this again.`)],
        ephemeral: true
      });
      return;
    }

    try {
      await command.execute({
        interaction,
        config: deps.config,
        repositories: deps.repositories
      });
    } catch (error) {
      logger.error(`Command error: ${interaction.commandName}`, error);

      const payload = {
        embeds: [embedFactory.error("Unexpected error while executing command.")],
        ephemeral: true
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }
    }
  });
}

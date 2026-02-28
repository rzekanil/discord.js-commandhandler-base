import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BotCommand } from "./types.js";
import { embedFactory } from "../core/embeds.js";

const dbTimeCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("dbtime")
    .setDescription("Zwraca aktualny czas z PostgreSQL."),
  cooldownSeconds: 10,
  access: {
    requiredPermissions: [PermissionFlagsBits.ManageGuild]
  },
  async execute({ interaction, repositories }): Promise<void> {
    const dbTime = await repositories.health.getDatabaseTime();
    await interaction.reply({
      embeds: [embedFactory.info(`Czas DB: ${dbTime.toISOString()}`)],
      ephemeral: true
    });
  }
};

export default dbTimeCommand;

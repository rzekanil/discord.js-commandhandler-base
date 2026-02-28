import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from "./types.js";
import { embedFactory } from "../core/embeds.js";

const pingCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Checks bot latency."),
  cooldownSeconds: 5,
  async execute({ interaction }): Promise<void> {
    const wsPing = interaction.client.ws.ping;
    await interaction.reply({
      embeds: [embedFactory.success(`Pong! WebSocket ping: ${wsPing}ms`)],
      ephemeral: true
    });
  }
};

export default pingCommand;

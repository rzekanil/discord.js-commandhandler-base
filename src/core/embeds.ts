import { EmbedBuilder } from "discord.js";

export const embedFactory = {
  success(message: string): EmbedBuilder {
    return new EmbedBuilder().setColor(0x2ecc71).setDescription(`[OK] ${message}`);
  },
  error(message: string): EmbedBuilder {
    return new EmbedBuilder().setColor(0xe74c3c).setDescription(`[ERROR] ${message}`);
  },
  info(message: string): EmbedBuilder {
    return new EmbedBuilder().setColor(0x3498db).setDescription(`[INFO] ${message}`);
  }
};

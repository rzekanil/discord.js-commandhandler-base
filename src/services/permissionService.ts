import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { CommandAccess } from "../commands/types.js";

interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

function ensureGuildMember(interaction: ChatInputCommandInteraction): GuildMember | null {
  if (!interaction.inCachedGuild()) {
    return null;
  }
  return interaction.member;
}

export class PermissionService {
  public check(
    interaction: ChatInputCommandInteraction,
    access: CommandAccess | undefined,
    ownerIds: string[]
  ): PermissionResult {
    if (!access) {
      return { allowed: true };
    }

    if (access.ownerOnly && !ownerIds.includes(interaction.user.id)) {
      return { allowed: false, reason: "This command is available only to bot owners." };
    }

    const member = ensureGuildMember(interaction);

    if (access.requiredRoles && access.requiredRoles.length > 0) {
      if (!member) {
        return { allowed: false, reason: "This command is only available in a guild." };
      }
      const hasRole = access.requiredRoles.some((roleId) => member.roles.cache.has(roleId));
      if (!hasRole) {
        return { allowed: false, reason: "Missing required role for this command." };
      }
    }

    if (access.requiredPermissions && access.requiredPermissions.length > 0) {
      if (!member) {
        return { allowed: false, reason: "This command is only available in a guild." };
      }
      const hasPermissions = member.permissions.has(access.requiredPermissions);
      if (!hasPermissions) {
        return { allowed: false, reason: "Missing required permissions for this command." };
      }
    }

    return { allowed: true };
  }
}

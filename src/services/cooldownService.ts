interface CooldownCheckResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export class CooldownService {
  private readonly cooldowns = new Map<string, number>();

  public check(commandName: string, userId: string, cooldownSeconds: number): CooldownCheckResult {
    if (cooldownSeconds <= 0) {
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const key = `${commandName}:${userId}`;
    const now = Date.now();
    const expiresAt = this.cooldowns.get(key);

    if (expiresAt !== undefined && now < expiresAt) {
      const retryAfterSeconds = Math.ceil((expiresAt - now) / 1000);
      return { allowed: false, retryAfterSeconds };
    }

    this.cooldowns.set(key, now + cooldownSeconds * 1000);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

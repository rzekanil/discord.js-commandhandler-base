import { inspect } from "node:util";
import chalk from "chalk";

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

const LEVEL_STYLES: Record<LogLevel, (text: string) => string> = {
  INFO: chalk.bold.cyan,
  WARN: chalk.bold.yellow,
  ERROR: chalk.bold.red,
  DEBUG: chalk.bold.magenta
};

function formatTimestamp(date: Date): string {
  return date.toISOString();
}

function formatContext(context: unknown): string {
  return inspect(context, {
    colors: chalk.level > 0,
    depth: 4,
    compact: false
  });
}

function log(level: LogLevel, message: string, context?: unknown): void {
  const timestamp = chalk.dim(`[${formatTimestamp(new Date())}]`);
  const levelTag = LEVEL_STYLES[level](`[${level}]`);
  const base = `${timestamp} ${levelTag} ${message}`;

  if (context === undefined) {
    console.log(base);
    return;
  }

  console.log(`${base}\n${formatContext(context)}`);
}

export const logger = {
  info: (message: string, context?: unknown): void => log("INFO", message, context),
  warn: (message: string, context?: unknown): void => log("WARN", message, context),
  error: (message: string, context?: unknown): void => log("ERROR", message, context),
  debug: (message: string, context?: unknown): void => log("DEBUG", message, context)
};

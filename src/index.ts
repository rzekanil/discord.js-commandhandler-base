import { bootstrap } from "./bootstrap.js";
import { logger } from "./core/logger.js";

bootstrap().catch((error: unknown) => {
  logger.error("Application bootstrap failed", error);
  process.exitCode = 1;
});

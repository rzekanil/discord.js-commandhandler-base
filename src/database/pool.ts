import { Pool } from "pg";
import { DatabaseConfig } from "../types/config.js";

export class DatabasePool {
  private static instance: Pool | null = null;

  public static getInstance(config: DatabaseConfig): Pool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new Pool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: config.ssl,
        max: config.max,
        idleTimeoutMillis: config.idleTimeoutMillis,
        connectionTimeoutMillis: config.connectionTimeoutMillis
      });
    }
    return DatabasePool.instance;
  }
}

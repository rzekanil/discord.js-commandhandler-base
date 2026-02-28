import { Pool } from "pg";

interface DbNowRow {
  now: Date;
}

export class HealthRepository {
  public constructor(private readonly pool: Pool) {}

  public async getDatabaseTime(): Promise<Date> {
    const result = await this.pool.query<DbNowRow>("SELECT NOW() AS now");
    const row = result.rows[0];

    if (!row) {
      throw new Error("Failed to read database time.");
    }

    return row.now;
  }
}

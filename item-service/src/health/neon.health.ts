import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { DbService } from '../db/db.service';
import { sql } from 'drizzle-orm';

@Injectable()
export class NeonHealthIndicator {
  constructor(
    private db: DbService,
    private healthIndicatorService: HealthIndicatorService,
  ) {}

  pingCheck() {
    return this.healthIndicatorService
      .check('neon')
      .attempt(async () => {
        await this.db.db.execute(sql`SELECT 1`);
      });
  }
}
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema"
import { ConfigService } from '@nestjs/config';

export const createDB = (configService : ConfigService) => {
    const sql = neon(configService.get<string>('DATABASE_URL')!);
    return drizzle(sql, {schema});
}
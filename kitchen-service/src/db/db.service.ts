import { neon } from "@neondatabase/serverless";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/neon-http";

@Injectable()
export class DbService {
    public db : ReturnType<typeof drizzle>;

    constructor(configService : ConfigService) {
        const sql = neon(configService.get<string>('DATABASE_URL')!);
        this.db = drizzle(sql, {schema})
    }

}
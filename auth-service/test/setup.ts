import { resolve } from 'path';
import * as dotenv from 'dotenv';

// Load .env.test BEFORE NestJS ConfigModule loads .env
const envPath = resolve(__dirname, '..', '.env.test');
dotenv.config({ path: envPath, override: true, debug: false });

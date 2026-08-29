import { resolve } from 'path';
import * as dotenv from 'dotenv';

const envPath = resolve(__dirname, '..', '.env.test');
dotenv.config({ path: envPath, override: true, debug: false });

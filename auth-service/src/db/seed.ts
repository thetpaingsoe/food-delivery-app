import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { users } from './schema';

const accounts = [
  { name: 'Admin', email: 'admin@swiftbite.local', password: 'Admin123!', role: 'admin' },
  { name: 'Kitchen', email: 'kitchen@swiftbite.local', password: 'Kitchen123!', role: 'kitchen' },
  { name: 'Rider', email: 'rider@swiftbite.local', password: 'Rider123!', role: 'rider' },
  { name: 'Customer', email: 'customer@swiftbite.local', password: 'Customer123!', role: 'customer' },
];

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!));

  for (const account of accounts) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, account.email))
      .limit(1);

    if (existing.length > 0) {
      console.log(`skip ${account.email} (exists)`);
      continue;
    }

    await db.insert(users).values({
      name: account.name,
      email: account.email,
      passwordHash: await bcrypt.hash(account.password, 10),
      role: account.role,
    });
    console.log(`seeded ${account.email} (${account.role})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

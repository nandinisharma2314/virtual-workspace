import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import { users } from './src/database/schema.js';
import { eq, ilike } from 'drizzle-orm';

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

async function main() {
  await db.update(users).set({ department: 'Design' }).where(ilike(users.name, '%nia%'));
  await db.update(users).set({ department: 'Product' }).where(eq(users.role, 'Admin'));
  
  console.log('Departments updated successfully');
  process.exit(0);
}

main();

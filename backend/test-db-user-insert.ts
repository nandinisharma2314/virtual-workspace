import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/database/schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function test() {
  try {
    const users = await db.select().from(schema.users).limit(1);
    const userId = users[0].id;
    console.log("Using user ID:", userId);
    
    const res = await db.insert(schema.files).values({
      name: "test.png",
      url: "",
      storageKey: "dummy-key",
      size: 1024,
      type: "image/png",
      uploadedById: userId,
    }).returning();
    console.log("Success:", res);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    pool.end();
  }
}
test();

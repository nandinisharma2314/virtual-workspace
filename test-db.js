import { DatabaseService } from './backend/dist/database/database.service.js';
import { files, messages } from './backend/dist/database/schema.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

async function run() {
  const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/workflow' });
  const db = drizzle(pool);
  
  const allFiles = await db.select().from(files);
  console.log("FILES TABLE:", allFiles.length);
  
  const allMsgs = await db.select().from(messages);
  const msgsWithAttachments = allMsgs.filter(m => m.attachments && m.attachments.length > 0);
  console.log("MESSAGES WITH ATTACHMENTS:", msgsWithAttachments.length);
  process.exit(0);
}
run();

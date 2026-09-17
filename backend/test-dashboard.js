import { DatabaseService } from './src/database/database.service.js';
import { timeLogs } from './src/database/schema.js';

async function run() {
  const dbService = new DatabaseService();
  try {
    const db = dbService.db;
    const logs = await db.select().from(timeLogs);
    console.log("Success:", logs);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();

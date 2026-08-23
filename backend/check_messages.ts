import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { DatabaseService } from './src/database/database.service.js';
import { messages } from './src/database/schema.js';
import { desc } from 'drizzle-orm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(DatabaseService);
  const msgs = await db.db.select().from(messages).orderBy(desc(messages.createdAt)).limit(5);
  console.log(msgs);
  await app.close();
}
bootstrap();

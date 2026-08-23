import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { DatabaseService } from './src/database/database.service.js';
import { notifications } from './src/database/schema.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(DatabaseService);
  const notifs = await db.db.select().from(notifications);
  console.log('Total notifications:', notifs.length);
  console.log(notifs);
  await app.close();
}
bootstrap();

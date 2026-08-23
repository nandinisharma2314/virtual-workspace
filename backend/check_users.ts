import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { DatabaseService } from './src/database/database.service.js';
import { users } from './src/database/schema.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(DatabaseService);
  const allUsers = await db.db.select().from(users);
  console.log(allUsers);
  await app.close();
}
bootstrap();

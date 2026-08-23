import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { NotificationsService } from './src/notifications/notifications.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const svc = app.get(NotificationsService);
  await svc.notifyAllExcept(4, "Test from script");
  console.log("Done");
  await app.close();
}
bootstrap();

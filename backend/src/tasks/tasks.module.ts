import { Module, forwardRef } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { TasksController } from './tasks.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { WorkspacesModule } from '../workspaces/workspaces.module.js';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    NotificationsModule,
    forwardRef(() => WorkspacesModule),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

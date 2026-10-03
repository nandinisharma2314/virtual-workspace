import { Module } from '@nestjs/common';
import { FilesService } from './files.service.js';
import { FilesController, FilesDevController } from './files.controller.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { WorkspacesModule } from '../workspaces/workspaces.module.js';

@Module({
  imports: [NotificationsModule, WorkspacesModule],
  controllers: [FilesController, FilesDevController],
  providers: [FilesService],
})
export class FilesModule {}

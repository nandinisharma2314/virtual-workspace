import { Module } from '@nestjs/common';
import { FilesService } from './files.service.js';
import { FilesController, FilesDevController } from './files.controller.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  controllers: [FilesController, FilesDevController],
  providers: [FilesService],
})
export class FilesModule {}

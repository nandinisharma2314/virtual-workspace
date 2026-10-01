import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { WorkspacesController } from './workspaces.controller.js';
import { WorkspacesService } from './workspaces.service.js';
import { WorkspaceGuard } from './guards/workspace.guard.js';

@Module({
  imports: [DatabaseModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceGuard],
  exports: [WorkspacesService, WorkspaceGuard],
})
export class WorkspacesModule {}

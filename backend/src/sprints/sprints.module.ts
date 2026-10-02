import { Module } from '@nestjs/common';
import { SprintsService } from './sprints.service.js';
import { SprintsController } from './sprints.controller.js';
import { WorkspacesModule } from '../workspaces/workspaces.module.js';

@Module({
  imports: [WorkspacesModule],
  controllers: [SprintsController],
  providers: [SprintsService],
})
export class SprintsModule {}

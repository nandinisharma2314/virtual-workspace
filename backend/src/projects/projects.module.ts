import { Module, forwardRef } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { ProjectsController } from './projects.controller.js';
import { WorkspacesModule } from '../workspaces/workspaces.module.js';

@Module({
  imports: [forwardRef(() => WorkspacesModule)],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}

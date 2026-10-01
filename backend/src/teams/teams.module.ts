import { Module, forwardRef } from '@nestjs/common';
import { TeamsService } from './teams.service.js';
import { TeamsController } from './teams.controller.js';
import { WorkspacesModule } from '../workspaces/workspaces.module.js';

@Module({
  imports: [forwardRef(() => WorkspacesModule)],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}

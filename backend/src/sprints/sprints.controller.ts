import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Headers,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { SprintsService } from './sprints.service.js';
import { CreateSprintDto } from './dto/create-sprint.dto.js';
import { UpdateSprintDto } from './dto/update-sprint.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';

@Controller('sprints')
@UseGuards(AuthGuard)
export class SprintsController {
  constructor(
    private readonly sprintsService: SprintsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Post()
  async create(
    @Body() createSprintDto: CreateSprintDto,
    @Req() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
  ) {
    const userId = req.user.sub;
    if (!createSprintDto.workspaceId && wsIdHeader && !isNaN(Number(wsIdHeader))) {
      createSprintDto.workspaceId = Number(wsIdHeader);
    }

    if (createSprintDto.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(
        userId,
        createSprintDto.workspaceId,
      );
      if (!auth.isOwner && !auth.permissions.includes('sprints:manage')) {
        throw new ForbiddenException('You do not have permission to create sprints in this workspace');
      }
    }

    return this.sprintsService.create(createSprintDto);
  }

  @Get()
  findAll(
    @Headers('x-workspace-id') wsIdHeader?: string,
    @Query('workspaceId') wsIdQuery?: string,
  ) {
    const rawWsId = wsIdHeader || wsIdQuery;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    return this.sprintsService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sprintsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSprintDto: UpdateSprintDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const sprint = await this.sprintsService.findOne(+id);
    if (sprint?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, sprint.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('sprints:manage')) {
        throw new ForbiddenException('You do not have permission to manage sprints in this workspace');
      }
    }
    return this.sprintsService.update(+id, updateSprintDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub;
    const sprint = await this.sprintsService.findOne(+id);
    if (sprint?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, sprint.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('sprints:manage')) {
        throw new ForbiddenException('You do not have permission to delete sprints in this workspace');
      }
    }
    return this.sprintsService.remove(+id);
  }
}

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
  ParseIntPipe,
  ForbiddenException,
  BadRequestException,
  HttpCode,
  HttpStatus,
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

  @Get('backlog')
  async getBacklog(
    @Req() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
    @Query('workspaceId') wsIdQuery?: string,
  ) {
    const userId = req.user.sub;
    const rawWsId = wsIdHeader || wsIdQuery;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required to fetch backlog');
    }

    await this.workspacesService.getUserPermissionsInWorkspace(userId, workspaceId);
    return this.sprintsService.getBacklog(workspaceId);
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
    @Query('workspaceId') wsIdQuery?: string,
  ) {
    const userId = req.user.sub;
    const rawWsId = wsIdHeader || wsIdQuery;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    if (workspaceId) {
      await this.workspacesService.getUserPermissionsInWorkspace(userId, workspaceId);
    }
    return this.sprintsService.findAll(workspaceId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    const sprint = await this.sprintsService.findOne(id);
    if (sprint?.workspaceId) {
      await this.workspacesService.getUserPermissionsInWorkspace(userId, sprint.workspaceId);
    }
    return sprint;
  }

  @Post(':id/tasks')
  async assignTasks(
    @Param('id', ParseIntPipe) id: number,
    @Body('taskIds') taskIds: number[],
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const sprint = await this.sprintsService.findOne(id);
    if (sprint?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, sprint.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('sprints:manage')) {
        throw new ForbiddenException('You do not have permission to manage sprints in this workspace');
      }
    }
    return this.sprintsService.assignTasksToSprint(id, taskIds);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/start')
  async startSprint(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { startDate?: string; endDate?: string; goal?: string },
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const sprint = await this.sprintsService.findOne(id);
    if (sprint?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, sprint.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('sprints:manage')) {
        throw new ForbiddenException('You do not have permission to start sprints in this workspace');
      }
    }
    return this.sprintsService.startSprint(id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/complete')
  async completeSprint(
    @Param('id', ParseIntPipe) id: number,
    @Body('rolloverToSprintId') rolloverToSprintId: number | undefined,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const sprint = await this.sprintsService.findOne(id);
    if (sprint?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, sprint.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('sprints:manage')) {
        throw new ForbiddenException('You do not have permission to complete sprints in this workspace');
      }
    }
    return this.sprintsService.completeSprint(id, rolloverToSprintId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSprintDto: UpdateSprintDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const sprint = await this.sprintsService.findOne(id);
    if (sprint?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, sprint.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('sprints:manage')) {
        throw new ForbiddenException('You do not have permission to manage sprints in this workspace');
      }
    }
    return this.sprintsService.update(id, updateSprintDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    const sprint = await this.sprintsService.findOne(id);
    if (sprint?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, sprint.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('sprints:manage')) {
        throw new ForbiddenException('You do not have permission to delete sprints in this workspace');
      }
    }
    return this.sprintsService.remove(id);
  }
}

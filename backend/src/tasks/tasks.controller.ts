import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req: any) {
    const userId = req.user.sub;
    const wsHeader = req.headers['x-workspace-id'];
    const workspaceId = wsHeader && !isNaN(Number(wsHeader)) ? Number(wsHeader) : undefined;

    if (workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('tasks:create')) {
        throw new ForbiddenException('You do not have permission to create tasks in this workspace');
      }
    }

    return this.tasksService.create(createTaskDto, userId, workspaceId);
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('workspaceId') wsQuery?: string,
    @Query('assignedOnly') assignedOnly?: string,
  ) {
    const userId = req.user.sub;
    const wsHeader = req.headers['x-workspace-id'];
    const rawWs = wsQuery || wsHeader;
    const workspaceId = rawWs && !isNaN(Number(rawWs)) ? Number(rawWs) : undefined;
    let onlyAssigned = assignedOnly === 'true';

    if (workspaceId) {
      try {
        const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, workspaceId);
        if (!auth.isOwner && !auth.permissions.includes('tasks:read_all')) {
          onlyAssigned = true;
        }
      } catch (e) {
        onlyAssigned = true;
      }
    }

    return this.tasksService.findAll(workspaceId, userId, onlyAssigned);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const task = await this.tasksService.findOne(id);
    if (task?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, task.workspaceId);
      if (!auth.isOwner) {
        const canEditAll = auth.permissions.includes('tasks:edit_all');
        const canEditAssigned = auth.permissions.includes('tasks:edit_assigned') && task.assigneeId === userId;
        if (!canEditAll && !canEditAssigned) {
          throw new ForbiddenException('You do not have permission to edit this task');
        }
      }
    }
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    const task = await this.tasksService.findOne(id);
    if (task?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, task.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('tasks:delete')) {
        throw new ForbiddenException('You do not have permission to delete this task');
      }
    }
    return this.tasksService.remove(id);
  }
}

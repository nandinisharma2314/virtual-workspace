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
  NotFoundException,
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
    const rawWs = wsHeader || (createTaskDto as any).workspaceId;
    const workspaceId = rawWs && !isNaN(Number(rawWs)) ? Number(rawWs) : undefined;

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
    @Query('sprintId') sprintQuery?: string,
  ) {
    const userId = req.user.sub;
    const wsHeader = req.headers['x-workspace-id'];
    const rawWs = wsQuery || wsHeader;
    const workspaceId = rawWs && !isNaN(Number(rawWs)) ? Number(rawWs) : undefined;
    const sprintId = sprintQuery && !isNaN(Number(sprintQuery)) ? Number(sprintQuery) : undefined;
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

    return this.tasksService.findAll(workspaceId, userId, onlyAssigned, sprintId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, task.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('tasks:read_all')) {
        if (task.assigneeId !== userId) {
          throw new ForbiddenException('You do not have access to this task');
        }
      }
    }

    return task;
  }

  @Get(':id/full')
  async findFullTask(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, task.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('tasks:read_all')) {
        if (task.assigneeId !== userId) {
          throw new ForbiddenException('You do not have access to this task');
        }
      }
    }

    return this.tasksService.findFullTask(id);
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
    return this.tasksService.update(id, updateTaskDto, userId);
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

  // --- Checklists ---

  @Post(':id/checklists')
  async addChecklist(
    @Param('id', ParseIntPipe) id: number,
    @Body('title') title: string,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const task = await this.tasksService.findOne(id);
    if (task?.workspaceId) {
      await this.workspacesService.getUserPermissionsInWorkspace(userId, task.workspaceId);
    }
    return this.tasksService.addChecklist(id, title);
  }

  @Delete(':id/checklists/:clId')
  async removeChecklist(
    @Param('id', ParseIntPipe) id: number,
    @Param('clId', ParseIntPipe) clId: number,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const task = await this.tasksService.findOne(id);
    if (task?.workspaceId) {
      await this.workspacesService.getUserPermissionsInWorkspace(userId, task.workspaceId);
    }
    return this.tasksService.removeChecklist(clId);
  }

  @Post(':id/checklists/:clId/items')
  async addChecklistItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('clId', ParseIntPipe) clId: number,
    @Body() body: any,
    @Req() req: any,
  ) {
    const itemTitle = body?.title || body?.content || 'Checklist item';
    const userId = req.user.sub;
    const task = await this.tasksService.findOne(id);
    if (task?.workspaceId) {
      await this.workspacesService.getUserPermissionsInWorkspace(userId, task.workspaceId);
    }
    return this.tasksService.addChecklistItem(clId, itemTitle);
  }

  @Patch(':id/checklists/:clId/items/:itemId')
  async toggleChecklistItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('clId', ParseIntPipe) clId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body('isCompleted') isCompleted: boolean,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const task = await this.tasksService.findOne(id);
    if (task?.workspaceId) {
      await this.workspacesService.getUserPermissionsInWorkspace(userId, task.workspaceId);
    }
    return this.tasksService.toggleChecklistItem(itemId, isCompleted);
  }

  @Delete(':id/checklists/:clId/items/:itemId')
  async removeChecklistItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('clId', ParseIntPipe) clId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const task = await this.tasksService.findOne(id);
    if (task?.workspaceId) {
      await this.workspacesService.getUserPermissionsInWorkspace(userId, task.workspaceId);
    }
    return this.tasksService.removeChecklistItem(itemId);
  }

  // --- Comments ---

  @Post(':id/comments')
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const task = await this.tasksService.findOne(id);
    if (task?.workspaceId) {
      await this.workspacesService.getUserPermissionsInWorkspace(userId, task.workspaceId);
    }
    return this.tasksService.addComment(id, userId, content);
  }

  @Delete(':id/comments/:commentId')
  async removeComment(
    @Param('id', ParseIntPipe) id: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.tasksService.removeComment(commentId, userId);
  }
}

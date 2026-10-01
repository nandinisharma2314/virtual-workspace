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
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req: any) {
    const userId = req.user.sub;
    const wsHeader = req.headers['x-workspace-id'];
    if (!createProjectDto.workspaceId && wsHeader && !isNaN(Number(wsHeader))) {
      createProjectDto.workspaceId = Number(wsHeader);
    }

    if (createProjectDto.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(
        userId,
        createProjectDto.workspaceId,
      );
      if (!auth.isOwner && !auth.permissions.includes('projects:create')) {
        throw new ForbiddenException('You do not have permission to create projects in this workspace');
      }
    }

    return this.projectsService.create(createProjectDto, userId);
  }

  @Get()
  async findAll(@Req() req: any, @Query('workspaceId') wsQuery?: string) {
    const userId = req.user.sub;
    const wsHeader = req.headers['x-workspace-id'];
    const rawWs = wsQuery || wsHeader;
    const workspaceId = rawWs && !isNaN(Number(rawWs)) ? Number(rawWs) : undefined;

    let hasReadAll = true;
    if (workspaceId) {
      try {
        const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, workspaceId);
        hasReadAll = auth.isOwner || auth.permissions.includes('projects:read_all');
      } catch (e) {
        hasReadAll = false;
      }
    }

    return this.projectsService.findAll(workspaceId, userId, hasReadAll);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const project = await this.projectsService.findOne(id);
    if (project?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, project.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('projects:edit')) {
        throw new ForbiddenException('You do not have permission to edit this project');
      }
    }
    return this.projectsService.update(id, updateProjectDto);
  }

  @Post(':id/members')
  async assignMember(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) targetUserId: number,
    @Body('role') role: string | undefined,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const project = await this.projectsService.findOne(id);
    if (project?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, project.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('projects:assign')) {
        throw new ForbiddenException('You do not have permission to assign members to this project');
      }
    }
    return this.projectsService.assignMember(id, targetUserId, role);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const project = await this.projectsService.findOne(id);
    if (project?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, project.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('projects:assign')) {
        throw new ForbiddenException('You do not have permission to remove members from this project');
      }
    }
    return this.projectsService.removeMember(id, targetUserId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    const project = await this.projectsService.findOne(id);
    if (project?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, project.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('projects:delete')) {
        throw new ForbiddenException('You do not have permission to delete this project');
      }
    }
    return this.projectsService.remove(id);
  }
}

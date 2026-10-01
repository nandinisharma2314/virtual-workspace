import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { TeamsService } from './teams.service.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';

@Controller('teams')
@UseGuards(AuthGuard)
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Post()
  async create(@Body() createTeamDto: CreateTeamDto, @Req() req: any) {
    const userId = req.user.sub;
    const wsHeader = req.headers['x-workspace-id'];
    if (!createTeamDto.workspaceId && wsHeader && !isNaN(Number(wsHeader))) {
      createTeamDto.workspaceId = Number(wsHeader);
    }

    if (createTeamDto.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, createTeamDto.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('teams:manage')) {
        throw new ForbiddenException('You do not have permission to create teams in this workspace');
      }
    }

    return this.teamsService.create(createTeamDto);
  }

  @Get()
  async findAll(@Req() req: any, @Query('workspaceId') wsQuery?: string) {
    const userId = req.user.sub;
    const wsHeader = req.headers['x-workspace-id'];
    const rawWs = wsQuery || wsHeader;
    const workspaceId = rawWs && !isNaN(Number(rawWs)) ? Number(rawWs) : undefined;

    if (workspaceId) {
      await this.workspacesService.getUserPermissionsInWorkspace(userId, workspaceId);
    }

    return this.teamsService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateTeamDto: UpdateTeamDto, @Req() req: any) {
    const userId = req.user.sub;
    const team = await this.teamsService.findOne(id);
    if (team?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, team.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('teams:manage')) {
        throw new ForbiddenException('You do not have permission to edit this team');
      }
    }
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    const team = await this.teamsService.findOne(id);
    if (team?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, team.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('teams:manage')) {
        throw new ForbiddenException('You do not have permission to delete this team');
      }
    }
    return this.teamsService.remove(id);
  }
}

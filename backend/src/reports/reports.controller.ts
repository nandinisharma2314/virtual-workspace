import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Headers, Req, ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Post()
  async create(@Body() createReportDto: CreateReportDto, @Req() req: any, @Headers('x-workspace-id') wsIdHeader?: string) {
    const rawWsId = (createReportDto as any)?.workspaceId || wsIdHeader;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    if (workspaceId && req.user?.sub) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(req.user.sub, workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('reports:view')) {
        throw new ForbiddenException('You do not have permission to manage reports in this workspace');
      }
    }
    return this.reportsService.create(createReportDto);
  }

  @Get('dashboard')
  async getDashboardData(
    @Query('range') range: string,
    @Req() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
    @Query('workspaceId') wsIdQuery?: string,
  ) {
    const rawWsId = wsIdHeader || wsIdQuery;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    if (workspaceId && req.user?.sub) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(req.user.sub, workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('reports:view')) {
        throw new ForbiddenException('You do not have permission to view reports in this workspace');
      }
    }
    return this.reportsService.getDashboardData(range, workspaceId);
  }

  @Get()
  async findAll(@Req() req: any, @Headers('x-workspace-id') wsIdHeader?: string, @Query('workspaceId') wsIdQuery?: string) {
    const rawWsId = wsIdHeader || wsIdQuery;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    if (workspaceId && req.user?.sub) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(req.user.sub, workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('reports:view')) {
        throw new ForbiddenException('You do not have permission to view reports in this workspace');
      }
    }
    return this.reportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(+id, updateReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(+id);
  }
}

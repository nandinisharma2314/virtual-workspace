import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto.js';
import { InviteMemberDto, UpdateMemberDto } from './dto/member-management.dto.js';

@Controller('workspaces')
@UseGuards(AuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get('permissions')
  getPermissions() {
    return this.workspacesService.getAvailablePermissions();
  }

  @Post()
  createWorkspace(@Req() req: any, @Body() dto: CreateWorkspaceDto) {
    const userId = req.user.sub;
    return this.workspacesService.createWorkspace(userId, dto);
  }

  @Get()
  getUserWorkspaces(@Req() req: any) {
    const userId = req.user.sub;
    return this.workspacesService.getUserWorkspaces(userId);
  }

  @Post('invites/accept')
  acceptInvite(@Req() req: any, @Body('token') token: string) {
    const userId = req.user.sub;
    return this.workspacesService.acceptInvite(token, userId);
  }

  @Get(':id')
  getWorkspace(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.sub;
    return this.workspacesService.getWorkspaceById(id, userId);
  }

  @Patch(':id')
  updateWorkspace(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateWorkspaceDto>,
  ) {
    const userId = req.user.sub;
    return this.workspacesService.updateWorkspace(id, userId, dto);
  }

  // --- Roles Management ---

  @Get(':id/roles')
  getRoles(@Param('id', ParseIntPipe) id: number) {
    return this.workspacesService.getRoles(id);
  }

  @Post(':id/roles')
  createRole(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateRoleDto,
  ) {
    const userId = req.user.sub;
    return this.workspacesService.createRole(id, userId, dto);
  }

  @Patch(':id/roles/:roleId')
  updateRole(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: UpdateRoleDto,
  ) {
    const userId = req.user.sub;
    return this.workspacesService.updateRole(id, roleId, userId, dto);
  }

  @Delete(':id/roles/:roleId')
  deleteRole(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    const userId = req.user.sub;
    return this.workspacesService.deleteRole(id, roleId, userId);
  }

  // --- Members Management ---

  @Get(':id/members')
  getMembers(@Param('id', ParseIntPipe) id: number) {
    return this.workspacesService.getMembers(id);
  }

  @Patch(':id/members/:userId')
  updateMember(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Body() dto: UpdateMemberDto,
  ) {
    const currentUserId = req.user.sub;
    return this.workspacesService.updateMember(id, targetUserId, currentUserId, dto);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
  ) {
    const currentUserId = req.user.sub;
    return this.workspacesService.removeMember(id, targetUserId, currentUserId);
  }

  // --- Invitations ---

  @Get(':id/invites')
  getInvites(@Param('id', ParseIntPipe) id: number) {
    return this.workspacesService.getInvites(id);
  }

  @Post(':id/invites')
  inviteMember(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InviteMemberDto,
  ) {
    const currentUserId = req.user.sub;
    return this.workspacesService.inviteMember(id, currentUserId, dto);
  }
}

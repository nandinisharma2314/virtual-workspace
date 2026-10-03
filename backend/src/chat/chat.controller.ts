import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards, Req, Headers, Query, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';

@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Get('ice-servers')
  getIceServers() {
    return this.chatService.getIceServers();
  }

  @Get('messages/:channelId')
  getMessages(@Param('channelId') channelId: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.getMessagesByChannel(channelId, userId);
  }

  @Get('info/:channelId')
  getInfo(@Param('channelId') channelId: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.getChannelInfo(channelId, userId);
  }

  @Patch('info/:channelId')
  updateInfo(
    @Param('channelId') channelId: string,
    @Body() body: { name: string; description: string; bgGradient?: string },
    @Req() req: any
  ) {
    const userId = req.user?.sub;
    return this.chatService.updateChannelInfo(channelId, body.name, body.description, userId, body.bgGradient);
  }

  @Post('members/:channelId')
  addMember(
    @Param('channelId') channelId: string,
    @Body() body: { email: string },
    @Req() req: any
  ) {
    const inviterId = req.user?.sub;
    const inviterName = req.user?.name || 'A team member';
    return this.chatService.addMemberByEmail(channelId, body.email, inviterId, inviterName);
  }

  @Get('direct-message-users')
  getDirectMessageUsers(
    @Headers('x-workspace-id') wsIdHeader?: string,
    @Query('workspaceId') wsIdQuery?: string,
  ) {
    const rawWsId = wsIdHeader || wsIdQuery;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    return this.chatService.getDirectMessageUsers(workspaceId);
  }

  @Get('channels')
  getChannels(
    @Req() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
    @Query('workspaceId') wsIdQuery?: string,
  ) {
    const userId = req.user?.sub;
    const rawWsId = wsIdHeader || wsIdQuery;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    return this.chatService.getChannelsForUser(userId, workspaceId);
  }

  @Post('channels')
  async createChannel(
    @Body() body: { name: string; description: string; bgGradient?: string; memberEmails?: string[]; workspaceId?: number }, 
    @Req() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
  ) {
    const userId = req.user?.sub;
    const rawWsId = body.workspaceId || wsIdHeader;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    if (workspaceId && userId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('channels:create')) {
        throw new ForbiddenException('You do not have permission to create channels in this workspace');
      }
    }
    return this.chatService.createChannel(body.name, body.description, userId, body.bgGradient, body.memberEmails, workspaceId);
  }

  @Patch('messages/:id')
  editMessage(@Param('id') id: string, @Body() body: { content: string }, @Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.editMessage(parseInt(id), userId, body.content);
  }

  @Delete('messages/:id')
  deleteMessage(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.deleteMessage(parseInt(id), userId);
  }

  @Get('invitations')
  getInvitations(@Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.getPendingInvitations(userId);
  }

  @Post('invitations/:channelId/accept')
  acceptInvitation(@Param('channelId') channelId: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.acceptInvitation(channelId, userId);
  }

  @Post('invitations/:channelId/decline')
  declineInvitation(@Param('channelId') channelId: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.declineInvitation(channelId, userId);
  }

  @Delete('channels/:channelId/members/:userId')
  removeMember(
    @Param('channelId') channelId: string,
    @Param('userId') targetUserId: string,
    @Req() req: any
  ) {
    const requesterId = req.user?.sub;
    return this.chatService.removeMember(channelId, parseInt(targetUserId), requesterId);
  }

  @Delete('channels/:channelId/invitations/:userId')
  revokeInvitation(
    @Param('channelId') channelId: string,
    @Param('userId') targetUserId: string,
    @Req() req: any
  ) {
    const requesterId = req.user?.sub;
    return this.chatService.revokeInvitation(channelId, parseInt(targetUserId), requesterId);
  }

  @Post('messages/:id/reactions')
  addReaction(@Param('id') id: string, @Body() body: { emoji: string }, @Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.addReaction(parseInt(id), userId, body.emoji);
  }
}


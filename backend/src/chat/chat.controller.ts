import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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
  getDirectMessageUsers() {
    return this.chatService.getDirectMessageUsers();
  }

  @Get('channels')
  getChannels(@Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.getChannelsForUser(userId);
  }

  @Post('channels')
  createChannel(
    @Body() body: { name: string; description: string; bgGradient?: string; memberEmails?: string[] }, 
    @Req() req: any
  ) {
    const userId = req.user?.sub;
    return this.chatService.createChannel(body.name, body.description, userId, body.bgGradient, body.memberEmails);
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


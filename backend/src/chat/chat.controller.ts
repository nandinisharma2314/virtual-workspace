import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages/:channelId')
  getMessages(@Param('channelId') channelId: string) {
    return this.chatService.getMessagesByChannel(channelId);
  }

  @Get('info/:channelId')
  getInfo(@Param('channelId') channelId: string) {
    return this.chatService.getChannelInfo(channelId);
  }

  @Patch('info/:channelId')
  updateInfo(
    @Param('channelId') channelId: string,
    @Body() body: { name: string; description: string },
    @Req() req: any
  ) {
    const userId = req.user?.sub;
    return this.chatService.updateChannelInfo(channelId, body.name, body.description, userId);
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

  @Post('channels')
  createChannel(@Body() body: { name: string; description: string }, @Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.createChannel(body.name, body.description, userId);
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

  @Post('messages/:id/reactions')
  addReaction(@Param('id') id: string, @Body() body: { emoji: string }, @Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.addReaction(parseInt(id), userId, body.emoji);
  }
}


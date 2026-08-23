import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service.js';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join_channel')
  handleJoinChannel(@MessageBody() payload: { channelId: string }, @ConnectedSocket() client: Socket) {
    if (payload.channelId) {
      // client can leave previous rooms if needed, but for now just join
      client.join(payload.channelId);
      this.logger.log(`Client ${client.id} joined ${payload.channelId}`);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() payload: { text: string; userId: number; channelId?: string; parentId?: number; attachment?: any },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Message received: ${payload.text}`);
    
    const channelId = payload.channelId || 'c-general';
    
    // Save to database via ChatService
    const message = await this.chatService.saveMessage(
      payload.userId,
      payload.text,
      channelId,
      payload.parentId,
      payload.attachment
    );

    // Broadcast to the specific channel room
    this.server.to(channelId).emit('chat_message', message);
    
    return message;
  }

  @SubscribeMessage('edit_message')
  async handleEditMessage(
    @MessageBody() payload: { messageId: number; text: string; userId: number; channelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.editMessage(payload.messageId, payload.userId, payload.text);
    this.server.to(payload.channelId).emit('message_edited', { messageId: payload.messageId, text: payload.text, isEdited: true });
    return message;
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @MessageBody() payload: { messageId: number; userId: number; channelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.chatService.deleteMessage(payload.messageId, payload.userId);
    this.server.to(payload.channelId).emit('message_deleted', { messageId: payload.messageId });
    return { success: true };
  }

  @SubscribeMessage('add_reaction')
  async handleAddReaction(
    @MessageBody() payload: { messageId: number; emoji: string; userId: number; channelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const reactions = await this.chatService.addReaction(payload.messageId, payload.userId, payload.emoji);
    this.server.to(payload.channelId).emit('reaction_updated', { messageId: payload.messageId, reactions });
    return reactions;
  }
}

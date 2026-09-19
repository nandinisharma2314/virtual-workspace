import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || 
                    client.handshake.headers?.authorization?.split(' ')[1] || 
                    client.handshake.query?.token;
                    
      if (!token) {
        this.logger.error(`Unauthorized client (no token): ${client.id}`);
        client.disconnect();
        return;
      }
      
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
      }
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      });
      
      (client as any).user = payload;
      this.logger.log(`Client authenticated: ${client.id} (User: ${payload.sub})`);
    } catch (error) {
      this.logger.error(`Unauthorized client (invalid token): ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

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

  // WebRTC Signaling
  @SubscribeMessage('join_video_call')
  handleJoinVideoCall(@MessageBody() payload: { channelId: string; senderId: string; senderName?: string }, @ConnectedSocket() client: Socket) {
    client.to(payload.channelId).emit('join_video_call', payload);
  }

  @SubscribeMessage('invite_video_call')
  handleInviteVideoCall(@MessageBody() payload: { channelId: string; senderId: string; targetId: string; channelName?: string; senderName?: string }, @ConnectedSocket() client: Socket) {
    client.to(payload.channelId).emit('invite_video_call', payload);
  }

  // In-Call Chat & Admin Controls
  @SubscribeMessage('in_call_message')
  handleInCallMessage(@MessageBody() payload: { channelId: string; senderId: string; senderName: string; text: string; timestamp: string }, @ConnectedSocket() client: Socket) {
    client.to(payload.channelId).emit('in_call_message', payload);
  }

  @SubscribeMessage('toggle_in_call_chat')
  handleToggleInCallChat(@MessageBody() payload: { channelId: string; isEnabled: boolean; adminId: string }, @ConnectedSocket() client: Socket) {
    client.to(payload.channelId).emit('toggle_in_call_chat', payload);
  }

  @SubscribeMessage('in_call_file')
  handleInCallFile(@MessageBody() payload: { channelId: string; senderId: string; senderName: string; file: any; timestamp: string }, @ConnectedSocket() client: Socket) {
    client.to(payload.channelId).emit('in_call_file', payload);
  }

  @SubscribeMessage('webrtc_offer')
  handleWebRtcOffer(@MessageBody() payload: { channelId: string; offer: any; senderId: string }, @ConnectedSocket() client: Socket) {
    client.to(payload.channelId).emit('webrtc_offer', payload);
  }

  @SubscribeMessage('webrtc_answer')
  handleWebRtcAnswer(@MessageBody() payload: { channelId: string; answer: any; senderId: string }, @ConnectedSocket() client: Socket) {
    client.to(payload.channelId).emit('webrtc_answer', payload);
  }

  @SubscribeMessage('webrtc_ice_candidate')
  handleWebRtcIceCandidate(@MessageBody() payload: { channelId: string; candidate: any; senderId: string }, @ConnectedSocket() client: Socket) {
    client.to(payload.channelId).emit('webrtc_ice_candidate', payload);
  }
}


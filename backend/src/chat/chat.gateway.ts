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
  private readonly onlineUsers = new Map<number, Set<string>>();
  private readonly userStatus = new Map<number, string>();

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

      const rawWsId = client.handshake.auth?.workspaceId || 
                      client.handshake.headers?.['x-workspace-id'] || 
                      client.handshake.query?.workspaceId;
      if (rawWsId && !isNaN(Number(rawWsId))) {
        (client.data as any).workspaceId = Number(rawWsId);
      }

      const userId = payload.sub;
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)!.add(client.id);
      this.userStatus.set(userId, 'online');

      // Send initial presence snapshot to this connecting client
      const snapshot: Record<number, string> = {};
      this.userStatus.forEach((status, uid) => {
        snapshot[uid] = status;
      });
      client.emit('presence_snapshot', snapshot);

      // Broadcast user is online
      this.server.emit('user_presence', { userId, status: 'online' });

      this.logger.log(`Client authenticated: ${client.id} (User: ${payload.sub}, Workspace: ${(client.data as any)?.workspaceId || 'none'})`);
    } catch (error) {
      this.logger.error(`Unauthorized client (invalid token): ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client as any).user;
    if (user && user.sub) {
      const userId = user.sub;
      const sockets = this.onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.onlineUsers.delete(userId);
          this.userStatus.delete(userId);
          this.server.emit('user_presence', { userId, status: 'offline' });
        }
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('set_presence')
  handleSetPresence(@MessageBody() payload: { status: string }, @ConnectedSocket() client: Socket) {
    const userId = (client as any).user?.sub;
    if (userId && payload.status) {
      this.userStatus.set(userId, payload.status);
      this.server.emit('user_presence', { userId, status: payload.status });
    }
  }

  private getScopedRoom(channelId: string, client?: Socket): string {
    const userId = (client as any)?.user?.sub;
    return this.chatService.getCanonicalDmChannelId(channelId, userId);
  }

  @SubscribeMessage('join_channel')
  handleJoinChannel(@MessageBody() payload: { channelId: string }, @ConnectedSocket() client: Socket) {
    if (payload.channelId) {
      const room = this.getScopedRoom(payload.channelId, client);
      client.join(room);
      this.logger.log(`Client ${client.id} joined ${room}`);
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoomLegacy(@MessageBody() payload: { channelId: string; user?: any }, @ConnectedSocket() client: Socket) {
    if (payload.channelId) {
      const room = this.getScopedRoom(payload.channelId, client);
      client.join(room);
      client.to(room).emit('user-connected', payload.user);
      this.logger.log(`Client ${client.id} joined WebRTC room ${room}`);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() payload: { text: string; userId?: number; channelId?: string; parentId?: number; attachment?: any },
    @ConnectedSocket() client: Socket,
  ) {
    const authUserId = (client as any).user?.sub || payload.userId;
    this.logger.log(`Message received from user ${authUserId}: ${payload.text}`);
    
    const channelId = payload.channelId || 'c-general';
    const room = this.getScopedRoom(channelId, client);
    
    // Save to database via ChatService
    const message = await this.chatService.saveMessage(
      authUserId,
      payload.text,
      channelId,
      payload.parentId,
      payload.attachment
    );

    // Broadcast to the workspace-namespaced channel room
    this.server.to(room).emit('chat_message', message);
    
    return message;
  }

  @SubscribeMessage('edit_message')
  async handleEditMessage(
    @MessageBody() payload: { messageId: number; text: string; userId?: number; channelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const authUserId = (client as any).user?.sub || payload.userId;
    const room = this.getScopedRoom(payload.channelId, client);
    const message = await this.chatService.editMessage(payload.messageId, authUserId, payload.text);
    this.server.to(room).emit('message_edited', { messageId: payload.messageId, text: payload.text, isEdited: true });
    return message;
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @MessageBody() payload: { messageId: number; userId?: number; channelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const authUserId = (client as any).user?.sub || payload.userId;
    const room = this.getScopedRoom(payload.channelId, client);
    await this.chatService.deleteMessage(payload.messageId, authUserId);
    this.server.to(room).emit('message_deleted', { messageId: payload.messageId });
    return { success: true };
  }

  @SubscribeMessage('add_reaction')
  async handleAddReaction(
    @MessageBody() payload: { messageId: number; emoji: string; userId?: number; channelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const authUserId = (client as any).user?.sub || payload.userId;
    const room = this.getScopedRoom(payload.channelId, client);
    const reactions = await this.chatService.addReaction(payload.messageId, authUserId, payload.emoji);
    this.server.to(room).emit('reaction_updated', { messageId: payload.messageId, reactions });
    return reactions;
  }

  // WebRTC Signaling
  @SubscribeMessage('join_video_call')
  handleJoinVideoCall(@MessageBody() payload: { channelId: string; senderId: string; senderName?: string }, @ConnectedSocket() client: Socket) {
    const room = this.getScopedRoom(payload.channelId, client);
    client.to(room).emit('join_video_call', payload);
  }

  @SubscribeMessage('invite_video_call')
  handleInviteVideoCall(@MessageBody() payload: { channelId: string; senderId: string; targetId: string; channelName?: string; senderName?: string }, @ConnectedSocket() client: Socket) {
    const room = this.getScopedRoom(payload.channelId, client);
    client.to(room).emit('invite_video_call', payload);
  }

  // In-Call Chat & Admin Controls
  @SubscribeMessage('in_call_message')
  handleInCallMessage(@MessageBody() payload: { channelId: string; senderId: string; senderName: string; text: string; timestamp: string }, @ConnectedSocket() client: Socket) {
    const room = this.getScopedRoom(payload.channelId, client);
    client.to(room).emit('in_call_message', payload);
  }

  @SubscribeMessage('toggle_in_call_chat')
  handleToggleInCallChat(@MessageBody() payload: { channelId: string; isEnabled: boolean; adminId: string }, @ConnectedSocket() client: Socket) {
    const room = this.getScopedRoom(payload.channelId, client);
    client.to(room).emit('toggle_in_call_chat', payload);
  }

  @SubscribeMessage('in_call_file')
  handleInCallFile(@MessageBody() payload: { channelId: string; senderId: string; senderName: string; file: any; timestamp: string }, @ConnectedSocket() client: Socket) {
    const room = this.getScopedRoom(payload.channelId, client);
    client.to(room).emit('in_call_file', payload);
  }

  @SubscribeMessage('webrtc_offer')
  handleWebRtcOffer(@MessageBody() payload: { channelId: string; offer: any; senderId: string }, @ConnectedSocket() client: Socket) {
    const room = this.getScopedRoom(payload.channelId, client);
    client.to(room).emit('webrtc_offer', payload);
  }

  @SubscribeMessage('webrtc-offer')
  handleWebRtcOfferKebab(@MessageBody() payload: { channelId: string; offer: any; senderId: string }, @ConnectedSocket() client: Socket) {
    const room = this.getScopedRoom(payload.channelId, client);
    client.to(room).emit('webrtc-offer', payload);
  }

  @SubscribeMessage('webrtc_answer')
  handleWebRtcAnswer(@MessageBody() payload: { channelId: string; answer: any; senderId: string }, @ConnectedSocket() client: Socket) {
    const room = this.getScopedRoom(payload.channelId, client);
    client.to(room).emit('webrtc_answer', payload);
  }

  @SubscribeMessage('webrtc-answer')
  handleWebRtcAnswerKebab(@MessageBody() payload: { channelId: string; answer: any; senderId: string }, @ConnectedSocket() client: Socket) {
    const room = this.getScopedRoom(payload.channelId, client);
    client.to(room).emit('webrtc-answer', payload);
  }

  @SubscribeMessage('webrtc_ice_candidate')
  handleWebRtcIceCandidate(@MessageBody() payload: { channelId: string; candidate: any; senderId: string }, @ConnectedSocket() client: Socket) {
    const room = this.getScopedRoom(payload.channelId, client);
    client.to(room).emit('webrtc_ice_candidate', payload);
  }

  @SubscribeMessage('webrtc-ice-candidate')
  handleWebRtcIceCandidateKebab(@MessageBody() payload: { channelId: string; candidate: any; senderId: string }, @ConnectedSocket() client: Socket) {
    const room = this.getScopedRoom(payload.channelId, client);
    client.to(room).emit('webrtc-ice-candidate', payload);
  }
}

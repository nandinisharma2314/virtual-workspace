import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from auth payload, authorization header, or query parameters
      const token = client.handshake.auth?.token || 
                    client.handshake.headers?.authorization?.split(' ')[1] || 
                    client.handshake.query?.token;
                    
      if (!token) {
        client.disconnect();
        return;
      }
      
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
      }

      // Verify JWT
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      });
      
      // Trust the user ID from the token payload (usually in 'sub' property based on auth.service.ts)
      const userId = payload.sub;
      if (userId) {
        client.join(`user_${userId}`);
      }
    } catch (error) {
      // Invalid token
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Optional: add disconnect logic if needed
  }

  sendNotificationToUser(userId: number, notification: any) {
    this.server.to(`user_${userId}`).emit('new_notification', notification);
  }
}

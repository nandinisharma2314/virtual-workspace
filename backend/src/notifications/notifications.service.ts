import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { notifications } from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';
import { NotificationsGateway } from './notifications.gateway.js';
import { users } from '../database/schema.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    console.log('[NotificationsService] DB:', !!databaseService, 'Gateway:', !!notificationsGateway);
  }

  async getUserNotifications(userId: number) {
    try {
      return await this.databaseService.db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
    } catch (e) {
      this.logger.error('Failed to get notifications', e);
      return [];
    }
  }

  async markAsRead(id: number, userId: number) {
    return await this.databaseService.db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
  }

  async markAllAsRead(userId: number) {
    return await this.databaseService.db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId))
      .returning();
  }

  async createNotification(userId: number, content: string, type: string = 'system') {
    try {
      const [notification] = await this.databaseService.db
        .insert(notifications)
        .values({
          userId,
          content,
          type,
        })
        .returning();
      
      this.notificationsGateway.sendNotificationToUser(userId, notification);
      return notification;
    } catch (e) {
      this.logger.error('Failed to create notification', e);
      return null;
    }
  }

  async notifyAllExcept(excludeUserId: number, content: string, type: string = 'system') {
    try {
      const allUsers = await this.databaseService.db.select().from(users);
      for (const user of allUsers) {
        if (user.id !== excludeUserId) {
          await this.createNotification(user.id, content, type);
        }
      }
    } catch (e) {
      this.logger.error('Failed to notify users', e);
    }
  }
}

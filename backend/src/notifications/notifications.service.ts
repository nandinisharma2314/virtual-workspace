import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { notifications, users, workspaceMembers } from '../database/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { NotificationsGateway } from './notifications.gateway.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    console.log('[NotificationsService] DB:', !!databaseService, 'Gateway:', !!notificationsGateway);
  }

  async getUserNotifications(userId: number, workspaceId?: number) {
    try {
      if (workspaceId) {
        return await this.databaseService.db
          .select()
          .from(notifications)
          .where(and(eq(notifications.userId, userId), eq(notifications.workspaceId, workspaceId)))
          .orderBy(desc(notifications.createdAt));
      }
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

  async createNotification(userId: number, content: string, type: string = 'system', workspaceId?: number) {
    try {
      const [notification] = await this.databaseService.db
        .insert(notifications)
        .values({
          userId,
          content,
          type,
          workspaceId: workspaceId || null,
        })
        .returning();
      
      this.notificationsGateway.sendNotificationToUser(userId, notification);
      return notification;
    } catch (e) {
      this.logger.error('Failed to create notification', e);
      return null;
    }
  }

  async notifyWorkspaceMembers(workspaceId: number, content: string, type: string = 'system') {
    try {
      const members = await this.databaseService.db
        .select({ userId: workspaceMembers.userId })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, workspaceId));

      for (const m of members) {
        await this.createNotification(m.userId, content, type, workspaceId);
      }
    } catch (e: any) {
      this.logger.error(`Failed to notify workspace members: ${e.message}`);
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

  async remove(id: number, userId: number) {
    try {
      const [deleted] = await this.databaseService.db
        .delete(notifications)
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
        .returning();
      return { success: true, deleted };
    } catch (e) {
      this.logger.error(`Failed to delete notification ${id}`, e);
      return { success: false };
    }
  }
}


import { Injectable } from '@nestjs/common';
import { CreateInboxDto } from './dto/create-inbox.dto.js';
import { UpdateInboxDto } from './dto/update-inbox.dto.js';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class InboxService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createInboxDto: CreateInboxDto) {
    const [item] = await this.dbService.db
      .insert(schema.notifications)
      .values({
        content: (createInboxDto as any).content || 'New notification',
        type: (createInboxDto as any).type || 'system',
        userId: (createInboxDto as any).userId,
      })
      .returning();
    return item;
  }

  async findAll() {
    return this.dbService.db
      .select()
      .from(schema.notifications)
      .orderBy(desc(schema.notifications.createdAt));
  }

  async findOne(id: number) {
    const [item] = await this.dbService.db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.id, id));
    return item || null;
  }

  async update(id: number, updateInboxDto: UpdateInboxDto) {
    const [updated] = await this.dbService.db
      .update(schema.notifications)
      .set({
        isRead: (updateInboxDto as any).isRead ?? true,
      })
      .where(eq(schema.notifications.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.dbService.db.delete(schema.notifications).where(eq(schema.notifications.id, id));
    return { success: true };
  }
}

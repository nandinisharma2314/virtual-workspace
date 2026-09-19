import { Injectable } from '@nestjs/common';
import { CreateCalendarDto } from './dto/create-calendar.dto.js';
import { UpdateCalendarDto } from './dto/update-calendar.dto.js';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class CalendarService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createCalendarDto: CreateCalendarDto) {
    const [meeting] = await this.dbService.db
      .insert(schema.meetings)
      .values({
        title: (createCalendarDto as any).title || 'Meeting',
        description: (createCalendarDto as any).description || null,
        startTime: (createCalendarDto as any).startTime ? new Date((createCalendarDto as any).startTime) : new Date(),
        endTime: (createCalendarDto as any).endTime ? new Date((createCalendarDto as any).endTime) : new Date(Date.now() + 3600000),
      })
      .returning();
    return meeting;
  }

  async findAll() {
    return this.dbService.db
      .select()
      .from(schema.meetings)
      .orderBy(schema.meetings.startTime);
  }

  async findOne(id: number) {
    const [meeting] = await this.dbService.db
      .select()
      .from(schema.meetings)
      .where(eq(schema.meetings.id, id));
    return meeting || null;
  }

  async update(id: number, updateCalendarDto: UpdateCalendarDto) {
    const [updated] = await this.dbService.db
      .update(schema.meetings)
      .set({
        title: (updateCalendarDto as any).title,
        description: (updateCalendarDto as any).description,
      })
      .where(eq(schema.meetings.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.dbService.db.delete(schema.meetings).where(eq(schema.meetings.id, id));
    return { success: true };
  }
}

import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { DatabaseService } from '../database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { meetings, users } from '../database/schema.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createMeetingDto: CreateMeetingDto, userId: number) {
    const user = await this.dbService.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || user.length === 0 || user[0].role !== 'Admin') {
      throw new ForbiddenException('Only admins can create events.');
    }

    const [newMeeting] = await this.dbService.db.insert(meetings).values({
      title: createMeetingDto.title,
      description: createMeetingDto.description,
      startTime: new Date(createMeetingDto.startTime),
      endTime: new Date(createMeetingDto.endTime),
      organizerId: userId,
    }).returning();

    await this.notificationsService.notifyAllExcept(
      userId,
      `Admin ${user[0].name} created a new event: "${createMeetingDto.title}"`,
      'Meeting'
    );

    return newMeeting;
  }

  async findAll() {
    return await this.dbService.db.select().from(meetings).orderBy(meetings.startTime);
  }

  async findOne(id: number) {
    const results = await this.dbService.db.select().from(meetings).where(eq(meetings.id, id)).limit(1);
    return results[0] || null;
  }

  async update(id: number, updateMeetingDto: UpdateMeetingDto) {
    const [updated] = await this.dbService.db
      .update(meetings)
      .set({
        title: updateMeetingDto.title,
        description: updateMeetingDto.description,
        startTime: updateMeetingDto.startTime ? new Date(updateMeetingDto.startTime) : undefined,
        endTime: updateMeetingDto.endTime ? new Date(updateMeetingDto.endTime) : undefined,
      })
      .where(eq(meetings.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    const [deleted] = await this.dbService.db.delete(meetings).where(eq(meetings.id, id)).returning();
    return deleted;
  }
}

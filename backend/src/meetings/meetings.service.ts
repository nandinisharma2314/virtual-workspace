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

  findAll() {
    return `This action returns all meetings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} meeting`;
  }

  update(id: number, updateMeetingDto: UpdateMeetingDto) {
    return `This action updates a #${id} meeting`;
  }

  remove(id: number) {
    return `This action removes a #${id} meeting`;
  }
}

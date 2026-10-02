import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto.js';
import { UpdateMeetingDto } from './dto/update-meeting.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';
import { meetings, users } from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly notificationsService: NotificationsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(createMeetingDto: CreateMeetingDto, userId: number, workspaceId?: number) {
    const [user] = await this.dbService.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('meetings:manage')) {
        throw new ForbiddenException('You do not have permission to schedule meetings in this workspace');
      }
    } else if (user.role !== 'Admin') {
      throw new ForbiddenException('Only admins can create global events.');
    }

    const [newMeeting] = await this.dbService.db
      .insert(meetings)
      .values({
        title: createMeetingDto.title,
        description: createMeetingDto.description,
        startTime: new Date(createMeetingDto.startTime),
        endTime: new Date(createMeetingDto.endTime),
        organizerId: userId,
        workspaceId: workspaceId || null,
      })
      .returning();

    const notifMsg = `${user.name} scheduled a new meeting: "${createMeetingDto.title}"`;
    if (workspaceId) {
      await this.notificationsService.notifyWorkspaceMembers(workspaceId, notifMsg, 'Meeting');
    } else {
      await this.notificationsService.notifyAllExcept(userId, notifMsg, 'Meeting');
    }

    return newMeeting;
  }

  async findAll(userId: number, workspaceId?: number) {
    if (workspaceId) {
      return await this.dbService.db
        .select()
        .from(meetings)
        .where(eq(meetings.workspaceId, workspaceId))
        .orderBy(meetings.startTime);
    }

    const [user] = await this.dbService.db.select().from(users).where(eq(users.id, userId)).limit(1);
    const isAdmin = user && user.role === 'Admin';

    if (isAdmin) {
      return await this.dbService.db.select().from(meetings).orderBy(meetings.startTime);
    } else {
      return await this.dbService.db
        .select()
        .from(meetings)
        .where(eq(meetings.organizerId, userId))
        .orderBy(meetings.startTime);
    }
  }

  async findOne(id: number) {
    const [meeting] = await this.dbService.db.select().from(meetings).where(eq(meetings.id, id)).limit(1);
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return meeting;
  }

  async update(id: number, updateMeetingDto: UpdateMeetingDto, userId?: number) {
    const meeting = await this.findOne(id);

    if (userId) {
      if (meeting.workspaceId) {
        const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, meeting.workspaceId);
        if (!auth.isOwner && !auth.permissions.includes('meetings:manage') && meeting.organizerId !== userId) {
          throw new ForbiddenException('You do not have permission to edit this meeting');
        }
      } else if (meeting.organizerId !== userId) {
        throw new ForbiddenException('You do not have permission to edit this meeting');
      }
    }

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

  async remove(id: number, userId?: number) {
    const meeting = await this.findOne(id);

    if (userId) {
      if (meeting.workspaceId) {
        const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, meeting.workspaceId);
        if (!auth.isOwner && !auth.permissions.includes('meetings:manage') && meeting.organizerId !== userId) {
          throw new ForbiddenException('You do not have permission to delete this meeting');
        }
      } else if (meeting.organizerId !== userId) {
        throw new ForbiddenException('You do not have permission to delete this meeting');
      }
    }

    const [deleted] = await this.dbService.db.delete(meetings).where(eq(meetings.id, id)).returning();
    return deleted;
  }
}

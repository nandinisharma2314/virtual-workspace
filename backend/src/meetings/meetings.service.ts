import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto.js';
import { UpdateMeetingDto } from './dto/update-meeting.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';
import { meetings, users, meetingAttendees } from '../database/schema.js';
import { eq, and, desc, inArray } from 'drizzle-orm';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly notificationsService: NotificationsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(createMeetingDto: any, userId: number, workspaceId?: number) {
    const [user] = await this.dbService.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!workspaceId) {
      const rawWs = createMeetingDto.workspaceId;
      if (rawWs && !isNaN(Number(rawWs))) {
        workspaceId = Number(rawWs);
      } else {
        const userWs = await this.workspacesService.getUserWorkspaces(userId);
        if (userWs.length > 0) {
          workspaceId = userWs[0].id;
        }
      }
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
        description: createMeetingDto.description || null,
        startTime: new Date(createMeetingDto.startTime),
        endTime: new Date(createMeetingDto.endTime),
        organizerId: userId,
        teamId: createMeetingDto.teamId || null,
        workspaceId: workspaceId || null,
      })
      .returning();

    // Auto-add organizer as accepted
    await this.dbService.db.insert(meetingAttendees).values({
      meetingId: newMeeting.id,
      userId,
      status: 'accepted',
      respondedAt: new Date(),
    });

    // Add invited attendees if specified
    if (createMeetingDto.attendeeIds && Array.isArray(createMeetingDto.attendeeIds)) {
      for (const attendeeId of createMeetingDto.attendeeIds) {
        if (attendeeId !== userId) {
          await this.dbService.db.insert(meetingAttendees).values({
            meetingId: newMeeting.id,
            userId: attendeeId,
            status: 'pending',
          });
        }
      }
    }

    const notifMsg = `${user.name} scheduled a new meeting: "${createMeetingDto.title}"`;
    if (workspaceId) {
      await this.notificationsService.notifyWorkspaceMembers(workspaceId, notifMsg, 'Meeting');
    } else {
      await this.notificationsService.notifyAllExcept(userId, notifMsg, 'Meeting');
    }

    return this.findOne(newMeeting.id);
  }

  async findAll(userId: number, workspaceId?: number) {
    let query = this.dbService.db.select().from(meetings);
    let meetingList = workspaceId
      ? await query.where(eq(meetings.workspaceId, workspaceId)).orderBy(meetings.startTime)
      : await query.orderBy(meetings.startTime);

    const meetingIds = meetingList.map((m) => m.id);
    let allAttendees: any[] = [];
    if (meetingIds.length > 0) {
      allAttendees = await this.dbService.db
        .select({
          id: meetingAttendees.id,
          meetingId: meetingAttendees.meetingId,
          userId: meetingAttendees.userId,
          status: meetingAttendees.status,
          respondedAt: meetingAttendees.respondedAt,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        })
        .from(meetingAttendees)
        .innerJoin(users, eq(meetingAttendees.userId, users.id))
        .where(inArray(meetingAttendees.meetingId, meetingIds));
    }

    return meetingList.map((m) => {
      const attendees = allAttendees.filter((a) => a.meetingId === m.id);
      const userRsvp = attendees.find((a) => a.userId === userId);
      return {
        ...m,
        attendees,
        myRsvp: userRsvp?.status || (m.organizerId === userId ? 'accepted' : 'pending'),
      };
    });
  }

  async findOne(id: number) {
    const [meeting] = await this.dbService.db.select().from(meetings).where(eq(meetings.id, id)).limit(1);
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }

    const attendees = await this.dbService.db
      .select({
        id: meetingAttendees.id,
        meetingId: meetingAttendees.meetingId,
        userId: meetingAttendees.userId,
        status: meetingAttendees.status,
        respondedAt: meetingAttendees.respondedAt,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
      })
      .from(meetingAttendees)
      .innerJoin(users, eq(meetingAttendees.userId, users.id))
      .where(eq(meetingAttendees.meetingId, id));

    return {
      ...meeting,
      attendees,
    };
  }

  async respondRSVP(meetingId: number, userId: number, status: string) {
    const meeting = await this.findOne(meetingId);
    if (!meeting) throw new NotFoundException('Meeting not found');

    const [existing] = await this.dbService.db
      .select()
      .from(meetingAttendees)
      .where(and(eq(meetingAttendees.meetingId, meetingId), eq(meetingAttendees.userId, userId)));

    if (existing) {
      const [updated] = await this.dbService.db
        .update(meetingAttendees)
        .set({ status, respondedAt: new Date() })
        .where(eq(meetingAttendees.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await this.dbService.db
        .insert(meetingAttendees)
        .values({
          meetingId,
          userId,
          status,
          respondedAt: new Date(),
        })
        .returning();
      return created;
    }
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

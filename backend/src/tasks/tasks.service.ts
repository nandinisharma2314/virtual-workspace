import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { eq, desc, asc, and, inArray } from 'drizzle-orm';

@Injectable()
export class TasksService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createTaskDto: any, userId: number, workspaceId?: number) {
    const assigneeId = createTaskDto.assigneeId || userId;
    const taskWorkspaceId = createTaskDto.workspaceId || workspaceId || null;

    const [newTask] = await this.dbService.db
      .insert(schema.tasks)
      .values({
        title: createTaskDto.title,
        description: createTaskDto.description || null,
        status: createTaskDto.status || 'todo',
        priority: createTaskDto.priority || 'medium',
        channelId: createTaskDto.channelId || null,
        sprintId: createTaskDto.sprintId || null,
        projectId: createTaskDto.projectId || null,
        boardId: createTaskDto.boardId || null,
        boardListId: createTaskDto.boardListId || null,
        order: createTaskDto.order !== undefined ? createTaskDto.order : 0,
        workspaceId: taskWorkspaceId,
        estimatedHours: createTaskDto.estimatedHours || null,
        storyPoints: createTaskDto.storyPoints || null,
        issueType: createTaskDto.issueType || 'task',
        coverColor: createTaskDto.coverColor || null,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        assigneeId: assigneeId,
      })
      .returning();

    // Record activity
    await this.dbService.db.insert(schema.taskActivities).values({
      taskId: newTask.id,
      userId,
      action: 'created',
      details: { title: newTask.title },
    });

    // Fetch user details for notification
    const [user] = await this.dbService.db
      .select({ name: schema.users.name, role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    // Send targeted notification to assignee if someone else was assigned
    if (assigneeId && assigneeId !== userId) {
      await this.notificationsService.createNotification(
        assigneeId,
        `${user?.name || 'Someone'} assigned you a new task: "${createTaskDto.title}"`,
        'Task',
      );
    }

    if (taskWorkspaceId) {
      await this.notificationsService.notifyWorkspaceMembers(
        taskWorkspaceId,
        `${user?.name || 'A team member'} created a new task: "${createTaskDto.title}"`,
        'Task',
      );
    } else if (user && user.role === 'Admin') {
      await this.notificationsService.notifyAllExcept(
        userId,
        `Admin ${user.name} added a new task: "${createTaskDto.title}"`,
      );
    }

    return newTask;
  }

  async findAll(workspaceId?: number, userId?: number, onlyAssigned: boolean = false, sprintId?: number) {
    let query = this.dbService.db
      .select({
        id: schema.tasks.id,
        title: schema.tasks.title,
        description: schema.tasks.description,
        status: schema.tasks.status,
        priority: schema.tasks.priority,
        projectId: schema.tasks.projectId,
        workspaceId: schema.tasks.workspaceId,
        sprintId: schema.tasks.sprintId,
        boardId: schema.tasks.boardId,
        boardListId: schema.tasks.boardListId,
        order: schema.tasks.order,
        assigneeId: schema.tasks.assigneeId,
        channelId: schema.tasks.channelId,
        estimatedHours: schema.tasks.estimatedHours,
        storyPoints: schema.tasks.storyPoints,
        issueType: schema.tasks.issueType,
        coverColor: schema.tasks.coverColor,
        dueDate: schema.tasks.dueDate,
        completedAt: schema.tasks.completedAt,
        createdAt: schema.tasks.createdAt,
        updatedAt: schema.tasks.updatedAt,
        assigneeName: schema.users.name,
        assigneeAvatar: schema.users.avatar,
      })
      .from(schema.tasks)
      .leftJoin(schema.users, eq(schema.tasks.assigneeId, schema.users.id));

    const conditions: any[] = [];
    if (workspaceId) {
      conditions.push(eq(schema.tasks.workspaceId, workspaceId));
    }
    if (onlyAssigned && userId) {
      conditions.push(eq(schema.tasks.assigneeId, userId));
    }
    if (sprintId !== undefined) {
      conditions.push(eq(schema.tasks.sprintId, sprintId));
    }

    if (conditions.length === 1) {
      return query.where(conditions[0]).orderBy(asc(schema.tasks.order), desc(schema.tasks.createdAt));
    } else if (conditions.length > 1) {
      return query.where(and(...conditions)).orderBy(asc(schema.tasks.order), desc(schema.tasks.createdAt));
    }

    return query.orderBy(desc(schema.tasks.createdAt));
  }

  async findOne(id: number) {
    const [task] = await this.dbService.db
      .select({
        id: schema.tasks.id,
        title: schema.tasks.title,
        description: schema.tasks.description,
        status: schema.tasks.status,
        priority: schema.tasks.priority,
        projectId: schema.tasks.projectId,
        workspaceId: schema.tasks.workspaceId,
        sprintId: schema.tasks.sprintId,
        boardId: schema.tasks.boardId,
        boardListId: schema.tasks.boardListId,
        order: schema.tasks.order,
        assigneeId: schema.tasks.assigneeId,
        channelId: schema.tasks.channelId,
        estimatedHours: schema.tasks.estimatedHours,
        storyPoints: schema.tasks.storyPoints,
        issueType: schema.tasks.issueType,
        coverColor: schema.tasks.coverColor,
        dueDate: schema.tasks.dueDate,
        completedAt: schema.tasks.completedAt,
        createdAt: schema.tasks.createdAt,
        updatedAt: schema.tasks.updatedAt,
        assigneeName: schema.users.name,
        assigneeAvatar: schema.users.avatar,
        assigneeEmail: schema.users.email,
      })
      .from(schema.tasks)
      .leftJoin(schema.users, eq(schema.tasks.assigneeId, schema.users.id))
      .where(eq(schema.tasks.id, id));

    return task || null;
  }

  async findFullTask(id: number) {
    const task = await this.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const checklists = await this.dbService.db
      .select()
      .from(schema.taskChecklists)
      .where(eq(schema.taskChecklists.taskId, id))
      .orderBy(asc(schema.taskChecklists.position));

    let items: any[] = [];
    if (checklists.length > 0) {
      items = await this.dbService.db
        .select()
        .from(schema.taskChecklistItems)
        .where(inArray(schema.taskChecklistItems.checklistId, checklists.map(c => c.id)))
        .orderBy(asc(schema.taskChecklistItems.position));
    }

    const populatedChecklists = checklists.map((c) => ({
      ...c,
      items: items.filter((i) => i.checklistId === c.id),
    }));

    const comments = await this.dbService.db
      .select({
        id: schema.taskComments.id,
        taskId: schema.taskComments.taskId,
        userId: schema.taskComments.userId,
        content: schema.taskComments.content,
        createdAt: schema.taskComments.createdAt,
        userName: schema.users.name,
        userAvatar: schema.users.avatar,
      })
      .from(schema.taskComments)
      .innerJoin(schema.users, eq(schema.taskComments.userId, schema.users.id))
      .where(eq(schema.taskComments.taskId, id))
      .orderBy(desc(schema.taskComments.createdAt));

    const activities = await this.dbService.db
      .select({
        id: schema.taskActivities.id,
        taskId: schema.taskActivities.taskId,
        userId: schema.taskActivities.userId,
        action: schema.taskActivities.action,
        details: schema.taskActivities.details,
        createdAt: schema.taskActivities.createdAt,
        userName: schema.users.name,
        userAvatar: schema.users.avatar,
      })
      .from(schema.taskActivities)
      .innerJoin(schema.users, eq(schema.taskActivities.userId, schema.users.id))
      .where(eq(schema.taskActivities.taskId, id))
      .orderBy(desc(schema.taskActivities.createdAt));

    return {
      ...task,
      checklists: populatedChecklists,
      comments,
      activities,
    };
  }

  async update(id: number, updateTaskDto: any, userId?: number) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const updateData: any = { updatedAt: new Date() };
    if (updateTaskDto.title !== undefined) updateData.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined) updateData.description = updateTaskDto.description;
    if (updateTaskDto.status !== undefined) {
      updateData.status = updateTaskDto.status;
      if (updateTaskDto.status === 'completed' || updateTaskDto.status === 'done') {
        updateData.completedAt = new Date();
      }
    }
    if (updateTaskDto.priority !== undefined) updateData.priority = updateTaskDto.priority;
    if (updateTaskDto.channelId !== undefined) updateData.channelId = updateTaskDto.channelId;
    if (updateTaskDto.sprintId !== undefined) updateData.sprintId = updateTaskDto.sprintId;
    if (updateTaskDto.projectId !== undefined) updateData.projectId = updateTaskDto.projectId;
    if (updateTaskDto.boardId !== undefined) updateData.boardId = updateTaskDto.boardId;
    if (updateTaskDto.boardListId !== undefined) updateData.boardListId = updateTaskDto.boardListId;
    if (updateTaskDto.order !== undefined) updateData.order = updateTaskDto.order;
    if (updateTaskDto.workspaceId !== undefined) updateData.workspaceId = updateTaskDto.workspaceId;
    if (updateTaskDto.estimatedHours !== undefined) updateData.estimatedHours = updateTaskDto.estimatedHours;
    if (updateTaskDto.storyPoints !== undefined) updateData.storyPoints = updateTaskDto.storyPoints;
    if (updateTaskDto.issueType !== undefined) updateData.issueType = updateTaskDto.issueType;
    if (updateTaskDto.coverColor !== undefined) updateData.coverColor = updateTaskDto.coverColor;
    if (updateTaskDto.dueDate !== undefined) updateData.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
    if (updateTaskDto.assigneeId !== undefined) updateData.assigneeId = updateTaskDto.assigneeId;

    const [updated] = await this.dbService.db
      .update(schema.tasks)
      .set(updateData)
      .where(eq(schema.tasks.id, id))
      .returning();

    if (userId && updateTaskDto.status && updateTaskDto.status !== existing.status) {
      await this.dbService.db.insert(schema.taskActivities).values({
        taskId: id,
        userId,
        action: 'status_changed',
        details: { from: existing.status, to: updateTaskDto.status },
      });
    }

    return updated;
  }

  async remove(id: number) {
    await this.dbService.db.delete(schema.tasks).where(eq(schema.tasks.id, id));
    return { success: true };
  }

  // --- Checklist Management ---

  async addChecklist(taskId: number, title: string) {
    const existing = await this.dbService.db
      .select({ id: schema.taskChecklists.id })
      .from(schema.taskChecklists)
      .where(eq(schema.taskChecklists.taskId, taskId));

    const [cl] = await this.dbService.db
      .insert(schema.taskChecklists)
      .values({
        taskId,
        title: title || 'Checklist',
        position: existing.length,
      })
      .returning();

    return { ...cl, items: [] };
  }

  async removeChecklist(checklistId: number) {
    await this.dbService.db.delete(schema.taskChecklists).where(eq(schema.taskChecklists.id, checklistId));
    return { success: true };
  }

  async addChecklistItem(checklistId: number, title: string) {
    const existing = await this.dbService.db
      .select({ id: schema.taskChecklistItems.id })
      .from(schema.taskChecklistItems)
      .where(eq(schema.taskChecklistItems.checklistId, checklistId));

    const [item] = await this.dbService.db
      .insert(schema.taskChecklistItems)
      .values({
        checklistId,
        title,
        isCompleted: false,
        position: existing.length,
      })
      .returning();

    return item;
  }

  async toggleChecklistItem(itemId: number, isCompleted: boolean) {
    const [updated] = await this.dbService.db
      .update(schema.taskChecklistItems)
      .set({ isCompleted })
      .where(eq(schema.taskChecklistItems.id, itemId))
      .returning();

    return updated;
  }

  async removeChecklistItem(itemId: number) {
    await this.dbService.db.delete(schema.taskChecklistItems).where(eq(schema.taskChecklistItems.id, itemId));
    return { success: true };
  }

  // --- Comment Management ---

  async addComment(taskId: number, userId: number, content: string) {
    const [comment] = await this.dbService.db
      .insert(schema.taskComments)
      .values({
        taskId,
        userId,
        content,
      })
      .returning();

    const [user] = await this.dbService.db
      .select({ name: schema.users.name, avatar: schema.users.avatar })
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    return {
      ...comment,
      userName: user?.name || 'Teammate',
      userAvatar: user?.avatar || null,
    };
  }

  async removeComment(commentId: number, userId: number) {
    const [comment] = await this.dbService.db
      .select()
      .from(schema.taskComments)
      .where(eq(schema.taskComments.id, commentId));

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) {
      throw new ForbiddenException('Cannot delete comment created by another user');
    }

    await this.dbService.db.delete(schema.taskComments).where(eq(schema.taskComments.id, commentId));
    return { success: true };
  }
}

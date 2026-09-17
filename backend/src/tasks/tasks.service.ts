import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class TasksService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createTaskDto: any, userId: number) {
    const assigneeId = createTaskDto.assigneeId || userId;
    
    const [newTask] = await this.dbService.db.insert(schema.tasks).values({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status || 'todo',
      priority: createTaskDto.priority || 'medium',
      channelId: createTaskDto.channelId || null,
      sprintId: createTaskDto.sprintId || null,
      estimatedHours: createTaskDto.estimatedHours || null,
      assigneeId: assigneeId,
    }).returning();
    
    // Fetch user details for the broadcast
    const [user] = await this.dbService.db
      .select({ name: schema.users.name, role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, userId));
      
    if (user && user.role === 'Admin') {
      await this.notificationsService.notifyAllExcept(userId, `Admin ${user.name} added a new task: "${createTaskDto.title}"`);
    }

    return newTask;
  }

  findAll() {
    return this.dbService.db
      .select({
        id: schema.tasks.id,
        title: schema.tasks.title,
        description: schema.tasks.description,
        status: schema.tasks.status,
        priority: schema.tasks.priority,
        projectId: schema.tasks.projectId,
        sprintId: schema.tasks.sprintId,
        assigneeId: schema.tasks.assigneeId,
        channelId: schema.tasks.channelId,
        estimatedHours: schema.tasks.estimatedHours,
        createdAt: schema.tasks.createdAt,
        updatedAt: schema.tasks.updatedAt,
        assigneeName: schema.users.name
      })
      .from(schema.tasks)
      .leftJoin(schema.users, eq(schema.tasks.assigneeId, schema.users.id))
      .orderBy(desc(schema.tasks.createdAt));
  }

  async findOne(id: number) {
    const [task] = await this.dbService.db.select().from(schema.tasks).where(eq(schema.tasks.id, id));
    return task;
  }

  async update(id: number, updateTaskDto: any) {
    const updateData: any = { updatedAt: new Date() };
    if (updateTaskDto.title !== undefined) updateData.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined) updateData.description = updateTaskDto.description;
    if (updateTaskDto.status !== undefined) updateData.status = updateTaskDto.status;
    if (updateTaskDto.priority !== undefined) updateData.priority = updateTaskDto.priority;
    if (updateTaskDto.channelId !== undefined) updateData.channelId = updateTaskDto.channelId;
    if (updateTaskDto.sprintId !== undefined) updateData.sprintId = updateTaskDto.sprintId;
    if (updateTaskDto.estimatedHours !== undefined) updateData.estimatedHours = updateTaskDto.estimatedHours;
    if (updateTaskDto.assigneeId !== undefined) updateData.assigneeId = updateTaskDto.assigneeId;

    const [updated] = await this.dbService.db
      .update(schema.tasks)
      .set(updateData)
      .where(eq(schema.tasks.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.dbService.db.delete(schema.tasks).where(eq(schema.tasks.id, id));
    return { success: true };
  }
}

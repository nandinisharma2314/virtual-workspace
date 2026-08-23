import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class TasksService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createTaskDto: any, userId: number) {
    const [newTask] = await this.dbService.db.insert(schema.tasks).values({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status || 'todo',
      priority: createTaskDto.priority || 'medium',
      assigneeId: userId,
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
    return this.dbService.db.select().from(schema.tasks);
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: any) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSprintDto } from './dto/create-sprint.dto.js';
import { UpdateSprintDto } from './dto/update-sprint.dto.js';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { eq, and, desc, isNull, inArray } from 'drizzle-orm';

@Injectable()
export class SprintsService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createSprintDto: any) {
    const [newSprint] = await this.dbService.db
      .insert(schema.sprints)
      .values({
        name: createSprintDto.name,
        status: createSprintDto.status || 'planned',
        goal: createSprintDto.goal || null,
        sprintNumber: createSprintDto.sprintNumber || null,
        projectId: createSprintDto.projectId || null,
        workspaceId: createSprintDto.workspaceId || null,
        startDate: createSprintDto.startDate ? new Date(createSprintDto.startDate) : null,
        endDate: createSprintDto.endDate ? new Date(createSprintDto.endDate) : null,
      })
      .returning();
    return newSprint;
  }

  async findAll(workspaceId?: number) {
    let query = this.dbService.db.select().from(schema.sprints);
    let sprintList = workspaceId
      ? await query.where(eq(schema.sprints.workspaceId, workspaceId)).orderBy(desc(schema.sprints.id))
      : await query.orderBy(desc(schema.sprints.id));

    // Attach task summary metrics
    const sprintIds = sprintList.map((s) => s.id);
    let sprintTasks: any[] = [];
    if (sprintIds.length > 0) {
      sprintTasks = await this.dbService.db
        .select({
          id: schema.tasks.id,
          sprintId: schema.tasks.sprintId,
          status: schema.tasks.status,
          storyPoints: schema.tasks.storyPoints,
          estimatedHours: schema.tasks.estimatedHours,
        })
        .from(schema.tasks)
        .where(inArray(schema.tasks.sprintId, sprintIds));
    }

    return sprintList.map((sprint) => {
      const tasks = sprintTasks.filter((t) => t.sprintId === sprint.id);
      const totalPoints = tasks.reduce((acc, t) => acc + (t.storyPoints || t.estimatedHours || 0), 0);
      const completedPoints = tasks
        .filter((t) => t.status === 'completed' || t.status === 'done')
        .reduce((acc, t) => acc + (t.storyPoints || t.estimatedHours || 0), 0);

      return {
        ...sprint,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'completed' || t.status === 'done').length,
        totalPoints,
        completedPoints,
      };
    });
  }

  async findOne(id: number) {
    const [sprint] = await this.dbService.db.select().from(schema.sprints).where(eq(schema.sprints.id, id));
    return sprint || null;
  }

  async getBacklog(workspaceId: number) {
    const backlogTasks = await this.dbService.db
      .select({
        id: schema.tasks.id,
        title: schema.tasks.title,
        description: schema.tasks.description,
        status: schema.tasks.status,
        priority: schema.tasks.priority,
        projectId: schema.tasks.projectId,
        workspaceId: schema.tasks.workspaceId,
        sprintId: schema.tasks.sprintId,
        assigneeId: schema.tasks.assigneeId,
        storyPoints: schema.tasks.storyPoints,
        estimatedHours: schema.tasks.estimatedHours,
        issueType: schema.tasks.issueType,
        coverColor: schema.tasks.coverColor,
        createdAt: schema.tasks.createdAt,
        assigneeName: schema.users.name,
        assigneeAvatar: schema.users.avatar,
      })
      .from(schema.tasks)
      .leftJoin(schema.users, eq(schema.tasks.assigneeId, schema.users.id))
      .where(and(eq(schema.tasks.workspaceId, workspaceId), isNull(schema.tasks.sprintId)))
      .orderBy(desc(schema.tasks.createdAt));

    return backlogTasks;
  }

  async assignTasksToSprint(sprintId: number | null, taskIds: number[]) {
    if (!taskIds || taskIds.length === 0) return { count: 0 };

    await this.dbService.db
      .update(schema.tasks)
      .set({ sprintId: sprintId || null, updatedAt: new Date() })
      .where(inArray(schema.tasks.id, taskIds));

    return { count: taskIds.length, sprintId };
  }

  async startSprint(sprintId: number, dto: { startDate?: string; endDate?: string; goal?: string } = {}) {
    const [updated] = await this.dbService.db
      .update(schema.sprints)
      .set({
        status: 'active',
        startDate: dto?.startDate ? new Date(dto.startDate) : new Date(),
        endDate: dto?.endDate ? new Date(dto.endDate) : null,
        goal: dto?.goal || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.sprints.id, sprintId))
      .returning();

    return updated;
  }

  async completeSprint(sprintId: number, rolloverToSprintId?: number) {
    // Find incomplete tasks
    const sprintTasks = await this.dbService.db
      .select({ id: schema.tasks.id, status: schema.tasks.status })
      .from(schema.tasks)
      .where(eq(schema.tasks.sprintId, sprintId));

    const incompleteIds = sprintTasks
      .filter((t) => t.status !== 'completed' && t.status !== 'done')
      .map((t) => t.id);

    if (incompleteIds.length > 0) {
      // Rollover incomplete tasks to target sprint or back to backlog (null)
      await this.dbService.db
        .update(schema.tasks)
        .set({
          sprintId: rolloverToSprintId || null,
          updatedAt: new Date(),
        })
        .where(inArray(schema.tasks.id, incompleteIds));
    }

    const [updated] = await this.dbService.db
      .update(schema.sprints)
      .set({
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(schema.sprints.id, sprintId))
      .returning();

    return {
      ...updated,
      sprint: updated,
      rolloverCount: incompleteIds.length,
      rolloverTarget: rolloverToSprintId || 'backlog',
    };
  }

  async update(id: number, updateSprintDto: any) {
    const updateData: any = { updatedAt: new Date() };
    if (updateSprintDto.name !== undefined) updateData.name = updateSprintDto.name;
    if (updateSprintDto.status !== undefined) updateData.status = updateSprintDto.status;
    if (updateSprintDto.goal !== undefined) updateData.goal = updateSprintDto.goal;
    if (updateSprintDto.projectId !== undefined) updateData.projectId = updateSprintDto.projectId;
    if (updateSprintDto.startDate !== undefined) updateData.startDate = new Date(updateSprintDto.startDate);
    if (updateSprintDto.endDate !== undefined) updateData.endDate = new Date(updateSprintDto.endDate);

    const [updated] = await this.dbService.db
      .update(schema.sprints)
      .set(updateData)
      .where(eq(schema.sprints.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    // Move any tasks back to backlog before deleting sprint
    await this.dbService.db
      .update(schema.tasks)
      .set({ sprintId: null })
      .where(eq(schema.tasks.sprintId, id));

    await this.dbService.db.delete(schema.sprints).where(eq(schema.sprints.id, id));
    return { success: true };
  }
}

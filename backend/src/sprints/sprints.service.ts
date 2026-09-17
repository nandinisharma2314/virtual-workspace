import { Injectable } from '@nestjs/common';
import { CreateSprintDto } from './dto/create-sprint.dto.js';
import { UpdateSprintDto } from './dto/update-sprint.dto.js';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class SprintsService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createSprintDto: CreateSprintDto) {
    const [newSprint] = await this.dbService.db.insert(schema.sprints).values({
      name: createSprintDto.name,
      status: createSprintDto.status || 'planned',
      projectId: createSprintDto.projectId || null,
      startDate: createSprintDto.startDate ? new Date(createSprintDto.startDate) : null,
      endDate: createSprintDto.endDate ? new Date(createSprintDto.endDate) : null,
    }).returning();
    return newSprint;
  }

  async findAll() {
    return this.dbService.db.select().from(schema.sprints).orderBy(schema.sprints.id);
  }

  async findOne(id: number) {
    const [sprint] = await this.dbService.db.select().from(schema.sprints).where(eq(schema.sprints.id, id));
    return sprint;
  }

  async update(id: number, updateSprintDto: UpdateSprintDto) {
    const updateData: any = { updatedAt: new Date() };
    if (updateSprintDto.name !== undefined) updateData.name = updateSprintDto.name;
    if (updateSprintDto.status !== undefined) updateData.status = updateSprintDto.status;
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
    await this.dbService.db.delete(schema.sprints).where(eq(schema.sprints.id, id));
    return { success: true };
  }
}

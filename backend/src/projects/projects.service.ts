import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class ProjectsService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createProjectDto: CreateProjectDto) {
    const [project] = await this.dbService.db
      .insert(schema.projects)
      .values({
        name: createProjectDto.name,
        description: createProjectDto.description || null,
        teamId: createProjectDto.teamId || null,
        status: createProjectDto.status || 'active',
      })
      .returning();
    return project;
  }

  async findAll() {
    const allProjects = await this.dbService.db
      .select()
      .from(schema.projects)
      .orderBy(desc(schema.projects.createdAt));

    const allTasks = await this.dbService.db
      .select({
        id: schema.tasks.id,
        projectId: schema.tasks.projectId,
        status: schema.tasks.status,
      })
      .from(schema.tasks);

    return allProjects.map((p) => {
      const pTasks = allTasks.filter((t) => t.projectId === p.id);
      const completed = pTasks.filter((t) => t.status === 'done').length;
      const progress = pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0;
      return {
        ...p,
        totalTasks: pTasks.length,
        completedTasks: completed,
        progress,
      };
    });
  }

  async findOne(id: number) {
    const [project] = await this.dbService.db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, id));
    return project || null;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    const updateData: any = { updatedAt: new Date() };
    if (updateProjectDto.name !== undefined) updateData.name = updateProjectDto.name;
    if (updateProjectDto.description !== undefined) updateData.description = updateProjectDto.description;
    if (updateProjectDto.teamId !== undefined) updateData.teamId = updateProjectDto.teamId;
    if (updateProjectDto.status !== undefined) updateData.status = updateProjectDto.status;

    const [updated] = await this.dbService.db
      .update(schema.projects)
      .set(updateData)
      .where(eq(schema.projects.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.dbService.db.delete(schema.projects).where(eq(schema.projects.id, id));
    return { success: true };
  }
}

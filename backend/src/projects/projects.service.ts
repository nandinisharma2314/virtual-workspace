import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { eq, desc, and, inArray, or } from 'drizzle-orm';

@Injectable()
export class ProjectsService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createProjectDto: CreateProjectDto, userId?: number) {
    const [project] = await this.dbService.db
      .insert(schema.projects)
      .values({
        name: createProjectDto.name,
        description: createProjectDto.description || null,
        teamId: createProjectDto.teamId || null,
        workspaceId: createProjectDto.workspaceId || null,
        managerId: createProjectDto.managerId || userId || null,
        status: createProjectDto.status || 'active',
      })
      .returning();

    // Assign project members if provided
    if (createProjectDto.assignedUserIds && createProjectDto.assignedUserIds.length > 0) {
      const memberValues = createProjectDto.assignedUserIds.map((uid) => ({
        projectId: project.id,
        userId: uid,
        role: uid === project.managerId ? 'manager' : 'member',
      }));
      await this.dbService.db.insert(schema.projectMembers).values(memberValues);
    } else if (userId) {
      // Auto-assign creator/manager as project member
      await this.dbService.db.insert(schema.projectMembers).values({
        projectId: project.id,
        userId,
        role: 'manager',
      });
    }

    return this.findOne(project.id);
  }

  async findAll(workspaceId?: number, userId?: number, hasReadAll: boolean = true) {
    let query = this.dbService.db.select().from(schema.projects);

    const conditions: any[] = [];
    if (workspaceId) {
      conditions.push(eq(schema.projects.workspaceId, workspaceId));
    }

    // If user cannot read all, only return projects they manage or are member of
    if (!hasReadAll && userId) {
      // Find teams where user is lead or manager
      const userTeams = await this.dbService.db
        .select({ id: schema.teams.id })
        .from(schema.teams)
        .where(
          or(
            eq(schema.teams.leadId, userId),
            eq(schema.teams.managerId, userId)
          )
        );
      const userTeamIds = userTeams.map(t => t.id);

      const userProjectMemberships = await this.dbService.db
        .select({ projectId: schema.projectMembers.projectId })
        .from(schema.projectMembers)
        .where(eq(schema.projectMembers.userId, userId));

      const memberProjectIds = userProjectMemberships.map((m) => m.projectId);

      const orConditions = [eq(schema.projects.managerId, userId)];
      if (memberProjectIds.length > 0) {
        orConditions.push(inArray(schema.projects.id, memberProjectIds));
      }
      if (userTeamIds.length > 0) {
        orConditions.push(inArray(schema.projects.teamId, userTeamIds));
      }

      conditions.push(or(...orConditions));
    }

    let allProjects;
    if (conditions.length === 1) {
      allProjects = await query.where(conditions[0]).orderBy(desc(schema.projects.createdAt));
    } else if (conditions.length > 1) {
      allProjects = await query.where(and(...conditions)).orderBy(desc(schema.projects.createdAt));
    } else {
      allProjects = await query.orderBy(desc(schema.projects.createdAt));
    }

    // Fetch tasks counts
    const allTasks = await this.dbService.db
      .select({
        id: schema.tasks.id,
        projectId: schema.tasks.projectId,
        status: schema.tasks.status,
      })
      .from(schema.tasks);

    // Fetch assigned project members
    const allProjectMembers = await this.dbService.db
      .select({
        projectId: schema.projectMembers.projectId,
        userId: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatar: schema.users.avatar,
        role: schema.projectMembers.role,
      })
      .from(schema.projectMembers)
      .innerJoin(schema.users, eq(schema.projectMembers.userId, schema.users.id));

    return allProjects.map((p) => {
      const pTasks = allTasks.filter((t) => t.projectId === p.id);
      const completed = pTasks.filter((t) => t.status === 'done').length;
      const progress = pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0;
      const pMembers = allProjectMembers.filter((m) => m.projectId === p.id);

      return {
        ...p,
        totalTasks: pTasks.length,
        completedTasks: completed,
        progress,
        members: pMembers,
      };
    });
  }

  async findOne(id: number) {
    const [project] = await this.dbService.db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, id));

    if (!project) return null;

    const pMembers = await this.dbService.db
      .select({
        userId: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatar: schema.users.avatar,
        role: schema.projectMembers.role,
      })
      .from(schema.projectMembers)
      .innerJoin(schema.users, eq(schema.projectMembers.userId, schema.users.id))
      .where(eq(schema.projectMembers.projectId, id));

    return {
      ...project,
      members: pMembers,
    };
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    const updateData: any = { updatedAt: new Date() };
    if (updateProjectDto.name !== undefined) updateData.name = updateProjectDto.name;
    if (updateProjectDto.description !== undefined)
      updateData.description = updateProjectDto.description;
    if (updateProjectDto.teamId !== undefined) updateData.teamId = updateProjectDto.teamId;
    if (updateProjectDto.managerId !== undefined) updateData.managerId = updateProjectDto.managerId;
    if (updateProjectDto.status !== undefined) updateData.status = updateProjectDto.status;

    const [updated] = await this.dbService.db
      .update(schema.projects)
      .set(updateData)
      .where(eq(schema.projects.id, id))
      .returning();

    if (updateProjectDto.assignedUserIds) {
      await this.dbService.db
        .delete(schema.projectMembers)
        .where(eq(schema.projectMembers.projectId, id));

      if (updateProjectDto.assignedUserIds.length > 0) {
        const memberValues = updateProjectDto.assignedUserIds.map((uid) => ({
          projectId: id,
          userId: uid,
          role: uid === updated.managerId ? 'manager' : 'member',
        }));
        await this.dbService.db.insert(schema.projectMembers).values(memberValues);
      }
    }

    return this.findOne(id);
  }

  async assignMember(projectId: number, userId: number, role: string = 'member') {
    const [existing] = await this.dbService.db
      .select()
      .from(schema.projectMembers)
      .where(
        and(
          eq(schema.projectMembers.projectId, projectId),
          eq(schema.projectMembers.userId, userId),
        ),
      );

    if (existing) {
      await this.dbService.db
        .update(schema.projectMembers)
        .set({ role })
        .where(eq(schema.projectMembers.id, existing.id));
    } else {
      await this.dbService.db.insert(schema.projectMembers).values({
        projectId,
        userId,
        role,
      });
    }

    return this.findOne(projectId);
  }

  async removeMember(projectId: number, userId: number) {
    await this.dbService.db
      .delete(schema.projectMembers)
      .where(
        and(
          eq(schema.projectMembers.projectId, projectId),
          eq(schema.projectMembers.userId, userId),
        ),
      );

    return { success: true };
  }

  async remove(id: number) {
    await this.dbService.db
      .delete(schema.projectMembers)
      .where(eq(schema.projectMembers.projectId, id));
    await this.dbService.db.delete(schema.projects).where(eq(schema.projects.id, id));
    return { success: true };
  }
}

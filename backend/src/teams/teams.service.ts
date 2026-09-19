import { Injectable } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class TeamsService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createTeamDto: CreateTeamDto) {
    const [team] = await this.dbService.db
      .insert(schema.teams)
      .values({
        name: createTeamDto.name,
        description: createTeamDto.description || null,
      })
      .returning();
    return team;
  }

  async findAll() {
    return this.dbService.db
      .select()
      .from(schema.teams)
      .orderBy(desc(schema.teams.createdAt));
  }

  async findOne(id: number) {
    const [team] = await this.dbService.db
      .select()
      .from(schema.teams)
      .where(eq(schema.teams.id, id));
    return team || null;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    const updateData: any = { updatedAt: new Date() };
    if (updateTeamDto.name !== undefined) updateData.name = updateTeamDto.name;
    if (updateTeamDto.description !== undefined) updateData.description = updateTeamDto.description;

    const [updated] = await this.dbService.db
      .update(schema.teams)
      .set(updateData)
      .where(eq(schema.teams.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.dbService.db.delete(schema.teams).where(eq(schema.teams.id, id));
    return { success: true };
  }
}

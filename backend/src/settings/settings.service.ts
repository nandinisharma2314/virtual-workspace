import { Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto.js';
import { UpdateSettingDto } from './dto/update-setting.dto.js';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class SettingsService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createSettingDto: CreateSettingDto) {
    const [setting] = await this.dbService.db
      .insert(schema.settings)
      .values({
        key: (createSettingDto as any).key,
        value: (createSettingDto as any).value,
        userId: (createSettingDto as any).userId || null,
      })
      .returning();
    return setting;
  }

  async findAll() {
    return this.dbService.db.select().from(schema.settings);
  }

  async findOne(id: number) {
    const [setting] = await this.dbService.db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.id, id));
    return setting || null;
  }

  async update(id: number, updateSettingDto: UpdateSettingDto) {
    const [updated] = await this.dbService.db
      .update(schema.settings)
      .set({
        value: (updateSettingDto as any).value,
        updatedAt: new Date(),
      })
      .where(eq(schema.settings.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.dbService.db.delete(schema.settings).where(eq(schema.settings.id, id));
    return { success: true };
  }
}

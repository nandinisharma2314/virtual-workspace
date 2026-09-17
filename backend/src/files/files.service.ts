import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto.js';
import { UpdateFileDto } from './dto/update-file.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import * as schema from '../database/schema.js';
import { eq, isNotNull } from 'drizzle-orm';

@Injectable()
export class FilesService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createFileDto: CreateFileDto, userId: number) {
    const [newFile] = await this.dbService.db.insert(schema.files).values({
      name: createFileDto.name,
      url: createFileDto.url,
      size: createFileDto.size,
      type: createFileDto.type,
      uploadedById: userId,
      projectId: createFileDto.projectId,
    }).returning();
    
    // Fetch user details for the broadcast
    const [user] = await this.dbService.db
      .select({ name: schema.users.name, role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, userId));
      
    if (user && user.role === 'Admin') {
      await this.notificationsService.notifyAllExcept(userId, `Admin ${user.name} uploaded a new file: "${createFileDto.name}"`);
    }

    return newFile;
  }

  async findAll() {
    const dbFiles = await this.dbService.db.select().from(schema.files);
    return dbFiles;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class DocumentsService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createDocumentDto: CreateDocumentDto, userId?: number, workspaceId?: number) {
    const [doc] = await this.dbService.db
      .insert(schema.documents)
      .values({
        title: (createDocumentDto as any).title || 'Untitled Document',
        content: (createDocumentDto as any).content || null,
        projectId: (createDocumentDto as any).projectId || null,
        authorId: userId || (createDocumentDto as any).authorId || null,
        workspaceId: workspaceId || (createDocumentDto as any).workspaceId || null,
      })
      .returning();
    return doc;
  }

  async findAll(workspaceId?: number) {
    if (workspaceId) {
      return this.dbService.db
        .select()
        .from(schema.documents)
        .where(eq(schema.documents.workspaceId, workspaceId))
        .orderBy(desc(schema.documents.createdAt));
    }
    return this.dbService.db
      .select()
      .from(schema.documents)
      .orderBy(desc(schema.documents.createdAt));
  }

  async findOne(id: number) {
    const [doc] = await this.dbService.db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, id));
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return doc;
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto) {
    await this.findOne(id);
    const updateData: any = { updatedAt: new Date() };
    if ((updateDocumentDto as any).title !== undefined) updateData.title = (updateDocumentDto as any).title;
    if ((updateDocumentDto as any).content !== undefined) updateData.content = (updateDocumentDto as any).content;
    if ((updateDocumentDto as any).projectId !== undefined) updateData.projectId = (updateDocumentDto as any).projectId;

    const [updated] = await this.dbService.db
      .update(schema.documents)
      .set(updateData)
      .where(eq(schema.documents.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.dbService.db.delete(schema.documents).where(eq(schema.documents.id, id));
    return { success: true };
  }
}

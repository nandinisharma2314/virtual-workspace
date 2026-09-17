import { Injectable } from '@nestjs/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto.js';
import { UpdateFileDto } from './dto/update-file.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import * as schema from '../database/schema.js';
import { eq, isNotNull } from 'drizzle-orm';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { eq, desc } from 'drizzle-orm';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.bucketName = process.env.AWS_S3_BUCKET || 'workflow-dashboard-files';
    const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID || '';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
    this.bucketName = process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME || 'workflow-files';
    this.publicUrl = (process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/$/, '');

    // Cloudflare R2 S3-compatible endpoint
    // Cloudflare R2 S3-compatible endpoint: https://<account_id>.r2.cloudflarestorage.com
    const endpoint = accountId
      ? `https://${accountId}.r2.cloudflarestorage.com`
      : undefined;

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
        accessKeyId: accessKeyId || 'dummy',
        secretAccessKey: secretAccessKey || 'dummy',
      },
    });
  }

  async create(createFileDto: CreateFileDto, userId: number) {
    let validUserId: number | null = userId;
    
    // Check if the user exists in database to prevent foreign key constraint violation
    if (userId) {
      const [existingUser] = await this.dbService.db
        .select({ id: schema.users.id, name: schema.users.name, role: schema.users.role })
        .from(schema.users)
        .where(eq(schema.users.id, userId));
        
      if (!existingUser) {
        // Fallback: see if any user exists or set null
        const [fallbackUser] = await this.dbService.db
          .select({ id: schema.users.id })
          .from(schema.users)
          .limit(1);
        validUserId = fallbackUser ? fallbackUser.id : null;
      }
    }

    const fileUrl = createFileDto.url || (this.publicUrl && createFileDto.storageKey ? `${this.publicUrl}/${createFileDto.storageKey}` : '');

    let newFile;
    try {
      const [inserted] = await this.dbService.db.insert(schema.files).values({
        name: createFileDto.name,
        url: createFileDto.url || '',
        url: fileUrl,
        storageKey: createFileDto.storageKey,
        size: createFileDto.size,
        type: createFileDto.type,
        uploadedById: userId,
        uploadedById: validUserId,
        projectId: createFileDto.projectId,
      }).returning();
      newFile = inserted;
    } catch (err) {
      console.error("DB Insert Error in FilesService.create:", err);
      throw err;
    }
    
    // Fetch user details for the broadcast
    const [user] = await this.dbService.db
      .select({ name: schema.users.name, role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.id, userId));
      
    if (user && user.role === 'Admin') {
      await this.notificationsService.notifyAllExcept(userId, `Admin ${user.name} uploaded a new file: "${createFileDto.name}"`);
    // Fetch user details for the broadcast if applicable
    if (validUserId) {
      const [user] = await this.dbService.db
        .select({ name: schema.users.name, role: schema.users.role })
        .from(schema.users)
        .where(eq(schema.users.id, validUserId));
        
      if (user && user.role === 'Admin') {
        await this.notificationsService.notifyAllExcept(validUserId, `Admin ${user.name} uploaded a new file: "${createFileDto.name}"`);
      }
    }

    return newFile;
  }

  findAll() {
    return this.dbService.db.select().from(schema.files);
  async findAll(projectId?: number) {
    if (projectId) {
      return this.dbService.db
        .select()
        .from(schema.files)
        .where(eq(schema.files.projectId, projectId))
        .orderBy(desc(schema.files.createdAt));
    }
    return this.dbService.db
      .select()
      .from(schema.files)
      .orderBy(desc(schema.files.createdAt));
  }

  async generateUploadUrl(filename: string, contentType: string) {
    const storageKey = `${crypto.randomUUID()}-${filename}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    return { uploadUrl, storageKey };
  }

  async generateDownloadUrl(id: number) {
    const [file] = await this.dbService.db
      .select()
      .from(schema.files)
      .where(eq(schema.files.id, id));

    if (!file || !file.storageKey) {
      throw new Error('File not found or does not support signed downloads');
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    if (file.url && file.url !== '#' && file.url !== '') {
      return { downloadUrl: file.url };
    }

    if (!file.storageKey) {
      throw new NotFoundException('File does not have an associated storage key or URL');
    }

    if (this.publicUrl) {
      return { downloadUrl: `${this.publicUrl}/${file.storageKey}` };
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: file.storageKey,
      ResponseContentDisposition: `attachment; filename="${file.name}"`,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(file.name)}"`,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    return { downloadUrl };
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  async findOne(id: number) {
    const [file] = await this.dbService.db
      .select()
      .from(schema.files)
      .where(eq(schema.files.id, id));

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  async update(id: number, updateFileDto: UpdateFileDto) {
    await this.findOne(id);
    const [updated] = await this.dbService.db
      .update(schema.files)
      .set(updateFileDto)
      .where(eq(schema.files.id, id))
      .returning();

    return updated;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  async remove(id: number) {
    const file = await this.findOne(id);
    
    if (file.storageKey) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: file.storageKey,
        });
        await this.s3Client.send(command);
      } catch (r2Err) {
        console.warn(`Could not delete file ${file.storageKey} from Cloudflare R2:`, r2Err);
      }
    }

    const [deleted] = await this.dbService.db
      .delete(schema.files)
      .where(eq(schema.files.id, id))
      .returning();

    return { message: 'File deleted successfully', file: deleted };
  }
}

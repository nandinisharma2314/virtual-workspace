import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto.js';
import { UpdateFileDto } from './dto/update-file.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import * as schema from '../database/schema.js';
import { eq, isNotNull } from 'drizzle-orm';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.bucketName = process.env.AWS_S3_BUCKET || 'workflow-dashboard-files';
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
      },
    });
  }

  async create(createFileDto: CreateFileDto, userId: number) {
    let newFile;
    try {
      const [inserted] = await this.dbService.db.insert(schema.files).values({
        name: createFileDto.name,
        url: createFileDto.url || '',
        storageKey: createFileDto.storageKey,
        size: createFileDto.size,
        type: createFileDto.type,
        uploadedById: userId,
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
    }

    return newFile;
  }

  findAll() {
    return this.dbService.db.select().from(schema.files);
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
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: file.storageKey,
      ResponseContentDisposition: `attachment; filename="${file.name}"`,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    return { downloadUrl };
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

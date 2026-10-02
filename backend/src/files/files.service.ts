import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto.js';
import { UpdateFileDto } from './dto/update-file.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import * as schema from '../database/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

export type StorageProvider = 'cloudflare-r2' | 'aws-s3' | 'local-dev';

export interface StorageStatus {
  isConfigured: boolean;
  provider: StorageProvider;
  bucketName: string | null;
  publicUrl: string | null;
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private s3Client: S3Client | null = null;
  private bucketName: string | null = null;
  private publicUrl: string | null = null;
  private provider: StorageProvider = 'local-dev';
  private isConfigured = false;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.initializeStorageClient();
  }

  private initializeStorageClient() {
    // Check Cloudflare R2 credentials
    const r2AccountId = process.env.R2_ACCOUNT_ID;
    const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
    const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2BucketName = process.env.R2_BUCKET_NAME;
    const r2PublicUrl = process.env.R2_PUBLIC_URL;

    // Check AWS S3 / MinIO credentials
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const awsBucket = process.env.AWS_S3_BUCKET;
    const awsRegion = process.env.AWS_REGION || 'us-east-1';
    const s3Endpoint = process.env.S3_ENDPOINT;

    if (r2AccountId && r2AccessKeyId && r2SecretAccessKey && r2BucketName) {
      // Cloudflare R2 Configuration
      const endpoint = `https://${r2AccountId}.r2.cloudflarestorage.com`;
      this.bucketName = r2BucketName;
      this.publicUrl = r2PublicUrl ? r2PublicUrl.replace(/\/$/, '') : null;
      this.provider = 'cloudflare-r2';
      this.isConfigured = true;

      this.s3Client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
        },
      });
      this.logger.log(`Initialized Cloudflare R2 Object Storage for bucket: ${this.bucketName}`);
    } else if (awsAccessKeyId && awsSecretAccessKey && awsBucket) {
      // Standard AWS S3 / MinIO Configuration
      this.bucketName = awsBucket;
      this.publicUrl = process.env.S3_PUBLIC_URL ? process.env.S3_PUBLIC_URL.replace(/\/$/, '') : null;
      this.provider = 'aws-s3';
      this.isConfigured = true;

      this.s3Client = new S3Client({
        region: awsRegion,
        ...(s3Endpoint ? { endpoint: s3Endpoint, forcePathStyle: true } : {}),
        credentials: {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        },
      });
      this.logger.log(`Initialized AWS S3 Object Storage for bucket: ${this.bucketName} (region: ${awsRegion})`);
    } else {
      this.provider = 'local-dev';
      this.isConfigured = false;
      this.logger.warn(
        'Cloudflare R2 / AWS S3 credentials are not configured. FilesService is running in local-dev fallback mode.',
      );
    }
  }

  /**
   * Get current storage provider status
   */
  getStorageStatus(): StorageStatus {
    return {
      isConfigured: this.isConfigured,
      provider: this.provider,
      bucketName: this.bucketName,
      publicUrl: this.publicUrl,
    };
  }

  async create(createFileDto: CreateFileDto, userId: number, workspaceId?: number) {
    let validUserId: number | null = userId;

    if (userId) {
      const [existingUser] = await this.dbService.db
        .select({ id: schema.users.id, name: schema.users.name, role: schema.users.role })
        .from(schema.users)
        .where(eq(schema.users.id, userId));

      if (!existingUser) {
        const [fallbackUser] = await this.dbService.db
          .select({ id: schema.users.id })
          .from(schema.users)
          .limit(1);
        validUserId = fallbackUser ? fallbackUser.id : null;
      }
    }

    const fileUrl =
      createFileDto.url ||
      (this.publicUrl && createFileDto.storageKey
        ? `${this.publicUrl}/${createFileDto.storageKey}`
        : '');
    const resolvedWorkspaceId = (createFileDto as any).workspaceId || workspaceId || null;

    const [inserted] = await this.dbService.db
      .insert(schema.files)
      .values({
        name: createFileDto.name,
        url: fileUrl,
        storageKey: createFileDto.storageKey,
        size: createFileDto.size,
        type: createFileDto.type,
        uploadedById: validUserId,
        projectId: createFileDto.projectId,
        workspaceId: resolvedWorkspaceId,
        createdAt: new Date(),
      })
      .returning();

    if (validUserId) {
      const [user] = await this.dbService.db
        .select({ name: schema.users.name, role: schema.users.role })
        .from(schema.users)
        .where(eq(schema.users.id, validUserId));

      if (resolvedWorkspaceId) {
        const notifMsg = `${user?.name || 'A team member'} uploaded a new file: "${createFileDto.name}"`;
        await this.notificationsService.notifyWorkspaceMembers(resolvedWorkspaceId, notifMsg, 'File');
      } else if (user && user.role === 'Admin') {
        const notifMsg = `Admin ${user.name} uploaded a new file: "${createFileDto.name}"`;
        await this.notificationsService.notifyAllExcept(validUserId, notifMsg, 'File');
      }
    }

    return inserted;
  }

  async findAll(projectId?: number, workspaceId?: number) {
    if (workspaceId && projectId) {
      return this.dbService.db
        .select()
        .from(schema.files)
        .where(and(eq(schema.files.workspaceId, workspaceId), eq(schema.files.projectId, projectId)))
        .orderBy(desc(schema.files.createdAt));
    }
    if (workspaceId) {
      return this.dbService.db
        .select()
        .from(schema.files)
        .where(eq(schema.files.workspaceId, workspaceId))
        .orderBy(desc(schema.files.createdAt));
    }
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

  /**
   * Generates a presigned PUT upload URL for secure client-side uploads.
   * If storage credentials are not configured, returns a local dev upload URL.
   */
  async generateUploadUrl(filename: string, contentType: string) {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${crypto.randomUUID()}-${sanitizedFilename}`;

    if (!this.isConfigured || !this.s3Client || !this.bucketName) {
      // Local dev fallback URL
      const appPort = process.env.PORT || 3001;
      const devUploadUrl = `http://localhost:${appPort}/files/dev-upload?key=${encodeURIComponent(storageKey)}`;
      return {
        uploadUrl: devUploadUrl,
        storageKey,
        provider: 'local-dev',
      };
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        ContentType: contentType || 'application/octet-stream',
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      return { uploadUrl, storageKey, provider: this.provider };
    } catch (err: any) {
      this.logger.error(`Error generating presigned upload URL: ${err.message}`, err);
      throw err;
    }
  }

  /**
   * Generates a signed download URL or returns the public CDN URL for a file
   */
  async generateDownloadUrl(id: number, fallbackName?: string) {
    let [file] = await this.dbService.db
      .select()
      .from(schema.files)
      .where(eq(schema.files.id, id));

    if (!file && fallbackName) {
      const files = await this.dbService.db
        .select()
        .from(schema.files)
        .where(eq(schema.files.name, fallbackName))
        .orderBy(desc(schema.files.createdAt))
        .limit(1);
      file = files[0];
    }

    if (!file) {
      throw new NotFoundException(`File not found`);
    }

    // Direct URL exists and is valid
    if (file.url && file.url !== '#' && file.url !== '') {
      return { downloadUrl: file.url };
    }

    if (!file.storageKey) {
      throw new NotFoundException('File does not have an associated storage key or URL');
    }

    // If public CDN is configured, use it
    if (this.publicUrl) {
      return { downloadUrl: `${this.publicUrl}/${file.storageKey}` };
    }

    // Generate signed download URL if S3/R2 client is configured
    if (this.isConfigured && this.s3Client && this.bucketName) {
      try {
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: file.storageKey,
          ResponseContentDisposition: `attachment; filename="${encodeURIComponent(file.name)}"`,
        });

        const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
        return { downloadUrl };
      } catch (err: any) {
        this.logger.error(`Failed to generate signed download URL for file ${id}: ${err.message}`, err);
        throw err;
      }
    }

    // Dev mode fallback
    return { downloadUrl: file.url || `#dev-file-${file.storageKey}` };
  }

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

  async update(id: number, updateFileDto: UpdateFileDto) {
    await this.findOne(id);
    const [updated] = await this.dbService.db
      .update(schema.files)
      .set(updateFileDto)
      .where(eq(schema.files.id, id))
      .returning();

    return updated;
  }

  async remove(id: number) {
    const file = await this.findOne(id);

    if (file.storageKey && this.isConfigured && this.s3Client && this.bucketName) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: file.storageKey,
        });
        await this.s3Client.send(command);
      } catch (r2Err) {
        this.logger.warn(`Could not delete file ${file.storageKey} from object storage: ${r2Err}`);
      }
    }

    const [deleted] = await this.dbService.db
      .delete(schema.files)
      .where(eq(schema.files.id, id))
      .returning();

    return { message: 'File deleted successfully', file: deleted };
  }
}

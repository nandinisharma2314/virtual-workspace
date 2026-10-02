import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Headers,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FilesService } from './files.service.js';
import { CreateFileDto } from './dto/create-file.dto.js';
import { UpdateFileDto } from './dto/update-file.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('files')
@UseGuards(AuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('storage-status')
  getStorageStatus() {
    return this.filesService.getStorageStatus();
  }

  @Get('upload-url')
  getUploadUrl(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    if (!filename || !contentType) {
      throw new BadRequestException('filename and contentType query parameters are required');
    }
    return this.filesService.generateUploadUrl(filename, contentType);
  }

  @Get(':id/download-url')
  getDownloadUrl(@Param('id') id: string, @Query('name') name?: string) {
    return this.filesService.generateDownloadUrl(+id, name);
  }

  @Post()
  async create(
    @Body() createFileDto: CreateFileDto,
    @Req() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
  ) {
    try {
      const userId = req.user.sub;
      const rawWsId = (createFileDto as any).workspaceId || wsIdHeader;
      const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
      return await this.filesService.create(createFileDto, userId, workspaceId);
    } catch (err: any) {
      throw new InternalServerErrorException(`FilesController error: ${err.message || JSON.stringify(err)}`);
    }
  }

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Headers('x-workspace-id') wsIdHeader?: string,
    @Query('workspaceId') wsIdQuery?: string,
  ) {
    const rawWsId = wsIdHeader || wsIdQuery;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    return this.filesService.findAll(projectId ? +projectId : undefined, workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}

/**
 * Public controller for local development simulated uploads
 * (when Cloudflare R2 / AWS S3 are not configured in dev)
 */
@Controller('files')
export class FilesDevController {
  @Put('dev-upload')
  handleDevUpload(@Query('key') key: string) {
    return {
      success: true,
      message: 'Local development file uploaded successfully',
      key: key || 'local-dev-key',
    };
  }
}

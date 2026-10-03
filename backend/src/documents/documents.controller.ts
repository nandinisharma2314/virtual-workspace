import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Headers,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';

@Controller('documents')
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Post()
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
  ) {
    const userId = req.user.sub;
    const rawWsId = (createDocumentDto as any).workspaceId || wsIdHeader;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    if (workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('documents:manage')) {
        throw new ForbiddenException('You do not have permission to create documents in this workspace');
      }
    }
    return this.documentsService.create(createDocumentDto, userId, workspaceId);
  }

  @Get()
  findAll(
    @Headers('x-workspace-id') wsIdHeader?: string,
    @Query('workspaceId') wsIdQuery?: string,
  ) {
    const rawWsId = wsIdHeader || wsIdQuery;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    return this.documentsService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Req() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
  ) {
    const userId = req.user.sub;
    const doc = await this.documentsService.findOne(+id);
    const targetWsId = doc?.workspaceId || (wsIdHeader && !isNaN(Number(wsIdHeader)) ? Number(wsIdHeader) : undefined);
    if (targetWsId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, targetWsId);
      if (!auth.isOwner && !auth.permissions.includes('documents:manage')) {
        throw new ForbiddenException('You do not have permission to edit documents in this workspace');
      }
    }
    return this.documentsService.update(+id, updateDocumentDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
  ) {
    const userId = req.user.sub;
    const doc = await this.documentsService.findOne(+id);
    const targetWsId = doc?.workspaceId || (wsIdHeader && !isNaN(Number(wsIdHeader)) ? Number(wsIdHeader) : undefined);
    if (targetWsId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, targetWsId);
      if (!auth.isOwner && !auth.permissions.includes('documents:manage')) {
        throw new ForbiddenException('You do not have permission to delete documents in this workspace');
      }
    }
    return this.documentsService.remove(+id);
  }
}

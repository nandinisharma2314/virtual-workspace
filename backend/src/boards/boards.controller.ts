import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  Headers,
  ParseIntPipe,
  ForbiddenException,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BoardsService } from './boards.service.js';
import { CreateBoardDto, UpdateBoardDto, CreateBoardListDto, UpdateBoardListDto, MoveCardDto } from './dto/boards.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { WorkspacesService } from '../workspaces/workspaces.service.js';

@Controller('boards')
@UseGuards(AuthGuard)
export class BoardsController {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateBoardDto,
    @Req() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
  ) {
    const userId = req.user.sub;
    const rawWsId = dto.workspaceId || wsIdHeader;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required (in body or x-workspace-id header)');
    }
    dto.workspaceId = workspaceId;

    const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, workspaceId);
    if (!auth.isOwner && !auth.permissions.includes('boards:create')) {
      throw new ForbiddenException('You do not have permission to create boards in this workspace');
    }

    return this.boardsService.createBoard(userId, dto);
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
    @Query('workspaceId') wsIdQuery?: string,
  ) {
    const userId = req.user.sub;
    const rawWsId = wsIdHeader || wsIdQuery;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required (in query or x-workspace-id header)');
    }

    const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, workspaceId);
    const hasReadAll = auth.isOwner || auth.permissions.includes('boards:read_all');

    return this.boardsService.findAllBoards(workspaceId, userId, hasReadAll);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    const board = await this.boardsService.findOneBoard(id);
    if (board?.workspaceId) {
      // Validate workspace membership
      await this.workspacesService.getUserPermissionsInWorkspace(userId, board.workspaceId);
    }
    return board;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBoardDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const board = await this.boardsService.findOneBoard(id);
    if (board?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, board.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('boards:edit')) {
        throw new ForbiddenException('You do not have permission to edit this board');
      }
    }
    return this.boardsService.updateBoard(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    const board = await this.boardsService.findOneBoard(id);
    if (board?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, board.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('boards:delete')) {
        throw new ForbiddenException('You do not have permission to delete this board');
      }
    }
    return this.boardsService.deleteBoard(id);
  }

  // --- Board Lists (Columns) ---

  @Post(':id/lists')
  async createList(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateBoardListDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const board = await this.boardsService.findOneBoard(id);
    if (board?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, board.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('boards:edit')) {
        throw new ForbiddenException('You do not have permission to add lists to this board');
      }
    }
    return this.boardsService.createList(id, dto);
  }

  @Patch(':id/lists/:listId')
  async updateList(
    @Param('id', ParseIntPipe) id: number,
    @Param('listId', ParseIntPipe) listId: number,
    @Body() dto: UpdateBoardListDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const board = await this.boardsService.findOneBoard(id);
    if (board?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, board.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('boards:edit')) {
        throw new ForbiddenException('You do not have permission to update lists on this board');
      }
    }
    return this.boardsService.updateList(id, listId, dto);
  }

  @Delete(':id/lists/:listId')
  async removeList(
    @Param('id', ParseIntPipe) id: number,
    @Param('listId', ParseIntPipe) listId: number,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const board = await this.boardsService.findOneBoard(id);
    if (board?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, board.workspaceId);
      if (!auth.isOwner && !auth.permissions.includes('boards:edit')) {
        throw new ForbiddenException('You do not have permission to delete lists on this board');
      }
    }
    return this.boardsService.deleteList(id, listId);
  }

  // --- Moving Cards between Lists ---

  @HttpCode(200)
  @Patch(':id/cards/move')
  async moveCard(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MoveCardDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const board = await this.boardsService.findOneBoard(id);
    if (board?.workspaceId) {
      const auth = await this.workspacesService.getUserPermissionsInWorkspace(userId, board.workspaceId);
      const canEdit =
        auth.isOwner ||
        auth.permissions.includes('boards:edit') ||
        auth.permissions.includes('tasks:edit_all') ||
        auth.permissions.includes('tasks:edit_assigned') ||
        auth.permissions.includes('tasks:edit');
      if (!canEdit) {
        throw new ForbiddenException('You do not have permission to move cards on this board');
      }
    }
    return this.boardsService.moveCard(id, dto, userId);
  }
}

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { eq, and, desc, asc, inArray, or } from 'drizzle-orm';
import { CreateBoardDto, UpdateBoardDto, CreateBoardListDto, UpdateBoardListDto, MoveCardDto } from './dto/boards.dto.js';

@Injectable()
export class BoardsService {
  constructor(private readonly dbService: DatabaseService) {}

  async createBoard(userId: number, dto: CreateBoardDto) {
    if (!dto.workspaceId) {
      throw new BadRequestException('Workspace ID is required to create a board');
    }

    const title = dto.title || (dto as any).name || 'Untitled Board';
    const [board] = await this.dbService.db
      .insert(schema.boards)
      .values({
        workspaceId: dto.workspaceId,
        projectId: dto.projectId || null,
        title,
        description: dto.description || null,
        bgGradient: dto.bgGradient || 'from-indigo-600 to-purple-600',
        isPrivate: dto.isPrivate || false,
        creatorId: userId,
      })
      .returning();

    // Add creator to boardMembers
    await this.dbService.db.insert(schema.boardMembers).values({
      boardId: board.id,
      userId,
      role: 'admin',
    });

    // Seed default Kanban lists
    const defaultLists = [
      { title: 'To Do', accent: 'bg-gray-400', position: 0 },
      { title: 'In Progress', accent: 'bg-blue-500', position: 1 },
      { title: 'In Review', accent: 'bg-amber-500', position: 2 },
      { title: 'Done', accent: 'bg-emerald-500', position: 3 },
    ];

    for (const l of defaultLists) {
      await this.dbService.db.insert(schema.boardLists).values({
        boardId: board.id,
        title: l.title,
        accent: l.accent,
        position: l.position,
      });
    }

    return this.findOneBoard(board.id);
  }

  async findAllBoards(workspaceId: number, userId: number, hasReadAll: boolean = true) {
    let boardList = await this.dbService.db
      .select({
        id: schema.boards.id,
        workspaceId: schema.boards.workspaceId,
        projectId: schema.boards.projectId,
        title: schema.boards.title,
        description: schema.boards.description,
        bgGradient: schema.boards.bgGradient,
        isPrivate: schema.boards.isPrivate,
        creatorId: schema.boards.creatorId,
        createdAt: schema.boards.createdAt,
        updatedAt: schema.boards.updatedAt,
      })
      .from(schema.boards)
      .where(eq(schema.boards.workspaceId, workspaceId))
      .orderBy(desc(schema.boards.createdAt));

    if (!hasReadAll) {
      // Find boards where user is creator or member
      const userBoardMemberships = await this.dbService.db
        .select({ boardId: schema.boardMembers.boardId })
        .from(schema.boardMembers)
        .where(eq(schema.boardMembers.userId, userId));
      const memberBoardIds = new Set(userBoardMemberships.map((m) => m.boardId));

      boardList = boardList.filter((b) => !b.isPrivate || b.creatorId === userId || memberBoardIds.has(b.id));
    }

    // Attach list and card counts
    const allLists = await this.dbService.db
      .select({ id: schema.boardLists.id, boardId: schema.boardLists.boardId })
      .from(schema.boardLists)
      .where(inArray(schema.boardLists.boardId, boardList.map(b => b.id).concat([-1])));

    const allTasks = await this.dbService.db
      .select({ id: schema.tasks.id, boardId: schema.tasks.boardId })
      .from(schema.tasks)
      .where(eq(schema.tasks.workspaceId, workspaceId));

    return boardList.map((b) => {
      const bLists = allLists.filter((l) => l.boardId === b.id);
      const bTasks = allTasks.filter((t) => t.boardId === b.id);
      return {
        ...b,
        listCount: bLists.length,
        taskCount: bTasks.length,
      };
    });
  }

  async findOneBoard(boardId: number) {
    const [board] = await this.dbService.db
      .select()
      .from(schema.boards)
      .where(eq(schema.boards.id, boardId));

    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }

    const lists = await this.dbService.db
      .select()
      .from(schema.boardLists)
      .where(eq(schema.boardLists.boardId, boardId))
      .orderBy(asc(schema.boardLists.position));

    // Fetch tasks belonging to this board or default workspace tasks mapped by status
    const tasks = await this.dbService.db
      .select({
        id: schema.tasks.id,
        title: schema.tasks.title,
        description: schema.tasks.description,
        status: schema.tasks.status,
        priority: schema.tasks.priority,
        projectId: schema.tasks.projectId,
        sprintId: schema.tasks.sprintId,
        boardId: schema.tasks.boardId,
        boardListId: schema.tasks.boardListId,
        order: schema.tasks.order,
        assigneeId: schema.tasks.assigneeId,
        estimatedHours: schema.tasks.estimatedHours,
        storyPoints: schema.tasks.storyPoints,
        issueType: schema.tasks.issueType,
        coverColor: schema.tasks.coverColor,
        dueDate: schema.tasks.dueDate,
        completedAt: schema.tasks.completedAt,
        createdAt: schema.tasks.createdAt,
        assigneeName: schema.users.name,
        assigneeAvatar: schema.users.avatar,
        assigneeEmail: schema.users.email,
      })
      .from(schema.tasks)
      .leftJoin(schema.users, eq(schema.tasks.assigneeId, schema.users.id))
      .where(
        or(
          eq(schema.tasks.boardId, boardId),
          and(eq(schema.tasks.workspaceId, board.workspaceId), eq(schema.tasks.boardId, boardId))
        )
      )
      .orderBy(asc(schema.tasks.order), asc(schema.tasks.id));

    // Also fetch checklists and comments counts
    const taskIds = tasks.map((t) => t.id);
    let checklists: any[] = [];
    let checklistItems: any[] = [];
    let comments: any[] = [];

    if (taskIds.length > 0) {
      checklists = await this.dbService.db
        .select()
        .from(schema.taskChecklists)
        .where(inArray(schema.taskChecklists.taskId, taskIds));

      if (checklists.length > 0) {
        checklistItems = await this.dbService.db
          .select()
          .from(schema.taskChecklistItems)
          .where(inArray(schema.taskChecklistItems.checklistId, checklists.map(c => c.id)));
      }

      comments = await this.dbService.db
        .select({ id: schema.taskComments.id, taskId: schema.taskComments.taskId })
        .from(schema.taskComments)
        .where(inArray(schema.taskComments.taskId, taskIds));
    }

    const populatedLists = lists.map((list) => {
      const listTasks = tasks
        .filter((t) => t.boardListId === list.id || (!t.boardListId && this.statusMatchesList(t.status, list.title)))
        .map((t) => {
          const tChecklists = checklists.filter((c) => c.taskId === t.id);
          const tItems = checklistItems.filter((i) => tChecklists.some((c) => c.id === i.checklistId));
          const completedItems = tItems.filter((i) => i.isCompleted).length;
          const tCommentsCount = comments.filter((c) => c.taskId === t.id).length;

          return {
            ...t,
            checklistTotal: tItems.length,
            checklistCompleted: completedItems,
            commentsCount: tCommentsCount,
          };
        });

      return {
        ...list,
        tasks: listTasks,
      };
    });

    return {
      ...board,
      lists: populatedLists,
    };
  }

  private statusMatchesList(taskStatus?: string, listTitle?: string): boolean {
    if (!taskStatus || !listTitle) return false;
    const s = taskStatus.toLowerCase().replace(/_/g, '').replace(/-/g, '');
    const t = listTitle.toLowerCase().replace(/_/g, '').replace(/-/g, '').replace(/\s+/g, '');
    if (t.includes('todo') && (s === 'todo' || s === 'planned')) return true;
    if (t.includes('progress') && (s === 'inprogress' || s === 'doing')) return true;
    if (t.includes('review') && (s === 'review' || s === 'inreview')) return true;
    if ((t.includes('done') || t.includes('complete')) && (s === 'done' || s === 'completed')) return true;
    return false;
  }

  async updateBoard(boardId: number, dto: UpdateBoardDto) {
    const [updated] = await this.dbService.db
      .update(schema.boards)
      .set({
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.bgGradient !== undefined ? { bgGradient: dto.bgGradient } : {}),
        ...(dto.isPrivate !== undefined ? { isPrivate: dto.isPrivate } : {}),
        updatedAt: new Date(),
      })
      .where(eq(schema.boards.id, boardId))
      .returning();

    return updated;
  }

  async deleteBoard(boardId: number) {
    await this.dbService.db.delete(schema.boards).where(eq(schema.boards.id, boardId));
    return { success: true, message: 'Board deleted successfully' };
  }

  async createList(boardId: number, dto: CreateBoardListDto) {
    const existingLists = await this.dbService.db
      .select({ id: schema.boardLists.id })
      .from(schema.boardLists)
      .where(eq(schema.boardLists.boardId, boardId));

    const position = dto.position !== undefined ? dto.position : existingLists.length;

    const [list] = await this.dbService.db
      .insert(schema.boardLists)
      .values({
        boardId,
        title: dto.title,
        accent: dto.accent || 'bg-gray-400',
        position,
      })
      .returning();

    return list;
  }

  async updateList(boardId: number, listId: number, dto: UpdateBoardListDto) {
    const [updated] = await this.dbService.db
      .update(schema.boardLists)
      .set({
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.accent ? { accent: dto.accent } : {}),
        ...(dto.position !== undefined ? { position: dto.position } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(schema.boardLists.id, listId), eq(schema.boardLists.boardId, boardId)))
      .returning();

    return updated;
  }

  async deleteList(boardId: number, listId: number) {
    await this.dbService.db
      .delete(schema.boardLists)
      .where(and(eq(schema.boardLists.id, listId), eq(schema.boardLists.boardId, boardId)));

    return { success: true, message: 'List deleted successfully' };
  }

  async moveCard(boardId: number, dto: MoveCardDto, userId?: number) {
    const [targetList] = await this.dbService.db
      .select()
      .from(schema.boardLists)
      .where(and(eq(schema.boardLists.id, dto.targetListId), eq(schema.boardLists.boardId, boardId)));

    if (!targetList) {
      throw new NotFoundException('Target list not found on this board');
    }

    let status = dto.status;
    if (!status) {
      const titleLower = targetList.title.toLowerCase();
      if (titleLower.includes('done') || titleLower.includes('complete')) status = 'completed';
      else if (titleLower.includes('progress')) status = 'in_progress';
      else if (titleLower.includes('review')) status = 'review';
      else status = 'todo';
    }

    const [updated] = await this.dbService.db
      .update(schema.tasks)
      .set({
        boardId,
        boardListId: dto.targetListId,
        status,
        order: dto.newOrder !== undefined ? dto.newOrder : 0,
        completedAt: status === 'completed' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, dto.taskId))
      .returning();

    if (userId) {
      await this.dbService.db.insert(schema.taskActivities).values({
        taskId: dto.taskId,
        userId,
        action: 'moved_list',
        details: { targetListId: dto.targetListId, targetListTitle: targetList.title, status },
      });
    }

    return updated;
  }
}

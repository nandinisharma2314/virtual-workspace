import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Headers, Query } from '@nestjs/common';
import { MeetingsService } from './meetings.service.js';
import { CreateMeetingDto } from './dto/create-meeting.dto.js';
import { UpdateMeetingDto } from './dto/update-meeting.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('meetings')
@UseGuards(AuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(
    @Body() createMeetingDto: CreateMeetingDto,
    @Request() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
  ) {
    const rawWsId = (createMeetingDto as any).workspaceId || wsIdHeader;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    return this.meetingsService.create(createMeetingDto, req.user.sub, workspaceId);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
    @Query('workspaceId') wsIdQuery?: string,
  ) {
    const rawWsId = wsIdHeader || wsIdQuery;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    return this.meetingsService.findAll(req.user.sub, workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMeetingDto: UpdateMeetingDto,
    @Request() req: any,
  ) {
    return this.meetingsService.update(+id, updateMeetingDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.meetingsService.remove(+id, req.user.sub);
  }
}

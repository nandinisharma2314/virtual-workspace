import { Controller, Get, Patch, Param, UseGuards, Request, Headers, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('user-notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Request() req: any,
    @Headers('x-workspace-id') wsIdHeader?: string,
    @Query('workspaceId') wsIdQuery?: string,
  ) {
    const rawWsId = wsIdHeader || wsIdQuery;
    const workspaceId = rawWsId && !isNaN(Number(rawWsId)) ? Number(rawWsId) : undefined;
    return this.notificationsService.getUserNotifications(req.user.sub, workspaceId);
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(Number(id), req.user.sub);
  }
}

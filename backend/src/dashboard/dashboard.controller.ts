import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@Req() req: any) {
    const userId = req.user.sub;
    return this.dashboardService.getDashboardData(userId);
  }
}

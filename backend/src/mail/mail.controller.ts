import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('api/mail')
@UseGuards(AuthGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('invite')
  async invite(@Body() body: { email: string; inviterName?: string; channelName?: string }) {
    await this.mailService.sendInvitation(body.email, body.inviterName, body.channelName);
    return { status: 'ok' };
  }
}

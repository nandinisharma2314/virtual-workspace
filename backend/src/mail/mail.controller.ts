import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service.js';

@Controller('api/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('invite')
  async invite(@Body() body: { email: string; inviterName?: string; channelName?: string }) {
    await this.mailService.sendInvitation(body.email, body.inviterName, body.channelName);
    return { status: 'ok' };
  }
}

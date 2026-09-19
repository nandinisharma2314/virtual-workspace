import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private escapeHtml(str: string): string {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async sendInvitation(email: string, inviterName: string = 'A teammate', channelName: string = 'WorkFlow') {
    const safeInviter = this.escapeHtml(inviterName);
    const safeChannel = this.escapeHtml(channelName);
    try {
      await this.transporter.sendMail({
        from: `"WorkFlow Connect" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `You've been invited to collaborate on ${safeChannel}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; background-color: #F8FAFC;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <div style="background-color: #1164A3; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">WorkFlow Connect</h1>
              </div>
              <div style="padding: 40px;">
                <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">You're Invited!</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                  <strong>${safeInviter}</strong> has invited you to collaborate securely in the <strong>${safeChannel}</strong> channel.
                </p>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  WorkFlow Connect allows external partners to seamlessly communicate, share files, and manage projects without leaving their own workspace.
                </p>
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?invite=true&email=${encodeURIComponent(email)}&channel=${encodeURIComponent(channelName)}" style="display: inline-block; background-color: #1164A3; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px;">Accept Invitation</a>
                </div>
              </div>
              <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  Sent from WorkFlow. Secure collaboration for modern teams.
                </p>
              </div>
            </div>
          </div>
        `,
      });
      this.logger.log(`Invitation email sent to ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw error;
    }
  }
}

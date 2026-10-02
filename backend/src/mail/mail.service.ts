import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface WorkspaceInvitationOptions {
  email: string;
  inviterName: string;
  workspaceName: string;
  roleName: string;
  inviteLink: string;
  isNewUser?: boolean;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);
  private isConfigured = false;
  private fromAddress: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const service = process.env.SMTP_SERVICE;

    this.fromAddress = process.env.SMTP_FROM || (user ? `"WorkFlow" <${user}>` : '"WorkFlow" <no-reply@workflow.local>');

    if (host && user && pass) {
      // Custom SMTP configuration (e.g. Resend, SendGrid, Postmark, Mailpit, Amazon SES)
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.isConfigured = true;
      this.logger.log(`MailService initialized with SMTP host: ${host}:${port} (secure: ${secure})`);
    } else if (service && user && pass) {
      // Well-known service configuration (e.g. Gmail)
      this.transporter = nodemailer.createTransport({
        service,
        auth: { user, pass },
      });
      this.isConfigured = true;
      this.logger.log(`MailService initialized with service provider: ${service}`);
    } else if (user && pass) {
      // Default to Gmail if user/pass are provided without explicit host
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
      this.isConfigured = true;
      this.logger.log('MailService initialized with default Gmail transport');
    } else {
      this.logger.warn(
        'MailService is running in DEVELOPMENT mode (SMTP credentials not configured). Emails will be logged to the console.',
      );
      this.isConfigured = false;
    }
  }

  private escapeHtml(str: string): string {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Send a password reset email
   */
  async sendPasswordReset(email: string, resetLink: string) {
    const safeEmail = this.escapeHtml(email);

    if (!this.isConfigured || !this.transporter) {
      this.logger.log(`\n======================================================
[DEV EMAIL PREVIEW - PASSWORD RESET]
To: ${email}
Subject: Reset your WorkFlow password
Reset Link: ${resetLink}
======================================================\n`);
      return { success: true, devMode: true };
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: email,
        subject: 'Reset your WorkFlow password',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; background-color: #F8FAFC;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px;">WorkFlow</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">Secure. Reliable. Built for teams.</p>
              </div>
              <div style="padding: 40px;">
                <h2 style="color: #1e293b; font-size: 22px; margin-top: 0; font-weight: 700;">Reset your password</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                  We received a request to reset the password for your account associated with <strong>${safeEmail}</strong>.
                </p>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  Click the button below to choose a new password. This link will expire in <strong>1 hour</strong>.
                </p>
                <div style="text-align: center; margin-bottom: 30px;">
                  <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 0.2px;">Reset Password</a>
                </div>
                <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 0;">
                  If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.<br><br>
                  Or copy and paste this URL into your browser:<br>
                  <a href="${resetLink}" style="color: #7c3aed; word-break: break-all;">${resetLink}</a>
                </p>
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
      this.logger.log(`Password reset email sent to ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }

  /**
   * Send a workspace invitation email
   */
  async sendWorkspaceInvitation(options: WorkspaceInvitationOptions) {
    const { email, inviterName, workspaceName, roleName, inviteLink, isNewUser } = options;
    const safeInviter = this.escapeHtml(inviterName || 'A teammate');
    const safeWorkspace = this.escapeHtml(workspaceName || 'WorkFlow Workspace');
    const safeRole = this.escapeHtml(roleName || 'Member');

    if (!this.isConfigured || !this.transporter) {
      this.logger.log(`\n======================================================
[DEV EMAIL PREVIEW - WORKSPACE INVITATION]
To: ${email}
Inviter: ${safeInviter}
Workspace: ${safeWorkspace}
Role: ${safeRole}
Status: ${isNewUser ? 'New User (Invite Link)' : 'Existing User (Direct Access)'}
Link: ${inviteLink}
======================================================\n`);
      return { success: true, devMode: true };
    }

    try {
      const subject = isNewUser
        ? `${safeInviter} invited you to join "${safeWorkspace}" on WorkFlow`
        : `You have been added to "${safeWorkspace}" on WorkFlow`;

      const buttonText = isNewUser ? 'Accept Invitation & Join' : 'Open Workspace';

      await this.transporter.sendMail({
        from: this.fromAddress,
        to: email,
        subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; background-color: #0F172A; color: #F8FAFC;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1E293B; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
              <div style="background: linear-gradient(135deg, #6366F1 0%, #A855F7 100%); padding: 36px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">WorkFlow</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 14px; font-weight: 500;">Unified Multi-Tenant Workspace & Team Collaboration</p>
              </div>
              <div style="padding: 36px 32px;">
                <h2 style="color: #F8FAFC; font-size: 22px; margin-top: 0; font-weight: 700;">
                  ${isNewUser ? "You've been invited!" : "You're added to a new workspace!"}
                </h2>
                <p style="color: #CBD5E1; font-size: 16px; line-height: 1.6;">
                  <strong>${safeInviter}</strong> has invited you to collaborate in the <strong>${safeWorkspace}</strong> workspace as <strong>${safeRole}</strong>.
                </p>
                <div style="background-color: #0F172A; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #334155;">
                  <div style="display: flex; margin-bottom: 8px;">
                    <span style="color: #94A3B8; font-size: 14px; width: 100px;">Workspace:</span>
                    <strong style="color: #E2E8F0; font-size: 14px;">${safeWorkspace}</strong>
                  </div>
                  <div style="display: flex; margin-bottom: 8px;">
                    <span style="color: #94A3B8; font-size: 14px; width: 100px;">Assigned Role:</span>
                    <span style="background-color: #312E81; color: #C7D2FE; font-size: 12px; font-weight: 600; padding: 2px 10px; border-radius: 9999px;">${safeRole}</span>
                  </div>
                  <div style="display: flex;">
                    <span style="color: #94A3B8; font-size: 14px; width: 100px;">Invited By:</span>
                    <strong style="color: #E2E8F0; font-size: 14px;">${safeInviter}</strong>
                  </div>
                </div>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #A855F7 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);">${buttonText}</a>
                </div>
                <p style="color: #64748B; font-size: 13px; line-height: 1.6; margin-bottom: 0;">
                  Button not working? Copy and paste the link below directly into your browser:<br>
                  <a href="${inviteLink}" style="color: #818CF8; word-break: break-all;">${inviteLink}</a>
                </p>
              </div>
              <div style="background-color: #0F172A; padding: 20px; text-align: center; border-top: 1px solid #334155;">
                <p style="color: #64748B; font-size: 12px; margin: 0;">
                  Sent with securely routed transactional mail from WorkFlow.
                </p>
              </div>
            </div>
          </div>
        `,
      });
      this.logger.log(`Workspace invitation email sent to ${email} for workspace "${workspaceName}"`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send workspace invitation email to ${email}`, error);
      throw error;
    }
  }

  /**
   * Send a channel invitation email
   */
  async sendInvitation(email: string, inviterName: string = 'A teammate', channelName: string = 'WorkFlow') {
    const safeInviter = this.escapeHtml(inviterName);
    const safeChannel = this.escapeHtml(channelName);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteUrl = `${frontendUrl}/register?invite=true&email=${encodeURIComponent(email)}&channel=${encodeURIComponent(channelName)}`;

    if (!this.isConfigured || !this.transporter) {
      this.logger.log(`\n======================================================
[DEV EMAIL PREVIEW - CHANNEL INVITATION]
To: ${email}
Inviter: ${safeInviter}
Channel: ${safeChannel}
Invite Link: ${inviteUrl}
======================================================\n`);
      return { success: true, devMode: true };
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
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
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteUrl}" style="display: inline-block; background-color: #1164A3; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px;">Accept Invitation</a>
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

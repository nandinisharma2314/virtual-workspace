import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { messages, users, channels, channelMembers } from '../database/schema.js';
import { eq, desc, inArray, or, and, sql, isNull, ilike } from 'drizzle-orm';
import * as nodemailer from 'nodemailer';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class ChatService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
  ) {}

  async getMessagesByChannel(channelId: string, userId?: number) {
    // Check channel access if not c-general and not dm-
    if (channelId !== 'c-general' && !channelId.startsWith('dm-') && userId) {
      const [dbChannel] = await this.dbService.db
        .select()
        .from(channels)
        .where(eq(channels.id, channelId));

      if (dbChannel) {
        const [requester] = await this.dbService.db.select().from(users).where(eq(users.id, userId));
        const isAdmin = requester?.role === 'Admin';
        const isCreator = dbChannel.creatorId === userId;
        const [membership] = await this.dbService.db
          .select()
          .from(channelMembers)
          .where(and(
            eq(channelMembers.channelId, channelId),
            eq(channelMembers.userId, userId),
            eq(channelMembers.status, 'accepted')
          ));

        if (!isAdmin && !isCreator && !membership) {
          return [];
        }
      }
    }

    const rawMessages = await this.dbService.db
      .select({
        id: messages.id,
        content: messages.content,
        channelId: messages.channelId,
        createdAt: messages.createdAt,
        senderId: users.id,
        senderName: users.name,
        senderAvatar: users.avatar,
        parentId: messages.parentId,
        reactions: messages.reactions,
        isEdited: messages.isEdited,
        attachments: messages.attachments,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.channelId, channelId))
      .orderBy(messages.createdAt);

    return rawMessages.map(m => ({
      id: m.id.toString(),
      text: m.content,
      senderName: m.senderName || 'Unknown',
      senderPerson: m.senderName?.split(' ')[0].toLowerCase() || 'unknown',
      senderAvatar: m.senderAvatar || undefined,
      timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channelId: m.channelId,
      parentId: m.parentId?.toString(),
      reactions: m.reactions || {},
      isEdited: m.isEdited,
      attachment: m.attachments?.[0] || undefined
    }));
  }

  async saveMessage(userId: number, content: string, channelId: string, parentId?: number, attachment?: any) {
    const [saved] = await this.dbService.db
      .insert(messages)
      .values({
        content,
        senderId: userId,
        channelId: channelId,
        parentId: parentId || null,
        attachments: attachment ? [attachment] : null,
      })
      .returning();
      
    // Fetch user details for the broadcast
    const [user] = await this.dbService.db
      .select({ name: users.name, role: users.role, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, userId));
      
    if (user && user.role === 'Admin') {
      await this.notificationsService.notifyAllExcept(userId, `Admin ${user.name} sent a message in ${channelId}: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`);
    }

    return {
      id: saved.id.toString(),
      text: saved.content,
      senderName: user?.name || 'Unknown',
      senderPerson: user?.name?.split(' ')[0].toLowerCase() || 'unknown',
      senderAvatar: user?.avatar || undefined,
      timestamp: new Date(saved.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channelId: saved.channelId,
      parentId: saved.parentId?.toString(),
      reactions: {},
      isEdited: false,
      attachment: saved.attachments?.[0] || undefined
    };
  }

  async editMessage(messageId: number, userId: number, newContent: string) {
    const [msg] = await this.dbService.db.select().from(messages).where(eq(messages.id, messageId));
    if (!msg) throw new NotFoundException('Message not found');

    const [user] = await this.dbService.db.select().from(users).where(eq(users.id, userId));
    if (msg.senderId !== userId && user?.role !== 'Admin') {
      throw new ForbiddenException('You cannot edit this message');
    }

    const [updated] = await this.dbService.db
      .update(messages)
      .set({ content: newContent, isEdited: true, updatedAt: new Date() })
      .where(eq(messages.id, messageId))
      .returning();

    return {
      id: updated.id.toString(),
      text: updated.content,
      isEdited: updated.isEdited
    };
  }

  async deleteMessage(messageId: number, userId: number) {
    const [msg] = await this.dbService.db.select().from(messages).where(eq(messages.id, messageId));
    if (!msg) throw new NotFoundException('Message not found');

    const [user] = await this.dbService.db.select().from(users).where(eq(users.id, userId));
    if (msg.senderId !== userId && user?.role !== 'Admin') {
      throw new ForbiddenException('You cannot delete this message');
    }

    await this.dbService.db.delete(messages).where(eq(messages.id, messageId));
    return { success: true };
  }

  async addReaction(messageId: number, userId: number, emoji: string) {
    const [msg] = await this.dbService.db.select().from(messages).where(eq(messages.id, messageId));
    if (!msg) throw new NotFoundException('Message not found');

    const reactions: Record<string, number[]> = (msg.reactions as Record<string, number[]>) || {};
    
    // Toggle reaction
    if (reactions[emoji] && reactions[emoji].includes(userId)) {
      reactions[emoji] = reactions[emoji].filter(id => id !== userId);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    } else {
      if (!reactions[emoji]) reactions[emoji] = [];
      reactions[emoji].push(userId);
    }

    await this.dbService.db
      .update(messages)
      .set({ reactions })
      .where(eq(messages.id, messageId));
      
    return reactions;
  }

  async getChannelsForUser(userId: number) {
    const [currentUser] = await this.dbService.db.select().from(users).where(eq(users.id, userId));
    if (!currentUser) return [];

    // Strict privacy for all users:
    // Only return channels where the user is an accepted member, or the creator, or the default general channel
    const rawUserChannels = await this.dbService.db
      .select({
        id: channels.id,
        name: channels.name,
        description: channels.description,
        creatorId: channels.creatorId,
        bgGradient: channels.bgGradient,
        isTemplate: channels.isTemplate,
        createdAt: channels.createdAt,
      })
      .from(channels)
      .leftJoin(channelMembers, eq(channels.id, channelMembers.channelId))
      .where(or(
        and(eq(channelMembers.userId, userId), eq(channelMembers.status, 'accepted')),
        eq(channels.creatorId, userId),
        eq(channels.id, 'c-general')
      ))
      .orderBy(desc(channels.createdAt));

    const seen = new Set<string>();
    const userChannels = rawUserChannels.filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

    // Enhance each channel with member count and latest message
    const enhanced = await Promise.all(
      userChannels.map(async (c) => {
        const memberRows = await this.dbService.db
          .select({ count: sql`count(*)` })
          .from(channelMembers)
          .where(and(eq(channelMembers.channelId, c.id), eq(channelMembers.status, 'accepted')));
        const membersCount = Number(memberRows[0]?.count || 1);

        const latestMsg = await this.dbService.db
          .select({
            id: messages.id,
            content: messages.content,
            createdAt: messages.createdAt,
            senderName: users.name,
          })
          .from(messages)
          .leftJoin(users, eq(messages.senderId, users.id))
          .where(eq(messages.channelId, c.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        return {
          ...c,
          membersCount,
          latestMessage: latestMsg[0]
            ? {
                text: latestMsg[0].content,
                senderName: latestMsg[0].senderName || 'Team member',
                time: new Date(latestMsg[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date(latestMsg[0].createdAt).toLocaleDateString(),
              }
            : null,
        };
      })
    );

    return enhanced;
  }

  async createChannel(name: string, description: string, creatorId: number, bgGradient?: string, memberEmails?: string[]) {
    const cleanName = name.replace(/^#\s*/, '').trim();
    const baseSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'channel';
    let channelId = 'c-' + baseSlug;

    // Check if channel already exists with this ID
    const existing = await this.dbService.db.select().from(channels).where(eq(channels.id, channelId));
    if (existing.length > 0) {
      channelId = `c-${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const gradients = [
      "from-indigo-600 via-indigo-700 to-purple-800",
      "from-indigo-600 via-purple-600 to-violet-700",
      "from-purple-700 via-violet-600 to-indigo-800",
      "from-slate-800 via-indigo-900 to-purple-900",
      "from-blue-600 via-indigo-600 to-violet-700",
      "from-indigo-700 via-purple-700 to-pink-700",
    ];
    const gradient = bgGradient || gradients[Math.floor(Math.random() * gradients.length)];

    await this.dbService.db
      .insert(channels)
      .values({
        id: channelId,
        name: cleanName,
        description: description || '',
        creatorId,
        bgGradient: gradient,
        isTemplate: false,
      });

    // Creator is always added as the initial channel member
    await this.dbService.db
      .insert(channelMembers)
      .values({
        channelId,
        userId: creatorId,
        addedById: creatorId,
        status: 'accepted',
      })
      .onConflictDoNothing();

    // If initial members were provided, add them now
    if (Array.isArray(memberEmails) && memberEmails.length > 0) {
      const [creator] = await this.dbService.db.select().from(users).where(eq(users.id, creatorId));
      const creatorName = creator?.name || 'A team member';

      for (const email of memberEmails) {
        if (email && typeof email === 'string' && email.trim()) {
          try {
            await this.addMemberByEmail(channelId, email.trim(), creatorId, creatorName);
          } catch (err) {
            console.error(`Failed to add initial member ${email}:`, err);
          }
        }
      }
    }

    // Fetch accurate member count
    const memberRows = await this.dbService.db
      .select({ count: sql`count(*)` })
      .from(channelMembers)
      .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.status, 'accepted')));
    const membersCount = Number(memberRows[0]?.count || 1);

    return { 
      id: channelId, 
      name: cleanName, 
      description, 
      creatorId,
      bgGradient: gradient,
      membersCount,
    };
  }

  private escapeHtml(str: string): string {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private buildInvitationEmailHtml({
    recipientName,
    inviterName,
    channelName,
    channelDescription,
    acceptUrl,
    declineUrl,
    isNewUser,
  }: {
    recipientName: string;
    inviterName: string;
    channelName: string;
    channelDescription?: string;
    acceptUrl: string;
    declineUrl?: string;
    isNewUser?: boolean;
  }): string {
    const safeRecipient = this.escapeHtml(recipientName);
    const safeInviter = this.escapeHtml(inviterName);
    const safeChannel = this.escapeHtml(channelName);
    const safeDescription = channelDescription ? this.escapeHtml(channelDescription) : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to join #${safeChannel}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); border: 1px solid #E2E8F0;" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 32px 28px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: rgba(255, 255, 255, 0.16); border-radius: 10px; padding: 6px 14px; margin-bottom: 10px;">
                      <span style="font-size: 16px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;">
                        ⚡ WorkFlow Connect
                      </span>
                    </div>
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.2px;">
                      You're Invited to Collaborate
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <p style="font-size: 15px; line-height: 22px; color: #334155; margin: 0 0 16px 0;">
                Hello <strong style="color: #0f172a;">${safeRecipient}</strong>,
              </p>
              
              <p style="font-size: 15px; line-height: 23px; color: #475569; margin: 0 0 22px 0;">
                <strong style="color: #4F46E5;">${safeInviter}</strong> has invited you to join and collaborate in the <strong style="color: #0f172a;">#${safeChannel}</strong> channel on WorkFlow Dashboard.
              </p>

              <!-- Channel Preview Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 26px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width: 32px; height: 32px; background-color: #EDE9FE; color: #6366F1; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px; font-weight: bold;">
                            #
                          </div>
                        </td>
                        <td style="padding-left: 12px;" valign="middle">
                          <div style="font-size: 15px; font-weight: 700; color: #0F172A;">
                            ${safeChannel}
                          </div>
                          ${safeDescription ? `
                          <div style="font-size: 12.5px; color: #64748B; margin-top: 3px; line-height: 17px;">
                            ${safeDescription}
                          </div>` : ''}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 22px;">
                <tr>
                  <td align="center">
                    <a href="${acceptUrl}" target="_blank" style="display: inline-block; background-color: #4F46E5; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 13px 32px; border-radius: 8px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25); text-align: center;">
                      ${isNewUser ? 'Create Account & Join Channel' : 'Accept Invitation & Join'} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              ${declineUrl ? `
              <p style="text-align: center; margin: 0 0 20px 0;">
                <a href="${declineUrl}" target="_blank" style="font-size: 12.5px; color: #94a3b8; text-decoration: none;">
                  Decline invitation
                </a>
              </p>` : ''}

              <div style="height: 1px; background-color: #F1F5F9; width: 100%; margin: 24px 0 16px 0;"></div>

              <p style="font-size: 11.5px; line-height: 16px; color: #94A3B8; margin: 0; text-align: center;">
                This link was sent securely to ${safeRecipient}. If you did not expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 18px 28px; border-top: 1px solid #F1F5F9; text-align: center;">
              <p style="font-size: 11.5px; color: #94A3B8; margin: 0;">
                WorkFlow &bull; Modern Team Collaboration &bull; Secure Workspaces
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private async sendActualEmail(to: string, subject: string, text: string, html?: string) {
    try {
      let transporter;
      
      // If the user has provided real SMTP credentials in their .env
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        // Fallback to ethereal for testing if no real credentials are provided
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const info = await transporter.sendMail({
        from: `"WorkFlow" <${process.env.SMTP_USER || 'no-reply@workflowdashboard.local'}>`,
        to,
        subject,
        text,
        html: html || undefined,
      });

      if (!process.env.SMTP_USER) {
        console.log(`[Email Sent to ${to}] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      } else {
        console.log(`[Email Sent to ${to}] Successfully delivered to real inbox!`);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  async addMemberByEmail(channelId: string, email: string, inviterId: number, inviterName: string = 'A team member') {
    if (!inviterId) {
      throw new ForbiddenException('Authentication required to add members.');
    }

    const [inviter] = await this.dbService.db.select().from(users).where(eq(users.id, inviterId));
    if (!inviter) {
      throw new ForbiddenException('User not found.');
    }

    const [channel] = await this.dbService.db.select().from(channels).where(eq(channels.id, channelId));
    if (!channel) {
      throw new NotFoundException('Channel not found.');
    }

    // Permission check: For channels created by a user, ONLY the creator can add/invite members
    const isCreator = channel.creatorId ? (channel.creatorId === inviterId) : (inviter.role === 'Admin');

    if (!isCreator) {
      throw new ForbiddenException('Only the channel creator can invite members to this channel.');
    }

    const cleanEmail = email.trim();
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(or(eq(users.email, cleanEmail), ilike(users.email, cleanEmail)));
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const channelDisplayName = channel.name.replace(/^#\s*/, '');

    if (!user) {
      const subject = `Invitation: ${inviterName} invited you to join #${channelDisplayName}`;
      const registerUrl = `${frontendUrl}/register?invite=true&email=${encodeURIComponent(cleanEmail)}&channel=${encodeURIComponent(channelId)}`;
      const text = `Hello,\n\n${inviterName} has invited you to join the workspace and participate in channel #${channelDisplayName}.\n\nPlease register at: ${registerUrl} to get started.`;
      const html = this.buildInvitationEmailHtml({
        recipientName: cleanEmail,
        inviterName,
        channelName: channelDisplayName,
        channelDescription: channel.description || undefined,
        acceptUrl: registerUrl,
        isNewUser: true,
      });

      console.log(`[Email Action] Preparing to send invite to unregistered user: ${cleanEmail}`);
      this.sendActualEmail(cleanEmail, subject, text, html).catch(err => console.error('Failed to send invite email:', err));
      return { success: true, message: 'Invite sent to unregistered user' };
    }

    // Check if user is already an accepted member or pending
    const [existingMember] = await this.dbService.db
      .select()
      .from(channelMembers)
      .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, user.id)));

    if (existingMember && existingMember.status === 'accepted') {
      return { success: false, message: `${user.name} is already a member of this channel.` };
    }

    if (!existingMember) {
      await this.dbService.db
        .insert(channelMembers)
        .values({
          channelId,
          userId: user.id,
          addedById: inviterId,
          status: 'pending',
        });
    } else {
      await this.dbService.db
        .update(channelMembers)
        .set({ status: 'pending', addedById: inviterId })
        .where(eq(channelMembers.id, existingMember.id));
    }
    
    const inviteToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      channelId,
    }, { expiresIn: '7d' });

    const acceptUrl = `${frontendUrl}/chat?acceptChannel=${encodeURIComponent(channelId)}&token=${encodeURIComponent(inviteToken)}`;
    const declineUrl = `${frontendUrl}/chat?declineChannel=${encodeURIComponent(channelId)}&token=${encodeURIComponent(inviteToken)}`;

    const subject = `Invitation: ${inviterName} invited you to join #${channelDisplayName}`;
    const text = `Hello ${user.name},\n\n${inviterName} has invited you to join the channel #${channelDisplayName} on WorkFlow Dashboard.\n\nAccept Invitation: ${acceptUrl}\nDecline Invitation: ${declineUrl}\n\nYou can also accept or decline this invitation directly within your WorkFlow Dashboard.`;
    const html = this.buildInvitationEmailHtml({
      recipientName: user.name,
      inviterName,
      channelName: channelDisplayName,
      channelDescription: channel.description || undefined,
      acceptUrl,
      declineUrl,
      isNewUser: false,
    });

    console.log(`[Email Action] Preparing to send invitation email to registered user: ${cleanEmail}`);
    this.sendActualEmail(cleanEmail, subject, text, html).catch(err => console.error('Failed to send invitation email:', err));

    // Real-time in-app notification
    await this.notificationsService.createNotification(
      user.id,
      `${inviterName} invited you to join #${channelDisplayName}`,
      'channel_invite'
    );

    return { 
      success: true, 
      message: `Invitation sent to ${user.name}`, 
      user: { id: user.id, name: user.name, role: user.role, avatar: user.avatar, email: user.email, status: 'pending' } 
    };
  }

  async getPendingInvitations(userId: number) {
    if (!userId) return [];

    const invites = await this.dbService.db
      .select({
        membershipId: channelMembers.id,
        channelId: channelMembers.channelId,
        channelName: channels.name,
        channelDescription: channels.description,
        bgGradient: channels.bgGradient,
        invitedAt: channelMembers.createdAt,
        inviterId: channelMembers.addedById,
        inviterName: users.name,
        inviterAvatar: users.avatar,
      })
      .from(channelMembers)
      .innerJoin(channels, eq(channelMembers.channelId, channels.id))
      .leftJoin(users, eq(channelMembers.addedById, users.id))
      .where(and(eq(channelMembers.userId, userId), eq(channelMembers.status, 'pending')))
      .orderBy(desc(channelMembers.createdAt));

    return invites.map(inv => ({
      membershipId: inv.membershipId,
      channelId: inv.channelId,
      channelName: inv.channelName.startsWith('#') ? inv.channelName : `# ${inv.channelName}`,
      description: inv.channelDescription,
      bgGradient: inv.bgGradient,
      invitedAt: inv.invitedAt,
      inviterName: inv.inviterName || 'A teammate',
      inviterAvatar: inv.inviterAvatar,
    }));
  }

  async acceptInvitation(channelId: string, userId: number) {
    const [membership] = await this.dbService.db
      .select()
      .from(channelMembers)
      .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)));

    if (!membership) {
      throw new NotFoundException('Invitation not found.');
    }

    if (membership.status === 'accepted') {
      return { success: true, message: 'You are already a member of this channel.', channelId };
    }

    await this.dbService.db
      .update(channelMembers)
      .set({ status: 'accepted' })
      .where(eq(channelMembers.id, membership.id));

    const [user] = await this.dbService.db.select().from(users).where(eq(users.id, userId));
    const [channel] = await this.dbService.db.select().from(channels).where(eq(channels.id, channelId));

    if (user && channel) {
      await this.saveMessage(
        userId,
        `👋 ${user.name} accepted the invitation and joined #${channel.name.replace(/^#\s*/, '')}!`,
        channelId
      );
    }

    return { success: true, message: 'Invitation accepted successfully.', channelId };
  }

  async declineInvitation(channelId: string, userId: number) {
    const [membership] = await this.dbService.db
      .select()
      .from(channelMembers)
      .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)));

    if (!membership) {
      throw new NotFoundException('Invitation not found.');
    }

    await this.dbService.db
      .delete(channelMembers)
      .where(eq(channelMembers.id, membership.id));

    return { success: true, message: 'Invitation declined.' };
  }

  async removeMember(channelId: string, targetUserId: number, requesterId: number) {
    const [requester] = await this.dbService.db.select().from(users).where(eq(users.id, requesterId));
    if (!requester) {
      throw new ForbiddenException('User not found.');
    }

    const [channel] = await this.dbService.db.select().from(channels).where(eq(channels.id, channelId));
    if (!channel) {
      throw new NotFoundException('Channel not found.');
    }

    // Strict Personal Channel Privacy:
    // If a channel was created by someone, ONLY the creator can remove members from it (not even an admin).
    const isCreator = channel.creatorId ? (channel.creatorId === requesterId) : (requester.role === 'Admin');

    if (!isCreator) {
      throw new ForbiddenException('Only the channel creator has rights to remove members from this channel.');
    }

    if (targetUserId === requesterId) {
      throw new ForbiddenException('You cannot remove yourself from the channel.');
    }

    const [targetUser] = await this.dbService.db.select().from(users).where(eq(users.id, targetUserId));
    if (!targetUser) {
      throw new NotFoundException('Target user not found.');
    }

    // Delete membership
    await this.dbService.db
      .delete(channelMembers)
      .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, targetUserId)));

    // Send in-app notification to removed user
    await this.notificationsService.createNotification(
      targetUserId,
      `You were removed from #${channel.name.replace(/^#\s*/, '')} by ${requester.name}.`,
      'channel_removal'
    );

    // Broadcast message in channel
    await this.saveMessage(
      requesterId,
      `🚫 ${targetUser.name} was removed from the channel by ${requester.name}.`,
      channelId
    );

    return { success: true, message: `${targetUser.name} was removed from #${channel.name.replace(/^#\s*/, '')}.` };
  }

  async revokeInvitation(channelId: string, targetUserId: number, requesterId: number) {
    const [requester] = await this.dbService.db.select().from(users).where(eq(users.id, requesterId));
    const [channel] = await this.dbService.db.select().from(channels).where(eq(channels.id, channelId));
    if (!channel) throw new NotFoundException('Channel not found.');

    const isCreator = channel.creatorId ? (channel.creatorId === requesterId) : (requester?.role === 'Admin');
    if (!isCreator) {
      throw new ForbiddenException('Only the channel creator can revoke invitations for this channel.');
    }

    await this.dbService.db
      .delete(channelMembers)
      .where(and(
        eq(channelMembers.channelId, channelId),
        eq(channelMembers.userId, targetUserId),
        eq(channelMembers.status, 'pending')
      ));

    return { success: true, message: 'Invitation revoked.' };
  }

  async getChannelInfo(channelId: string, userId?: number) {
    const [dbChannel] = await this.dbService.db.select().from(channels).where(eq(channels.id, channelId));

    // Access control check for private channels
    if (dbChannel && dbChannel.id !== 'c-general' && userId) {
      const [requester] = await this.dbService.db.select().from(users).where(eq(users.id, userId));
      const isAdmin = requester?.role === 'Admin';
      const isCreator = dbChannel.creatorId === userId;
      const [membership] = await this.dbService.db
        .select()
        .from(channelMembers)
        .where(and(
          eq(channelMembers.channelId, channelId), 
          eq(channelMembers.userId, userId),
          eq(channelMembers.status, 'accepted')
        ));

      if (!isAdmin && !isCreator && !membership) {
        throw new ForbiddenException('You do not have access to this channel.');
      }
    }

    let name = dbChannel ? `# ${dbChannel.name}` : (channelId.startsWith('c-') ? `# ${channelId.substring(2)}` : channelId);
    let description = dbChannel?.description || "Discussion channel";

    // Fetch accepted members from database for this specific channel
    const memberUsers = await this.dbService.db
      .select({
        id: users.id,
        name: users.name,
        role: users.role,
        avatar: users.avatar,
        email: users.email,
      })
      .from(channelMembers)
      .innerJoin(users, eq(channelMembers.userId, users.id))
      .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.status, 'accepted')));

    // Fetch pending invitees
    const pendingUsers = await this.dbService.db
      .select({
        id: users.id,
        name: users.name,
        role: users.role,
        avatar: users.avatar,
        email: users.email,
        invitedAt: channelMembers.createdAt,
      })
      .from(channelMembers)
      .innerJoin(users, eq(channelMembers.userId, users.id))
      .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.status, 'pending')));

    // Also include creator if not already in memberUsers
    let creatorUser: any = null;
    if (dbChannel?.creatorId) {
      const [cu] = await this.dbService.db
        .select({ id: users.id, name: users.name, role: users.role, avatar: users.avatar, email: users.email })
        .from(users)
        .where(eq(users.id, dbChannel.creatorId));
      creatorUser = cu;
    }

    const membersMap = new Map<number, any>();
    if (creatorUser) membersMap.set(creatorUser.id, creatorUser);
    memberUsers.forEach(m => membersMap.set(m.id, m));

    const members = Array.from(membersMap.values()).map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      email: u.email,
      avatarPerson: u.name.split(' ')[0].toLowerCase(),
      avatar: u.avatar
    }));

    // Fetch tasks specifically associated with this channel
    const { tasks, files } = await import('../database/schema.js');
    const channelTasks = await this.dbService.db
      .select()
      .from(tasks)
      .where(eq(tasks.channelId, channelId));
    const mappedTasks = channelTasks.map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority === 'high' ? 'High' : (t.priority === 'medium' ? 'Medium' : 'Low'),
      color: t.priority === 'high' ? 'text-rose-600' : (t.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'),
      date: new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));

    // Fetch files
    const allFiles = await this.dbService.db.select().from(files).limit(5);
    const mappedFiles = allFiles.map(f => ({
      name: f.name,
      icon: f.type || 'unknown',
      meta: f.size ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size',
      time: new Date(f.createdAt).toLocaleDateString(),
      pinnedBy: 'System'
    }));

    return {
      id: dbChannel?.id || channelId,
      name,
      description,
      creatorId: dbChannel?.creatorId,
      bgGradient: dbChannel?.bgGradient,
      members,
      pendingMembers: pendingUsers.map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        email: u.email,
        avatarPerson: u.name.split(' ')[0].toLowerCase(),
        avatar: u.avatar,
        invitedAt: u.invitedAt,
      })),
      tasks: mappedTasks,
      files: mappedFiles
    };
  }

  async updateChannelInfo(channelId: string, name: string, description: string, userId: number, bgGradient?: string) {
    const [user] = await this.dbService.db.select().from(users).where(eq(users.id, userId));
    const [channel] = await this.dbService.db.select().from(channels).where(eq(channels.id, channelId));
    
    const isCreator = channel?.creatorId ? (channel.creatorId === userId) : (user?.role === 'Admin');

    if (!isCreator && channel) {
      throw new ForbiddenException('Only the channel creator can edit this personal channel.');
    }

    const cleanName = name ? (name.startsWith('# ') ? name.slice(2) : name) : (channel?.name || 'general');
    const finalGradient = bgGradient !== undefined ? bgGradient : channel?.bgGradient;

    await this.dbService.db
      .insert(channels)
      .values({
        id: channelId,
        name: cleanName,
        description,
        creatorId: channel?.creatorId || userId,
        bgGradient: finalGradient,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: channels.id,
        set: { 
          name: cleanName, 
          description, 
          ...(bgGradient !== undefined ? { bgGradient } : {}),
          updatedAt: new Date() 
        },
      });

    return this.getChannelInfo(channelId, userId);
  }

  async getDirectMessageUsers() {
    const dmUsers = await this.dbService.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        status: users.status,
        role: users.role,
        department: users.department,
      })
      .from(users);
    
    return dmUsers;
  }
}

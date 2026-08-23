import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { messages, users } from '../database/schema.js';
import { eq, desc, inArray, or } from 'drizzle-orm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class ChatService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getMessagesByChannel(channelId: string) {
    const rawMessages = await this.dbService.db
      .select({
        id: messages.id,
        content: messages.content,
        channelId: messages.channelId,
        createdAt: messages.createdAt,
        senderId: users.id,
        senderName: users.name,
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
      .select({ name: users.name, role: users.role })
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
      timestamp: new Date(saved.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channelId: saved.channelId,
      parentId: saved.parentId?.toString(),
      reactions: saved.reactions || {},
      isEdited: saved.isEdited,
      attachment: saved.attachments?.[0] || undefined
    };
  }

  async editMessage(messageId: number, userId: number, newContent: string) {
    const [message] = await this.dbService.db.select().from(messages).where(eq(messages.id, messageId));
    if (!message || message.senderId !== userId) {
      throw new ForbiddenException('Cannot edit this message');
    }

    const [updated] = await this.dbService.db
      .update(messages)
      .set({ content: newContent, isEdited: true })
      .where(eq(messages.id, messageId))
      .returning();

    return updated;
  }

  async deleteMessage(messageId: number, userId: number) {
    const [message] = await this.dbService.db.select().from(messages).where(eq(messages.id, messageId));
    if (!message || message.senderId !== userId) {
      throw new ForbiddenException('Cannot delete this message');
    }

    await this.dbService.db.delete(messages).where(eq(messages.id, messageId));
    return { success: true };
  }

  async addReaction(messageId: number, userId: number, emoji: string) {
    const [message] = await this.dbService.db.select().from(messages).where(eq(messages.id, messageId));
    if (!message) throw new NotFoundException('Message not found');

    const reactions = (message.reactions as Record<string, number[]>) || {};
    let alreadyHasSameEmoji = false;

    for (const key of Object.keys(reactions)) {
      const idx = reactions[key].indexOf(userId);
      if (idx > -1) {
        if (key === emoji) alreadyHasSameEmoji = true;
        reactions[key].splice(idx, 1);
        if (reactions[key].length === 0) delete reactions[key];
      }
    }

    if (!alreadyHasSameEmoji) {
      if (!reactions[emoji]) reactions[emoji] = [];
      reactions[emoji].push(userId);
    }

    await this.dbService.db
      .update(messages)
      .set({ reactions })
      .where(eq(messages.id, messageId));
      
    return reactions;
  }

  async createChannel(name: string, description: string, creatorId: number) {
    const channelId = 'c-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    this.channelMetadata.set(channelId, { name, description });
    this.channelMembersMap.set(channelId, [creatorId]);
    return { id: channelId, name, description };
  }

  private channelMetadata = new Map<string, { name: string; description: string }>();
  private channelMembersMap = new Map<string, number[]>();

  private async sendActualEmail(to: string, subject: string, text: string) {
    try {
      let transporter;
      
      // If the user has provided real SMTP credentials in their .env
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
          service: 'gmail', // Assuming Gmail for simplicity, can be adjusted
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
        from: process.env.SMTP_USER || '"Workflow Dashboard" <no-reply@workflowdashboard.local>',
        to,
        subject,
        text,
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
      throw new ForbiddenException('Only admins can add members to a channel.');
    }

    const [inviter] = await this.dbService.db.select().from(users).where(eq(users.id, inviterId));
    if (!inviter || inviter.role !== 'Admin') {
      throw new ForbiddenException('Only admins can add members to a channel.');
    }

    const [user] = await this.dbService.db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const subject = `${inviterName} invited you to join ${channelId}`;
      const text = `${inviterName} has invited you to join the workspace and participate in channel ${channelId}.\n\nPlease register at ${frontendUrl}/register to get started.`;
      
      console.log(`[Email Action] Preparing to send invite to unregistered user: ${email}`);
      await this.sendActualEmail(email, subject, text);
      return { success: true, message: 'Invite sent to unregistered user' };
    }

    const members = this.channelMembersMap.get(channelId) || [];
    if (!members.includes(user.id)) {
      members.push(user.id);
      this.channelMembersMap.set(channelId, members);
    }
    
    const subject = `${inviterName} added you to ${channelId}`;
    const text = `Hello ${user.name},\n\n${inviterName} has added you to the channel ${channelId}.`;
    
    console.log(`[Email Action] Preparing to send notification to registered user: ${email}`);
    await this.sendActualEmail(email, subject, text);
    return { success: true, message: 'User added to channel successfully and notified' };
  }

  async getChannelInfo(channelId: string) {
    // Check if we have edited metadata in memory
    const edited = this.channelMetadata.get(channelId);
    let name = edited?.name || channelId;
    let description = edited?.description || "Direct message or custom channel";
    
    if (!edited) {
      // Defaults if never edited
      if (channelId === 'c-general') {
        name = "# general";
        description = "Company wide announcements and general discussion";
      } else if (channelId.startsWith('c-')) {
        name = "# " + channelId.substring(2);
        description = `Discussion channel for ${channelId.substring(2)}`;
      }
    }

    // Fetch members 
    const memberIds = this.channelMembersMap.get(channelId) || [];
    let queryCondition;
    if (memberIds.length > 0) {
      queryCondition = or(
        inArray(users.id, memberIds),
        eq(users.role, 'Admin')
      );
    } else {
      queryCondition = eq(users.role, 'Admin');
    }
    const channelUsers = await this.dbService.db.select().from(users).where(queryCondition);
    
    const members = channelUsers.map(u => ({
      name: u.name,
      role: u.role,
      avatarPerson: u.name.split(' ')[0].toLowerCase()
    }));

    // Fetch tasks
    const { tasks, files } = await import('../database/schema.js');
    const allTasks = await this.dbService.db.select().from(tasks).limit(5);
    const mappedTasks = allTasks.map(t => ({
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
      name,
      description,
      members,
      tasks: mappedTasks,
      files: mappedFiles
    };
  }

  async updateChannelInfo(channelId: string, name: string, description: string, userId: number) {
    const [user] = await this.dbService.db.select().from(users).where(eq(users.id, userId));
    if (!user || user.role !== 'Admin') {
      throw new ForbiddenException('Only admins can edit channel info.');
    }

    this.channelMetadata.set(channelId, { name, description });
    return this.getChannelInfo(channelId);
  }

  async getDirectMessageUsers() {
    const allMemberIds = new Set<number>();
    for (const members of this.channelMembersMap.values()) {
      members.forEach(id => allMemberIds.add(id));
    }

    let queryCondition;
    if (allMemberIds.size > 0) {
      queryCondition = or(
        inArray(users.id, Array.from(allMemberIds)),
        eq(users.role, 'Admin')
      );
    } else {
      queryCondition = eq(users.role, 'Admin');
    }

    const dmUsers = await this.dbService.db
      .select({
        id: users.id,
        name: users.name,
        avatar: users.avatar,
        status: users.status,
        role: users.role,
      })
      .from(users)
      .where(queryCondition);
    
    return dmUsers;
  }
}

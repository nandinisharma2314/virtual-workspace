import {
    ConflictException,
    Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq, or } from 'drizzle-orm';

import { DatabaseService } from '../database/database.service.js';
import { users, notifications, settings, reports, meetings, documents, files, messages, tasks, channelMembers, channels } from '../database/schema.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
    constructor(private readonly database: DatabaseService) { }

    async findAll() {
        return this.database.db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            department: users.department,
            status: users.status,
            avatar: users.avatar
        }).from(users);
    }

    async create(createUserDto: CreateUserDto) {
        const { name, email, password, department } = createUserDto;

        // Check if email already exists
        const existingUser = await this.database.db
            .select({
                id: users.id,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            throw new ConflictException('Email already registered');
        }

        // Hash password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        const [newUser] = await this.database.db
            .insert(users)
            .values({
                name,
                email,
                password: hashedPassword,
                ...(department ? { department } : {}),
            })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                department: users.department,
                status: users.status,
                avatar: users.avatar,
                createdAt: users.createdAt,
            });

        return newUser;
    }

    async findByEmail(email: string) {
        const [user] = await this.database.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        return user;
    }

    async findById(id: number) {
        const [user] = await this.database.db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
        return user;
    }

    async saveResetToken(userId: number, token: string, expires: Date) {
        await this.database.db
            .update(users)
            .set({
                resetPasswordToken: token,
                resetPasswordExpires: expires,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));
    }

    async findByResetToken(token: string) {
        const [user] = await this.database.db
            .select()
            .from(users)
            .where(eq(users.resetPasswordToken, token))
            .limit(1);
        return user;
    }

    async updatePassword(userId: number, hashedPassword: string) {
        await this.database.db
            .update(users)
            .set({
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));
    }

    async updateProfile(userId: number, data: { name?: string; email?: string; bio?: string; role?: string; avatar?: string; language?: string; timezone?: string; emailNotifications?: boolean; pushNotifications?: boolean; inAppNotifications?: boolean; department?: string; status?: string; }) {
        await this.database.db
            .update(users)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));
    }

    async deleteUser(userId: number) {
        // Handle foreign key constraints by deleting or nullifying related records
        await this.database.db.delete(channelMembers).where(or(eq(channelMembers.userId, userId), eq(channelMembers.addedById, userId)));
        await this.database.db.update(channels).set({ creatorId: null }).where(eq(channels.creatorId, userId));
        await this.database.db.delete(notifications).where(eq(notifications.userId, userId));
        await this.database.db.delete(settings).where(eq(settings.userId, userId));
        await this.database.db.delete(reports).where(eq(reports.generatedById, userId));
        await this.database.db.delete(meetings).where(eq(meetings.organizerId, userId));
        await this.database.db.delete(documents).where(eq(documents.authorId, userId));
        await this.database.db.delete(files).where(eq(files.uploadedById, userId));
        await this.database.db.delete(messages).where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)));
        await this.database.db.update(tasks).set({ assigneeId: null }).where(eq(tasks.assigneeId, userId));
        
        await this.database.db.delete(users).where(eq(users.id, userId));
    }

    async updateRole(userId: number, role: string) {
        await this.database.db
            .update(users)
            .set({ role, updatedAt: new Date() })
            .where(eq(users.id, userId));
    }
}
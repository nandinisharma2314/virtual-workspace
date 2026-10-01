import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { DatabaseService } from '../database/database.service.js';
import {
  workspaces,
  workspaceRoles,
  workspaceMembers,
  workspaceInvites,
  users,
  projects,
  tasks,
  teams,
  channels,
  projectMembers,
} from '../database/schema.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto.js';
import { InviteMemberDto, UpdateMemberDto } from './dto/member-management.dto.js';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_DEFINITIONS,
  PermissionDefinition,
} from './workspace-permissions.js';

@Injectable()
export class WorkspacesService {
  constructor(private readonly dbService: DatabaseService) {}

  getAvailablePermissions(): PermissionDefinition[] {
    return PERMISSION_DEFINITIONS;
  }

  async createWorkspace(userId: number, dto: CreateWorkspaceDto) {
    const slugBase = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40);
    const slug = `${slugBase}-${randomBytes(3).toString('hex')}`;

    const [newWorkspace] = await this.dbService.db
      .insert(workspaces)
      .values({
        name: dto.name,
        slug,
        description: dto.description || null,
        logo: dto.logo || null,
        ownerId: userId,
      })
      .returning();

    // Create standard default roles for this workspace
    const [adminRole] = await this.dbService.db
      .insert(workspaceRoles)
      .values({
        workspaceId: newWorkspace.id,
        name: 'Admin',
        description: 'Full administrative access to workspace settings, roles, and members',
        isSystem: true,
        permissions: DEFAULT_ROLE_PERMISSIONS.Admin,
      })
      .returning();

    await this.dbService.db.insert(workspaceRoles).values([
      {
        workspaceId: newWorkspace.id,
        name: 'Manager',
        description: 'Can manage projects, assign tasks, oversee teams and invite members',
        isSystem: true,
        permissions: DEFAULT_ROLE_PERMISSIONS.Manager,
      },
      {
        workspaceId: newWorkspace.id,
        name: 'Supervisor',
        description: 'Can oversee tasks, view all projects and monitor sprint progress',
        isSystem: true,
        permissions: DEFAULT_ROLE_PERMISSIONS.Supervisor,
      },
      {
        workspaceId: newWorkspace.id,
        name: 'Normal Employee',
        description: 'Can view and update assigned projects, tasks, and log time',
        isSystem: true,
        permissions: DEFAULT_ROLE_PERMISSIONS['Normal Employee'],
      },
    ]);

    // Add creator as workspace member with Admin role
    await this.dbService.db.insert(workspaceMembers).values({
      workspaceId: newWorkspace.id,
      userId,
      roleId: adminRole.id,
      customRoleLabel: 'Workspace Owner',
      status: 'active',
    });

    return this.getWorkspaceById(newWorkspace.id, userId);
  }

  async getUserWorkspaces(userId: number) {
    // Ensure user has at least one default workspace if none exist
    await this.ensureDefaultWorkspaceForUser(userId);

    const memberRecords = await this.dbService.db
      .select({
        memberId: workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        customRoleLabel: workspaceMembers.customRoleLabel,
        memberStatus: workspaceMembers.status,
        joinedAt: workspaceMembers.joinedAt,
        roleId: workspaceRoles.id,
        roleName: workspaceRoles.name,
        permissions: workspaceRoles.permissions,
        workspaceName: workspaces.name,
        workspaceSlug: workspaces.slug,
        workspaceDescription: workspaces.description,
        workspaceLogo: workspaces.logo,
        ownerId: workspaces.ownerId,
        createdAt: workspaces.createdAt,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .leftJoin(workspaceRoles, eq(workspaceMembers.roleId, workspaceRoles.id))
      .where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.status, 'active')))
      .orderBy(desc(workspaces.createdAt));

    return memberRecords.map((r) => ({
      id: r.workspaceId,
      name: r.workspaceName,
      slug: r.workspaceSlug,
      description: r.workspaceDescription,
      logo: r.workspaceLogo,
      ownerId: r.ownerId,
      isOwner: r.ownerId === userId,
      createdAt: r.createdAt,
      currentMember: {
        roleId: r.roleId,
        roleName: r.roleName || 'Member',
        customRoleLabel: r.customRoleLabel || r.roleName || 'Member',
        permissions: (r.permissions as string[]) || [],
      },
    }));
  }

  async getWorkspaceById(workspaceId: number, userId: number) {
    const [ws] = await this.dbService.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    if (!ws) {
      throw new NotFoundException('Workspace not found');
    }

    const [member] = await this.dbService.db
      .select({
        memberId: workspaceMembers.id,
        customRoleLabel: workspaceMembers.customRoleLabel,
        status: workspaceMembers.status,
        roleId: workspaceRoles.id,
        roleName: workspaceRoles.name,
        permissions: workspaceRoles.permissions,
      })
      .from(workspaceMembers)
      .leftJoin(workspaceRoles, eq(workspaceMembers.roleId, workspaceRoles.id))
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));

    const isOwner = ws.ownerId === userId;

    if (!member && !isOwner) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    const allPermissions = isOwner
      ? PERMISSION_DEFINITIONS.map((p) => p.key)
      : ((member?.permissions as string[]) || []);

    return {
      ...ws,
      isOwner,
      currentMember: {
        roleId: member?.roleId || null,
        roleName: member?.roleName || (isOwner ? 'Admin' : 'Member'),
        customRoleLabel: member?.customRoleLabel || (isOwner ? 'Workspace Owner' : member?.roleName || 'Member'),
        permissions: allPermissions,
      },
    };
  }

  async updateWorkspace(workspaceId: number, userId: number, dto: Partial<CreateWorkspaceDto>) {
    const memberAuth = await this.getUserPermissionsInWorkspace(userId, workspaceId);
    if (!memberAuth.isOwner && !memberAuth.permissions.includes('workspace:manage')) {
      throw new ForbiddenException('You do not have permission to manage workspace settings');
    }

    const [updated] = await this.dbService.db
      .update(workspaces)
      .set({
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.logo !== undefined ? { logo: dto.logo } : {}),
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId))
      .returning();

    return updated;
  }

  // --- Roles & Permissions Management ---

  async getRoles(workspaceId: number) {
    const roles = await this.dbService.db
      .select()
      .from(workspaceRoles)
      .where(eq(workspaceRoles.workspaceId, workspaceId))
      .orderBy(workspaceRoles.id);

    return roles;
  }

  async createRole(workspaceId: number, userId: number, dto: CreateRoleDto) {
    const memberAuth = await this.getUserPermissionsInWorkspace(userId, workspaceId);
    if (!memberAuth.isOwner && !memberAuth.permissions.includes('roles:manage')) {
      throw new ForbiddenException('You do not have permission to create roles');
    }

    const [role] = await this.dbService.db
      .insert(workspaceRoles)
      .values({
        workspaceId,
        name: dto.name,
        description: dto.description || null,
        isSystem: false,
        permissions: dto.permissions || [],
      })
      .returning();

    return role;
  }

  async updateRole(workspaceId: number, roleId: number, userId: number, dto: UpdateRoleDto) {
    const memberAuth = await this.getUserPermissionsInWorkspace(userId, workspaceId);
    if (!memberAuth.isOwner && !memberAuth.permissions.includes('roles:manage')) {
      throw new ForbiddenException('You do not have permission to edit roles');
    }

    const [existing] = await this.dbService.db
      .select()
      .from(workspaceRoles)
      .where(and(eq(workspaceRoles.id, roleId), eq(workspaceRoles.workspaceId, workspaceId)));

    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    if (existing.isSystem && existing.name === 'Admin') {
      // Prevent stripping Admin permissions
      if (dto.permissions && !dto.permissions.includes('roles:manage')) {
        throw new BadRequestException('Admin role must retain roles:manage permission');
      }
    }

    const [updated] = await this.dbService.db
      .update(workspaceRoles)
      .set({
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.permissions ? { permissions: dto.permissions } : {}),
      })
      .where(eq(workspaceRoles.id, roleId))
      .returning();

    return updated;
  }

  async deleteRole(workspaceId: number, roleId: number, userId: number) {
    const memberAuth = await this.getUserPermissionsInWorkspace(userId, workspaceId);
    if (!memberAuth.isOwner && !memberAuth.permissions.includes('roles:manage')) {
      throw new ForbiddenException('You do not have permission to delete roles');
    }

    const [existing] = await this.dbService.db
      .select()
      .from(workspaceRoles)
      .where(and(eq(workspaceRoles.id, roleId), eq(workspaceRoles.workspaceId, workspaceId)));

    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    if (existing.isSystem) {
      throw new BadRequestException('System built-in roles cannot be deleted');
    }

    // Find default employee role to reassign any members holding this deleted role
    const [employeeRole] = await this.dbService.db
      .select()
      .from(workspaceRoles)
      .where(and(eq(workspaceRoles.workspaceId, workspaceId), eq(workspaceRoles.name, 'Normal Employee')));

    if (employeeRole) {
      await this.dbService.db
        .update(workspaceMembers)
        .set({ roleId: employeeRole.id })
        .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.roleId, roleId)));
    }

    await this.dbService.db.delete(workspaceRoles).where(eq(workspaceRoles.id, roleId));
    return { success: true, message: 'Role deleted successfully' };
  }

  // --- Members Management ---

  async getMembers(workspaceId: number) {
    const members = await this.dbService.db
      .select({
        memberId: workspaceMembers.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        department: users.department,
        status: workspaceMembers.status,
        joinedAt: workspaceMembers.joinedAt,
        customRoleLabel: workspaceMembers.customRoleLabel,
        roleId: workspaceRoles.id,
        roleName: workspaceRoles.name,
        roleIsSystem: workspaceRoles.isSystem,
        permissions: workspaceRoles.permissions,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .leftJoin(workspaceRoles, eq(workspaceMembers.roleId, workspaceRoles.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId))
      .orderBy(users.name);

    return members;
  }

  async updateMember(
    workspaceId: number,
    targetUserId: number,
    currentUserId: number,
    dto: UpdateMemberDto,
  ) {
    const memberAuth = await this.getUserPermissionsInWorkspace(currentUserId, workspaceId);
    if (!memberAuth.isOwner && !memberAuth.permissions.includes('members:assign_role')) {
      throw new ForbiddenException('You do not have permission to edit member roles');
    }

    const [ws] = await this.dbService.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    if (ws.ownerId === targetUserId && dto.roleId) {
      // Owner must stay Admin
    }

    const [updated] = await this.dbService.db
      .update(workspaceMembers)
      .set({
        ...(dto.roleId !== undefined ? { roleId: dto.roleId } : {}),
        ...(dto.customRoleLabel !== undefined ? { customRoleLabel: dto.customRoleLabel } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      })
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, targetUserId),
        ),
      )
      .returning();

    return updated;
  }

  async removeMember(workspaceId: number, targetUserId: number, currentUserId: number) {
    const memberAuth = await this.getUserPermissionsInWorkspace(currentUserId, workspaceId);
    if (!memberAuth.isOwner && !memberAuth.permissions.includes('members:remove')) {
      throw new ForbiddenException('You do not have permission to remove members');
    }

    const [ws] = await this.dbService.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    if (ws.ownerId === targetUserId) {
      throw new BadRequestException('The workspace owner cannot be removed from the workspace');
    }

    await this.dbService.db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, targetUserId),
        ),
      );

    return { success: true, message: 'Member removed from workspace' };
  }

  // --- Invitations ---

  async inviteMember(workspaceId: number, currentUserId: number, dto: InviteMemberDto) {
    const memberAuth = await this.getUserPermissionsInWorkspace(currentUserId, workspaceId);
    if (!memberAuth.isOwner && !memberAuth.permissions.includes('members:invite')) {
      throw new ForbiddenException('You do not have permission to invite members');
    }

    // Check if target user is already in the workspace
    const [existingUser] = await this.dbService.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email.toLowerCase()));

    if (existingUser) {
      const [existingMember] = await this.dbService.db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, existingUser.id),
          ),
        );

      if (existingMember) {
        throw new ConflictException('User is already a member of this workspace');
      }
    }

    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [invite] = await this.dbService.db
      .insert(workspaceInvites)
      .values({
        workspaceId,
        email: dto.email.toLowerCase(),
        token,
        roleId: dto.roleId,
        customRoleLabel: dto.customRoleLabel || null,
        invitedById: currentUserId,
        status: 'pending',
        expiresAt,
      })
      .returning();

    // If the user already exists in the system, we can also auto-add them or let them accept
    if (existingUser) {
      await this.dbService.db.insert(workspaceMembers).values({
        workspaceId,
        userId: existingUser.id,
        roleId: dto.roleId,
        customRoleLabel: dto.customRoleLabel || null,
        status: 'active',
      });
      await this.dbService.db
        .update(workspaceInvites)
        .set({ status: 'accepted' })
        .where(eq(workspaceInvites.id, invite.id));

      return {
        ...invite,
        status: 'accepted',
        autoAccepted: true,
        message: 'Existing user was automatically added to the workspace with the specified role.',
      };
    }

    return {
      ...invite,
      inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/invite/${token}`,
    };
  }

  async getInvites(workspaceId: number) {
    const invites = await this.dbService.db
      .select({
        id: workspaceInvites.id,
        email: workspaceInvites.email,
        token: workspaceInvites.token,
        roleId: workspaceInvites.roleId,
        customRoleLabel: workspaceInvites.customRoleLabel,
        status: workspaceInvites.status,
        createdAt: workspaceInvites.createdAt,
        expiresAt: workspaceInvites.expiresAt,
        roleName: workspaceRoles.name,
      })
      .from(workspaceInvites)
      .leftJoin(workspaceRoles, eq(workspaceInvites.roleId, workspaceRoles.id))
      .where(eq(workspaceInvites.workspaceId, workspaceId))
      .orderBy(desc(workspaceInvites.createdAt));

    return invites;
  }

  async acceptInvite(token: string, userId: number) {
    const [invite] = await this.dbService.db
      .select()
      .from(workspaceInvites)
      .where(eq(workspaceInvites.token, token));

    if (!invite) {
      throw new NotFoundException('Invitation not found or invalid');
    }

    if (invite.status !== 'pending') {
      throw new BadRequestException(`Invitation is already ${invite.status}`);
    }

    if (new Date() > new Date(invite.expiresAt)) {
      await this.dbService.db
        .update(workspaceInvites)
        .set({ status: 'expired' })
        .where(eq(workspaceInvites.id, invite.id));
      throw new BadRequestException('Invitation has expired');
    }

    // Check if already a member
    const [existingMember] = await this.dbService.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, invite.workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      );

    if (!existingMember) {
      await this.dbService.db.insert(workspaceMembers).values({
        workspaceId: invite.workspaceId,
        userId,
        roleId: invite.roleId,
        customRoleLabel: invite.customRoleLabel,
        status: 'active',
      });
    }

    await this.dbService.db
      .update(workspaceInvites)
      .set({ status: 'accepted' })
      .where(eq(workspaceInvites.id, invite.id));

    return {
      success: true,
      workspaceId: invite.workspaceId,
      message: 'Successfully joined workspace',
    };
  }

  // --- Permission Resolver & Helper ---

  async getUserPermissionsInWorkspace(userId: number, workspaceId: number) {
    const [ws] = await this.dbService.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    if (!ws) {
      throw new NotFoundException('Workspace not found');
    }

    const isOwner = ws.ownerId === userId;

    const [member] = await this.dbService.db
      .select({
        roleName: workspaceRoles.name,
        customRoleLabel: workspaceMembers.customRoleLabel,
        permissions: workspaceRoles.permissions,
        status: workspaceMembers.status,
      })
      .from(workspaceMembers)
      .leftJoin(workspaceRoles, eq(workspaceMembers.roleId, workspaceRoles.id))
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));

    if (!isOwner && (!member || member.status !== 'active')) {
      throw new ForbiddenException('Not an active member of this workspace');
    }

    const permissions = isOwner
      ? PERMISSION_DEFINITIONS.map((p) => p.key)
      : ((member?.permissions as string[]) || []);

    return {
      isOwner,
      role: isOwner ? 'Admin' : member?.roleName || 'Member',
      customRoleLabel: member?.customRoleLabel || (isOwner ? 'Workspace Owner' : member?.roleName || 'Member'),
      permissions,
    };
  }

  // Automatically creates a default workspace for an existing user and migrates orphaned items
  async ensureDefaultWorkspaceForUser(userId: number) {
    const existing = await this.dbService.db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return;
    }

    const [user] = await this.dbService.db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, userId));

    const name = user?.name ? `${user.name.split(' ')[0]}'s Workspace` : 'Main Workspace';
    const slug = `ws-${userId}-${randomBytes(3).toString('hex')}`;

    const [newWs] = await this.dbService.db
      .insert(workspaces)
      .values({
        name,
        slug,
        description: 'Primary workspace',
        ownerId: userId,
      })
      .returning();

    // Create default system roles
    const [adminRole] = await this.dbService.db
      .insert(workspaceRoles)
      .values({
        workspaceId: newWs.id,
        name: 'Admin',
        description: 'Full administrative access',
        isSystem: true,
        permissions: DEFAULT_ROLE_PERMISSIONS.Admin,
      })
      .returning();

    await this.dbService.db.insert(workspaceRoles).values([
      {
        workspaceId: newWs.id,
        name: 'Manager',
        description: 'Can manage projects, assign tasks, oversee teams and invite members',
        isSystem: true,
        permissions: DEFAULT_ROLE_PERMISSIONS.Manager,
      },
      {
        workspaceId: newWs.id,
        name: 'Supervisor',
        description: 'Can oversee tasks, view all projects and monitor sprint progress',
        isSystem: true,
        permissions: DEFAULT_ROLE_PERMISSIONS.Supervisor,
      },
      {
        workspaceId: newWs.id,
        name: 'Normal Employee',
        description: 'Can view and update assigned projects, tasks, and log time',
        isSystem: true,
        permissions: DEFAULT_ROLE_PERMISSIONS['Normal Employee'],
      },
    ]);

    await this.dbService.db.insert(workspaceMembers).values({
      workspaceId: newWs.id,
      userId,
      roleId: adminRole.id,
      customRoleLabel: 'Workspace Owner',
      status: 'active',
    });

    // Seed default isolated #general channel for this new workspace
    await this.seedWorkspaceStarterData(newWs.id, userId);
  }

  async seedWorkspaceStarterData(workspaceId: number, userId: number) {
    try {
      const channelId = `c-general-ws-${workspaceId}`;
      const existing = await this.dbService.db.select().from(channels).where(eq(channels.id, channelId));
      if (existing.length === 0) {
        await this.dbService.db.insert(channels).values({
          id: channelId,
          name: "general",
          description: "Company-wide announcements and discussion",
          creatorId: userId,
          workspaceId: workspaceId,
          isTemplate: false,
        });

        await this.dbService.db.insert(channelMembers).values({
          channelId,
          userId,
          role: "admin",
        });
      }
    } catch (e) {
      console.error("Failed to seed workspace starter channel:", e);
    }
  }
}

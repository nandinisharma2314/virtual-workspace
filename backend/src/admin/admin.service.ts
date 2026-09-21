import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { eq, isNull, and } from 'drizzle-orm';

export interface ChatTheme {
  id: string;
  name: string;
  gradient: string;
  bgClass: string;
  category?: string;
  createdAt?: string;
}

export interface BoardBackground {
  id: string;
  name: string;
  image: string;
  desc: string;
  category?: string;
  createdAt?: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  iconGradient: string;
  iconShadow: string;
  cardBgGradient: string;
  borderColor: string;
  hoverBorderColor: string;
  hoverShadowColor: string;
  badgeStyle: string;
  hoverTextColor: string;
}

export interface SystemWorkspaceConfig {
  workspaceName: string;
  logoInitial: string;
  defaultTimezone: string;
  defaultLanguage: string;
  maxUploadSizeMB: number;
  allowedExtensions: string[];
}

@Injectable()
export class AdminService {
  constructor(private readonly dbService: DatabaseService) {}

  // Helper to get or seed a system setting JSON payload
  private async getOrSeedSetting<T>(key: string, defaultPayload: T): Promise<T> {
    const [existing] = await this.dbService.db
      .select()
      .from(schema.settings)
      .where(and(eq(schema.settings.key, key), isNull(schema.settings.userId)));

    if (existing && existing.value) {
      try {
        return JSON.parse(existing.value) as T;
      } catch (err) {
        console.error(`Error parsing setting ${key}:`, err);
      }
    }

    // Seed default value into database
    await this.dbService.db
      .insert(schema.settings)
      .values({
        key,
        value: JSON.stringify(defaultPayload),
        userId: null,
      });

    return defaultPayload;
  }

  // Helper to update a system setting JSON payload
  private async updateSetting<T>(key: string, payload: T): Promise<T> {
    const [existing] = await this.dbService.db
      .select()
      .from(schema.settings)
      .where(and(eq(schema.settings.key, key), isNull(schema.settings.userId)));

    if (existing) {
      await this.dbService.db
        .update(schema.settings)
        .set({
          value: JSON.stringify(payload),
          updatedAt: new Date(),
        })
        .where(eq(schema.settings.id, existing.id));
    } else {
      await this.dbService.db
        .insert(schema.settings)
        .values({
          key,
          value: JSON.stringify(payload),
          userId: null,
        });
    }

    return payload;
  }

  // 1. System Overview Stats
  async getOverviewStats() {
    const allUsers = await this.dbService.db.select().from(schema.users);
    const allChannels = await this.dbService.db.select().from(schema.channels);
    const allTasks = await this.dbService.db.select().from(schema.tasks);
    const allFiles = await this.dbService.db.select().from(schema.files);
    const allProjects = await this.dbService.db.select().from(schema.projects);

    const totalStorageBytes = allFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);

    const activeUsers = allUsers.filter(u => (u.status || 'Active').toLowerCase() === 'active').length;
    const completedTasks = allTasks.filter(t => t.status === 'completed' || t.status === 'done').length;

    return {
      users: {
        total: allUsers.length,
        active: activeUsers,
        admins: allUsers.filter(u => u.role === 'Admin').length,
      },
      channels: {
        total: allChannels.length,
      },
      tasks: {
        total: allTasks.length,
        completed: completedTasks,
        completionRate: allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0,
      },
      files: {
        total: allFiles.length,
        storageMB: totalStorageMB,
      },
      projects: {
        total: allProjects.length,
      },
      system: {
        status: 'Operational',
        uptime: '99.98%',
        serverTime: new Date().toISOString(),
        database: 'PostgreSQL Connected',
      },
    };
  }

  // 2. User Management
  async getUsers() {
    const users = await this.dbService.db.select().from(schema.users);
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'Member',
      department: u.department || 'Engineering',
      status: u.status || 'Active',
      avatar: u.avatar,
      createdAt: u.createdAt,
    }));
  }

  async updateUser(id: number, data: { role?: string; status?: string; department?: string }) {
    const [existing] = await this.dbService.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));

    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const [updated] = await this.dbService.db
      .update(schema.users)
      .set({
        ...(data.role ? { role: data.role } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.department ? { department: data.department } : {}),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      department: updated.department,
      status: updated.status,
    };
  }

  // 3. Chat Gradient Themes
  async getThemes(): Promise<ChatTheme[]> {
    const defaultThemes: ChatTheme[] = [
      {
        id: "indigo-violet",
        name: "Cosmic Indigo",
        gradient: "from-indigo-600 via-indigo-700 to-purple-800",
        bgClass: "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800",
        category: "Vibrant",
      },
      {
        id: "blue-cyan",
        name: "Oceanic Blue",
        gradient: "from-blue-600 via-indigo-600 to-violet-700",
        bgClass: "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700",
        category: "Cool",
      },
      {
        id: "purple-pink",
        name: "Velvet Magenta",
        gradient: "from-indigo-700 via-purple-700 to-pink-700",
        bgClass: "bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700",
        category: "Warm",
      },
      {
        id: "emerald-teal",
        name: "Emerald Deep",
        gradient: "from-emerald-700 via-teal-700 to-cyan-800",
        bgClass: "bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800",
        category: "Nature",
      },
      {
        id: "rose-amber",
        name: "Sunset Ember",
        gradient: "from-rose-600 via-orange-600 to-amber-600",
        bgClass: "bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600",
        category: "Warm",
      },
      {
        id: "slate-dark",
        name: "Midnight Slate",
        gradient: "from-slate-800 via-indigo-900 to-purple-900",
        bgClass: "bg-gradient-to-r from-slate-800 via-indigo-900 to-purple-900",
        category: "Dark",
      },
    ];

    return this.getOrSeedSetting<ChatTheme[]>('system_chat_themes', defaultThemes);
  }

  async addTheme(theme: Omit<ChatTheme, 'id'>): Promise<ChatTheme> {
    const themes = await this.getThemes();
    const newTheme: ChatTheme = {
      id: `theme-${Date.now()}`,
      name: theme.name,
      gradient: theme.gradient,
      bgClass: theme.bgClass || `bg-gradient-to-r ${theme.gradient}`,
      category: theme.category || 'Custom',
      createdAt: new Date().toISOString(),
    };

    const updated = [newTheme, ...themes];
    await this.updateSetting('system_chat_themes', updated);
    return newTheme;
  }

  async deleteTheme(id: string) {
    const themes = await this.getThemes();
    const filtered = themes.filter(t => t.id !== id);
    if (filtered.length === themes.length) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }
    await this.updateSetting('system_chat_themes', filtered);
    return { success: true };
  }

  // 4. Board & Chat Wallpapers
  async getWallpapers(): Promise<BoardBackground[]> {
    const defaultWallpapers: BoardBackground[] = [
      { id: 'cosmic', name: 'Deep Space Galaxy', image: '/cosmic_board_bg.jpg', desc: 'Nebula galaxy and stars', category: 'Space' },
      { id: 'moon', name: 'Crescent Moon Night', image: '/crescent_moon_night_bg.jpg', desc: 'Starry sky over mountains', category: 'Night' },
      { id: 'track', name: 'Athletic Sprint Track', image: '/track_sprint_bg.jpg', desc: 'Vivid blue stadium lanes', category: 'Abstract' },
      { id: 'wood', name: 'Natural Oak Planks', image: '/wood_planks_bg.jpg', desc: 'Warm vertical timber wall', category: 'Wood' },
      { id: 'ocean', name: 'Calm Ocean Horizon', image: '/calm_ocean_bg.jpg', desc: 'Tranquil turquoise sea', category: 'Nature' },
      { id: 'library', name: 'Vintage Library', image: '/library_books_bg.jpg', desc: 'Classic cozy bookshelves', category: 'Interior' },
      { id: 'desk', name: 'Modern Workspace Desk', image: '/workspace_desk_bg.jpg', desc: 'Clean laptop & coffee flat lay', category: 'Office' },
    ];

    return this.getOrSeedSetting<BoardBackground[]>('system_board_backgrounds', defaultWallpapers);
  }

  async addWallpaper(wallpaper: Omit<BoardBackground, 'id'>): Promise<BoardBackground> {
    const wallpapers = await this.getWallpapers();
    const newWallpaper: BoardBackground = {
      id: `wp-${Date.now()}`,
      name: wallpaper.name,
      image: wallpaper.image,
      desc: wallpaper.desc || 'Custom workspace wallpaper',
      category: wallpaper.category || 'Custom',
      createdAt: new Date().toISOString(),
    };

    const updated = [newWallpaper, ...wallpapers];
    await this.updateSetting('system_board_backgrounds', updated);
    return newWallpaper;
  }

  async deleteWallpaper(id: string) {
    const wallpapers = await this.getWallpapers();
    const filtered = wallpapers.filter(w => w.id !== id);
    if (filtered.length === wallpapers.length) {
      throw new NotFoundException(`Wallpaper with ID ${id} not found`);
    }
    await this.updateSetting('system_board_backgrounds', filtered);
    return { success: true };
  }

  // 5. Template Categories
  async getTemplateCategories(): Promise<TemplateCategory[]> {
    const defaultCategories: TemplateCategory[] = [
      {
        id: 'project-management',
        name: 'Project Management',
        icon: 'project-management',
        iconColor: 'bg-amber-50 text-amber-600 border border-amber-200/80',
        iconGradient: 'from-amber-500 to-orange-500',
        iconShadow: 'shadow-amber-500/25',
        cardBgGradient: 'from-amber-500/[0.09] via-amber-500/[0.02] to-white',
        borderColor: 'border-amber-200/80',
        hoverBorderColor: 'group-hover:border-amber-400',
        hoverShadowColor: 'group-hover:shadow-amber-500/15',
        badgeStyle: 'bg-amber-100/80 text-amber-800 border-amber-200/70',
        hoverTextColor: 'group-hover:text-amber-700',
      },
      {
        id: 'business',
        name: 'Business',
        icon: 'business',
        iconColor: 'bg-blue-50 text-blue-600 border border-blue-200/80',
        iconGradient: 'from-blue-600 to-cyan-500',
        iconShadow: 'shadow-blue-500/25',
        cardBgGradient: 'from-blue-500/[0.09] via-blue-500/[0.02] to-white',
        borderColor: 'border-blue-200/80',
        hoverBorderColor: 'group-hover:border-blue-400',
        hoverShadowColor: 'group-hover:shadow-blue-500/15',
        badgeStyle: 'bg-blue-100/80 text-blue-800 border-blue-200/70',
        hoverTextColor: 'group-hover:text-blue-700',
      },
      {
        id: 'engineering',
        name: 'Engineering',
        icon: 'engineering',
        iconColor: 'bg-indigo-50 text-indigo-600 border border-indigo-200/80',
        iconGradient: 'from-indigo-600 to-violet-500',
        iconShadow: 'shadow-indigo-500/25',
        cardBgGradient: 'from-indigo-500/[0.09] via-indigo-500/[0.02] to-white',
        borderColor: 'border-indigo-200/80',
        hoverBorderColor: 'group-hover:border-indigo-400',
        hoverShadowColor: 'group-hover:shadow-indigo-500/15',
        badgeStyle: 'bg-indigo-100/80 text-indigo-800 border-indigo-200/70',
        hoverTextColor: 'group-hover:text-indigo-700',
      },
      {
        id: 'design',
        name: 'Design & Creative',
        icon: 'design',
        iconColor: 'bg-pink-50 text-pink-600 border border-pink-200/80',
        iconGradient: 'from-pink-500 to-rose-500',
        iconShadow: 'shadow-pink-500/25',
        cardBgGradient: 'from-pink-500/[0.09] via-pink-500/[0.02] to-white',
        borderColor: 'border-pink-200/80',
        hoverBorderColor: 'group-hover:border-pink-400',
        hoverShadowColor: 'group-hover:shadow-pink-500/15',
        badgeStyle: 'bg-pink-100/80 text-pink-800 border-pink-200/70',
        hoverTextColor: 'group-hover:text-pink-700',
      },
      {
        id: 'operations',
        name: 'Operations & Support',
        icon: 'remote-work',
        iconColor: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80',
        iconGradient: 'from-emerald-600 to-teal-500',
        iconShadow: 'shadow-emerald-500/25',
        cardBgGradient: 'from-emerald-500/[0.09] via-emerald-500/[0.02] to-white',
        borderColor: 'border-emerald-200/80',
        hoverBorderColor: 'group-hover:border-emerald-400',
        hoverShadowColor: 'group-hover:shadow-emerald-500/15',
        badgeStyle: 'bg-emerald-100/80 text-emerald-800 border-emerald-200/70',
        hoverTextColor: 'group-hover:text-emerald-700',
      },
      {
        id: 'hr',
        name: 'HR & Training',
        icon: 'education',
        iconColor: 'bg-violet-50 text-violet-600 border border-violet-200/80',
        iconGradient: 'from-violet-600 to-purple-500',
        iconShadow: 'shadow-violet-500/25',
        cardBgGradient: 'from-violet-500/[0.09] via-violet-500/[0.02] to-white',
        borderColor: 'border-violet-200/80',
        hoverBorderColor: 'group-hover:border-violet-400',
        hoverShadowColor: 'group-hover:shadow-violet-500/15',
        badgeStyle: 'bg-violet-100/80 text-violet-800 border-violet-200/70',
        hoverTextColor: 'group-hover:text-violet-700',
      },
    ];

    return this.getOrSeedSetting<TemplateCategory[]>('system_template_categories', defaultCategories);
  }

  // 6. Channel & Board Starter Templates
  async getTemplates(): Promise<any[]> {
    const defaultTemplates: any[] = [
      {
        id: "kanban-sprint",
        name: "Kanban Sprint Board",
        category: "engineering",
        description: "Agile kanban board with backlog, in-progress, code review, and QA stages.",
        icon: "kanban",
        defaultTab: "Board",
        bannerGradient: "from-indigo-600 to-violet-800",
        templateConfig: {
          bgImage: "/cosmic_board_bg.jpg",
          boardName: "Sprint Backlog & Execution",
          columns: [
            { id: "col-todo", title: "Backlog", cards: [] },
            { id: "col-dev", title: "In Development", cards: [] },
            { id: "col-review", title: "Code Review", cards: [] },
            { id: "col-done", title: "Completed", cards: [] }
          ]
        }
      },
      {
        id: "sales-pipeline",
        name: "Enterprise Sales Pipeline",
        category: "business",
        description: "Track enterprise opportunities from lead qualification to closed contracts.",
        icon: "dollar-sign",
        defaultTab: "Pipeline",
        bannerGradient: "from-emerald-700 to-cyan-900",
        templateConfig: {
          bgImage: "/wood_planks_bg.jpg",
          boardName: "Enterprise Sales Pipeline",
          columns: [
            { id: "col-lead", title: "Qualified Leads", cards: [] },
            { id: "col-demo", title: "Meeting / Demo", cards: [] },
            { id: "col-proposal", title: "Proposal Sent", cards: [] },
            { id: "col-won", title: "Closed Won", cards: [] }
          ]
        }
      },
      {
        id: "tier-list",
        name: "Feature Tier List & Prioritization",
        category: "project-management",
        description: "Rank product ideas and backlog items by priority, impact, and effort.",
        icon: "award",
        defaultTab: "Tier Board",
        bannerGradient: "from-blue-600 to-indigo-900",
        templateConfig: {
          bgImage: "/track_sprint_bg.jpg",
          boardName: "Product Priority Tiers",
          columns: [
            { id: "col-s", title: "S-Tier (Critical)", cards: [] },
            { id: "col-a", title: "A-Tier (High Value)", cards: [] },
            { id: "col-b", title: "B-Tier (Nice to Have)", cards: [] }
          ]
        }
      },
      {
        id: "feedback-triage",
        name: "Customer Feedback & Bug Triage",
        category: "operations",
        description: "Collect user feedback, assign bug severity, and track fixes.",
        icon: "message-square-plus",
        defaultTab: "Triage",
        bannerGradient: "from-amber-600 to-rose-900",
        templateConfig: {
          bgImage: "/crescent_moon_night_bg.jpg",
          boardName: "Feedback & Bug Triage",
          columns: [
            { id: "col-new", title: "Incoming Feedback", cards: [] },
            { id: "col-investigating", title: "Investigating", cards: [] },
            { id: "col-resolved", title: "Resolved", cards: [] }
          ]
        }
      },
      {
        id: "new-hire-onboarding",
        name: "New Hire Onboarding Hub",
        category: "hr",
        description: "Structured 30-60-90 day checklist and resources for new team members.",
        icon: "user-plus",
        defaultTab: "Checklist",
        bannerGradient: "from-teal-600 to-blue-800",
        templateConfig: {
          bgImage: "/workspace_desk_bg.jpg",
          boardName: "Onboarding Checklist",
          columns: [
            { id: "col-day1", title: "First Week Setup", cards: [] },
            { id: "col-day30", title: "30-Day Checkpoint", cards: [] },
            { id: "col-day60", title: "60-Day Milestone", cards: [] }
          ]
        }
      }
    ];

    return this.getOrSeedSetting<any[]>('system_channel_templates', defaultTemplates);
  }

  async addTemplate(template: any): Promise<any> {
    const templates = await this.getTemplates();
    const newTemplate = {
      ...template,
      id: template.id || `tpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTemplate, ...templates];
    await this.updateSetting('system_channel_templates', updated);
    return newTemplate;
  }

  async deleteTemplate(id: string) {
    const templates = await this.getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    if (filtered.length === templates.length) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    await this.updateSetting('system_channel_templates', filtered);
    return { success: true };
  }

  // 7. AI Query Suggestions
  async getAiSuggestions(): Promise<string[]> {
    const defaults = [
      "Summarize this week's progress",
      "What are my overdue tasks?",
      "Generate meeting notes",
      "Draft sprint retro summary",
    ];

    return this.getOrSeedSetting<string[]>('system_ai_suggestions', defaults);
  }

  async updateAiSuggestions(suggestions: string[]) {
    return this.updateSetting<string[]>('system_ai_suggestions', suggestions);
  }

  // 8. Workspace System Configuration
  async getSystemSettings(): Promise<SystemWorkspaceConfig> {
    const defaults: SystemWorkspaceConfig = {
      workspaceName: "Workspace",
      logoInitial: "W",
      defaultTimezone: "Asia/Kolkata (GMT+05:30)",
      defaultLanguage: "English (US)",
      maxUploadSizeMB: 25,
      allowedExtensions: ["pdf", "fig", "png", "jpg", "jpeg", "docx", "zip", "mp4"],
    };

    return this.getOrSeedSetting<SystemWorkspaceConfig>('system_workspace_config', defaults);
  }

  async updateSystemSettings(config: Partial<SystemWorkspaceConfig>) {
    const current = await this.getSystemSettings();
    const updated = { ...current, ...config };
    return this.updateSetting<SystemWorkspaceConfig>('system_workspace_config', updated);
  }
}


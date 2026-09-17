import { pgTable, serial, varchar, timestamp, integer, text, boolean, jsonb, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 100 }).default('Member'),
  department: varchar('department', { length: 100 }).default('Engineering'),
  status: varchar('status', { length: 100 }).default('Active'),
  avatar: text('avatar'),
  bio: text('bio'),
  language: varchar('language', { length: 100 }).default('English (US)'),
  timezone: varchar('timezone', { length: 100 }).default('Pacific Time (PT)'),
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  pushNotifications: boolean('push_notifications').default(true).notNull(),
  inAppNotifications: boolean('in_app_notifications').default(true).notNull(),
  resetPasswordToken: varchar('reset_password_token', { length: 255 }),
  resetPasswordExpires: timestamp('reset_password_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  teamId: integer('team_id').references(() => teams.id),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sprints = pgTable('sprints', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  projectId: integer('project_id').references(() => projects.id),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 50 }).default('planned'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('todo'),
  priority: varchar('priority', { length: 50 }).default('medium'),
  projectId: integer('project_id').references(() => projects.id),
  sprintId: integer('sprint_id').references(() => sprints.id),
  assigneeId: integer('assignee_id').references(() => users.id),
  channelId: varchar('channel_id', { length: 255 }).references(() => channels.id),
  estimatedHours: real('estimated_hours'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const timeLogs = pgTable('time_logs', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id),
  userId: integer('user_id').references(() => users.id),
  projectId: integer('project_id').references(() => projects.id),
  hours: real('hours').notNull(),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  senderId: integer('sender_id').references(() => users.id),
  receiverId: integer('receiver_id').references(() => users.id),
  teamId: integer('team_id').references(() => teams.id),
  channelId: varchar('channel_id', { length: 255 }),
  parentId: integer('parent_id'), // For threaded replies
  isEdited: boolean('is_edited').default(false).notNull(),
  attachments: jsonb('attachments'), // Array of { name, url, type, size }
  reactions: jsonb('reactions'), // Record<emoji, userIds[]> e.g. { '👍': [1, 2], '❤️': [3] }
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 1000 }).notNull(),
  size: integer('size'),
  type: varchar('type', { length: 100 }),
  uploadedById: integer('uploaded_by_id').references(() => users.id),
  projectId: integer('project_id').references(() => projects.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  projectId: integer('project_id').references(() => projects.id),
  authorId: integer('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const meetings = pgTable('meetings', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  organizerId: integer('organizer_id').references(() => users.id),
  teamId: integer('team_id').references(() => teams.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  data: jsonb('data'),
  generatedById: integer('generated_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  key: varchar('key', { length: 255 }).notNull(),
  value: text('value'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  content: text('content').notNull(),
  type: varchar('type', { length: 100 }).default('system').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const channels = pgTable('channels', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  creatorId: integer('creator_id').references(() => users.id),
  bgGradient: varchar('bg_gradient', { length: 255 }).default('from-indigo-600 via-indigo-700 to-purple-800'),
  isTemplate: boolean('is_template').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const channelMembers = pgTable('channel_members', {
  id: serial('id').primaryKey(),
  channelId: varchar('channel_id', { length: 255 }).references(() => channels.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  addedById: integer('added_by_id').references(() => users.id),
  status: varchar('status', { length: 50 }).default('accepted').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});



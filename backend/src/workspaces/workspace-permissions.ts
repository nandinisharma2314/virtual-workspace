export const WORKSPACE_PERMISSIONS = {
  // Workspace management
  WORKSPACE_MANAGE: 'workspace:manage',
  ROLES_MANAGE: 'roles:manage',
  MEMBERS_INVITE: 'members:invite',
  MEMBERS_REMOVE: 'members:remove',
  MEMBERS_ASSIGN_ROLE: 'members:assign_role',

  // Projects
  PROJECTS_CREATE: 'projects:create',
  PROJECTS_READ_ALL: 'projects:read_all',
  PROJECTS_READ_ASSIGNED: 'projects:read_assigned',
  PROJECTS_EDIT: 'projects:edit',
  PROJECTS_DELETE: 'projects:delete',
  PROJECTS_ASSIGN: 'projects:assign',

  // Boards (Trello)
  BOARDS_CREATE: 'boards:create',
  BOARDS_READ_ALL: 'boards:read_all',
  BOARDS_READ_ASSIGNED: 'boards:read_assigned',
  BOARDS_EDIT: 'boards:edit',
  BOARDS_DELETE: 'boards:delete',

  // Tasks & Sprints (Jira)
  TASKS_CREATE: 'tasks:create',
  TASKS_READ_ALL: 'tasks:read_all',
  TASKS_READ_ASSIGNED: 'tasks:read_assigned',
  TASKS_EDIT_ALL: 'tasks:edit_all',
  TASKS_EDIT_ASSIGNED: 'tasks:edit_assigned',
  TASKS_DELETE: 'tasks:delete',
  TASKS_ASSIGN: 'tasks:assign',
  SPRINTS_MANAGE: 'sprints:manage',

  // Teams & Communication (Teams & Slack)
  TEAMS_MANAGE: 'teams:manage',
  CHANNELS_CREATE: 'channels:create',
  FILES_MANAGE: 'files:manage',
  DOCUMENTS_MANAGE: 'documents:manage',
  MEETINGS_MANAGE: 'meetings:manage',
  REPORTS_VIEW: 'reports:view',
} as const;

export type WorkspacePermission = (typeof WORKSPACE_PERMISSIONS)[keyof typeof WORKSPACE_PERMISSIONS];

export interface PermissionDefinition {
  key: WorkspacePermission;
  label: string;
  group: 'Workspace' | 'Members' | 'Projects' | 'Boards' | 'Tasks' | 'Collaboration' | 'Analytics';
  description?: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { key: 'workspace:manage', label: 'Manage Workspace Settings', group: 'Workspace', description: 'Can rename workspace and change configuration' },
  { key: 'roles:manage', label: 'Create & Edit Roles & Permissions', group: 'Workspace', description: 'Can define custom roles, permission matrix, and role labels' },
  { key: 'members:invite', label: 'Invite New Members', group: 'Members', description: 'Can invite members and assign initial roles' },
  { key: 'members:remove', label: 'Remove Members', group: 'Members', description: 'Can kick members from the workspace' },
  { key: 'members:assign_role', label: 'Change Member Roles', group: 'Members', description: 'Can reassign member roles and custom labels' },
  
  { key: 'projects:create', label: 'Create Projects', group: 'Projects', description: 'Can create new projects' },
  { key: 'projects:read_all', label: 'View All Projects in Workspace', group: 'Projects', description: 'Can view every project in the workspace' },
  { key: 'projects:read_assigned', label: 'View Only Assigned Projects', group: 'Projects', description: 'Can only view projects where user is assigned' },
  { key: 'projects:edit', label: 'Edit Projects', group: 'Projects', description: 'Can update project details and settings' },
  { key: 'projects:delete', label: 'Delete Projects', group: 'Projects', description: 'Can delete projects' },
  { key: 'projects:assign', label: 'Assign Projects & Assignees', group: 'Projects', description: 'Can assign managers, supervisors, and employees to projects' },

  { key: 'boards:create', label: 'Create Kanban Boards', group: 'Boards', description: 'Can create new visual Kanban boards' },
  { key: 'boards:read_all', label: 'View All Boards', group: 'Boards', description: 'Can view all boards in the workspace' },
  { key: 'boards:read_assigned', label: 'View Only Assigned Boards', group: 'Boards', description: 'Can only view boards where user is a member' },
  { key: 'boards:edit', label: 'Edit Boards & Columns', group: 'Boards', description: 'Can modify board columns, titles, and layout' },
  { key: 'boards:delete', label: 'Delete Boards', group: 'Boards', description: 'Can delete boards from workspace' },

  { key: 'tasks:create', label: 'Create Tasks', group: 'Tasks', description: 'Can create new tasks' },
  { key: 'tasks:read_all', label: 'View All Tasks in Workspace', group: 'Tasks', description: 'Can view all tasks in the workspace' },
  { key: 'tasks:read_assigned', label: 'View Only Assigned Tasks', group: 'Tasks', description: 'Can view only tasks assigned to self' },
  { key: 'tasks:edit_all', label: 'Edit Any Task', group: 'Tasks', description: 'Can edit status and details of any task' },
  { key: 'tasks:edit_assigned', label: 'Edit Assigned Tasks', group: 'Tasks', description: 'Can edit status and details of assigned tasks' },
  { key: 'tasks:delete', label: 'Delete Tasks', group: 'Tasks', description: 'Can delete tasks' },
  { key: 'tasks:assign', label: 'Assign Tasks to Others', group: 'Tasks', description: 'Can assign tasks to any member' },
  { key: 'sprints:manage', label: 'Manage Sprints', group: 'Tasks', description: 'Can create, start, and complete sprints' },

  { key: 'teams:manage', label: 'Manage Teams', group: 'Collaboration', description: 'Can create and manage teams' },
  { key: 'channels:create', label: 'Create Channels', group: 'Collaboration', description: 'Can create chat channels' },
  { key: 'files:manage', label: 'Upload & Delete Files', group: 'Collaboration', description: 'Can upload and delete files' },
  { key: 'documents:manage', label: 'Create & Edit Documents', group: 'Collaboration', description: 'Can create and edit workspace documents' },
  { key: 'meetings:manage', label: 'Schedule Meetings', group: 'Collaboration', description: 'Can schedule calendar meetings' },
  { key: 'reports:view', label: 'View Reports & Analytics', group: 'Analytics', description: 'Can view workspace performance and time tracking' },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: PERMISSION_DEFINITIONS.map(p => p.key),
  Manager: [
    'members:invite',
    'projects:create',
    'projects:read_all',
    'projects:edit',
    'projects:assign',
    'boards:create',
    'boards:read_all',
    'boards:edit',
    'boards:delete',
    'tasks:create',
    'tasks:read_all',
    'tasks:edit_all',
    'tasks:assign',
    'sprints:manage',
    'teams:manage',
    'channels:create',
    'files:manage',
    'documents:manage',
    'meetings:manage',
    'reports:view',
  ],
  Supervisor: [
    'projects:read_all',
    'projects:assign',
    'boards:create',
    'boards:read_all',
    'boards:edit',
    'tasks:create',
    'tasks:read_all',
    'tasks:edit_all',
    'tasks:assign',
    'sprints:manage',
    'channels:create',
    'files:manage',
    'documents:manage',
    'meetings:manage',
    'reports:view',
  ],
  'Normal Employee': [
    'projects:read_assigned',
    'boards:read_all',
    'tasks:read_assigned',
    'tasks:edit_assigned',
    'files:manage',
    'documents:manage',
  ],
};

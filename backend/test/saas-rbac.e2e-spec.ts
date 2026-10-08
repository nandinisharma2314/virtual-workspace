import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('SaaS Multi-Tenant RBAC & All-in-One Engine (e2e)', () => {
  let app: INestApplication;
  let ownerToken: string;
  let ownerId: number;
  let workspaceId: number;
  let restrictedRoleId: number;
  let memberToken: string;
  let memberId: number;

  let secretProjectId: number;
  let sharedProjectId: number;
  let secretTaskId: number;
  let sharedTaskId: number;
  let boardId: number;
  let boardListId: number;
  let meetingId: number;

  const timestamp = Date.now();
  const ownerEmail = `owner_${timestamp}@saas-startup.com`;
  const memberEmail = `developer_${timestamp}@saas-startup.com`;
  const password = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Owner Registration & Workspace Setup
  it('1. Should register company owner and automatically create workspace', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'CEO Owner',
        email: ownerEmail,
        password,
        department: 'Executive',
      })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    ownerToken = res.body.access_token;
    ownerId = res.body.user.id;

    // Get owner's workspace
    const wsRes = await request(app.getHttpServer())
      .get('/workspaces')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(Array.isArray(wsRes.body)).toBe(true);
    expect(wsRes.body.length).toBeGreaterThan(0);
    workspaceId = wsRes.body[0].id;
    expect(workspaceId).toBeDefined();
  });

  // 2. Custom Role Creation with Granular Permissions
  it('2. Owner creates custom role "Restricted Dev" with scoped permissions', async () => {
    const res = await request(app.getHttpServer())
      .post(`/workspaces/${workspaceId}/roles`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Restricted Dev',
        description: 'Can only view assigned projects and tasks',
        permissions: [
          'projects:read_assigned',
          'tasks:read_assigned',
          'tasks:edit',
          'tasks:edit_assigned',
          'boards:read_all',
          'boards:create',
          'boards:edit',
          'chat:read',
          'chat:send',
          'meetings:read',
          'meetings:rsvp',
        ],
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    restrictedRoleId = res.body.id;
  });

  // 3. Invite Member with Restricted Role & Accept
  it('3. Owner invites member with custom role, and member accepts invitation', async () => {
    const inviteRes = await request(app.getHttpServer())
      .post(`/workspaces/${workspaceId}/invites`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: memberEmail,
        roleId: restrictedRoleId,
        customRoleLabel: 'Contractor Engineer',
      })
      .expect(201);

    expect(inviteRes.body.token).toBeDefined();
    const inviteToken = inviteRes.body.token;

    // Member registers with inviteToken
    const regRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Contractor Dev',
        email: memberEmail,
        password,
        inviteToken,
      })
      .expect(201);

    expect(regRes.body.access_token).toBeDefined();
    memberToken = regRes.body.access_token;
    memberId = regRes.body.user.id;
    expect(memberId).toBeDefined();
  });

  // 4. Project Scoping & Isolation
  it('4. Owner creates Secret Project and Shared Project with member assigned', async () => {
    // Secret Project (owner only)
    const p1 = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-workspace-id', String(workspaceId))
      .send({
        name: 'Executive Confidential M&A',
        description: 'Owner only secret deal',
        workspaceId,
        memberIds: [ownerId],
      })
      .expect(201);

    secretProjectId = p1.body.id;

    // Shared Project (with member assigned)
    const p2 = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-workspace-id', String(workspaceId))
      .send({
        name: 'Client Mobile App',
        description: 'Collaborative development',
        workspaceId,
        memberIds: [ownerId, memberId],
      })
      .expect(201);

    sharedProjectId = p2.body.id;
  });

  it('5. Member should ONLY see Shared Project and CANNOT access Secret Project', async () => {
    // Member lists projects
    const listRes = await request(app.getHttpServer())
      .get('/projects')
      .set('Authorization', `Bearer ${memberToken}`)
      .set('x-workspace-id', String(workspaceId))
      .expect(200);

    const projectIds = listRes.body.map((p: any) => p.id);
    expect(projectIds).toContain(sharedProjectId);
    expect(projectIds).not.toContain(secretProjectId);

    // Member attempts direct access to Secret Project
    await request(app.getHttpServer())
      .get(`/projects/${secretProjectId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .set('x-workspace-id', String(workspaceId))
      .expect(403);
  });

  // 5. Task Scoping & Isolation
  it('6. Owner creates Secret Task and Shared Task (assigned to Member)', async () => {
    // Secret Task
    const t1 = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-workspace-id', String(workspaceId))
      .send({
        title: 'Draft Exec Salaries',
        description: 'Highly sensitive',
        status: 'todo',
        priority: 'high',
        projectId: sharedProjectId,
        assigneeId: ownerId,
        workspaceId,
      })
      .expect(201);

    secretTaskId = t1.body.id;

    // Shared Task assigned to Member
    const t2 = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-workspace-id', String(workspaceId))
      .send({
        title: 'Implement Auth Refresh Token',
        description: 'Contractor assignment',
        status: 'in_progress',
        priority: 'medium',
        projectId: sharedProjectId,
        assigneeId: memberId,
        workspaceId,
      })
      .expect(201);

    sharedTaskId = t2.body.id;
  });

  it('7. Member should ONLY see assigned task and is blocked from secret task', async () => {
    // Member lists tasks
    const listRes = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${memberToken}`)
      .set('x-workspace-id', String(workspaceId))
      .expect(200);

    const taskIds = listRes.body.map((t: any) => t.id);
    expect(taskIds).toContain(sharedTaskId);
    expect(taskIds).not.toContain(secretTaskId);

    // Direct access to secret task
    await request(app.getHttpServer())
      .get(`/tasks/${secretTaskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);

    // Full detail access to secret task
    await request(app.getHttpServer())
      .get(`/tasks/${secretTaskId}/full`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);

    // Full detail access to assigned task must succeed
    const fullRes = await request(app.getHttpServer())
      .get(`/tasks/${sharedTaskId}/full`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);

    expect(fullRes.body.id).toBe(sharedTaskId);
    expect(fullRes.body.title).toBe('Implement Auth Refresh Token');
  });

  // 6. Trello Parity: Boards, Lists, Checklists, Comments
  it('8. Trello Parity: Board creation, auto-seeded lists, checklists, comments', async () => {
    // Owner creates board
    const bRes = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-workspace-id', String(workspaceId))
      .send({
        name: 'Sprint Kanban Board',
        description: 'Trello-style flow',
        workspaceId,
      })
      .expect(201);

    boardId = bRes.body.id;
    expect(boardId).toBeDefined();

    // Member fetches board with lists
    const bGetRes = await request(app.getHttpServer())
      .get(`/boards/${boardId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);

    expect(bGetRes.body.lists).toBeDefined();
    expect(bGetRes.body.lists.length).toBeGreaterThanOrEqual(4);
    boardListId = bGetRes.body.lists[0].id;

    // Member adds checklist to assigned task
    const clRes = await request(app.getHttpServer())
      .post(`/tasks/${sharedTaskId}/checklists`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'Definition of Done' })
      .expect(201);

    const checklistId = clRes.body.id;

    // Member adds item to checklist
    const itemRes = await request(app.getHttpServer())
      .post(`/tasks/${sharedTaskId}/checklists/${checklistId}/items`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ content: 'Unit tests passed' })
      .expect(201);

    const itemId = itemRes.body.id;

    // Member toggles item completed
    await request(app.getHttpServer())
      .patch(`/tasks/${sharedTaskId}/checklists/${checklistId}/items/${itemId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ isCompleted: true })
      .expect(200);

    // Member adds comment to card
    const cRes = await request(app.getHttpServer())
      .post(`/tasks/${sharedTaskId}/comments`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ content: 'Finished security unit tests!' })
      .expect(201);

    expect(cRes.body.content).toBe('Finished security unit tests!');

    // Move card to list
    await request(app.getHttpServer())
      .patch(`/boards/${boardId}/cards/move`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        taskId: sharedTaskId,
        targetListId: boardListId,
        newOrder: 0,
      })
      .expect(200);
  });

  // 7. Jira Parity: Backlog & Sprint Lifecycle
  it('9. Jira Parity: Backlog assignment, Sprint Start & Complete lifecycle', async () => {
    // Owner creates Sprint
    const sprintRes = await request(app.getHttpServer())
      .post('/sprints')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Sprint 101 Alpha',
        goal: 'Complete auth and onboarding',
        sprintNumber: 101,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'planned',
        projectId: sharedProjectId,
      })
      .expect(201);

    const sprintId = sprintRes.body.id;

    // Assign shared task to sprint
    await request(app.getHttpServer())
      .post(`/sprints/${sprintId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ taskId: sharedTaskId })
      .expect(201);

    // Start sprint
    const startRes = await request(app.getHttpServer())
      .post(`/sprints/${sprintId}/start`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(startRes.body.status).toBe('active');

    // Complete sprint
    const compRes = await request(app.getHttpServer())
      .post(`/sprints/${sprintId}/complete`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ rolloverIncompleteTo: 'backlog' })
      .expect(200);

    expect(compRes.body.status).toBe('completed');
  });

  // 8. Teams Parity: Meeting scheduling & Member RSVP
  it('10. Teams Parity: Meeting scheduling and interactive member RSVP', async () => {
    const meetRes = await request(app.getHttpServer())
      .post('/meetings')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('x-workspace-id', String(workspaceId))
      .send({
        title: 'Weekly Multi-Tenant Sync',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        projectId: sharedProjectId,
        workspaceId,
      })
      .expect(201);

    meetingId = meetRes.body.id;

    // Member submits RSVP
    const rsvpRes = await request(app.getHttpServer())
      .post(`/meetings/${meetingId}/rsvp`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'accepted' })
      .expect(200);

    expect(rsvpRes.body.status).toBe('accepted');
  });
});

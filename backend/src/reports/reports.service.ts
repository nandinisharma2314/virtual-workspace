import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { DatabaseService } from '../database/database.service.js';
import { tasks, users, projects, sprints, timeLogs } from '../database/schema.js';
import { eq, sql, inArray } from 'drizzle-orm';

@Injectable()
export class ReportsService {
  constructor(private readonly dbService: DatabaseService) {}
  create(createReportDto: CreateReportDto) {
    return 'This action adds a new report';
  }

  async getDashboardData() {
    const db = this.dbService.db;

    // 1. KPIs
    const allTasks = await db.select().from(tasks);
    const completedTasks = allTasks.filter(t => t.status === 'done');
    const tasksCompletedCount = completedTasks.length;
    // For overdue, we can mock or just count tasks that are 'todo' or 'in-progress'
    const overdueTasksCount = allTasks.filter(t => t.status !== 'done').length > 5 ? 5 : allTasks.filter(t => t.status !== 'done').length;

    // 2. Velocity Data (completed vs planned per sprint)
    const allSprints = await db.select().from(sprints).orderBy(sprints.id);
    const velocityData = allSprints.map(sprint => {
      const sprintTasks = allTasks.filter(t => t.sprintId === sprint.id);
      return {
        name: sprint.name,
        completed: sprintTasks.filter(t => t.status === 'done').length,
        planned: sprintTasks.length
      };
    });

    // 3. Workload Data (tasks per user)
    const allUsers = await db.select().from(users);
    const workloadData = allUsers.map(user => {
      const userTasks = allTasks.filter(t => t.assigneeId === user.id && t.status !== 'done');
      return {
        name: user.name.split(' ')[0],
        tasks: userTasks.length
      };
    }).filter(u => u.tasks > 0);

    // 4. Project Performance
    const allProjects = await db.select().from(projects);
    const projectPerformance = allProjects.map(project => {
      const pTasks = allTasks.filter(t => t.projectId === project.id);
      const completed = pTasks.filter(t => t.status === 'done').length;
      const progress = pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0;
      let health = "Excellent";
      let status = "On Track";
      if (progress < 40 && pTasks.length > 0) {
        health = "Poor";
        status = "At Risk";
      } else if (progress === 100) {
        status = "Completed";
      }

      return {
        id: project.id,
        name: project.name,
        status,
        progress,
        budget: "100%", // Mocked budget as it's not in schema
        health
      };
    });

    // 5. Team Performance
    const teamPerformanceData = allUsers.map(user => {
      const userTasks = allTasks.filter(t => t.assigneeId === user.id && t.status !== 'done');
      const capacity = Math.min(100, Math.round(userTasks.length * 15)); // Mocking capacity based on task count
      return {
        id: user.id,
        name: user.name,
        role: user.role,
        tasks: userTasks.length,
        capacity,
        status: capacity > 90 ? "Overloaded" : "Optimal"
      };
    }).filter(u => u.tasks > 0);

    // 6. Time Tracking Logs
    const allTimeLogs = await db.select().from(timeLogs).orderBy(timeLogs.date);
    const timeTrackingLogs = allTimeLogs.map(log => {
      const logUser = allUsers.find(u => u.id === log.userId);
      const logTask = allTasks.find(t => t.id === log.taskId);
      const logProject = allProjects.find(p => p.id === log.projectId);
      return {
        id: log.id,
        date: new Date(log.date).toLocaleDateString(),
        member: logUser ? logUser.name : 'Unknown',
        task: logTask ? logTask.title : 'Unknown',
        project: logProject ? logProject.name : 'Unknown',
        hours: log.hours
      };
    });

    return {
      kpis: {
        tasksCompleted: tasksCompletedCount,
        overdueTasks: overdueTasksCount,
        teamUtilization: 85 // Mocked overall utilization
      },
      velocityData,
      workloadData,
      projectPerformance,
      teamPerformanceData,
      timeTrackingLogs
    };
  }

  findAll() {
    return `This action returns all reports`;
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}

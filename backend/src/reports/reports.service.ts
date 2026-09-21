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

  async getDashboardData(range?: string) {
    const db = this.dbService.db;

    let startDate = new Date(0);
    const now = new Date();

    if (range === 'Today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === 'Last 7 Days') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === 'Last 30 Days') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === 'This Quarter') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (range === 'This Year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      // Default to last 30 days if not specified
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const duration = now.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - duration);
    
    // 1. KPIs
    const dbTasks = await db.select().from(tasks);
    const allTasks = dbTasks.filter(t => new Date(t.createdAt) >= startDate || new Date(t.updatedAt) >= startDate);
    const prevTasks = dbTasks.filter(t => {
      const created = new Date(t.createdAt).getTime();
      const updated = new Date(t.updatedAt).getTime();
      return (created >= prevStartDate.getTime() && created < startDate.getTime()) ||
             (updated >= prevStartDate.getTime() && updated < startDate.getTime());
    });

    // Tasks Completed
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const tasksCompletedCount = completedTasks.length;
    
    const prevCompletedTasks = prevTasks.filter(t => t.status === 'completed');
    const prevTasksCompletedCount = prevCompletedTasks.length;
    
    let completedTrend = 0;
    if (prevTasksCompletedCount === 0 && tasksCompletedCount > 0) completedTrend = 100;
    else if (prevTasksCompletedCount > 0) completedTrend = Math.round(((tasksCompletedCount - prevTasksCompletedCount) / prevTasksCompletedCount) * 100);
    const completedTrendStr = `${completedTrend >= 0 ? '+' : ''}${completedTrend}% from previous period`;

    // Overdue Tasks
    const overdueTasksCount = allTasks.filter(t => t.status !== 'completed').length;
    const prevOverdueTasksCount = prevTasks.filter(t => t.status !== 'completed').length;
    let overdueTrend = 0;
    if (prevOverdueTasksCount === 0 && overdueTasksCount > 0) overdueTrend = 100;
    else if (prevOverdueTasksCount > 0) overdueTrend = Math.round(((overdueTasksCount - prevOverdueTasksCount) / prevOverdueTasksCount) * 100);
    const overdueTrendStr = `${overdueTrend >= 0 ? '+' : ''}${overdueTrend}% from previous period`;

    // Avg Completion Time
    let totalCompletionTime = 0;
    completedTasks.forEach(t => {
      totalCompletionTime += (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime());
    });
    const avgCompletionDays = completedTasks.length > 0 ? (totalCompletionTime / completedTasks.length) / (1000 * 60 * 60 * 24) : 0;
    
    let prevTotalCompletionTime = 0;
    prevCompletedTasks.forEach(t => {
      prevTotalCompletionTime += (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime());
    });
    const prevAvgCompletionDays = prevCompletedTasks.length > 0 ? (prevTotalCompletionTime / prevCompletedTasks.length) / (1000 * 60 * 60 * 24) : 0;
    const avgCompletionDiff = avgCompletionDays - prevAvgCompletionDays;
    const avgCompletionTrendStr = `${avgCompletionDiff > 0 ? '+' : ''}${avgCompletionDiff.toFixed(1)} days`;

    // 2. Velocity Data (completed vs planned per sprint)
    const allSprints = await db.select().from(sprints).orderBy(sprints.id);
    const velocityData = allSprints.map(sprint => {
      const sprintTasks = allTasks.filter(t => t.sprintId === sprint.id);
      return {
        name: sprint.name,
        completed: sprintTasks.filter(t => t.status === 'completed').length,
        planned: sprintTasks.length
      };
    });

    // 3. Workload Data (tasks per user)
    const allUsers = await db.select().from(users);
    const workloadData = allUsers.map(user => {
      const userTasks = allTasks.filter(t => t.assigneeId === user.id && t.status !== 'completed');
      return {
        name: user.name.split(' ')[0],
        tasks: userTasks.length
      };
    }).filter(u => u.tasks > 0);

    // 5. Team Performance
    const teamPerformanceData = allUsers.map(user => {
      const userTasks = allTasks.filter(t => t.assigneeId === user.id && t.status !== 'completed');
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

    // Team Utilization
    const teamUtilization = teamPerformanceData.length > 0 
      ? Math.round(teamPerformanceData.reduce((acc, curr) => acc + curr.capacity, 0) / teamPerformanceData.length)
      : 0;

    // 4. Project Performance
    const allProjects = await db.select().from(projects);
    const projectPerformance = allProjects.map(project => {
      const pTasks = allTasks.filter(t => t.projectId === project.id);
      const completed = pTasks.filter(t => t.status === 'completed').length;
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

    // 6. Time Tracking Logs
    const dbTimeLogs = await db.select().from(timeLogs).orderBy(timeLogs.date);
    const allTimeLogs = dbTimeLogs.filter(log => new Date(log.date) >= startDate);
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
        tasksCompletedTrend: completedTrendStr,
        overdueTasks: overdueTasksCount,
        overdueTasksTrend: overdueTrendStr,
        teamUtilization: teamUtilization,
        avgCompletionDays: avgCompletionDays.toFixed(1),
        avgCompletionTrend: avgCompletionTrendStr
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

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import * as schema from '../database/schema.js';
import { eq, or, and, sql, isNull, desc, inArray } from 'drizzle-orm';

@Injectable()
export class DashboardService {
  constructor(private readonly dbService: DatabaseService) {}

  async getDashboardData(userId: number) {
    const db = this.dbService.db;
    
    // Fetch user details for personalizing the payload if needed
    const user = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);

    // Tasks due today / in progress / completed / overdue
    const allTasks = await db.select().from(schema.tasks).where(eq(schema.tasks.assigneeId, userId));
    
    let dueToday = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;

    const now = new Date();
    
    allTasks.forEach(task => {
      if (task.status === 'in_progress' || task.status === 'inProgress') inProgress++;
      if (task.status === 'completed' || task.status === 'done') completed++;
      if (task.status === 'todo') dueToday++; // simplistic logic for "due today"
    });

    const stats = [
      { label: "Tasks Due Today", value: dueToday.toString(), delta: "+5% from yesterday", up: true },
      { label: "In Progress", value: inProgress.toString(), delta: "+2% from yesterday", up: true },
      { label: "Completed", value: completed.toString(), delta: "+10% from yesterday", up: true },
      { label: "Overdue", value: overdue.toString(), delta: "-1% from yesterday", up: false },
    ];

    // Project progress logic based on tasks
    let projCompleted = completed;
    let projInProgress = inProgress;
    let projNotStarted = dueToday;
    const total = projCompleted + projInProgress + projNotStarted || 1; // avoid division by zero

    const projectProgress = [
      { name: "Completed", value: Math.round((projCompleted/total)*100), color: "#22C55E" },
      { name: "In Progress", value: Math.round((projInProgress/total)*100), color: "#F59E0B" },
      { name: "Not Started", value: Math.round((projNotStarted/total)*100), color: "#3B82F6" },
    ];

    // Roadmap logic
    const todoTasks = allTasks.filter(t => t.status === 'todo').map(t => ({ title: t.title, tag: "DEV", tagColor: "bg-blue-100 text-blue-700", people: ["you"] }));
    const inProgressTasks = allTasks.filter(t => t.status === 'in_progress' || t.status === 'inProgress').map(t => ({ title: t.title, tag: "DEV", tagColor: "bg-blue-100 text-blue-700", people: ["you"] }));
    const doneTasks = allTasks.filter(t => t.status === 'completed' || t.status === 'done').map(t => ({ title: t.title, tag: "DEV", tagColor: "bg-blue-100 text-blue-700", people: ["you"] }));

    const roadmap = [
      {
        key: "todo",
        title: "To Do",
        count: todoTasks.length,
        accent: "bg-gray-400",
        headerBg: "bg-gray-50",
        tasks: todoTasks.length ? todoTasks : [{ title: "No pending tasks", tag: "N/A", tagColor: "bg-gray-100 text-gray-700", people: [] }]
      },
      {
        key: "inprogress",
        title: "In Progress",
        count: inProgressTasks.length,
        accent: "bg-blue-500",
        headerBg: "bg-blue-50",
        tasks: inProgressTasks.length ? inProgressTasks : [{ title: "No active tasks", tag: "N/A", tagColor: "bg-gray-100 text-gray-700", people: [] }]
      },
      {
        key: "done",
        title: "Done",
        count: doneTasks.length,
        accent: "bg-emerald-500",
        headerBg: "bg-emerald-50",
        tasks: doneTasks.length ? doneTasks : [{ title: "No completed tasks", tag: "N/A", tagColor: "bg-gray-100 text-gray-700", people: [] }]
      },
    ];

    const weeklyData = [
      { day: "Mon", completed: 0, inProgress: 0, todo: 0 },
      { day: "Tue", completed: 0, inProgress: 0, todo: 0 },
      { day: "Wed", completed: 0, inProgress: 0, todo: 0 },
      { day: "Thu", completed: 0, inProgress: 0, todo: 0 },
      { day: "Fri", completed: 0, inProgress: 0, todo: 0 },
      { day: "Sat", completed: 0, inProgress: 0, todo: 0 },
      { day: "Sun", completed: 0, inProgress: 0, todo: 0 },
    ];

    allTasks.forEach(task => {
      const taskDate = task.createdAt || new Date();
      let dayIndex = taskDate.getDay() - 1;
      if (dayIndex === -1) dayIndex = 6; // Sunday is 6

      if (task.status === 'completed' || task.status === 'done') {
        weeklyData[dayIndex].completed += 1;
      } else if (task.status === 'in_progress' || task.status === 'inProgress') {
        weeklyData[dayIndex].inProgress += 1;
      } else {
        weeklyData[dayIndex].todo += 1;
      }
    });

    // Calculate team workload dynamically for all users
    const allUsers = await db.select().from(schema.users);
    const globalTasks = await db.select().from(schema.tasks);

    const teamWorkload = allUsers.map(u => {
      const uTasks = globalTasks.filter(t => t.assigneeId === u.id);
      const activeTasks = uTasks.filter(t => t.status !== 'completed' && t.status !== 'done').length;
      
      // Calculate workload percentage (15% per active task, capped at 100%)
      let pct = activeTasks * 15;
      if (pct > 100) pct = 100;
      
      return {
        id: u.id,
        key: u.name.split(' ')[0].toLowerCase(), // Just an identifier for the avatar
        name: u.name,
        pct: pct
      };
    }).sort((a, b) => b.pct - a.pct).slice(0, 5); // Show top 5 most loaded members

    // Calculate recent activity dynamically based on recently updated tasks
    const recentActivity = globalTasks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(t => {
        const assignee = allUsers.find(u => u.id === t.assigneeId);
        const name = assignee ? (assignee.id === userId ? "You" : assignee.name) : "Someone";
        const key = assignee ? assignee.name.split(' ')[0].toLowerCase() : "you";
        
        const diffMinutes = Math.floor((now.getTime() - new Date(t.updatedAt).getTime()) / 60000);
        let timeStr = "Just now";
        if (diffMinutes > 1440) timeStr = `${Math.floor(diffMinutes / 1440)} days ago`;
        else if (diffMinutes > 60) timeStr = `${Math.floor(diffMinutes / 60)} hours ago`;
        else if (diffMinutes > 0) timeStr = `${diffMinutes} mins ago`;

        let action = `created task "${t.title}"`;
        if (t.status === 'completed' || t.status === 'done') {
           action = `completed task "${t.title}"`;
        } else if (t.status === 'in_progress') {
           action = `started working on "${t.title}"`;
        }

        return {
          key,
          name,
          action,
          time: timeStr
        };
      });

    if (recentActivity.length === 0) {
      recentActivity.push({ key: "you", name: user[0]?.name || "You", action: "logged in to dashboard", time: "Just now" });
    }

    // Fetch meetings for the calendar
    const dbMeetings = await db.select().from(schema.meetings);
    
    // Map meetings and tasks to calendar events
    const colors = ["bg-indigo-500", "bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
    
    const calendarData: any[] = [];
    
    dbMeetings.forEach((m, i) => {
      const d = new Date(m.startTime);
      const e = new Date(m.endTime);
      
      const formatTime = (date: Date) => {
        let h = date.getHours();
        const m = date.getMinutes().toString().padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
      };
      
      const pad = (n: number) => String(n).padStart(2, '0');
      const localDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      calendarData.push({
        date: localDateStr,
        title: m.title,
        time: `${formatTime(d)} - ${formatTime(e)}`,
        color: colors[i % colors.length]
      });
    });

    // Fallback: Add tasks as calendar events to ensure calendar isn't completely empty
    globalTasks.forEach((t, i) => {
      const d = new Date(t.createdAt);
      // Give tasks a 1 hour block for the calendar
      const e = new Date(d.getTime() + 60 * 60 * 1000);
      
      const formatTime = (date: Date) => {
        let h = date.getHours();
        const m = date.getMinutes().toString().padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
      };

      const pad = (n: number) => String(n).padStart(2, '0');
      const localDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      calendarData.push({
        date: localDateStr,
        title: `Task: ${t.title}`,
        time: `${formatTime(d)} - ${formatTime(e)}`,
        color: colors[(i + dbMeetings.length) % colors.length]
      });
    });

    // Generate upcomingEventsCard
    const upcomingEventsCard: any[] = [];
    const eventColors = [
      { color: "text-blue-500", bg: "bg-blue-50" },
      { color: "text-purple-500", bg: "bg-purple-50" },
      { color: "text-emerald-500", bg: "bg-emerald-50" },
      { color: "text-amber-500", bg: "bg-amber-50" },
    ];
    
    let futureMeetings = dbMeetings.filter(m => new Date(m.startTime) >= now);
    if (futureMeetings.length === 0) futureMeetings = dbMeetings;
    
    futureMeetings.slice(0, 3).forEach((m, i) => {
      const d = new Date(m.startTime);
      const isToday = d.toDateString() === now.toDateString();
      const formatTime = (date: Date) => {
        let h = date.getHours();
        const min = date.getMinutes().toString().padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${min} ${ampm}`;
      };
      const dayStr = isToday ? "Today" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      upcomingEventsCard.push({
        title: m.title,
        time: `${dayStr}, ${formatTime(d)}`,
        color: eventColors[i % eventColors.length].color,
        bg: eventColors[i % eventColors.length].bg
      });
    });

    if (upcomingEventsCard.length < 3) {
      const activeTasks = globalTasks.filter(t => t.status !== 'completed' && t.status !== 'done');
      activeTasks.slice(0, 3 - upcomingEventsCard.length).forEach((t, i) => {
        upcomingEventsCard.push({
          title: `Task: ${t.title}`,
          time: "Upcoming",
          color: eventColors[(upcomingEventsCard.length + i) % eventColors.length].color,
          bg: eventColors[(upcomingEventsCard.length + i) % eventColors.length].bg
        });
      });
    }

    if (upcomingEventsCard.length === 0) {
       upcomingEventsCard.push({ title: "Personal Review", time: "Today, 4:00 PM", color: "text-blue-500", bg: "bg-blue-50" });
    }

    // Populate upcomingList using future meetings
    const upcomingList: any[] = upcomingEventsCard.map((e, i) => {
      const icons = ["video", "megaphone", "palette", "server"];
      return {
        title: e.title,
        time: e.time,
        icon: icons[i % icons.length]
      };
    });

    // Populate recentFiles
    const dbFiles = await db.select().from(schema.files);
    const recentFiles: any[] = dbFiles.slice(0, 5).map(f => {
      let icon = "doc";
      if (f.name.endsWith(".pdf")) icon = "pdf";
      if (f.name.endsWith(".fig") || f.name.includes("Design")) icon = "figma";
      
      return {
        name: f.name,
        updated: new Date(f.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        icon
      };
    });
    if (recentFiles.length === 0) {
      recentFiles.push(
        { name: "Project Requirements.pdf", updated: "Today, 10:30 AM", icon: "pdf" },
        { name: "Dashboard Design.fig", updated: "Yesterday", icon: "figma" },
        { name: "Q3 Planning.docx", updated: "Aug 12", icon: "doc" }
      );
    }

    // Populate activityFeed using recentActivity data
    const activityFeed: any[] = recentActivity.slice(0, 5).map(a => {
      return {
        key: a.key,
        name: a.name,
        action: a.action,
        detail: "",
        time: a.time
      };
    });

    // Fetch user channels according to role-based access:
    // Admin: see all channels created by admin (or all channels)
    // Member: see ONLY channels they are added to by admin
    const [currentUser] = user;
    let userChannels: any[] = [];
    if (currentUser && currentUser.role === 'Admin') {
      userChannels = await db
        .select()
        .from(schema.channels)
        .where(or(eq(schema.channels.creatorId, userId), isNull(schema.channels.creatorId)))
        .orderBy(desc(schema.channels.createdAt));
    } else {
      userChannels = await db
        .select({
          id: schema.channels.id,
          name: schema.channels.name,
          description: schema.channels.description,
          creatorId: schema.channels.creatorId,
          bgGradient: schema.channels.bgGradient,
          isTemplate: schema.channels.isTemplate,
          createdAt: schema.channels.createdAt,
          updatedAt: schema.channels.updatedAt,
        })
        .from(schema.channels)
        .innerJoin(schema.channelMembers, eq(schema.channels.id, schema.channelMembers.channelId))
        .where(eq(schema.channelMembers.userId, userId))
        .orderBy(desc(schema.channels.createdAt));
    }

    // Determine upNextChannel: recent activity or welcome
    let upNextChannel: any = null;
    if (userChannels.length > 0) {
      const channelIds = userChannels.map(c => c.id);
      const latestMsg = await db
        .select({
          id: schema.messages.id,
          content: schema.messages.content,
          channelId: schema.messages.channelId,
          createdAt: schema.messages.createdAt,
          senderName: schema.users.name,
          senderAvatar: schema.users.avatar,
        })
        .from(schema.messages)
        .leftJoin(schema.users, eq(schema.messages.senderId, schema.users.id))
        .where(inArray(schema.messages.channelId, channelIds))
        .orderBy(desc(schema.messages.createdAt))
        .limit(1);

      const targetChannel = latestMsg[0] 
        ? userChannels.find(c => c.id === latestMsg[0].channelId) || userChannels[0]
        : userChannels[0];

      upNextChannel = {
        channel: targetChannel,
        latestMessage: latestMsg[0] ? {
          text: latestMsg[0].content,
          senderName: latestMsg[0].senderName || 'Team Lead',
          senderAvatar: latestMsg[0].senderAvatar,
          time: new Date(latestMsg[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        } : null,
      };
    }

    return {
      stats,
      projectProgress,
      roadmap,
      tasksOverview: weeklyData,
      teamWorkload,
      recentActivity,
      calendarData,
      upcomingEventsCard,
      upcomingList,
      recentFiles,
      activityFeed,
      channels: userChannels,
      upNextChannel,
    };
  }
}

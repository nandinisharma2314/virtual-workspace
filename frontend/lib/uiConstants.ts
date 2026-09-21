export type Avatar = { initials: string; color: string };

export const avatarColors: Record<string, Avatar> = {
  avi: { initials: "AS", color: "bg-rose-400" },
  rohit: { initials: "RV", color: "bg-indigo-400" },
  priya: { initials: "PS", color: "bg-amber-400" },
  neha: { initials: "NS", color: "bg-emerald-400" },
  arjun: { initials: "AP", color: "bg-sky-400" },
  rahul: { initials: "RS", color: "bg-indigo-500" },
  vikram: { initials: "VJ", color: "bg-purple-500" },
  ankit: { initials: "AP", color: "bg-emerald-600" },
};

export const stats: any[] = [];
export const projectProgress: any[] = [];
export const tasksOverview: any[] = [];
export const tasksOverviewWeekly: any[] = [];
export const tasksOverviewMonthly: any[] = [];
export const teamWorkload: any[] = [];
export const recentActivity: any[] = [];
export const upcomingEventsCard: any[] = [];

export const aiSuggestions = [
  "Summarize this week's progress",
  "What are my overdue tasks?",
  "Generate meeting notes",
];

export const calendarMonth = "";
export const calendarWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const calendarWeeks: (number | null)[][] = [];
export const calendarToday = 0;
export const calendarOutsideDays = new Set<number>();

export const scheduleItems: any[] = [];
export const upcomingList: any[] = [];
export const recentFiles: any[] = [];
export const activityFeed: any[] = [];

export type RoadmapTask = {
  title: string;
  tag: string;
  tagColor: string;
  comments?: number;
  attachments?: number;
  people: string[];
};

export type RoadmapColumn = {
  key: string;
  title: string;
  count: number;
  accent: string;
  headerBg: string;
  tasks: RoadmapTask[];
};

export const roadmap: RoadmapColumn[] = [];

export const sidebarPrimary: { label: string; icon: string; badge?: string }[] = [
  { label: "Home", icon: "home" },
  { label: "Workspaces", icon: "layers" },
  { label: "Inbox", icon: "inbox" },
  { label: "Chat", icon: "chat" },
  { label: "Teams", icon: "users" },
  { label: "Projects", icon: "folder" },
  { label: "Boards", icon: "layout" },
  { label: "Sprints", icon: "zap" },
  { label: "Calendar", icon: "calendar" },
  { label: "Meetings", icon: "video" },
  { label: "Documents", icon: "file-text" },
  { label: "Files", icon: "folder-open" },
  { label: "Reports", icon: "bar-chart" },
];

export const favorites = [
  { label: "#marketing", color: "bg-rose-400" },
  { label: "#product-design", color: "bg-blue-400" },
  { label: "#dev-team", color: "bg-emerald-400" },
  { label: "Customer Support", color: "bg-amber-400" },
];

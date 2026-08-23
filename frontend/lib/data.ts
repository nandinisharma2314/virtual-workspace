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

export const stats = [
  { label: "Tasks Due Today", value: "12", delta: "+20% from yesterday", up: true },
  { label: "In Progress", value: "24", delta: "+8% from yesterday", up: true },
  { label: "Completed", value: "98", delta: "+16% from yesterday", up: true },
  { label: "Overdue", value: "07", delta: "-12% from yesterday", up: false },
];

export const projectProgress = [
  { name: "Completed", value: 72, color: "#22C55E" },
  { name: "In Progress", value: 18, color: "#3B82F6" },
  { name: "On Hold", value: 6, color: "#F59E0B" },
  { name: "Not Started", value: 4, color: "#D1D5DB" },
];

export const tasksOverview = [
  { day: "Mon", completed: 30, inProgress: 55, todo: 15 },
  { day: "Tue", completed: 45, inProgress: 90, todo: 10 },
  { day: "Wed", completed: 25, inProgress: 40, todo: 20 },
  { day: "Thu", completed: 60, inProgress: 95, todo: 12 },
  { day: "Fri", completed: 35, inProgress: 40, todo: 8 },
  { day: "Sat", completed: 55, inProgress: 85, todo: 5 },
  { day: "Sun", completed: 15, inProgress: 20, todo: 3 },
];

export const tasksOverviewWeekly = [
  { day: "Week 1", completed: 120, inProgress: 150, todo: 45 },
  { day: "Week 2", completed: 145, inProgress: 180, todo: 30 },
  { day: "Week 3", completed: 110, inProgress: 120, todo: 60 },
  { day: "Week 4", completed: 180, inProgress: 200, todo: 25 },
];

export const tasksOverviewMonthly = [
  { day: "Jan", completed: 450, inProgress: 300, todo: 120 },
  { day: "Feb", completed: 520, inProgress: 350, todo: 90 },
  { day: "Mar", completed: 480, inProgress: 280, todo: 150 },
  { day: "Apr", completed: 610, inProgress: 420, todo: 110 },
  { day: "May", completed: 590, inProgress: 380, todo: 95 },
  { day: "Jun", completed: 650, inProgress: 400, todo: 80 },
];

export const teamWorkload = [
  { key: "avi", name: "You", pct: 80 },
  { key: "rohit", name: "Rohit Verma", pct: 65 },
  { key: "priya", name: "Priya Singh", pct: 50 },
  { key: "neha", name: "Neha Sharma", pct: 40 },
  { key: "arjun", name: "Arjun Patel", pct: 30 },
];

export const recentActivity = [
  { key: "rohit", name: "Rohit Verma", action: "completed Design system", time: "20m ago" },
  { key: "neha", name: "Neha Sharma", action: "commented on API Integration", time: "1h ago" },
  { key: "arjun", name: "Arjun Patel", action: "moved task to In Progress", time: "2h ago" },
  { key: "priya", name: "Priya Singh", action: "uploaded Figma file", time: "3h ago" },
];

export const upcomingEventsCard = [
  { title: "Daily Standup", time: "Today, 10:00 AM", color: "text-blue-500", bg: "bg-blue-50" },
  { title: "Sprint Review", time: "Today, 2:00 PM", color: "text-emerald-500", bg: "bg-emerald-50" },
  { title: "Client Call", time: "Tomorrow, 11:00 AM", color: "text-amber-500", bg: "bg-amber-50" },
];

export const aiSuggestions = [
  "Summarize this week's progress",
  "What are my overdue tasks?",
  "Generate meeting notes",
];

export const calendarMonth = "May 2024";
export const calendarWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const calendarWeeks: (number | null)[][] = [
  [29, 30, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, 26],
  [27, 28, 29, 30, 31, 1, 2],
];
export const calendarToday = 16;
export const calendarOutsideDays = new Set([29, 30, 31, 1, 2]);

export const scheduleItems = [
  { time: "10:00 – 10:30 AM", title: "Daily Standup", color: "bg-blue-500" },
  { time: "11:00 AM – 12:00 PM", title: "Product Review", color: "bg-emerald-500" },
  { time: "02:00 – 03:00 PM", title: "Design Sync", color: "bg-amber-500" },
  { time: "04:00 – 05:00 PM", title: "Client Call", color: "bg-orange-500" },
];

export const upcomingList = [
  { title: "Sprint Review", time: "Today, 2:00 PM", icon: "video", bg: "bg-emerald-100", fg: "text-emerald-600" },
  { title: "Marketing Campaign", time: "Tomorrow, 11:00 AM", icon: "megaphone", bg: "bg-violet-100", fg: "text-violet-600" },
  { title: "UI Design Review", time: "May 18, 10:30 AM", icon: "palette", bg: "bg-amber-100", fg: "text-amber-600" },
  { title: "Backend Deployment", time: "May 20, 9:00 AM", icon: "server", bg: "bg-blue-100", fg: "text-blue-600" },
];

export const recentFiles = [
  { name: "Brand Guidelines.pdf", updated: "Updated 2h ago", icon: "pdf" },
  { name: "Design System.fig", updated: "Updated 3h ago", icon: "figma" },
  { name: "Project Plan.docx", updated: "Updated yesterday", icon: "doc" },
  { name: "API Documentation.pdf", updated: "Updated 2 days ago", icon: "pdf" },
];

export const activityFeed = [
  { key: "rohit", name: "Rohit Verma", action: "completed", detail: "Design system", time: "20m ago" },
  { key: "neha", name: "Neha Sharma", action: "commented on", detail: "API Integration", time: "1h ago" },
  { key: "arjun", name: "Arjun Patel", action: "moved task to", detail: "In Progress", time: "2h ago" },
  { key: "priya", name: "Priya Singh", action: "uploaded", detail: "Figma file", time: "3h ago" },
  { key: "avi", name: "You", action: "created task", detail: "Landing page design", time: "5h ago" },
];

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

export const roadmap: RoadmapColumn[] = [
  {
    key: "todo",
    title: "To Do",
    count: 6,
    accent: "bg-gray-400",
    headerBg: "bg-gray-50",
    tasks: [
      { title: "User authentication flow", tag: "AUTH", tagColor: "bg-violet-100 text-violet-700", comments: 5, people: ["avi", "rohit"] },
      { title: "Landing page design", tag: "DESIGN", tagColor: "bg-amber-100 text-amber-700", comments: 3, people: ["priya"] },
      { title: "Create style guide", tag: "DESIGN", tagColor: "bg-amber-100 text-amber-700", comments: 2, people: ["neha", "arjun"] },
    ],
  },
  {
    key: "inprogress",
    title: "In Progress",
    count: 4,
    accent: "bg-blue-500",
    headerBg: "bg-blue-50",
    tasks: [
      { title: "Dashboard UI", tag: "DESIGN", tagColor: "bg-amber-100 text-amber-700", comments: 5, people: ["rohit", "priya"] },
      { title: "API integration", tag: "DEVELOPMENT", tagColor: "bg-emerald-100 text-emerald-700", comments: 3, people: ["arjun"] },
      { title: "Database schema", tag: "DEVELOPMENT", tagColor: "bg-emerald-100 text-emerald-700", comments: 2, people: ["neha", "avi"] },
    ],
  },
  {
    key: "review",
    title: "Review",
    count: 3,
    accent: "bg-amber-500",
    headerBg: "bg-amber-50",
    tasks: [
      { title: "Payment gateway", tag: "DEVELOPMENT", tagColor: "bg-emerald-100 text-emerald-700", comments: 5, people: ["rohit"] },
      { title: "Notification system", tag: "DEVELOPMENT", tagColor: "bg-emerald-100 text-emerald-700", comments: 3, people: ["priya", "arjun"] },
      { title: "Code review", tag: "DEVELOPMENT", tagColor: "bg-emerald-100 text-emerald-700", comments: 2, people: ["neha"] },
    ],
  },
  {
    key: "done",
    title: "Done",
    count: 5,
    accent: "bg-emerald-500",
    headerBg: "bg-emerald-50",
    tasks: [
      { title: "Project setup", tag: "DEVOPS", tagColor: "bg-blue-100 text-blue-700", people: ["avi", "rohit"] },
      { title: "User research", tag: "DESIGN", tagColor: "bg-amber-100 text-amber-700", people: ["priya"] },
      { title: "Initial wireframes", tag: "DESIGN", tagColor: "bg-amber-100 text-amber-700", people: ["neha", "arjun"] },
    ],
  },
];

export const sidebarPrimary: { label: string; icon: string; badge?: string }[] = [
  { label: "Home", icon: "home" },
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
  { label: "Website Redesign", color: "bg-violet-400" },
];

export type ProjectCard = {
  id: string;
  title: string;
  tag?: { label: string; bg: string; text: string };
  assignee: { name: string; person: string };
  date: string;
  commentsCount?: number;
  completed?: boolean;
};

export type ProjectColumn = {
  id: string;
  title: string;
  count: number;
  dotClass: string;
  cards: ProjectCard[];
};

export const initialProjectColumns: ProjectColumn[] = [
  {
    id: "col-todo",
    title: "To Do",
    count: 12,
    dotClass: "bg-gray-400",
    cards: [
      {
        id: "task-1",
        title: "Create wireframes for homepage",
        tag: { label: "Design", bg: "bg-purple-50", text: "text-purple-700" },
        assignee: { name: "Priya S.", person: "priya" },
        date: "May 30",
      },
      {
        id: "task-2",
        title: "Setup analytics and tracking",
        tag: { label: "Analytics", bg: "bg-emerald-50", text: "text-emerald-700" },
        assignee: { name: "Arjun P.", person: "arjun" },
        date: "May 31",
      },
      {
        id: "task-3",
        title: "Write copy for landing page",
        tag: { label: "Content", bg: "bg-amber-50", text: "text-amber-700" },
        assignee: { name: "Neha S.", person: "neha" },
        date: "Jun 2",
      },
      {
        id: "task-4",
        title: "Competitor research and analysis",
        tag: { label: "Research", bg: "bg-blue-50", text: "text-blue-700" },
        assignee: { name: "Rohit V.", person: "rohit" },
        date: "Jun 3",
      },
    ],
  },
  {
    id: "col-in-progress",
    title: "In Progress",
    count: 8,
    dotClass: "bg-blue-600",
    cards: [
      {
        id: "task-5",
        title: "Design homepage UI",
        tag: { label: "Design", bg: "bg-purple-50", text: "text-purple-700" },
        assignee: { name: "Priya S.", person: "priya" },
        date: "May 28",
        commentsCount: 2,
      },
      {
        id: "task-6",
        title: "Develop responsive navigation",
        tag: { label: "Development", bg: "bg-blue-50/90", text: "text-[#2563EB]" },
        assignee: { name: "Vikram J.", person: "vikram" },
        date: "May 29",
        commentsCount: 3,
      },
      {
        id: "task-7",
        title: "Build reusable components",
        tag: { label: "Development", bg: "bg-blue-50/90", text: "text-[#2563EB]" },
        assignee: { name: "Arjun P.", person: "arjun" },
        date: "May 30",
        commentsCount: 1,
      },
      {
        id: "task-8",
        title: "Optimize images and assets",
        tag: { label: "Optimization", bg: "bg-emerald-50", text: "text-emerald-700" },
        assignee: { name: "Vikram J.", person: "vikram" },
        date: "May 31",
      },
    ],
  },
  {
    id: "col-in-review",
    title: "In Review",
    count: 5,
    dotClass: "bg-amber-500",
    cards: [
      {
        id: "task-9",
        title: "Review homepage design",
        tag: { label: "Design", bg: "bg-purple-50", text: "text-purple-700" },
        assignee: { name: "Neha S.", person: "neha" },
        date: "May 27",
        commentsCount: 4,
      },
      {
        id: "task-10",
        title: "Code review - navigation",
        tag: { label: "Development", bg: "bg-blue-50/90", text: "text-[#2563EB]" },
        assignee: { name: "Rohit V.", person: "rohit" },
        date: "May 28",
        commentsCount: 2,
      },
      {
        id: "task-11",
        title: "Content review - landing page",
        tag: { label: "Content", bg: "bg-amber-50", text: "text-amber-700" },
        assignee: { name: "Neha S.", person: "neha" },
        date: "May 29",
        commentsCount: 1,
      },
      {
        id: "task-12",
        title: "Cross browser testing",
        tag: { label: "Testing", bg: "bg-emerald-50", text: "text-emerald-700" },
        assignee: { name: "Arjun P.", person: "arjun" },
        date: "May 30",
      },
    ],
  },
  {
    id: "col-done",
    title: "Done",
    count: 18,
    dotClass: "bg-emerald-500",
    cards: [
      {
        id: "task-13",
        title: "Project kickoff meeting",
        assignee: { name: "Rohit V.", person: "rohit" },
        date: "May 15",
        completed: true,
      },
      {
        id: "task-14",
        title: "Requirements gathering",
        assignee: { name: "Priya S.", person: "priya" },
        date: "May 16",
        completed: true,
      },
      {
        id: "task-15",
        title: "Information architecture",
        assignee: { name: "Arjun P.", person: "arjun" },
        date: "May 18",
        completed: true,
      },
      {
        id: "task-16",
        title: "Mood board and inspiration",
        assignee: { name: "Neha S.", person: "neha" },
        date: "May 20",
        completed: true,
      },
      {
        id: "task-17",
        title: "Setup project repository",
        assignee: { name: "Vikram J.", person: "vikram" },
        date: "May 21",
        completed: true,
      },
    ],
  },
];

export const projectLabels = [
  { label: "Design", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200/60" },
  { label: "Web", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200/60" },
  { label: "Q2 2025", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/60" },
];

export const projectMilestones = [
  { title: "Design Phase", date: "May 15 - May 31", status: "Completed", statusColor: "text-emerald-600", progress: 100 },
  { title: "Development Phase", date: "Jun 1 - Jun 30", status: "In Progress", statusColor: "text-amber-500", progress: 65 },
  { title: "Launch", date: "Jul 1 - Jul 15", status: "Upcoming", statusColor: "text-gray-400", progress: 0 },
];

export const projectRecentFiles = [
  { name: "Website_Wireframes.fig", meta: "Figma File • 12.4 MB • May 25", icon: "figma" },
  { name: "Style_Guide.pdf", meta: "PDF • 2.8 MB • May 24", icon: "pdf" },
  { name: "Requirements.docx", meta: "Docx • 1.6 MB • May 20", icon: "docx" },
];

export interface TemplateActionCard {
  title: string;
  subtitle: string;
  actionText: string;
  icon: 'play' | 'plus' | 'file' | 'check' | 'link' | 'list' | 'refresh-cw';
  bgColorClass: string;
  textColorClass: string;
}

export interface TemplateStep {
  title: string;
  description: string;
  actionText: string;
  iconType: 'link' | 'list' | 'refresh-cw';
  iconBgColor: string;
  iconColor: string;
}

export interface TemplateTabContent {
  tabName: string;
  headline: string;
  description: string;
  actionCard?: TemplateActionCard;
  secondaryHeadline?: string;
  secondaryDescription?: string;
}

export interface TemplateStarterTask {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'High' | 'Medium' | 'Low';
  date?: string;
  tag?: string;
}

export interface CustomTab {
  id: string;
  name: string;
  icon?: string;
  badge?: string;
  description?: string;
}

export interface ChannelTemplate {
  id: string;
  name: string;
  category: string;
  author: string;
  uses: string;
  badge?: string;
  tagline?: string;
  defaultTab: string;
  customTabs: CustomTab[];
  starterTasks: TemplateStarterTask[];
  templateConfig: Record<string, any>;
  bannerImage?: string;
  bannerGradient?: string;
  videoPlaceholder?: string;
  tabs: TemplateTabContent[];
  steps?: TemplateStep[];
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

export const templateCategories: TemplateCategory[] = [
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
    name: 'Design',
    icon: 'design',
    iconColor: 'bg-purple-50 text-purple-600 border border-purple-200/80',
    iconGradient: 'from-purple-600 to-pink-500',
    iconShadow: 'shadow-purple-500/25',
    cardBgGradient: 'from-purple-500/[0.09] via-purple-500/[0.02] to-white',
    borderColor: 'border-purple-200/80',
    hoverBorderColor: 'group-hover:border-purple-400',
    hoverShadowColor: 'group-hover:shadow-purple-500/15',
    badgeStyle: 'bg-purple-100/80 text-purple-800 border-purple-200/70',
    hoverTextColor: 'group-hover:text-purple-700',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: 'marketing',
    iconColor: 'bg-rose-50 text-rose-600 border border-rose-200/80',
    iconGradient: 'from-rose-500 to-pink-500',
    iconShadow: 'shadow-rose-500/25',
    cardBgGradient: 'from-rose-500/[0.09] via-rose-500/[0.02] to-white',
    borderColor: 'border-rose-200/80',
    hoverBorderColor: 'group-hover:border-rose-400',
    hoverShadowColor: 'group-hover:shadow-rose-500/15',
    badgeStyle: 'bg-rose-100/80 text-rose-800 border-rose-200/70',
    hoverTextColor: 'group-hover:text-rose-700',
  },
  {
    id: 'remote-work',
    name: 'Remote Work',
    icon: 'remote-work',
    iconColor: 'bg-cyan-50 text-cyan-600 border border-cyan-200/80',
    iconGradient: 'from-teal-500 to-cyan-600',
    iconShadow: 'shadow-cyan-500/25',
    cardBgGradient: 'from-cyan-500/[0.09] via-cyan-500/[0.02] to-white',
    borderColor: 'border-cyan-200/80',
    hoverBorderColor: 'group-hover:border-cyan-400',
    hoverShadowColor: 'group-hover:shadow-cyan-500/15',
    badgeStyle: 'bg-cyan-100/80 text-cyan-800 border-cyan-200/70',
    hoverTextColor: 'group-hover:text-cyan-700',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'education',
    iconColor: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80',
    iconGradient: 'from-emerald-500 to-teal-500',
    iconShadow: 'shadow-emerald-500/25',
    cardBgGradient: 'from-emerald-500/[0.09] via-emerald-500/[0.02] to-white',
    borderColor: 'border-emerald-200/80',
    hoverBorderColor: 'group-hover:border-emerald-400',
    hoverShadowColor: 'group-hover:shadow-emerald-500/15',
    badgeStyle: 'bg-emerald-100/80 text-emerald-800 border-emerald-200/70',
    hoverTextColor: 'group-hover:text-emerald-700',
  },
];

export const channelTemplates: ChannelTemplate[] = [
  {
    id: "my-tasks",
    name: "My Tasks Board",
    category: "project-management",
    author: "WorkFlow Team",
    uses: "142.8K",
    badge: "Interactive Kanban",
    tagline: "Track personal to-dos, priorities, and workflow in an interactive board.",
    defaultTab: "Board",
    customTabs: [
      { id: "board", name: "Board", icon: "layout", description: "Interactive personal Kanban board" },
      { id: "overview", name: "Overview", icon: "check-square", description: "Personal productivity checklist & stats" },
    ],
    bannerGradient: "from-orange-400 to-amber-500",
    videoPlaceholder: "/video-placeholder.png",
    starterTasks: [
      { id: "mt-1", title: "Review Q3 team roadmap & key milestones", status: "in_progress", priority: "High", date: "Today", tag: "Strategy" },
      { id: "mt-2", title: "Prioritize daily queue and clear inbox items", status: "todo", priority: "High", date: "Tomorrow", tag: "Daily" },
      { id: "mt-3", title: "Prepare weekly status deck for engineering sync", status: "todo", priority: "Medium", date: "Sep 18", tag: "Reporting" },
      { id: "mt-4", title: "Verify automated tests and deployment logs", status: "done", priority: "Low", date: "Sep 12", tag: "DevOps" },
    ],
    templateConfig: {
      bgImage: "/cosmic_board_bg.jpg",
      boardName: "hi",
      columns: [
        {
          id: "col-future",
          title: "Future Town Halls",
          cards: [
            { id: "c-1", title: "hi" },
            { id: "c-2", title: "hiiiiiii" },
            { id: "c-3", title: "Instructions for joining the Town Hall Remotely", cover: "/remote_laptop_cover.jpg" },
            { id: "c-4", title: "The Schedule", hasDesc: true },
            { id: "c-5", title: "Town Hall Announcements", isTemplate: true, checklist: "0/3" }
          ]
        },
        {
          id: "col-announcements",
          title: "Announcements / Questions",
          cards: [
            { id: "c-6", title: "Introducing: Andre", hasDesc: true, hasEye: true, assignee: "NS" },
            { id: "c-7", title: "Town Hall Announcements", checklist: "0/3" },
            { id: "c-8", title: "End-of-year Review for Sales" },
            { id: "c-9", title: "What is Support?", cover: "/support_cover.jpg" }
          ]
        },
        {
          id: "col-th-12",
          title: "Town Hall 12/10",
          cards: [
            { id: "c-10", title: "Town Hall Announcements", checklistDone: "3/3" },
            { id: "c-11", title: "Company Update" },
            { id: "c-12", title: "Social Media Campaign Data Analysis", cover: "/social_media_cover.jpg", attachments: 1 },
            { id: "c-13", title: "Product Update" }
          ]
        },
        {
          id: "col-th-11",
          title: "Town Hall 11/12",
          cards: [
            { id: "c-14", title: "Town Hall Announcements", checklistDone: "3/3" },
            { id: "c-15", title: "Introducing: Laura", hasDesc: true },
            { id: "c-16", title: "Company Goal Update", cover: "/goal_staircase_cover.jpg" },
            { id: "c-17", title: "Product Offsite", hasDesc: true }
          ]
        },
        {
          id: "col-minutes",
          title: "Minutes",
          cards: [
            { id: "c-18", title: "Town Hall 10/8", hasDesc: true },
            { id: "c-19", title: "Town Hall 9/10", hasDesc: true }
          ]
        }
      ]
    },
    tabs: [
      {
        tabName: "Overview",
        headline: "Welcome to My Tasks",
        description: "Track all your to-dos in your own, private WorkFlow board.",
        actionCard: {
          title: "Organize your workflow with a board",
          subtitle: "Move tasks from To Do to Completed seamlessly.",
          actionText: "Open Board",
          icon: "list",
          bgColorClass: "bg-[#FFF8E6]",
          textColorClass: "text-[#B78103]"
        }
      }
    ],
    steps: [
      {
        title: "Collect personal tasks",
        description: "Add everything you need to do in one place.",
        actionText: "Try your portal",
        iconType: "link",
        iconBgColor: "bg-purple-100",
        iconColor: "text-purple-700"
      },
      {
        title: "Prioritize your day",
        description: "Organize tasks by priority or deadline.",
        actionText: "Go to queues",
        iconType: "list",
        iconBgColor: "bg-green-100",
        iconColor: "text-green-700"
      },
      {
        title: "Update progress",
        description: "Move tasks to done and track your accomplishments.",
        actionText: "Explore work",
        iconType: "refresh-cw",
        iconBgColor: "bg-orange-100",
        iconColor: "text-orange-700"
      }
    ]
  },
  {
    id: "new-hire",
    name: "New Hire Onboarding",
    category: "business",
    author: "WorkFlow Team",
    uses: "131.3K",
    badge: "Onboarding Portal",
    tagline: "Help new employees start strong with 30-day milestones, team buddies, and resources.",
    defaultTab: "Onboarding Hub",
    customTabs: [
      { id: "onboarding-hub", name: "Onboarding Hub", icon: "user-check", description: "First 30 days checklist and team directory" },
    ],
    bannerImage: "/template_banner_1.png",
    bannerGradient: "from-emerald-600 to-teal-800",
    starterTasks: [
      { id: "nh-1", title: "Complete IT security compliance & 2FA setup", status: "done", priority: "High", date: "Day 1", tag: "IT" },
      { id: "nh-2", title: "Schedule 1:1 welcome coffee with assigned mentor", status: "in_progress", priority: "High", date: "Day 2", tag: "Team" },
      { id: "nh-3", title: "Clone repositories and complete dev environment setup", status: "todo", priority: "High", date: "Week 1", tag: "Engineering" },
      { id: "nh-4", title: "Review company product architecture & coding guidelines", status: "todo", priority: "Medium", date: "Week 1", tag: "Docs" },
      { id: "nh-5", title: "Submit first pull request with buddy review", status: "todo", priority: "Medium", date: "Week 2", tag: "Engineering" },
    ],
    templateConfig: {
      bgImage: "/workspace_desk_bg.jpg",
      boardName: "New Hire Onboarding",
      columns: [
        {
          id: "col-nh-day1",
          title: "Day 1: Welcome & Setup",
          cards: [
            { id: "nhc-1", title: "Complete IT security compliance & 2FA setup", cover: "/remote_laptop_cover.jpg", checklistDone: "3/3" },
            { id: "nhc-2", title: "Set up laptop, passwords, and 1Password vault", hasDesc: true },
            { id: "nhc-3", title: "Join essential Slack channels (#general, #eng)", checklist: "0/2" },
            { id: "nhc-4", title: "Attend company orientation session", isTemplate: true }
          ]
        },
        {
          id: "col-nh-week1",
          title: "Week 1: Foundations",
          cards: [
            { id: "nhc-5", title: "Meet your onboarding buddy for lunch/coffee", hasDesc: true, assignee: "NS", cover: "/support_cover.jpg" },
            { id: "nhc-6", title: "Review technical stack documentation and codebase", hasDesc: true, hasEye: true },
            { id: "nhc-7", title: "Submit benefits and payroll paperwork", checklistDone: "2/2" },
            { id: "nhc-8", title: "Clone repositories and complete dev setup" }
          ]
        },
        {
          id: "col-nh-month1",
          title: "Month 1: Acceleration",
          cards: [
            { id: "nhc-9", title: "Ship your first production feature or bug fix", cover: "/goal_staircase_cover.jpg", attachments: 1 },
            { id: "nhc-10", title: "30-day check-in with your engineering manager", hasDesc: true, assignee: "NS" },
            { id: "nhc-11", title: "Present an intro slide during the team all-hands", hasDesc: true }
          ]
        },
        {
          id: "col-nh-team",
          title: "Team Directory & Buddies",
          cards: [
            { id: "nhc-12", title: "Sarah Jenkins — Onboarding Mentor", hasEye: true, assignee: "NS" },
            { id: "nhc-13", title: "Marcus Vance — Engineering Lead", hasEye: true },
            { id: "nhc-14", title: "Elena Rostova — People Operations", cover: "/social_media_cover.jpg" }
          ]
        },
        {
          id: "col-nh-resources",
          title: "Resources & Links",
          cards: [
            { id: "nhc-15", title: "Company Handbook & Benefits FAQ", hasDesc: true },
            { id: "nhc-16", title: "Engineering Onboarding Notion Guide", hasDesc: true }
          ]
        }
      ],
      progress: 35,
      milestones: [
        {
          period: "Day 1: Getting Started",
          items: [
            { id: "m1", label: "Set up laptop, passwords, and 1Password vault", done: true },
            { id: "m2", label: "Join essential Slack channels (#general, #announcements, #eng)", done: true },
            { id: "m3", label: "Attend company orientation session", done: false },
          ]
        },
        {
          period: "Week 1: Foundations",
          items: [
            { id: "m4", label: "Meet your onboarding buddy for lunch/coffee", done: true },
            { id: "m5", label: "Review technical stack documentation and codebase walkthrough", done: false },
            { id: "m6", label: "Submit your benefits and payroll paperwork", done: false },
          ]
        },
        {
          period: "Month 1: Acceleration",
          items: [
            { id: "m7", label: "Ship your first production feature or bug fix", done: false },
            { id: "m8", label: "30-day check-in with your engineering manager", done: false },
            { id: "m9", label: "Present an intro slide during the team all-hands", done: false },
          ]
        }
      ],
      buddies: [
        { name: "Sarah Jenkins", role: "Onboarding Mentor", email: "sarah.j@company.com", avatar: "sarah" },
        { name: "Marcus Vance", role: "Engineering Lead", email: "marcus.v@company.com", avatar: "marcus" },
        { name: "Elena Rostova", role: "People Operations", email: "elena.r@company.com", avatar: "elena" },
      ]
    },
    tabs: [
      {
        tabName: "Onboarding Hub",
        headline: "Welcome new employees",
        description: "Help new employees start strong with this onboarding template.",
      }
    ],
    steps: [
      {
        title: "Complete Day 1 orientation",
        description: "Get credentials, join channels, and meet team buddies.",
        actionText: "View Checklist",
        iconType: "list",
        iconBgColor: "bg-emerald-100",
        iconColor: "text-emerald-700"
      },
      {
        title: "Explore dev environment",
        description: "Set up your tools, clone repos, and test the build.",
        actionText: "Read Docs",
        iconType: "link",
        iconBgColor: "bg-blue-100",
        iconColor: "text-blue-700"
      },
      {
        title: "Connect with mentor",
        description: "Schedule your weekly check-ins and ask any questions.",
        actionText: "Meet Buddy",
        iconType: "refresh-cw",
        iconBgColor: "bg-purple-100",
        iconColor: "text-purple-700"
      }
    ]
  },
  {
    id: "tier-list",
    name: "Tier List",
    category: "design",
    author: "WorkFlow Engineering Team",
    uses: "23.3K",
    badge: "Visual Tier Maker",
    tagline: "Collaborative interactive S/A/B/C/D ranking board for items, tools, and ideas.",
    defaultTab: "Tier List",
    customTabs: [
      { id: "tier-list", name: "Tier List", icon: "award", description: "Interactive S, A, B, C, D ranking board" },
    ],
    bannerGradient: "from-slate-700 via-indigo-900 to-slate-900",
    starterTasks: [
      { id: "tl-1", title: "Collect team nominations for Q4 tech stack tiers", status: "in_progress", priority: "High", date: "Today", tag: "Ranking" },
      { id: "tl-2", title: "Finalize S-Tier criteria and voting guidelines", status: "todo", priority: "Medium", date: "Tomorrow", tag: "Design" },
      { id: "tl-3", title: "Export tier graphic and share summary with team", status: "todo", priority: "Low", date: "Friday", tag: "Export" },
    ],
    templateConfig: {
      bgImage: "/track_sprint_bg.jpg",
      boardName: "Tech Stack Tier List",
      columns: [
        {
          id: "col-tier-s",
          title: "S Tier (God Tier)",
          cards: [
            { id: "tlc-1", title: "TypeScript — Strict Type Safety", cover: "/remote_laptop_cover.jpg", checklistDone: "3/3", assignee: "NS" },
            { id: "tlc-2", title: "React 19 — Server Components & Actions", hasDesc: true, hasEye: true },
            { id: "tlc-3", title: "Tailwind CSS — Rapid Design System Utility", attachments: 1 }
          ]
        },
        {
          id: "col-tier-a",
          title: "A Tier (Great)",
          cards: [
            { id: "tlc-4", title: "NestJS — Robust Enterprise Backend Framework", cover: "/goal_staircase_cover.jpg" },
            { id: "tlc-5", title: "PostgreSQL — Rock-solid Relational Database", hasDesc: true },
            { id: "tlc-6", title: "Docker — Reproducible Containerization", hasEye: true }
          ]
        },
        {
          id: "col-tier-b",
          title: "B Tier (Solid)",
          cards: [
            { id: "tlc-7", title: "Redis — Ultra-fast In-memory Cache & PubSub", hasDesc: true },
            { id: "tlc-8", title: "GraphQL — Strongly-typed Flexible API Layer" }
          ]
        },
        {
          id: "col-tier-c",
          title: "C Tier (Average)",
          cards: [
            { id: "tlc-9", title: "Webpack — Complex Legacy Bundler", hasDesc: true },
            { id: "tlc-10", title: "CSS Modules — Component-scoped Stylesheet" }
          ]
        },
        {
          id: "col-tier-d",
          title: "D Tier (Legacy)",
          cards: [
            { id: "tlc-11", title: "jQuery — Deprecated DOM Manipulation", cover: "/support_cover.jpg" },
            { id: "tlc-12", title: "Grunt / Gulp — Outdated Task Runners" }
          ]
        },
        {
          id: "col-tier-pool",
          title: "Candidate Evaluation Pool",
          cards: [
            { id: "tlc-13", title: "Rust — High Performance Systems Language", isTemplate: true, checklist: "0/3" },
            { id: "tlc-14", title: "Bun — High-speed JavaScript Runtime", cover: "/social_media_cover.jpg" },
            { id: "tlc-15", title: "tRPC — End-to-end Type-safe APIs" }
          ]
        }
      ],
      tiers: [
        { id: "S", label: "S Tier", color: "bg-rose-500", text: "text-white", bgRow: "bg-rose-50/50 border-rose-200" },
        { id: "A", label: "A Tier", color: "bg-orange-500", text: "text-white", bgRow: "bg-orange-50/50 border-orange-200" },
        { id: "B", label: "B Tier", color: "bg-amber-400", text: "text-gray-900", bgRow: "bg-amber-50/50 border-amber-200" },
        { id: "C", label: "C Tier", color: "bg-emerald-500", text: "text-white", bgRow: "bg-emerald-50/50 border-emerald-200" },
        { id: "D", label: "D Tier", color: "bg-blue-500", text: "text-white", bgRow: "bg-blue-50/50 border-blue-200" },
      ],
      items: [
        { id: "item-1", name: "TypeScript", tier: "S", category: "Language" },
        { id: "item-2", name: "React 19", tier: "S", category: "Frontend" },
        { id: "item-3", name: "Tailwind CSS", tier: "S", category: "Styling" },
        { id: "item-4", name: "NestJS", tier: "A", category: "Backend" },
        { id: "item-5", name: "PostgreSQL", tier: "A", category: "Database" },
        { id: "item-6", name: "Docker", tier: "A", category: "DevOps" },
        { id: "item-7", name: "Redis", tier: "B", category: "Cache" },
        { id: "item-8", name: "GraphQL", tier: "B", category: "API" },
        { id: "item-9", name: "Webpack", tier: "C", category: "Tooling" },
        { id: "item-10", name: "CSS Modules", tier: "C", category: "Styling" },
        { id: "item-11", name: "jQuery", tier: "D", category: "Legacy" },
      ]
    },
    tabs: [
      {
        tabName: "Tier List",
        headline: "Create a tier list",
        description: "Use this template to create a tier list for anything you want.",
      }
    ],
    steps: [
      {
        title: "Rank items into tiers",
        description: "Organize items from S Tier (God tier) down to D Tier.",
        actionText: "Start Ranking",
        iconType: "list",
        iconBgColor: "bg-rose-100",
        iconColor: "text-rose-700"
      },
      {
        title: "Add your custom items",
        description: "Insert new cards with custom tags and names.",
        actionText: "Add Item",
        iconType: "refresh-cw",
        iconBgColor: "bg-purple-100",
        iconColor: "text-purple-700"
      }
    ]
  },
  {
    id: "feedback-intake",
    name: "Feedback intake and triage",
    category: "engineering",
    author: "Internal Tools",
    uses: "1.2K",
    badge: "Intake & Triage Portal",
    tagline: "Streamline user feedback submission, automated triage rules, and engineering prioritization.",
    defaultTab: "Feedback instructions",
    customTabs: [
      { id: "feedback-instructions", name: "Feedback instructions", icon: "inbox", description: "Submission portal and automated workflows" },
      { id: "triage-queue", name: "Triage Queue", icon: "alert-circle", description: "Incoming requests and bug triage board" },
    ],
    bannerImage: "/template_banner.png",
    bannerGradient: "from-blue-700 via-indigo-800 to-purple-900",
    videoPlaceholder: "/video-placeholder-2.png",
    starterTasks: [
      { id: "fi-1", title: "[CRITICAL BUG] Payment checkout fails intermittently on Safari iOS", status: "in_progress", priority: "High", date: "Urgent", tag: "Checkout" },
      { id: "fi-2", title: "[FEATURE] Support export to CSV and Excel in Reports tab", status: "todo", priority: "Medium", date: "Sep 20", tag: "Reporting" },
      { id: "fi-3", title: "[UX] Improve contrast for dark-mode text badges", status: "done", priority: "Low", date: "Sep 13", tag: "Accessibility" },
      { id: "fi-4", title: "[SECURITY] Require 2-factor authentication on workspace admin role", status: "todo", priority: "High", date: "Sep 25", tag: "Security" },
    ],
    templateConfig: {
      bgImage: "/crescent_moon_night_bg.jpg",
      boardName: "Feedback & Bug Triage",
      columns: [
        {
          id: "col-fi-incoming",
          title: "Incoming Feedback",
          cards: [
            { id: "fic-1", title: "Add keyboard shortcut (Cmd+K) for global search", hasDesc: true, checklist: "0/2" },
            { id: "fic-2", title: "Dark mode sidebar contrast on smaller screens", cover: "/remote_laptop_cover.jpg" },
            { id: "fic-3", title: "Support export to CSV and Excel in Reports tab", attachments: 1, hasEye: true }
          ]
        },
        {
          id: "col-fi-investigating",
          title: "Needs Investigation",
          cards: [
            { id: "fic-4", title: "[CRITICAL BUG] Payment checkout fails intermittently on Safari iOS", cover: "/social_media_cover.jpg", isTemplate: true, checklist: "0/3", assignee: "NS" },
            { id: "fic-5", title: "Audit session timeout on 2-factor authentication", hasDesc: true }
          ]
        },
        {
          id: "col-fi-dev",
          title: "In Development",
          cards: [
            { id: "fic-6", title: "Workspace permission roles update for Admin & Member", hasDesc: true, assignee: "NS" },
            { id: "fic-7", title: "Automated Slack alert webhook integration", cover: "/support_cover.jpg" }
          ]
        },
        {
          id: "col-fi-qa",
          title: "Review & QA",
          cards: [
            { id: "fic-8", title: "Mobile responsive navigation layout polish", checklistDone: "3/3", cover: "/goal_staircase_cover.jpg" },
            { id: "fic-9", title: "Table column reordering performance test", hasDesc: true }
          ]
        },
        {
          id: "col-fi-shipped",
          title: "Shipped & Closed",
          cards: [
            { id: "fic-10", title: "Initial user onboarding checklist feature", checklistDone: "3/3" },
            { id: "fic-11", title: "Password reset verification email flow", checklistDone: "3/3" }
          ]
        }
      ],
      automations: [
        { id: "a1", name: "Auto-assign High priority bugs to Tech Lead", active: true },
        { id: "a2", name: "Send instant Slack ping when urgent ticket submitted", active: true },
        { id: "a3", name: "Auto-close triaged feedback after 14 days of no response", active: false },
      ],
      triageIssues: [
        { id: "T-101", title: "Payment checkout fails intermittently on Safari iOS", type: "Bug", priority: "Critical", status: "Investigating", author: "jessica@workspace.com", time: "10 mins ago" },
        { id: "T-102", title: "Support export to CSV and Excel in Reports tab", type: "Feature", priority: "Medium", status: "Triaged", author: "alex.m@client.io", time: "2 hours ago" },
        { id: "T-103", title: "Add keyboard shortcut (Cmd+K) for global search", type: "Enhancement", priority: "Low", status: "Incoming", author: "david.chen@studio.com", time: "Yesterday" },
        { id: "T-104", title: "Dark mode sidebar contrast on smaller screens", type: "UX", priority: "Low", status: "Resolved", author: "sophie@design.co", time: "2 days ago" },
      ]
    },
    tabs: [
      {
        tabName: "Feedback instructions",
        headline: "Feedback instructions",
        description: "Looking to submit or manage feedback? Welcome! You're in the right place.",
        actionCard: {
          title: "Need to submit a feedback? Use this workflow.",
          subtitle: "Replace with a new or existing workflow.",
          actionText: "Submit Feedback",
          icon: "play",
          bgColorClass: "bg-[#E8F2FA]",
          textColorClass: "text-[#1164A3]"
        }
      }
    ],
    steps: [
      {
        title: "Collect customer requests through your channels",
        description: "Use our integrated portal to gather feedback seamlessly.",
        actionText: "Try your portal",
        iconType: "link",
        iconBgColor: "bg-purple-100",
        iconColor: "text-purple-700"
      },
      {
        title: "Prioritize and assign requests in your queues",
        description: "Sort and assign issues to the right team members instantly.",
        actionText: "Go to queues",
        iconType: "list",
        iconBgColor: "bg-green-100",
        iconColor: "text-green-700"
      },
      {
        title: "Update customers and request status, all in one place",
        description: "Keep everyone in the loop with automated status updates.",
        actionText: "Explore work",
        iconType: "refresh-cw",
        iconBgColor: "bg-orange-100",
        iconColor: "text-orange-700"
      }
    ]
  },
  {
    id: "sales-deal",
    name: "Sales deal tracking",
    category: "marketing",
    author: "Sales Team",
    uses: "4.5K",
    badge: "CRM Deal Pipeline",
    tagline: "Track prospect pipeline, revenue targets, contract milestones, and deal velocity.",
    defaultTab: "Deal Hub",
    customTabs: [
      { id: "deal-hub", name: "Deal Hub", icon: "dollar-sign", description: "Deal velocity and pipeline revenue metrics" },
      { id: "pipeline", name: "Pipeline", icon: "kanban", description: "Stage-by-stage visual deal board" },
    ],
    bannerImage: "/template_banner_4.png",
    bannerGradient: "from-emerald-700 to-cyan-900",
    starterTasks: [
      { id: "sd-1", title: "Send revised enterprise contract to Apex Enterprise ($45K)", status: "in_progress", priority: "High", date: "Today", tag: "Contract" },
      { id: "sd-2", title: "Host technical deep-dive demo with Stark Industries", status: "todo", priority: "High", date: "Tomorrow", tag: "Demo" },
      { id: "sd-3", title: "Complete security questionnaire for Wayne Enterprises", status: "todo", priority: "Medium", date: "Sep 22", tag: "Security" },
      { id: "sd-4", title: "Prepare quarterly sales commission & quota report", status: "done", priority: "Low", date: "Sep 10", tag: "Reporting" },
    ],
    templateConfig: {
      bgImage: "/wood_planks_bg.jpg",
      boardName: "Enterprise Sales Pipeline",
      columns: [
        {
          id: "col-sd-lead",
          title: "Qualified Leads (2)",
          cards: [
            { id: "sdc-1", title: "Cyberdyne Systems — $65,000 (AI Infrastructure)", cover: "/remote_laptop_cover.jpg", hasDesc: true, assignee: "NS" },
            { id: "sdc-2", title: "Initech Global — $35,000 (Migration Pilot)", checklist: "0/2" }
          ]
        },
        {
          id: "col-sd-demo",
          title: "Meeting / Demo (2)",
          cards: [
            { id: "sdc-3", title: "Stark Industries — $120,000 (Full Platform License)", cover: "/goal_staircase_cover.jpg", hasEye: true, assignee: "NS" },
            { id: "sdc-4", title: "Umbrella Corp — $50,000 (Custom Security Add-on)", hasDesc: true }
          ]
        },
        {
          id: "col-sd-proposal",
          title: "Proposal Sent (2)",
          cards: [
            { id: "sdc-5", title: "Apex Enterprise — $45,000 (Annual Enterprise Tier)", cover: "/social_media_cover.jpg", attachments: 1, hasDesc: true },
            { id: "sdc-6", title: "Massive Dynamic — $80,000 (Multi-Region Cluster)", checklist: "1/3" }
          ]
        },
        {
          id: "col-sd-negotiation",
          title: "Negotiation (2)",
          cards: [
            { id: "sdc-7", title: "Wayne Enterprises — $95,000 (Executive Signoff)", cover: "/support_cover.jpg", isTemplate: true, checklist: "2/3" },
            { id: "sdc-8", title: "Oscorp BioTech — $70,000 (SLA Agreement Review)", hasDesc: true }
          ]
        },
        {
          id: "col-sd-won",
          title: "Closed Won (2)",
          cards: [
            { id: "sdc-9", title: "Hooli Cloud — $90,000 (Signed 2-Year Contract)", checklistDone: "3/3" },
            { id: "sdc-10", title: "Pied Piper — $60,000 (Enterprise Deployment Active)", checklistDone: "3/3" }
          ]
        }
      ],
      stats: {
        totalValue: "$415,000",
        winRate: "74%",
        activeDeals: 5,
        avgDealSize: "$83,000"
      },
      stages: [
        {
          id: "lead",
          name: "Qualified Leads",
          deals: [
            { id: "d1", company: "Cyberdyne Systems", value: "$65,000", owner: "Marcus V.", probability: "40%" },
          ]
        },
        {
          id: "demo",
          name: "Meeting / Demo",
          deals: [
            { id: "d2", company: "Stark Industries", value: "$120,000", owner: "Sarah J.", probability: "60%" },
          ]
        },
        {
          id: "proposal",
          name: "Proposal Sent",
          deals: [
            { id: "d3", company: "Apex Enterprise", value: "$45,000", owner: "David C.", probability: "75%" },
          ]
        },
        {
          id: "negotiation",
          name: "Negotiation",
          deals: [
            { id: "d4", company: "Wayne Enterprises", value: "$95,000", owner: "Sarah J.", probability: "85%" },
          ]
        },
        {
          id: "won",
          name: "Closed Won",
          deals: [
            { id: "d5", company: "Hooli Cloud", value: "$90,000", owner: "Marcus V.", probability: "100%" },
          ]
        }
      ]
    },
    tabs: [
      {
        tabName: "Deal Hub",
        headline: "Close more deals",
        description: "Collaborate on active deals, share insights, and get approvals quickly.",
      }
    ],
    steps: [
      {
        title: "Track sales opportunities",
        description: "Move deals through stages from lead to closed won.",
        actionText: "View Pipeline",
        iconType: "list",
        iconBgColor: "bg-emerald-100",
        iconColor: "text-emerald-700"
      },
      {
        title: "Collaborate on contracts",
        description: "Review proposals and coordinate approvals in one channel.",
        actionText: "Open Deals",
        iconType: "link",
        iconBgColor: "bg-blue-100",
        iconColor: "text-blue-700"
      }
    ]
  },
  {
    id: "remote-standup",
    name: "Async Daily Standup & Sync",
    category: "remote-work",
    author: "WorkFlow Core",
    uses: "52.1K",
    badge: "Distributed Teams",
    tagline: "Coordinate asynchronous standups, daily priorities, and blocker resolution across timezones.",
    defaultTab: "Standup Board",
    customTabs: [
      { id: "standup-board", name: "Standup Board", icon: "layout", description: "Daily asynchronous standup cards" },
      { id: "blockers", name: "Blockers & Asks", icon: "alert-circle", description: "Flagged impediments and team support queue" },
    ],
    bannerGradient: "from-cyan-600 via-sky-600 to-indigo-700",
    starterTasks: [
      { id: "rs-1", title: "Share 3 key priorities for today in #standup thread", status: "done", priority: "High", date: "9:00 AM", tag: "Daily" },
      { id: "rs-2", title: "Flag design dependency blocker for payment modal", status: "in_progress", priority: "High", date: "Urgent", tag: "Blocker" },
      { id: "rs-3", title: "Async review of pull request #142 before merge window", status: "todo", priority: "Medium", date: "Today", tag: "Code Review" },
      { id: "rs-4", title: "Post Friday celebration shout-outs and team kudos", status: "todo", priority: "Low", date: "Friday", tag: "Culture" },
    ],
    templateConfig: {
      bgImage: "/calm_ocean_bg.jpg",
      boardName: "Async Daily Standup & Sync",
      columns: [
        {
          id: "col-rs-yesterday",
          title: "Yesterday Completed",
          cards: [
            { id: "rsc-1", title: "Migrated database schema to PostgreSQL 16", checklistDone: "3/3", hasDesc: true },
            { id: "rsc-2", title: "Refactored chat feed hooks for real-time latency", cover: "/remote_laptop_cover.jpg" },
            { id: "rsc-3", title: "Reviewed pull request #142 before merge window", checklistDone: "2/2" }
          ]
        },
        {
          id: "col-rs-today",
          title: "Today's Focus",
          cards: [
            { id: "rsc-4", title: "Implement new templates page full-screen UI", cover: "/goal_staircase_cover.jpg", hasEye: true, assignee: "NS" },
            { id: "rsc-5", title: "Conduct customer discovery sync calls", hasDesc: true },
            { id: "rsc-6", title: "Audit cross-browser styling & responsiveness", checklist: "0/3" }
          ]
        },
        {
          id: "col-rs-blockers",
          title: "Blockers & Asks",
          cards: [
            { id: "rsc-7", title: "[BLOCKER] Awaiting Apple App Store review approval", isTemplate: true, checklist: "0/2", cover: "/support_cover.jpg" },
            { id: "rsc-8", title: "Staging database replication latency spike", hasDesc: true }
          ]
        },
        {
          id: "col-rs-kudos",
          title: "Kudos & Shoutouts",
          cards: [
            { id: "rsc-9", title: "Kudos to Priya for shipping the analytics dashboard!", cover: "/social_media_cover.jpg", attachments: 1 },
            { id: "rsc-10", title: "Welcome our new frontend engineer to the team!", hasEye: true }
          ]
        }
      ]
    },
    tabs: [
      {
        tabName: "Standup Board",
        headline: "Asynchronous team standup",
        description: "Keep distributed teammates aligned without scheduling another video call.",
      }
    ],
    steps: [
      {
        title: "Post morning check-ins",
        description: "Submit your 3 key goals and what you shipped yesterday.",
        actionText: "Check In",
        iconType: "list",
        iconBgColor: "bg-cyan-100",
        iconColor: "text-cyan-700"
      },
      {
        title: "Clear blockers quickly",
        description: "Tag team members to unblock cross-functional dependencies.",
        actionText: "View Blockers",
        iconType: "refresh-cw",
        iconBgColor: "bg-rose-100",
        iconColor: "text-rose-700"
      }
    ]
  },
  {
    id: "team-learning",
    name: "Team Academy & Training Hub",
    category: "education",
    author: "WorkFlow Academy",
    uses: "18.7K",
    badge: "Learning Curriculum",
    tagline: "Structured curriculum tracks, skill development benchmarks, and certification checklists.",
    defaultTab: "Curriculum",
    customTabs: [
      { id: "curriculum", name: "Curriculum", icon: "book-open", description: "Structured learning modules and tracks" },
      { id: "certifications", name: "Certifications", icon: "award", description: "Team skill badges and completion status" },
    ],
    bannerGradient: "from-emerald-600 via-teal-600 to-indigo-700",
    starterTasks: [
      { id: "tl-1", title: "Complete Module 1: System Architecture Fundamentals", status: "done", priority: "High", date: "Week 1", tag: "Engineering" },
      { id: "tl-2", title: "Hands-on Workshop: Security best practices & OWASP", status: "in_progress", priority: "High", date: "Week 2", tag: "Security" },
      { id: "tl-3", title: "Submit capstone project design doc for peer review", status: "todo", priority: "Medium", date: "Week 3", tag: "Capstone" },
      { id: "tl-4", title: "Schedule final assessment and certification review", status: "todo", priority: "Low", date: "Week 4", tag: "Certification" },
    ],
    templateConfig: {
      bgImage: "/library_books_bg.jpg",
      boardName: "Team Academy & Training Hub",
      columns: [
        {
          id: "col-tl-curriculum",
          title: "Curriculum Modules",
          cards: [
            { id: "tlc-1", title: "Module 1: Architecture & Design System", cover: "/remote_laptop_cover.jpg", checklistDone: "3/3" },
            { id: "tlc-2", title: "Module 2: API Design & NestJS Microservices", checklistDone: "3/3", hasDesc: true },
            { id: "tlc-3", title: "Module 3: Database Indexing & Query Optimization", checklist: "1/4", hasEye: true }
          ]
        },
        {
          id: "col-tl-workshops",
          title: "Hands-on Workshops",
          cards: [
            { id: "tlc-4", title: "Security Best Practices & OWASP Top 10", cover: "/goal_staircase_cover.jpg", isTemplate: true, checklist: "0/3", assignee: "NS" },
            { id: "tlc-5", title: "Zero-Downtime Deployment & CI/CD Pipelines", hasDesc: true }
          ]
        },
        {
          id: "col-tl-capstone",
          title: "Capstone Projects",
          cards: [
            { id: "tlc-6", title: "Full-Stack Dashboard Capstone Review", cover: "/social_media_cover.jpg", attachments: 2, hasDesc: true },
            { id: "tlc-7", title: "Microservice Event Queue Architecture Draft", checklist: "0/2" }
          ]
        },
        {
          id: "col-tl-certified",
          title: "Certified Teammates",
          cards: [
            { id: "tlc-8", title: "Frontend Specialist Certification Awarded", checklistDone: "4/4", assignee: "NS" },
            { id: "tlc-9", title: "DevOps Practitioner Credential Earned", cover: "/support_cover.jpg", checklistDone: "4/4" }
          ]
        }
      ],
      modules: [
        { id: "m-1", title: "Module 1: Architecture & Design System", duration: "2 hours", completed: true },
        { id: "m-2", title: "Module 2: API Design & NestJS Microservices", duration: "3 hours", completed: true },
        { id: "m-3", title: "Module 3: Database Indexing & Query Optimization", duration: "2.5 hours", completed: false },
        { id: "m-4", title: "Module 4: CI/CD Pipelines & Zero-Downtime Deploys", duration: "2 hours", completed: false },
      ]
    },
    tabs: [
      {
        tabName: "Curriculum",
        headline: "Team skill growth & mastery",
        description: "Empower teammates to level up their core skills with guided modular learning.",
      }
    ],
    steps: [
      {
        title: "Enroll in team tracks",
        description: "Pick curated courses aligned with your role and career milestones.",
        actionText: "Browse Courses",
        iconType: "list",
        iconBgColor: "bg-emerald-100",
        iconColor: "text-emerald-700"
      },
      {
        title: "Track certification progress",
        description: "Earn company badges and showcase your technical accomplishments.",
        actionText: "View Badges",
        iconType: "link",
        iconBgColor: "bg-indigo-100",
        iconColor: "text-indigo-700"
      }
    ]
  }
];

export function getTemplateById(id: string): ChannelTemplate | undefined {
  return channelTemplates.find(t => t.id === id);
}

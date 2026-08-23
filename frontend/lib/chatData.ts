export type ChatChannel = {
  id: string;
  name: string;
  unreadCount?: number;
  isPrivate?: boolean;
};

export type ChatDirectMessage = {
  id: string;
  person: string;
  name: string;
  status: "online" | "offline" | "busy" | "away";
  unreadCount?: number;
};

export type ChatTeam = {
  id: string;
  name: string;
  badgeText: string;
  badgeBg: string;
};

export type ChatMessage = {
  id: string;
  channelId?: string;
  parentId?: string;
  senderName: string;
  senderPerson: string;
  timestamp: string;
  text: string;
  isEdited?: boolean;
  reactions?: Record<string, number[]>;
  attachment?: {
    type: "figma" | "pdf" | "zip" | "image" | "doc" | "audio" | "voice";
    name: string;
    size: string;
    url?: string;
  };
  codeBlock?: {
    language: string;
    lines: string[];
  };
  threadReply?: {
    count: number;
    lastReplyTime: string;
    participants: string[];
  };
};

export const chatChannels: ChatChannel[] = [
  { id: "c-general", name: "general" },
  { id: "c-announcements", name: "announcements" },
  { id: "c-product-design", name: "product-design" },
  { id: "c-development", name: "development" },
  { id: "c-marketing", name: "marketing" },
  { id: "c-sales", name: "sales" },
  { id: "c-support", name: "support" },
  { id: "c-onboarding", name: "onboarding" },
];

export const chatDirectMessages: ChatDirectMessage[] = [
  { id: "dm-rohit", person: "rohit", name: "Rohit Verma", status: "online", unreadCount: 2 },
  { id: "dm-neha", person: "neha", name: "Neha Sharma", status: "online" },
  { id: "dm-arjun", person: "arjun", name: "Arjun Patel", status: "online" },
  { id: "dm-priya", person: "priya", name: "Priya Singh", status: "online" },
  { id: "dm-vikram", person: "vikram", name: "Vikram Joshi", status: "online" },
];

export const chatTeams: ChatTeam[] = [
  { id: "t-design", name: "Design Team", badgeText: "DT", badgeBg: "bg-indigo-600" },
  { id: "t-dev", name: "Development Team", badgeText: "DEV", badgeBg: "bg-blue-600" },
  { id: "t-marketing", name: "Marketing Team", badgeText: "MT", badgeBg: "bg-rose-500" },
  { id: "t-sales", name: "Sales Team", badgeText: "ST", badgeBg: "bg-emerald-600" },
];

export const chatMessages: ChatMessage[] = [
  {
    id: "m-1",
    senderName: "Rohit Verma",
    senderPerson: "rohit",
    timestamp: "9:30 AM",
    text: "Good morning team! 👋\nWe have a project sync at 11:00 AM.\nPlease review the latest updates.",
    reactions: {
      "👍": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      "❤️": [1, 2, 3, 4, 5],
      "🎉": [1, 2, 3]
    },
  },
  {
    id: "m-2",
    senderName: "Neha Sharma",
    senderPerson: "neha",
    timestamp: "9:32 AM",
    text: "Here's the latest design for the dashboard.",
    attachment: {
      type: "figma",
      name: "Dashboard_UI_v2.fig",
      size: "Figma File • 4.2 MB",
    },
    reactions: {
      "👍": [1, 2, 3, 4, 5, 6, 7, 8],
      "🔥": [1, 2, 3]
    },
  },
  {
    id: "m-3",
    senderName: "Arjun Patel",
    senderPerson: "arjun",
    timestamp: "9:35 AM",
    text: "Looks great! I have some feedback in the comments.\n@team please check.",
    reactions: {
      "✅": [1, 2, 3, 4, 5, 6],
      "🎉": [1, 2, 3, 4]
    },
  },
  {
    id: "m-3-1",
    parentId: "m-3",
    senderName: "Priya Singh",
    senderPerson: "priya",
    timestamp: "9:42 AM",
    text: "I'll take a look right now.",
  },
  {
    id: "m-4",
    senderName: "Priya Singh",
    senderPerson: "priya",
    timestamp: "9:47 AM",
    text: "I've pushed the API changes to the dev branch.",
    codeBlock: {
      language: "javascript",
      lines: [
        "const getUsers = async (req, res) => {",
        "  try {",
        "    const users = await User.find();",
        "    res.status(200).json(users);",
        "  } catch (error) {",
        "    res.status(500).json({ message: error.message });",
        "  }",
        "}",
      ],
    },
    reactions: {
      "✅": [1, 2, 3, 4, 5, 6],
      "🎉": [1, 2, 3, 4]
    },
  },
  {
    id: "m-5",
    senderName: "Vikram Joshi",
    senderPerson: "vikram",
    timestamp: "9:50 AM",
    text: "Great work team! 🎉",
    reactions: {
      "❤️": [1, 2, 3, 4]
    },
  },
];

export const channelTasks = [
  { title: "Review Q2 roadmap", priority: "High", date: "May 20", color: "text-rose-500" },
  { title: "Update landing page copy", priority: "Medium", date: "May 22", color: "text-amber-500" },
  { title: "Fix mobile responsiveness", priority: "Low", date: "May 24", color: "text-emerald-500" },
];

export const channelPinnedFiles = [
  { name: "Q2 Roadmap.pdf", meta: "PDF • 2.4 MB", pinnedBy: "Pinned by Neha • May 10", icon: "pdf" },
  { name: "Design Guidelines", meta: "Doc • 1.8 MB", pinnedBy: "Pinned by Rohit • Apr 28", icon: "doc" },
];

export const channelSharedFiles = [
  { name: "Dashboard_UI_v2.fig", meta: "Figma File • 4.2 MB", time: "Today at 9:32 AM", icon: "figma" },
  { name: "API_Documentation.pdf", meta: "PDF • 3.2 MB", time: "Yesterday at 6:45 PM", icon: "pdf" },
  { name: "Brand_Assets.zip", meta: "ZIP • 12.6 MB", time: "2 days ago", icon: "zip" },
];

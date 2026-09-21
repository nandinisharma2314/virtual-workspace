export type InboxItem = {
  id: string;
  title: string;
  subtitle: string;
  preview: string;
  time: string;
  dateGroup: "Today" | "Yesterday" | "Earlier";
  unread: boolean;
  tag: "Mention" | "High" | "Meeting" | "File" | "AI" | "Approval" | "System" | "Low" | "Medium";
  tagStyle: { bg: string; text: string; border: string };
  iconType: "avatar" | "check" | "meeting" | "file" | "ai" | "approval" | "system" | "task-avatar";
  avatarPerson?: string;
  senderName: string;
  senderRole?: string;
  channel: { name: string; project: string };
  project: { name: string; dotColor: string };
  priority: { label: string; color: string; dotClass: string };
  fullMessage: string;
  aiSuggestedAction?: {
    title: string;
    reason: string;
    buttonLabel: string;
    confidence: string;
    actionUrl?: string;
  };
};

export const initialInboxItems: InboxItem[] = [];

export const inboxCategories = [
  { key: "All", label: "All", icon: "Inbox" },
  { key: "Unread", label: "Unread", icon: "Mail" },
  { key: "Mentions", label: "Mentions", icon: "AtSign" },
  { key: "Tasks", label: "Tasks", icon: "CheckSquare" },
  { key: "Approvals", label: "Approvals", icon: "CheckCircle2" },
  { key: "Meetings", label: "Meetings", icon: "Calendar" },
  { key: "Files", label: "Files", icon: "FileText" },
  { key: "Calendar", label: "Calendar", icon: "CalendarDays" },
  { key: "AI Summary", label: "AI Summary", icon: "Sparkles" },
  { key: "System", label: "System", icon: "Settings" },
];

export const inboxPriorities = [
  { key: "High", label: "High", dotColor: "bg-rose-500" },
  { key: "Medium", label: "Medium", dotColor: "bg-amber-500" },
  { key: "Low", label: "Low", dotColor: "bg-emerald-500" },
];

export const inboxProjects: { key: string; label: string; dotColor: string }[] = [];

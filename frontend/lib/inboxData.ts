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

export const initialInboxItems: InboxItem[] = [
  {
    id: "item-1",
    dateGroup: "Today",
    title: "Rahul Sharma mentioned you",
    subtitle: "In #design-team",
    preview: "@You can you review the new landing page design? Your feedback i...",
    time: "10:24 AM",
    unread: true,
    tag: "Mention",
    tagStyle: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200/60" },
    iconType: "avatar",
    avatarPerson: "rahul",
    senderName: "Rahul Sharma",
    senderRole: "Lead UI/UX Designer",
    channel: { name: "# design-team", project: "Mobile App" },
    project: { name: "Mobile App", dotColor: "bg-pink-500" },
    priority: { label: "High", color: "text-rose-600", dotClass: "bg-rose-500" },
    fullMessage: "@You can you review the new landing page design? Your feedback is important before we move to development. We have aligned the typography tokens and responsive breakpoints according to the design specifications.",
    aiSuggestedAction: {
      title: "AI Suggested Action",
      reason: "This looks like a review request.",
      buttonLabel: "Create Review Task",
      confidence: "High",
    },
  },
  {
    id: "item-2",
    dateGroup: "Today",
    title: "Review API Documentation",
    subtitle: "Task assigned by Neha Sharma",
    preview: "Please review the updated API docs v2.4 and approve.",
    time: "9:48 AM",
    unread: true,
    tag: "High",
    tagStyle: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200/60" },
    iconType: "check",
    avatarPerson: "neha",
    senderName: "Neha Sharma",
    senderRole: "Backend Lead",
    channel: { name: "# backend-architecture", project: "Mobile App" },
    project: { name: "Mobile App", dotColor: "bg-pink-500" },
    priority: { label: "High", color: "text-rose-600", dotClass: "bg-rose-500" },
    fullMessage: "Hi Avi, please review the updated REST API endpoints for v2.4 authentication and token refresh. We need final product engineering approval before QA starts regression testing this afternoon.",
    aiSuggestedAction: {
      title: "AI Suggested Action",
      reason: "Action item requiring technical review & sign-off.",
      buttonLabel: "Approve Documentation",
      confidence: "High",
    },
  },
  {
    id: "item-3",
    dateGroup: "Today",
    title: "Sprint Planning",
    subtitle: "Today at 2:00 PM • 1h",
    preview: "Occurs in 2 hours",
    time: "9:30 AM",
    unread: true,
    tag: "Meeting",
    tagStyle: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200/60" },
    iconType: "meeting",
    avatarPerson: "rohit",
    senderName: "Rohit Verma",
    senderRole: "Scrum Master",
    channel: { name: "# general-sync", project: "Mobile App" },
    project: { name: "Mobile App", dotColor: "bg-pink-500" },
    priority: { label: "Medium", color: "text-amber-500", dotClass: "bg-amber-500" },
    fullMessage: "Weekly sprint planning session for the upcoming Q3 product roadmap. We will groom backlog epics, estimate story points, and assign engineering capacity for the next two-week sprint.",
    aiSuggestedAction: {
      title: "AI Suggested Action",
      reason: "Upcoming meeting in 2 hours. Prepare agenda & notes.",
      buttonLabel: "Join Video Call",
      confidence: "High",
    },
  },
  {
    id: "item-4",
    dateGroup: "Today",
    title: "UI Proposal.pdf shared with you",
    subtitle: "Shared by Vikram Joshi in Mobile App",
    preview: "Please check the latest UI proposal for the homepage.",
    time: "8:55 AM",
    unread: true,
    tag: "File",
    tagStyle: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200/60" },
    iconType: "file",
    avatarPerson: "vikram",
    senderName: "Vikram Joshi",
    senderRole: "Senior Visual Designer",
    channel: { name: "# design-system", project: "Mobile App" },
    project: { name: "Mobile App", dotColor: "bg-pink-500" },
    priority: { label: "Medium", color: "text-amber-500", dotClass: "bg-amber-500" },
    fullMessage: "I have attached the finalized Figma export and PDF documentation for the responsive homepage layout. Take a close look at the revised dark mode color palettes and component elevation states.",
    aiSuggestedAction: {
      title: "AI Suggested Action",
      reason: "Document analysis available. Summarize 14 pages?",
      buttonLabel: "Summarize PDF",
      confidence: "High",
    },
  },
  {
    id: "item-5",
    dateGroup: "Yesterday",
    title: "Priya Singh assigned you a task",
    subtitle: "Design system - Update button components",
    preview: "Due tomorrow, Jul 29",
    time: "Yesterday",
    unread: false,
    tag: "High",
    tagStyle: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200/60" },
    iconType: "task-avatar",
    avatarPerson: "priya",
    senderName: "Priya Singh",
    senderRole: "Product Designer",
    channel: { name: "# product-ui", project: "Mobile App" },
    project: { name: "Mobile App", dotColor: "bg-pink-500" },
    priority: { label: "High", color: "text-rose-600", dotClass: "bg-rose-500" },
    fullMessage: "We need to update our primary button tokens across all modals, dialogs, and navigation cards to support the new elevation shadows and disabled interaction states by tomorrow end-of-day.",
    aiSuggestedAction: {
      title: "AI Suggested Action",
      reason: "Task assignment due very soon.",
      buttonLabel: "Open in Roadmap Board",
      confidence: "High",
    },
  },
  {
    id: "item-6",
    dateGroup: "Yesterday",
    title: "AI Summary is ready",
    subtitle: "Daily summary for Jul 27",
    preview: "3 tasks completed, 2 in progress, 1 pending",
    time: "Yesterday",
    unread: false,
    tag: "AI",
    tagStyle: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200/60" },
    iconType: "ai",
    avatarPerson: "avi",
    senderName: "WorkFlow AI Assistant",
    senderRole: "Automated Intelligence",
    channel: { name: "Automated Report", project: "Marketing Campaign" },
    project: { name: "Marketing Campaign", dotColor: "bg-orange-500" },
    priority: { label: "Low", color: "text-emerald-600", dotClass: "bg-emerald-500" },
    fullMessage: "Your team maintained exceptional velocity yesterday! Rohit completed the design system token schema, Neha deployed API enhancements, and 3 high-priority pull requests were merged without regression.",
    aiSuggestedAction: {
      title: "AI Suggested Action",
      reason: "Weekly executive briefing report can be compiled.",
      buttonLabel: "Export Executive Summary",
      confidence: "High",
    },
  },
  {
    id: "item-7",
    dateGroup: "Yesterday",
    title: "Leave Request requires approval",
    subtitle: "Ankit Patel has requested leave on Jul 31 - Aug 2",
    preview: "3 days • Family Function",
    time: "Yesterday",
    unread: false,
    tag: "Approval",
    tagStyle: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200/60" },
    iconType: "approval",
    avatarPerson: "ankit",
    senderName: "Ankit Patel",
    senderRole: "Frontend Developer",
    channel: { name: "HR Portal", project: "HR & Admin" },
    project: { name: "HR & Admin", dotColor: "bg-emerald-500" },
    priority: { label: "Medium", color: "text-amber-500", dotClass: "bg-amber-500" },
    fullMessage: "Requesting 3 days of annual paid leave from July 31st to August 2nd to attend an upcoming family function out of town. All my current sprint tasks have been handed off to Rohit.",
    aiSuggestedAction: {
      title: "AI Suggested Action",
      reason: "No sprint conflicts detected during this period.",
      buttonLabel: "Approve Leave Request",
      confidence: "High",
    },
  },
  {
    id: "item-8",
    dateGroup: "Earlier",
    title: "Pull Request #142 merged",
    subtitle: "feat: user authentication flow",
    preview: "Merged by Arjun Patel",
    time: "Jul 26",
    unread: false,
    tag: "System",
    tagStyle: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200/60" },
    iconType: "system",
    avatarPerson: "arjun",
    senderName: "GitHub System",
    senderRole: "Continuous Integration",
    channel: { name: "github-notifications", project: "Mobile App" },
    project: { name: "Mobile App", dotColor: "bg-pink-500" },
    priority: { label: "Low", color: "text-emerald-600", dotClass: "bg-emerald-500" },
    fullMessage: "Pull Request #142 (feat: user authentication flow and JWT cookie handling) was successfully squashed and merged into primary target production branch by @Arjun Patel.",
    aiSuggestedAction: {
      title: "AI Suggested Action",
      reason: "PR merged. You can now close associated Jira task.",
      buttonLabel: "Close Related Task #482",
      confidence: "High",
    },
  },
];

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

export const inboxProjects = [
  { key: "Mobile App", label: "Mobile App", dotColor: "bg-pink-500" },
  { key: "Marketing Campaign", label: "Marketing Campaign", dotColor: "bg-orange-500" },
  { key: "HR & Admin", label: "HR & Admin", dotColor: "bg-emerald-500" },
];

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

export interface ChannelTemplate {
  id: string;
  name: string;
  category: string;
  author: string;
  uses: string;
  bannerImage?: string;
  bannerGradient?: string;
  videoPlaceholder?: string;
  tabs: TemplateTabContent[];
  steps?: TemplateStep[];
}

export const templateCategories = [
  { id: 'business', name: 'Business', iconColor: 'bg-[#4BCE97] text-white', icon: 'business' },
  { id: 'design', name: 'Design', iconColor: 'bg-[#E774BB] text-white', icon: 'design' },
  { id: 'education', name: 'Education', iconColor: 'bg-[#F5CD47] text-gray-900', icon: 'education' },
  { id: 'engineering', name: 'Engineering', iconColor: 'bg-[#8590A2] text-white', icon: 'engineering' },
  { id: 'marketing', name: 'Marketing', iconColor: 'bg-[#57D9A3] text-white', icon: 'marketing' },
  { id: 'project-management', name: 'Project Management', iconColor: 'bg-[#FFC400] text-gray-900', icon: 'project-management' },
  { id: 'remote-work', name: 'Remote Work', iconColor: 'bg-[#4C9AFF] text-white', icon: 'remote-work' },
];

export const channelTemplates: ChannelTemplate[] = [
  {
    id: "my-tasks",
    name: "My Tasks | Trello",
    category: "project-management",
    author: "Trello Team",
    uses: "0",
    bannerGradient: "from-orange-400 to-amber-500",
    videoPlaceholder: "/video-placeholder.png",
    tabs: [
      {
        tabName: "Overview",
        headline: "Welcome to My Tasks",
        description: "Track all your to-dos in your own, private Trello board.",
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
    author: "Trello Team",
    uses: "131.3K",
    bannerImage: "/template_banner_1.png",
    tabs: [
      {
        tabName: "Overview",
        headline: "Welcome new employees",
        description: "Help new employees start strong with this onboarding template.",
      }
    ]
  },
  {
    id: "tier-list",
    name: "Tier List",
    category: "design",
    author: "Trello Engineering Team",
    uses: "23.3K",
    bannerGradient: "from-slate-700 to-slate-900",
    tabs: [
      {
        tabName: "Overview",
        headline: "Create a tier list",
        description: "Use this template to create a tier list for anything you want.",
      }
    ]
  },
  {
    id: "feedback-intake",
    name: "Feedback intake and triage",
    category: "engineering",
    author: "Internal Tools",
    uses: "1.2K",
    bannerImage: "/template_banner.png",
    videoPlaceholder: "/video-placeholder-2.png",
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
    ],
    tabs: [
      {
        tabName: "Feedback instructions",
        headline: "Feedback instructions",
        description: "Looking to submit or manage feedback? Welcome! You're in the right place.",
        actionCard: {
          title: "Need to submit a feedback? Use this workflow.",
          subtitle: "Replace with a new or existing workflow.",
          actionText: "Add a workflow",
          icon: "play",
          bgColorClass: "bg-[#E8F2FA]",
          textColorClass: "text-[#1164A3]"
        }
      }
    ]
  },
  {
    id: "sales-deal",
    name: "Sales deal tracking",
    category: "marketing",
    author: "Sales Team",
    uses: "4.5K",
    bannerImage: "/template_banner_4.png",
    tabs: [
      {
        tabName: "Deal Hub",
        headline: "Close more deals",
        description: "Collaborate on active deals, share insights, and get approvals quickly.",
      }
    ]
  }
];

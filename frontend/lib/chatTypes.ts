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
  senderAvatar?: string;
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

export const chatChannels: ChatChannel[] = [];
export const chatDirectMessages: ChatDirectMessage[] = [];
export const chatTeams: ChatTeam[] = [];
export const chatMessages: ChatMessage[] = [];

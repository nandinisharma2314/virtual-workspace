"use client";

import React, { useState, useEffect, useRef } from 'react';

// Icons & template data
import { 
  Plus, CheckCircle2, Trash2, ArrowRight, ArrowLeft,
  Sparkles, Search, MoreHorizontal, Layout, 
  X, Check, Filter, User, Star, Share2, Zap, Eye, AlignLeft,
  Paperclip, Inbox, Calendar, FolderKanban, CheckSquare2,
  ChevronDown, ExternalLink, LayoutGrid, Bell, HelpCircle,
  Image as ImageIcon, ArrowLeft as BackArrow,
  FileText, GitMerge, AtSign, CheckCircle2 as CheckCircleIcon, CheckSquare
} from 'lucide-react';
import { ChannelTemplate, channelTemplates } from '@/lib/templateConfig';
import { InboxItem } from '@/lib/inboxTypes';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { io } from 'socket.io-client';
import Image from 'next/image';
import { API_URL } from '@/lib/apis';
import { toast, confirmDialog } from '@/lib/toast';
import { useBoardBackgrounds, DEFAULT_BOARD_BACKGROUNDS } from "@/lib/useAdminData";

// ─── Adapt a raw DB notification into the rich InboxItem shape ───────────────
function adaptDbNotification(dbNotif: any, index: number): InboxItem {
  const dateObj = new Date(dbNotif.createdAt);
  const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let tag: InboxItem['tag'] = 'System';
  let tagStyle = { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200/60' };
  let iconType: InboxItem['iconType'] = 'system';
  let title = `New ${dbNotif.type} Notification`;
  let aiSuggestedAction: InboxItem['aiSuggestedAction'] = {
    title: 'AI Suggested Action', reason: 'Based on real-time data.',
    buttonLabel: 'View Details', confidence: 'High',
  };
  const contentLower = dbNotif.content?.toLowerCase() || '';
  if (contentLower.includes('mention') || dbNotif.type === 'Mention') {
    tag = 'Mention'; tagStyle = { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200/60' }; iconType = 'avatar';
  } else if (contentLower.includes('task') || dbNotif.type === 'Task') {
    tag = 'High'; tagStyle = { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200/60' }; iconType = 'check'; title = 'Task Assignment';
  } else if (contentLower.includes('meet') || dbNotif.type === 'Meeting') {
    tag = 'Meeting'; tagStyle = { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200/60' }; iconType = 'meeting'; title = 'Upcoming Meeting';
    aiSuggestedAction = { title: 'Join Google Meet', reason: 'Meeting starting soon.', buttonLabel: 'Join Google Meet', confidence: 'Very High', actionUrl: 'https://meet.google.com' };
  } else if (contentLower.includes('file') || dbNotif.type === 'File') {
    tag = 'File'; tagStyle = { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200/60' }; iconType = 'file'; title = 'File Shared';
  }
  const projects = [
    { name: 'Mobile App', dotColor: 'bg-pink-500' },
    { name: 'Marketing Campaign', dotColor: 'bg-orange-500' },
  ];
  const priorities = [
    { label: 'High', color: 'text-rose-600', dotClass: 'bg-rose-500' },
    { label: 'Medium', color: 'text-amber-500', dotClass: 'bg-amber-500' },
    { label: 'Low', color: 'text-emerald-600', dotClass: 'bg-emerald-500' },
  ];
  return {
    id: dbNotif.id.toString(), title, subtitle: `Type: ${dbNotif.type}`,
    preview: (dbNotif.content || '').substring(0, 60) + '...', time: timeString,
    dateGroup: 'Today', unread: !dbNotif.isRead, tag, tagStyle, iconType,
    avatarPerson: 'avi', senderName: 'System',
    channel: { name: '# general', project: 'System' },
    project: projects[index % projects.length],
    priority: priorities[index % priorities.length],
    fullMessage: dbNotif.content, aiSuggestedAction,
  };
}

export const BOARD_BACKGROUNDS = DEFAULT_BOARD_BACKGROUNDS;

export interface TaskCard {
  id: string;
  title: string;
  cover?: string;
  isTemplate?: boolean;
  checklist?: string;
  checklistDone?: string;
  hasDesc?: boolean;
  hasEye?: boolean;
  attachments?: number;
  assignee?: string;
  tag?: string;
  priority?: 'High' | 'Medium' | 'Low' | string;
  date?: string;
  status?: string;
}

export interface TaskColumn {
  id: string;
  title: string;
  color?: string;
  cards: TaskCard[];
}

interface MyTasksBoardProps {
  template: ChannelTemplate;
  subTab?: 'board' | 'overview';
  onAddTask?: (task: any) => void;
  onSwitchTab?: (tab: string) => void;
  onBackToDashboard?: () => void;
  onSwitchTemplate?: (templateId: string) => void;
}

export default function MyTasksBoard({
  template,
  subTab = 'board',
  onAddTask,
  onSwitchTab,
  onBackToDashboard,
  onSwitchTemplate
}: MyTasksBoardProps) {
  const router = useRouter();
  const dynamicBackgrounds = useBoardBackgrounds();

  // --- Current User (real, from backend) ---
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role?: string; avatar?: string } | null>(null);

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      fetch(`${API_URL}/auth/me?_t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => (res.ok ? res.json() : null))
        .then(data => { if (data) setCurrentUser(data); })
        .catch(() => {});
    }
  }, []);

  // Helper: get initials from name
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper: avatar background colour from initials
  const avatarColors = [
    '#5E4DB2', '#0C66E4', '#206A83', '#216E4E', '#7F5F01', '#974F0C', '#AE2E24'
  ];
  const getAvatarColor = (name?: string) => {
    if (!name) return avatarColors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  // --- Real-time Notifications (for bell icon) ---
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // --- Rich Inbox Items (same as real /inbox page) ---
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [inboxTab, setInboxTab] = useState<'All' | 'Unread' | 'Tasks' | 'Meetings' | 'Files'>('All');
  const [selectedInboxId, setSelectedInboxId] = useState<string>('');

  const inboxFilteredItems = inboxItems.filter(item => {
    if (inboxTab === 'Unread') return item.unread;
    if (inboxTab === 'Tasks') return item.tag === 'High' || item.title.toLowerCase().includes('task');
    if (inboxTab === 'Meetings') return item.tag === 'Meeting';
    if (inboxTab === 'Files') return item.tag === 'File';
    return true;
  });

  const renderInboxIcon = (item: InboxItem) => {
    if (item.iconType === 'avatar' || item.iconType === 'task-avatar') {
      return (
        <div className="relative shrink-0 h-8 w-8 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[11px] font-bold">
            {item.senderName?.[0] || 'U'}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-white ring-1 ring-[#1a1f2e]">
            <AtSign size={8} strokeWidth={3} />
          </span>
        </div>
      );
    }
    if (item.iconType === 'check' || item.iconType === 'approval') {
      return <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><CheckCircleIcon size={16} /></div>;
    }
    if (item.iconType === 'meeting') {
      return <div className="h-8 w-8 shrink-0 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center"><Calendar size={15} /></div>;
    }
    if (item.iconType === 'file') {
      return <div className="h-8 w-8 shrink-0 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center"><FileText size={15} /></div>;
    }
    if (item.iconType === 'ai') {
      return <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center"><Sparkles size={15} /></div>;
    }
    return <div className="h-8 w-8 shrink-0 rounded-full bg-white/10 text-white/50 flex items-center justify-center"><GitMerge size={14} /></div>;
  };

  const markInboxItemRead = async (id: string) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    // Only call API for DB items (numeric IDs)
    if (!isNaN(Number(id)) && token) {
      await fetch(`${API_URL}/user-notifications/${id}/read`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    setInboxItems(prev => prev.map(i => i.id === id ? { ...i, unread: false } : i));
  };

  const markAllInboxRead = async () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      await fetch(`${API_URL}/user-notifications/mark-all-read`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    setInboxItems(prev => prev.map(i => ({ ...i, unread: false })));
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const inboxUnreadCount = inboxItems.filter(i => i.unread).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) return;
        const res = await fetch(`${API_URL}/user-notifications?_t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter((n: any) => !n.isRead).length);
          // Also populate rich inbox items
          const mapped = data.map((d: any, i: number) => adaptDbNotification(d, i));
          setInboxItems(mapped);
        }
      } catch (e) {
        console.warn('Notifications fetch failed', e);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    let userId = null;
    if (token) {
      try { userId = JSON.parse(atob(token.split('.')[1])).sub; } catch (e) {}
    }
    const socket = io(API_URL, { auth: { token }, query: { userId } });
    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      // Also add to rich inbox
      setInboxItems(prev => [adaptDbNotification(notification, prev.length), ...prev]);
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const markAllAsRead = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      await fetch(`${API_URL}/user-notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const markAsRead = async (id: number) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      await fetch(`${API_URL}/user-notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  // Close notification panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load board columns
  const [columns, setColumns] = useState<TaskColumn[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`template_${template.id}_columns`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return template.templateConfig?.columns || [
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
    ];
  });

  // Board Title State
  const [boardTitle, setBoardTitle] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`template_${template.id}_title`);
      if (saved) return saved;
    }
    return template.templateConfig?.boardName || template.name || "hi";
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // Synchronize when template prop updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`template_${template.id}_columns`);
      if (saved) {
        try {
          setColumns(JSON.parse(saved));
          return;
        } catch (e) {}
      }
    }
    setColumns(template.templateConfig?.columns || []);
  }, [template.id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`template_${template.id}_title`);
      if (saved) {
        setBoardTitle(saved);
        return;
      }
    }
    setBoardTitle(template.templateConfig?.boardName || template.name || "hi");
  }, [template.id, template.name]);

  // Card addition state
  const [addingColId, setAddingColId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  // List addition state
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Active floating dock tab
  const [floatingTab, setFloatingTab] = useState<'inbox' | 'planner' | 'board' | 'switch'>('board');
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [switcherTab, setSwitcherTab] = useState<'templates' | 'backgrounds'>('templates');

  // Panel open states
  const [isInboxPanelOpen, setIsInboxPanelOpen] = useState(false);
  const [isPlannerPanelOpen, setIsPlannerPanelOpen] = useState(false);

  // Planner: scheduled cards state
  const [plannedCards, setPlannedCards] = useState<Record<string, { cardId: string; colId: string; title: string }[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`template_${template.id}_planned`);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  // Calendar data from backend
  const [backendCalendarData, setBackendCalendarData] = useState<any[]>([]);

  useEffect(() => {
    const fetchCalendar = async () => {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (token) {
        try {
          const res = await fetch(`${API_URL}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.calendarData) setBackendCalendarData(data.calendarData);
          }
        } catch (e) {
          console.error("Failed to fetch calendar data", e);
        }
      }
    };
    fetchCalendar();
  }, []);

  const savePlanned = (updated: typeof plannedCards) => {
    setPlannedCards(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`template_${template.id}_planned`, JSON.stringify(updated));
    }
  };

  const toggleCardInDay = (dateKey: string, card: { cardId: string; colId: string; title: string }) => {
    const existing = plannedCards[dateKey] || [];
    const alreadyThere = existing.find(c => c.cardId === card.cardId);
    if (alreadyThere) {
      savePlanned({ ...plannedCards, [dateKey]: existing.filter(c => c.cardId !== card.cardId) });
    } else {
      savePlanned({ ...plannedCards, [dateKey]: [...existing, card] });
    }
  };

  // Build 7 days starting from today
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };
  const weekDays = getWeekDays();
  const formatDateKey = (d: Date) => d.toISOString().split('T')[0];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // All cards across all columns (for planner picker)
  const allCards = columns.flatMap(col => col.cards.map(card => ({ ...card, colId: col.id, colTitle: col.title })));

  // Board Background state (syncs with template.templateConfig.bgImage)
  const [boardBg, setBoardBg] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const custom = localStorage.getItem(`template_${template.id}_bg`);
      console.log("[DEBUG] useState init for template", template.id, "custom:", custom);
      if (custom) return custom;
    }
    console.log("[DEBUG] useState init returning default:", template.templateConfig?.bgImage);
    return template.templateConfig?.bgImage || "/cosmic_board_bg.jpg";
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const custom = localStorage.getItem(`template_${template.id}_bg`);
      console.log("[DEBUG] useEffect running for template", template.id, "custom:", custom);
      if (custom) {
        setBoardBg(custom);
        return;
      }
    }
    console.log("[DEBUG] useEffect setting default:", template.templateConfig?.bgImage);
    setBoardBg(template.templateConfig?.bgImage || "/cosmic_board_bg.jpg");
  }, [template.id, template.templateConfig?.bgImage]);

  const handleSelectBg = (bgUrl: string) => {
    setBoardBg(bgUrl);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`template_${template.id}_bg`, bgUrl);
    }
  };

  // Card details modal
  const [selectedCard, setSelectedCard] = useState<{ card: TaskCard; colId: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`template_${template.id}_columns`, JSON.stringify(columns));
    }
  }, [columns, template.id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`template_${template.id}_title`, boardTitle);
    }
  }, [boardTitle, template.id]);

  const handleAddCard = (colId: string) => {
    if (!newCardTitle.trim()) return;
    const newCard: TaskCard = {
      id: `c-${Date.now()}`,
      title: newCardTitle.trim(),
    };

    setColumns(prev => prev.map(col => {
      if (col.id === colId) {
        return { ...col, cards: [...col.cards, newCard] };
      }
      return col;
    }));

    if (onAddTask) {
      onAddTask({
        id: newCard.id,
        title: newCard.title,
        status: colId.includes('done') || colId.includes('minutes') ? 'done' : 'todo',
        date: 'Today'
      });
    }

    setNewCardTitle('');
    setAddingColId(null);
  };

  const handleAddList = () => {
    if (!newListTitle.trim()) return;
    const newList: TaskColumn = {
      id: `col-${Date.now()}`,
      title: newListTitle.trim(),
      cards: []
    };
    setColumns(prev => [...prev, newList]);
    setNewListTitle('');
    setIsAddingList(false);
  };

  const handleDeleteCard = (colId: string, cardId: string) => {
    setColumns(prev => prev.map(col => {
      if (col.id === colId) {
        return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
      }
      return col;
    }));
  };

  const handleDeleteList = (colId: string) => {
    confirmDialog({
      title: "Delete List",
      message: "Are you sure you want to delete this list and all its cards? This action cannot be undone.",
      variant: "danger",
      confirmText: "Delete List",
      onConfirm: () => {
        setColumns(prev => prev.filter(c => c.id !== colId));
        toast.success("List deleted.");
      }
    });
  };

  const handleMoveCard = (cardId: string, fromColId: string, direction: 'prev' | 'next') => {
    const colIndex = columns.findIndex(c => c.id === fromColId);
    const targetIndex = direction === 'next' ? colIndex + 1 : colIndex - 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    let movingCard: TaskCard | null = null;

    setColumns(prev => prev.map((col, idx) => {
      if (idx === colIndex) {
        movingCard = col.cards.find(c => c.id === cardId) || null;
        return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
      }
      return col;
    }).map((col, idx) => {
      if (idx === targetIndex && movingCard) {
        return { ...col, cards: [...col.cards, movingCard] };
      }
      return col;
    }));
  };

  const getFilteredCards = (cards: TaskCard[] = []) => {
    if (!searchQuery.trim()) return cards;
    const q = searchQuery.toLowerCase();
    return cards.filter(c => c.title.toLowerCase().includes(q));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col w-screen h-screen select-none overflow-hidden"
      style={{
        backgroundImage: `url('${boardBg}')`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Dark Ambient Overlay to match WorkFlow cosmic look */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP WORKFLOW NAVIGATION BAR                                           */}
      {/* ========================================================================= */}
      <nav className="relative z-30 h-12 shrink-0 px-3 bg-[#1a1f2e]/95 backdrop-blur-md border-b border-indigo-500/20 flex items-center justify-between text-[#B6C2CF]">
        {/* Left: Back arrow + WorkFlow Logo + Boards badge */}
        <div className="flex items-center gap-2.5">
          {/* Back arrow — replaces the old grid icon + square logo */}
          <button 
            onClick={() => {
              if (onBackToDashboard) onBackToDashboard();
              else router.push('/boards');
            }} 
            className="flex items-center gap-1.5 p-1.5 hover:bg-indigo-500/20 rounded-lg text-indigo-300 hover:text-white transition-all cursor-pointer group" 
            title="Back to Boards"
          >
            <BackArrow size={17} strokeWidth={2.2} />
          </button>



          {/* WorkFlow logo image + Boards badge */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none" 
            onClick={() => {
              if (onBackToDashboard) onBackToDashboard();
              else router.push('/boards');
            }}
          >
            <Image
              src="/workflow-logo-white.png"
              alt="WorkFlow"
              width={160}
              height={44}
              className="h-10 w-auto object-contain"
              priority
            />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/25 text-indigo-200 border border-indigo-400/20">Boards</span>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md mx-4 hidden sm:flex items-center">
          <div className="w-full relative flex items-center">
            <Search size={14} className="absolute left-3 text-white/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/8 border border-white/15 focus:border-indigo-400/60 focus:bg-white/12 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/35 outline-none transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 text-white/50 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Create button, notifications, help, user avatar */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setIsAddingList(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm active:scale-95"
          >
            Create
          </button>

          {/* Real notifications bell */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative p-1.5 rounded-lg transition-colors ${
                isNotificationsOpen ? 'bg-indigo-500/25 text-indigo-200' : 'hover:bg-white/10 text-white/70 hover:text-white'
              }`}
              title="Notifications"
            >
              <Bell size={16} />
              <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-1 ring-[#1a1f2e]">
                {unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : '1'}
              </span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-xl border border-white/15 bg-[#1a1f2e]/98 backdrop-blur-md shadow-2xl overflow-hidden z-50 flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <h3 className="text-[13px] font-extrabold text-white">Notifications</h3>
                  <button onClick={markAllAsRead} className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-white/50 text-[13px]">No notifications yet</div>
                  ) : notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markAsRead(n.id)}
                      className={`relative flex items-start gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 cursor-pointer ${n.isRead ? 'opacity-60' : ''}`}
                    >
                      {!n.isRead && (
                        <div className="absolute left-2 top-5 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      )}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                        <Bell size={14} />
                      </div>
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <p className="text-[12px] text-white/85 leading-snug">{n.content}</p>
                        <span className="text-[10px] font-semibold text-white/40">
                          {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-white/10">
                  <Link href="/inbox" onClick={() => setIsNotificationsOpen(false)} className="block text-center w-full rounded-lg py-2 text-[11px] font-bold text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors hidden sm:block" title="Help">
            <HelpCircle size={16} />
          </button>

          {/* Real user avatar */}
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-white/20 shadow-sm cursor-pointer"
              title={`${currentUser.name} (${currentUser.role || 'Member'})`}
            />
          ) : (
            <div 
              className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] font-extrabold shadow-sm border border-white/20 cursor-pointer select-none"
              style={{ backgroundColor: getAvatarColor(currentUser?.name) }}
              title={currentUser ? `${currentUser.name} (${currentUser.role || 'Member'})` : 'Loading...'}
            >
              {getInitials(currentUser?.name)}
            </div>
          )}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. BOARD SUBHEADER (Board Title, Views, Live Sync, Share, Dashboard)       */}
      {/* ========================================================================= */}
      <header className="relative z-20 h-12 shrink-0 px-3.5 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-white">
        
        {/* Left Side: Board Identity */}
        <div className="flex items-center gap-2">
          {/* Editable Board Title */}
          {isEditingTitle ? (
            <input
              type="text"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              autoFocus
              className="bg-black/60 border border-[#579DFF] text-white font-bold text-lg px-2 py-0.5 rounded outline-none w-44"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="px-2 py-1 hover:bg-white/15 rounded text-lg font-bold tracking-tight text-white transition-colors flex items-center gap-1.5"
            >
              <span>{boardTitle}</span>
              <ChevronDown size={14} className="text-white/60" />
            </button>
          )}

          {/* Board Views / Table Icon */}
          <button className="p-1.5 hover:bg-white/15 rounded text-white/80 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold" title="Board view">
            <Layout size={15} />
          </button>

          {/* Star Icon */}
          <button 
            onClick={() => setIsStarred(!isStarred)}
            className={`p-1.5 hover:bg-white/15 rounded transition-colors ${isStarred ? 'text-amber-400' : 'text-white/70 hover:text-white'}`}
            title="Star this board"
          >
            <Star size={15} fill={isStarred ? "currentColor" : "none"} />
          </button>

          {/* Workspace Visibility Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 text-[12px] font-medium text-white/90">
            <span>Workspace</span>
          </div>
        </div>

        {/* Right Side: Members, Unito Sync, Automations, Filter & Share */}
        <div className="flex items-center gap-2">
          {/* Real user avatar in board subheader */}
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser?.name}
              className="w-7 h-7 rounded-full object-cover border border-white/20 shadow-sm"
              title={`${currentUser?.name} (${currentUser?.role || 'Member'})`}
            />
          ) : (
            <div 
              className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] font-extrabold shadow-sm border border-white/20 select-none"
              style={{ backgroundColor: getAvatarColor(currentUser?.name) }}
              title={currentUser ? `${currentUser.name} (${currentUser.role || 'Member'})` : 'Loading...'}
            >
              {getInitials(currentUser?.name)}
            </div>
          )}

          {/* Live Sync */}
          <button className="hidden md:flex items-center gap-1.5 px-2.5 py-1 hover:bg-white/15 rounded text-[12.5px] font-medium text-white/90 transition-colors">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Sync</span>
          </button>

          {/* Automation Lightning Icon */}
          <button className="p-1.5 hover:bg-white/15 rounded text-white/80 hover:text-white transition-colors" title="Automation">
            <Zap size={16} />
          </button>

          {/* Filter Button */}
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 hover:bg-white/15 rounded text-[12.5px] font-medium text-white/90 transition-colors cursor-pointer"
          >
            <Filter size={14} />
            <span>Filter</span>
          </button>

          {/* Share Button */}
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Board link copied to clipboard!");
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-white/15 rounded text-[12.5px] font-medium text-white/90 transition-colors cursor-pointer"
          >
            <Share2 size={13} strokeWidth={2.5} />
            <span>Share</span>
          </button>

          {/* Change Background Button */}
          <button 
            onClick={() => {
              setSwitcherTab('backgrounds');
              setIsSwitcherOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 hover:bg-white/15 rounded text-[12.5px] font-medium text-white/90 transition-colors cursor-pointer"
            title="Change board background image"
          >
            <ImageIcon size={14} />
            <span>Background</span>
          </button>

          {/* More options (...) */}
          <button 
            onClick={() => {
              setSwitcherTab('templates');
              setIsSwitcherOpen(true);
            }}
            className="p-1.5 hover:bg-white/15 rounded text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Board Menu & Switcher"
          >
            <MoreHorizontal size={18} />
          </button>

          <div className="h-5 w-px bg-white/20 mx-0.5" />

          {/* Back to Boards Dashboard */}
          <button
            onClick={() => {
              if (onBackToDashboard) {
                onBackToDashboard();
              } else {
                router.push('/boards');
              }
            }}
            className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white text-[12px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="All Boards"
          >
            <span>All Boards</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </header>

      {/* Filter Drawer / Search Bar */}
      {isFilterOpen && (
        <div className="relative z-20 bg-[#101204]/90 backdrop-blur-md px-4 py-2 border-b border-white/10 flex items-center gap-3">
          <Search size={14} className="text-white/60" />
          <input
            type="text"
            placeholder="Search or filter cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-white text-xs outline-none w-64 placeholder-white/40"
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-white/60 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WORKFLOW BOARD CANVAS (Lists & Cards)                                  */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 overflow-x-auto overflow-y-hidden p-4 flex items-start gap-3.5 [scrollbar-width:thin] select-none pb-20">
        
        {/* Render Each Column */}
        {columns.map((column, colIdx) => {
          const filteredCards = getFilteredCards(column.cards);
          const isAddingCard = addingColId === column.id;

          return (
            <div
              key={column.id}
              className="w-[272px] shrink-0 max-h-full flex flex-col bg-[#101204]/85 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl p-2.5 text-white"
            >
              {/* List Header */}
              <div className="flex items-center justify-between pb-2 px-1 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-[14px] font-bold text-[#DCDFE4] truncate">
                    {column.title}
                  </h3>
                  <span className="text-[11px] font-bold text-white/50 bg-white/10 px-1.5 py-0.2 rounded-full">
                    {column.cards.length}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <button 
                    onClick={() => setAddingColId(isAddingCard ? null : column.id)}
                    className="p-1 hover:bg-white/15 rounded text-white/60 hover:text-white transition-colors"
                    title="Add card"
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteList(column.id)}
                    className="p-1 hover:bg-white/15 rounded text-white/60 hover:text-rose-400 transition-colors"
                    title="Delete list"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Cards List with vertical scrolling */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 [scrollbar-width:thin]">
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard({ card, colId: column.id })}
                    className="group relative bg-[#22272B] hover:bg-[#282E33] border border-white/5 hover:border-[#579DFF]/60 rounded-lg p-2.5 shadow-sm text-white cursor-pointer transition-all"
                  >
                    {/* Card Cover Image (if present) */}
                    {card.cover && (
                      <div className="-mx-2.5 -mt-2.5 mb-2 rounded-t-lg overflow-hidden h-32 bg-black/50">
                        <img 
                          src={card.cover} 
                          alt={card.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    )}

                    {/* Template Badge (like in screenshot) */}
                    {card.isTemplate && (
                      <div className="mb-1.5 inline-flex items-center gap-1 bg-[#1C2B41] text-[#579DFF] border border-[#579DFF]/30 px-2 py-0.5 rounded text-[10.5px] font-bold">
                        <CheckSquare size={11} />
                        <span>Template</span>
                      </div>
                    )}

                    {/* Card Title */}
                    <p className="text-[13.5px] font-normal text-[#B6C2CF] leading-snug break-words">
                      {card.title}
                    </p>

                    {/* Badges / Metadata Row (Checklists, Avatars, Icons) */}
                    {(card.checklistDone || card.checklist || card.hasDesc || card.hasEye || card.attachments || card.assignee) && (
                      <div className="mt-2.5 flex items-center justify-between text-white/60 text-[11px]">
                        <div className="flex items-center gap-2">
                          {/* Completed Checklist (Green [3/3]) */}
                          {card.checklistDone && (
                            <span className="flex items-center gap-1 bg-[#1F845A] text-white px-1.5 py-0.5 rounded text-[10.5px] font-bold">
                              <Check size={11} strokeWidth={3} />
                              <span>{card.checklistDone}</span>
                            </span>
                          )}

                          {/* Incomplete Checklist ([0/3]) */}
                          {card.checklist && !card.checklistDone && (
                            <span className="flex items-center gap-1 bg-white/10 text-white/70 px-1.5 py-0.5 rounded text-[10.5px] font-medium">
                              <CheckSquare size={11} />
                              <span>{card.checklist}</span>
                            </span>
                          )}

                          {/* Description indicator (≡) */}
                          {card.hasDesc && (
                            <span title="This card has a description.">
                              <AlignLeft size={13} className="text-white/60" />
                            </span>
                          )}

                          {/* Watcher / Eye icon */}
                          {card.hasEye && (
                            <span title="You are watching this card.">
                              <Eye size={13} className="text-white/60" />
                            </span>
                          )}

                          {/* Attachment paperclip */}
                          {card.attachments && (
                            <span className="flex items-center gap-0.5 text-white/60">
                              <Paperclip size={12} />
                              <span>{card.attachments}</span>
                            </span>
                          )}
                        </div>

                        {/* Assignee Avatar Pill (NS from screenshot) */}
                        {card.assignee && (
                          <div className="w-5 h-5 rounded-full bg-[#5E4DB2] text-white flex items-center justify-center text-[9px] font-extrabold shadow-sm">
                            {card.assignee}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hover Move & Delete Controls */}
                    <div className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/60 rounded p-0.5 backdrop-blur-sm">
                      {colIdx > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveCard(card.id, column.id, 'prev');
                          }}
                          className="p-1 hover:bg-white/20 rounded text-white/70 hover:text-white"
                          title="Move left"
                        >
                          <ArrowLeft size={11} />
                        </button>
                      )}
                      {colIdx < columns.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveCard(card.id, column.id, 'next');
                          }}
                          className="p-1 hover:bg-white/20 rounded text-white/70 hover:text-white"
                          title="Move right"
                        >
                          <ArrowRight size={11} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(column.id, card.id);
                        }}
                        className="p-1 hover:bg-rose-500/30 rounded text-white/70 hover:text-rose-400"
                        title="Delete card"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add a card input or button */}
              {isAddingCard ? (
                <div className="mt-2 bg-[#22272B] p-2.5 rounded-lg border border-[#579DFF] space-y-2">
                  <textarea
                    placeholder="Enter a title for this card..."
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddCard(column.id);
                      }
                    }}
                    autoFocus
                    rows={2}
                    className="w-full bg-transparent text-white text-[13px] placeholder-white/40 resize-none outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddCard(column.id)}
                      className="px-3 py-1.5 bg-[#579DFF] hover:bg-[#85B8FF] text-[#1D2125] font-bold text-xs rounded-md transition-colors cursor-pointer"
                    >
                      Add card
                    </button>
                    <button
                      onClick={() => {
                        setAddingColId(null);
                        setNewCardTitle('');
                      }}
                      className="p-1 text-white/60 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingColId(column.id)}
                  className="mt-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white text-[13px] font-semibold flex items-center gap-2 transition-colors cursor-pointer text-left"
                >
                  <Plus size={15} />
                  <span>Add a card</span>
                </button>
              )}
            </div>
          );
        })}

        {/* + Add another list (WorkFlow Glass Button) */}
        {isAddingList ? (
          <div className="w-[272px] shrink-0 bg-[#101204]/90 backdrop-blur-md rounded-xl border border-white/15 p-3 text-white space-y-2 shadow-2xl">
            <input
              type="text"
              placeholder="Enter list name..."
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
              autoFocus
              className="w-full bg-[#22272B] border border-[#579DFF] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddList}
                className="px-3 py-1.5 bg-[#579DFF] text-[#1D2125] font-bold text-xs rounded-md hover:bg-[#85B8FF] transition-colors"
              >
                Add list
              </button>
              <button
                onClick={() => {
                  setIsAddingList(false);
                  setNewListTitle('');
                }}
                className="p-1 text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingList(true)}
            className="w-[272px] shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-[13.5px] rounded-xl p-3 flex items-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add another list</span>
          </button>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. INBOX PANEL OVERLAY */}
      {/* ========================================================================= */}
      {isInboxPanelOpen && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-35 w-[600px] max-w-[96vw]">
          <div className="bg-[#1a1f2e]/98 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '72vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20">
                  <Inbox size={15} className="text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-[13px] font-extrabold text-white">Inbox</h3>
                  <p className="text-[10px] text-white/40">{inboxItems.length} items • Sorted by: Newest</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {inboxUnreadCount > 0 && (
                  <button
                    onClick={markAllInboxRead}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg hover:bg-indigo-500/10 transition-all flex items-center gap-1"
                  >
                    <CheckCircleIcon size={12} /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => { setIsInboxPanelOpen(false); router.push('/inbox'); }}
                  className="text-[11px] font-bold text-white/40 hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-500/10 transition-all flex items-center gap-1"
                  title="Open full inbox page"
                >
                  <ExternalLink size={12} /> Full page
                </button>
                <button
                  onClick={() => setIsInboxPanelOpen(false)}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-white/8 overflow-x-auto [scrollbar-width:none]">
              {(['All', 'Unread', 'Tasks', 'Meetings', 'Files'] as const).map(tab => {
                const count = tab === 'All' ? inboxItems.length
                  : tab === 'Unread' ? inboxItems.filter(i => i.unread).length
                  : tab === 'Tasks' ? inboxItems.filter(i => i.tag === 'High' || i.title.toLowerCase().includes('task')).length
                  : tab === 'Meetings' ? inboxItems.filter(i => i.tag === 'Meeting').length
                  : inboxItems.filter(i => i.tag === 'File').length;
                return (
                  <button
                    key={tab}
                    onClick={() => setInboxTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                      inboxTab === tab
                        ? 'bg-indigo-500/25 text-indigo-200'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {tab}
                    {count > 0 && (
                      <span className={`h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full text-[9px] font-black ${
                        tab === 'Unread' ? 'bg-rose-500 text-white' : 'bg-white/10 text-white/60'
                      }`}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Rich Inbox Item List */}
            <div className="overflow-y-auto flex-1 [scrollbar-width:thin] px-3 py-2.5 space-y-1.5">
              {inboxFilteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Inbox size={22} className="text-indigo-400/60" />
                  </div>
                  <p className="text-[13px] text-white/40 font-medium">No items in this category</p>
                </div>
              ) : inboxFilteredItems.map(item => {
                const isSelected = item.id === selectedInboxId;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedInboxId(item.id);
                      if (item.unread) markInboxItemRead(item.id);
                    }}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-400/30 shadow-sm'
                        : item.unread
                        ? 'bg-white/6 border-white/10 hover:bg-white/10 hover:border-white/15'
                        : 'bg-white/3 border-white/6 hover:bg-white/7 hover:border-white/10 opacity-75'
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="shrink-0 w-2 flex justify-center">
                      {item.unread && <span className="h-2 w-2 rounded-full bg-indigo-400" />}
                    </div>
                    {/* Icon */}
                    <div className="shrink-0">{renderInboxIcon(item)}</div>
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className={`text-[12.5px] leading-tight truncate ${
                          item.unread ? 'font-extrabold text-white' : 'font-semibold text-white/70'
                        }`}>{item.title}</h4>
                        <span className="text-[10.5px] text-white/35 font-semibold shrink-0">{item.time}</span>
                      </div>
                      <p className={`text-[11px] truncate ${
                        item.subtitle.includes('#') ? 'text-indigo-400 font-semibold' : 'text-white/45 font-medium'
                      }`}>{item.subtitle}</p>
                      <p className="text-[11px] text-white/30 line-clamp-1 mt-0.5">{item.preview}</p>
                    </div>
                    {/* Tag badge */}
                    <span className={`shrink-0 ${item.tagStyle.bg} ${item.tagStyle.text} border ${item.tagStyle.border} px-1.5 py-0.5 rounded text-[10px] font-extrabold`}>
                      {item.tag}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-white/30">{inboxFilteredItems.length} of {inboxItems.length} items</span>
              <button
                onClick={() => { setIsInboxPanelOpen(false); router.push('/inbox'); }}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                Open full inbox <ExternalLink size={11} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PLANNER PANEL OVERLAY */}
      {/* ========================================================================= */}
      {isPlannerPanelOpen && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-35 w-[680px] max-w-[96vw]">
          <div className="bg-[#1a1f2e]/98 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '70vh' }}>
            {/* Planner Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
                  <Calendar size={15} className="text-violet-300" />
                </div>
                <div>
                  <h3 className="text-[13px] font-extrabold text-white">Planner</h3>
                  <p className="text-[10px] text-white/40">Schedule cards across the next 7 days</p>
                </div>
              </div>
              <button
                onClick={() => setIsPlannerPanelOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Week Grid */}
            <div className="flex-1 overflow-y-auto [scrollbar-width:thin] p-4">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, i) => {
                  const key = formatDateKey(day);
                  const isToday = i === 0;
                  const scheduled = plannedCards[key] || [];
                  const backendEvents = backendCalendarData.filter(e => e.date === key);

                  return (
                    <div key={key} className={`flex flex-col rounded-xl border ${
                      isToday
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-white/8 bg-white/4'
                    } p-2 min-h-[120px]`}>
                      {/* Day Header */}
                      <div className="mb-2">
                        <p className={`text-[10px] font-bold uppercase tracking-wide ${
                          isToday ? 'text-indigo-300' : 'text-white/40'
                        }`}>
                          {dayNames[day.getDay()]}
                        </p>
                        <p className={`text-[18px] font-black leading-none ${
                          isToday ? 'text-indigo-200' : 'text-white/70'
                        }`}>
                          {day.getDate()}
                        </p>
                        <p className="text-[9px] text-white/25">{monthNames[day.getMonth()]}</p>
                      </div>

                      {/* Scheduled Cards & Backend Events */}
                      <div className="flex flex-col gap-1 flex-1">
                        {backendEvents.map((ev, idx) => (
                          <div
                            key={`be-${idx}`}
                            className="group flex flex-col gap-0.5 bg-violet-500/15 border border-violet-400/20 rounded-lg px-1.5 py-1 cursor-default"
                          >
                            <span className="text-[9.5px] text-violet-200 font-bold leading-tight line-clamp-2">{ev.title}</span>
                            <span className="text-[8px] text-violet-300/70">{ev.time}</span>
                          </div>
                        ))}
                        {scheduled.map(sc => (
                          <div
                            key={sc.cardId}
                            className="group flex items-start justify-between gap-1 bg-indigo-500/15 border border-indigo-400/20 rounded-lg px-1.5 py-1 cursor-pointer hover:bg-indigo-500/25 transition-colors"
                            onClick={() => toggleCardInDay(key, sc)}
                            title="Click to unschedule"
                          >
                            <span className="text-[9.5px] text-indigo-200 font-medium leading-tight line-clamp-2">{sc.title}</span>
                            <X size={9} className="shrink-0 text-indigo-400/60 group-hover:text-indigo-300 mt-0.5" />
                          </div>
                        ))}
                      </div>

                      {/* Add Card Dropdown */}
                      <div className="mt-1.5 relative group/add">
                        <button className="w-full text-[9px] text-white/30 hover:text-white/60 flex items-center justify-center gap-0.5 py-0.5 rounded hover:bg-white/5 transition-colors">
                          <Plus size={10} /> Add
                        </button>
                        {/* Card picker on hover */}
                        <div className="hidden group-hover/add:block absolute bottom-full mb-1 left-0 right-0 bg-[#1a1f2e] border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden" style={{ minWidth: '160px', left: i > 3 ? 'auto' : '0', right: i > 3 ? '0' : 'auto' }}>
                          <div className="px-2.5 py-1.5 border-b border-white/10">
                            <p className="text-[10px] font-bold text-white/60">Schedule existing card</p>
                          </div>
                          <div className="max-h-40 overflow-y-auto [scrollbar-width:thin]">
                            {allCards.length === 0 ? (
                              <p className="p-3 text-[11px] text-white/30 text-center">No cards yet</p>
                            ) : allCards.map(card => {
                              const isScheduled = (plannedCards[key] || []).find(c => c.cardId === card.id);
                              return (
                                <button
                                  key={card.id}
                                  onClick={() => toggleCardInDay(key, { cardId: card.id, colId: card.colId, title: card.title })}
                                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                                    isScheduled ? 'opacity-50' : ''
                                  }`}
                                >
                                  <span className="text-[11px] text-white/80 leading-snug truncate">{card.title}</span>
                                  {isScheduled ? (
                                    <Check size={11} className="text-indigo-400 shrink-0" />
                                  ) : (
                                    <Plus size={11} className="text-white/30 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          
                          <div className="px-2.5 py-2 border-t border-white/10 bg-black/20">
                            <input 
                              type="text" 
                              placeholder="Create new task & schedule..."
                              className="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-indigo-500 placeholder-white/30"
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                  const title = e.currentTarget.value.trim();
                                  e.currentTarget.value = '';
                                  const firstCol = columns[0];
                                  if (!firstCol) return;
                                  
                                  const newId = `c-${Date.now()}`;
                                  
                                  // Update UI immediately
                                  const newColumns = [...columns];
                                  newColumns[0] = { ...firstCol, cards: [...firstCol.cards, { id: newId, title }] };
                                  setColumns(newColumns);
                                  
                                  toggleCardInDay(key, { cardId: newId, colId: firstCol.id, title });
                                  
                                  // Call API
                                  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                                  if (token) {
                                    await fetch(`${API_URL}/tasks`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ title, status: 'todo' })
                                    }).catch(console.error);
                                    
                                    // Also refresh calendar data so it shows up in meetings API
                                    const res = await fetch(`${API_URL}/dashboard`, {
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    if (res.ok) {
                                      const data = await res.json();
                                      if (data.calendarData) setBackendCalendarData(data.calendarData);
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Row */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-white/40">
                    <span className="font-bold text-white/70">{Object.values(plannedCards).flat().length}</span> cards scheduled
                  </span>
                  <span className="text-[11px] text-white/40">
                    <span className="font-bold text-white/70">{backendCalendarData.length}</span> calendar events
                  </span>
                </div>
                <button
                  onClick={() => {
                    confirmDialog({
                      title: "Clear Schedule",
                      message: "Are you sure you want to clear all scheduled cards?",
                      variant: "danger",
                      confirmText: "Clear Schedule",
                      onConfirm: () => {
                        savePlanned({});
                        toast.success("Schedule cleared.");
                      }
                    });
                  }}
                  className="text-[11px] text-white/30 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={11} /> Clear schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. BOTTOM FLOATING PILL DOCK (matching Screenshot 1) */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-[#1a1f2e]/95 backdrop-blur-lg border border-indigo-500/20 rounded-full px-2 py-1.5 shadow-2xl flex items-center gap-1.5 text-white">
          {/* Inbox */}
          <button
            onClick={() => {
              setFloatingTab('inbox');
              setIsInboxPanelOpen(prev => !prev);
              setIsPlannerPanelOpen(false);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
              isInboxPanelOpen ? 'bg-indigo-500/25 text-indigo-200' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Inbox size={14} />
            <span>Inbox</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-1 ring-[#1a1f2e]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Planner */}
          <button
            onClick={() => {
              setFloatingTab('planner');
              setIsPlannerPanelOpen(prev => !prev);
              setIsInboxPanelOpen(false);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isPlannerPanelOpen ? 'bg-violet-500/25 text-violet-200' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar size={14} />
            <span>Planner</span>
          </button>

          {/* Board (Active highlighted with indigo) */}
          <button
            onClick={() => {
              setFloatingTab('board');
              setIsInboxPanelOpen(false);
              setIsPlannerPanelOpen(false);
            }}
            className={`px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
              !isInboxPanelOpen && !isPlannerPanelOpen ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layout size={14} />
            <span>Board</span>
          </button>

          {/* Switch boards */}
          <button
            onClick={() => setIsSwitcherOpen(true)}
            className="px-3 py-1 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-all"
          >
            <FolderKanban size={14} />
            <span>Switch boards</span>
          </button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 5. CARD DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#22272B] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-150">
            {selectedCard.card.cover && (
              <div className="h-44 w-full bg-black/50 overflow-hidden">
                <img src={selectedCard.card.cover} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {selectedCard.card.title}
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    in list <span className="underline font-semibold text-white/80">{columns.find(c => c.id === selectedCard.colId)?.title}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedCard(null)}
                  className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {selectedCard.card.isTemplate && (
                <div className="inline-flex items-center gap-1.5 bg-[#1C2B41] text-[#579DFF] border border-[#579DFF]/40 px-3 py-1 rounded text-xs font-bold">
                  <CheckSquare size={13} />
                  <span>This card is configured as a template.</span>
                </div>
              )}

              {/* Checklist Section */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                    <CheckSquare2 size={15} className="text-[#579DFF]" />
                    Checklist
                  </span>
                  <span className="text-[11px] font-bold text-white/60">
                    {selectedCard.card.checklistDone || selectedCard.card.checklist || "0/3"}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-white/80">
                  <div className="flex items-center gap-2 p-2 rounded bg-white/5">
                    <input type="checkbox" defaultChecked={!!selectedCard.card.checklistDone} className="rounded" />
                    <span>Send out calendar invite to team</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-white/5">
                    <input type="checkbox" defaultChecked={!!selectedCard.card.checklistDone} className="rounded" />
                    <span>Attach town hall slide deck</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-white/5">
                    <input type="checkbox" defaultChecked={!!selectedCard.card.checklistDone} className="rounded" />
                    <span>Record minutes and post recording link</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-[#1D2125] flex justify-end gap-2 border-t border-white/10">
              <button
                onClick={() => setSelectedCard(null)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SWITCH BOARDS & BACKGROUNDS MODAL                                     */}
      {/* ========================================================================= */}
      {isSwitcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1D2125] border border-white/15 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-white p-5 space-y-4 max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-white">Board Customization</h3>
                <p className="text-[11px] text-white/50 mt-0.5">Switch templates or choose an individual photo background</p>
              </div>
              <button 
                onClick={() => setIsSwitcherOpen(false)} 
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs: Templates vs Backgrounds */}
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setSwitcherTab('templates')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  switcherTab === 'templates'
                    ? 'bg-[#579DFF] text-white shadow-xs'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layout size={13} />
                <span>Templates ({channelTemplates.length})</span>
              </button>
              <button
                onClick={() => setSwitcherTab('backgrounds')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  switcherTab === 'backgrounds'
                    ? 'bg-[#579DFF] text-white shadow-xs'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <ImageIcon size={13} />
                <span>Backgrounds ({dynamicBackgrounds.length})</span>
              </button>
            </div>

            {/* Tab 1: Templates List */}
            {switcherTab === 'templates' && (
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-white/40 px-1 py-0.5">
                  Select a Template (Each has its own unique background)
                </div>

                {channelTemplates.map((t) => {
                  const isCurrent = t.id === template.id;
                  const bgThumb = t.templateConfig?.bgImage || "/cosmic_board_bg.jpg";

                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setIsSwitcherOpen(false);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('active_board_template', t.id);
                          if (t.templateConfig?.columns) {
                            localStorage.setItem(`template_${t.id}_columns`, JSON.stringify(t.templateConfig.columns));
                          }
                        }
                        if (onSwitchTemplate) {
                          onSwitchTemplate(t.id);
                        } else {
                          window.location.reload();
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                        isCurrent 
                          ? 'bg-[#579DFF]/20 border-[#579DFF]/60 text-white shadow-xs' 
                          : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/90 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Realistic Mini Background Thumbnail */}
                        <div 
                          className="w-12 h-8 rounded-lg overflow-hidden bg-cover bg-center shrink-0 border border-white/20 shadow-xs relative group-hover:scale-105 transition-transform"
                          style={{ backgroundImage: `url('${bgThumb}')` }}
                        >
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs truncate">{t.name}</span>
                            {t.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/70 font-semibold shrink-0">
                                {t.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-white/50 truncate mt-0.5">
                            {t.tagline || `${t.starterTasks?.length || 4} tasks`}
                          </p>
                        </div>
                      </div>
                      {isCurrent ? (
                        <Check size={14} className="text-[#579DFF] shrink-0 ml-2" />
                      ) : (
                        <ArrowRight size={13} className="text-white/40 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Individual Board Backgrounds Picker */}
            {switcherTab === 'backgrounds' && (
              <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-white/40 px-1 py-0.5">
                  Photographic Backgrounds ({dynamicBackgrounds.length})
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {dynamicBackgrounds.map((bg) => {
                    const isSelected = boardBg === bg.image;
                    return (
                      <button
                        key={bg.id}
                        onClick={() => handleSelectBg(bg.image)}
                        className={`text-left rounded-xl overflow-hidden border transition-all cursor-pointer group relative flex flex-col ${
                          isSelected
                            ? 'ring-2 ring-[#579DFF] border-transparent shadow-lg'
                            : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'
                        }`}
                      >
                        {/* Background Thumbnail */}
                        <div 
                          className="h-20 w-full bg-cover bg-center relative"
                          style={{ backgroundImage: `url('${bg.image}')` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#579DFF] text-white flex items-center justify-center shadow-xs">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                          <div className="absolute bottom-1.5 left-2 right-2">
                            <span className="text-[11px] font-bold text-white drop-shadow-xs block truncate">
                              {bg.name}
                            </span>
                            <span className="text-[9.5px] text-white/70 block truncate">
                              {bg.desc}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

              <div className="pt-2 border-t border-white/10 mt-2 space-y-1">
                <button
                  onClick={() => {
                    setIsSwitcherOpen(false);
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('active_board_template');
                    }
                    if (onBackToDashboard) onBackToDashboard();
                    else router.push('/boards');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold flex items-center justify-between text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Layout size={13} className="text-gray-400" />
                    <span>Product Roadmap (Default Kanban)</span>
                  </div>
                  <ArrowRight size={13} className="text-white/40" />
                </button>

                <button
                  onClick={() => {
                    setIsSwitcherOpen(false);
                    router.push('/templates');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-[#0C66E4]/20 hover:bg-[#0C66E4]/30 text-[#579DFF] text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FolderKanban size={13} />
                    <span>Browse All Templates Gallery</span>
                  </div>
                  <ExternalLink size={13} />
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}

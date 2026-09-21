"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Plus, HelpCircle, Bell, ChevronDown, Folder, Users, FileText, CheckCircle2, Command, User, Settings, LogOut, Hash } from "lucide-react";
import Avatar from "./Avatar";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { API_URL } from "@/lib/apis";
import { toast } from "@/lib/toast";

const profileMenuItems = [
  { name: "My Profile", icon: User, path: "/settings?tab=profile" },
  { name: "Account Settings", icon: Settings, path: "/settings" },
  { name: "Log out", icon: LogOut, action: () => { document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; window.location.href = "/login"; }, textClass: "text-rose-600 hover:text-rose-700", bgClass: "group-hover:bg-rose-50", iconClass: "text-rose-500 group-hover:text-rose-600" },
];

const searchResults = [
  { type: "Pages", items: [
    { name: "Teams Directory", icon: Users, path: "/teams" },
    { name: "All Projects", icon: Folder, path: "/projects" },
    { name: "Analytics & Reports", icon: FileText, path: "/reports" },
  ]},
  { type: "Quick Actions", items: [
    { name: "Create New Task", icon: CheckCircle2, action: () => toast.success("Quick Task Created!") },
    { name: "Create New Channel", icon: Hash, isChannel: true, path: "/chat?create=true" },
    { name: "Add Team Member", icon: Plus, path: "/teams" },
  ]}
];

const createMenuItems = [
  { name: "New Task", icon: CheckCircle2, path: "/boards" },
  { name: "New Project", icon: Folder, path: "/projects" },
  { name: "New Channel", icon: Hash, isChannel: true, path: "/chat?create=true" },
  { name: "New Document", icon: FileText, path: "/documents" },
  { name: "Invite Member", icon: Users, path: "/teams" },
];

export default function Topbar({ user }: { user?: { name: string; email: string; role?: string; avatar?: string } }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(user);
  const searchRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (token) {
        fetch(`${API_URL}/auth/me?_t=${Date.now()}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setCurrentUser(data);
        })
        .catch(() => {});
      }
    }
  }, [currentUser]);

  // Handle Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) return;
        const res = await fetch(`${API_URL}/user-notifications?_t=${Date.now()}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter((n: any) => !n.isRead).length);
        }
      } catch (e) {
        // Use console.warn instead of console.error to avoid triggering Next.js error overlay during backend restarts
        console.warn("Failed to fetch notifications (backend might be restarting)", e);
      }
    };
    fetchNotifications();
    // Poll every 30 seconds as fallback
    const interval = setInterval(fetchNotifications, 30000);
    
    // Setup Socket.IO for real-time notifications
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    let userId = null;
    if (token) {
       try { userId = JSON.parse(atob(token.split('.')[1])).sub; } catch(e) {}
    }
    
    const socket = io(API_URL, {
      auth: { token },
      query: { userId }
    });
    
    socket.on("new_notification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
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
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      await fetch(`${API_URL}/user-notifications/${id}/read`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (createRef.current && !createRef.current.contains(event.target as Node)) {
        setIsCreateOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-gray-200/80 bg-white px-5 z-20 shadow-2xs">
      <button className="flex items-center justify-between gap-2 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded bg-gray-900 text-[9px] font-bold text-white">
            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'W'}
          </span>
          {currentUser?.name ? `${currentUser.name.split(' ')[0]}'s Workspace` : 'Workspace'}
        </span>
        <ChevronDown size={13} className="text-gray-400" />
      </button>

      <div className="relative max-w-sm w-full shrink" ref={searchRef}>
        <Search
          size={14}
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearchOpen ? "text-indigo-500" : "text-gray-400"}`}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search (⌘ + K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchOpen(true)}
          className="w-full rounded-lg border border-transparent bg-gray-100/70 py-1.5 pl-8 pr-12 text-xs text-gray-800 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
        />
        {!isSearchOpen && (
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[9px] font-bold text-gray-400 border border-gray-200 bg-white px-1.5 py-0.5 rounded">
            <Command size={10} />
            <span>K</span>
          </div>
        )}

        {/* Search Dropdown */}
        {isSearchOpen && (
          <div className="absolute left-0 top-[calc(100%+8px)] w-[400px] rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden z-50">
            <div className="max-h-[320px] overflow-y-auto p-2">
              {searchResults.map((section, idx) => (
                <div key={idx} className="mb-2 last:mb-0">
                  <div className="px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                    {section.type}
                  </div>
                  {section.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else if (item.path) {
                          router.push(item.path);
                        }
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-xs transition-all">
                        <item.icon size={14} />
                      </div>
                      <span className="text-[13px] font-semibold text-gray-700 group-hover:text-gray-900">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
              
              {searchQuery && !searchResults.some(section => section.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))) && (
                <div className="py-8 text-center text-[13px] font-medium text-gray-500">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <div className="relative" ref={createRef}>
          <button 
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all"
          >
            <Plus size={14} strokeWidth={2.5} />
            Create
          </button>
          
          {isCreateOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-48 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden z-50">
              <div className="p-1.5">
                {createMenuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      if ((item as any).isChannel) {
                        window.dispatchEvent(new CustomEvent('open-create-channel'));
                        router.push('/chat?create=true');
                      } else if (item.path) {
                        router.push(item.path);
                      }
                      setIsCreateOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-gray-50 transition-colors group"
                  >
                    <item.icon size={15} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-[13px] font-semibold text-gray-700 group-hover:text-gray-900">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
          <HelpCircle size={16} />
        </button>
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative rounded-lg p-1.5 transition-colors ${isNotificationsOpen ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}`}
          >
            <Bell size={16} />
            <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
              {unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : '1'}
            </span>
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden z-50 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-[13px] font-extrabold text-gray-900">Notifications</h3>
                <button onClick={markAllAsRead} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Mark all as read
                </button>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-[13px]">No notifications yet</div>
                ) : notifications.map((notification) => (
                  <div key={notification.id} onClick={() => !notification.isRead && markAsRead(notification.id)} className={`relative flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer ${notification.isRead ? 'opacity-70' : ''}`}>
                    {!notification.isRead && (
                      <div className="absolute left-2 top-5 h-1.5 w-1.5 rounded-full bg-indigo-600"></div>
                    )}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                      <Bell size={14} />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <p className="text-[13px] text-gray-800 leading-tight">
                        {notification.content}
                      </p>
                      <span className="text-[11px] font-semibold text-gray-400">
                        {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {notification.type === 'channel_invite' && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <Link
                            href="/chat"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsNotificationsOpen(false);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-colors shadow-2xs"
                          >
                            <span>Respond in Chat</span>
                            <span>→</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-gray-100">
                <Link href="/inbox" onClick={() => setIsNotificationsOpen(false)} className="block text-center w-full rounded-lg py-2 text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="h-5 w-px bg-gray-200/80 mx-1 hidden sm:block" />
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-2.5 rounded-xl py-0.5 pl-1 pr-2 transition-colors ${isProfileOpen ? "bg-gray-100" : "hover:bg-gray-50"}`}
          >
            <Avatar name={currentUser?.name || "User"} avatar={currentUser?.avatar} size={36} />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[13.5px] sm:text-[14px] font-extrabold text-[#111827]">{currentUser?.name || "Loading..."}</span>
              <span className="block text-[11px] font-medium text-[#6B7280] mt-0.5">{currentUser?.role || "Member"}</span>
            </span>
            <ChevronDown size={14} className="hidden text-gray-500 sm:block ml-1" strokeWidth={2.2} />
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <Avatar name={currentUser?.name || "User"} avatar={currentUser?.avatar} size={40} />
                  <div>
                    <div className="text-[14px] font-extrabold text-gray-900 truncate max-w-[150px]">{currentUser?.name || "Loading..."}</div>
                    <div className="text-[12px] font-medium text-gray-500 truncate max-w-[150px]">{currentUser?.email || "..."}</div>
                  </div>
                </div>
              </div>
              <div className="p-1.5">
                {profileMenuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else if (item.path) {
                        router.push(item.path);
                      }
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-gray-50 transition-colors group`}
                  >
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 group-hover:bg-white group-hover:shadow-xs transition-all ${item.bgClass || ""}`}>
                      <item.icon size={14} className={`text-gray-500 transition-colors ${item.iconClass || "group-hover:text-indigo-600"}`} />
                    </div>
                    <span className={`text-[13px] font-semibold text-gray-700 transition-colors ${item.textClass || "group-hover:text-gray-900"}`}>
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

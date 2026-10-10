"use client";

import {
  Home,
  Inbox,
  MessageSquare,
  Users,
  FolderKanban,
  LayoutGrid,
  Zap,
  Calendar,
  Video,
  FileText,
  Folder,
  BarChart3,
  ChevronRight,
  Plus,
  HelpCircle,
  Layers,
} from "lucide-react";
import { sidebarPrimary } from "@/lib/uiConstants";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { API_URL, getAuthHeaders, getActiveWorkspaceId } from "@/lib/apis";
import { useWorkspace } from "@/lib/WorkspaceContext";

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  layers: Layers,
  inbox: Inbox,
  chat: MessageSquare,
  users: Users,
  folder: FolderKanban,
  layout: LayoutGrid,
  zap: Zap,
  calendar: Calendar,
  video: Video,
  "file-text": FileText,
  "folder-open": Folder,
  "bar-chart": BarChart3,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [activeOverride, setActiveOverride] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const { currentWorkspace, can } = useWorkspace();

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    })
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (data) setCurrentUser(data);
    })
    .catch(() => {});
  }, []);

  useEffect(() => {
    const wsId = currentWorkspace?.id || getActiveWorkspaceId();
    if (wsId) {
      fetch(`${API_URL}/chat/channels?workspaceId=${wsId}`, {
        headers: getAuthHeaders({ "x-workspace-id": String(wsId) }),
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setChannels(data.slice(0, 5));
        })
        .catch(() => {});
    } else {
      setChannels([]);
    }
  }, [currentWorkspace?.id]);

  const visibleSidebarPrimary = sidebarPrimary.filter((item) => {
    // If Admin globally or Workspace Owner, show everything
    if (!currentUser || currentUser.role === "Admin" || currentWorkspace?.isOwner) return true;

    // Granular permissions per section:
    if (item.label === "Reports" && !can("reports:view")) return false;
    if (
      item.label === "Boards" &&
      !can("boards:read_all") &&
      !can("boards:read_assigned") &&
      !can("boards:create")
    )
      return false;
    if (
      item.label === "Projects" &&
      !can("projects:read_all") &&
      !can("projects:read_assigned") &&
      !can("projects:create")
    )
      return false;
    if (
      item.label === "Sprints" &&
      !can("sprints:manage") &&
      !can("tasks:read_all") &&
      !can("tasks:read_assigned")
    )
      return false;
    if (
      item.label === "Meetings" &&
      !can("meetings:manage") &&
      !can("meetings:read") &&
      !can("meetings:rsvp")
    )
      return false;
    if (item.label === "Files" && !can("files:manage")) return false;
    if (item.label === "Documents" && !can("documents:manage")) return false;
    if (item.label === "Teams" && !can("teams:manage")) return false;

    return true;
  });

  return (
    <aside className="group hidden w-[72px] hover:w-[240px] transition-[width] duration-300 ease-in-out shrink-0 flex-col border-r border-gray-200/80 bg-white lg:flex h-screen overflow-hidden z-50 relative">
      <div className="w-[240px] flex flex-col h-full pt-4 pb-8 px-3">
        {/* 1. Seamless Logo Header Section */}
        <div className="flex shrink-0 items-center px-2 pb-2.5 mb-1 h-11 overflow-hidden">
          <Link 
            href="/" 
            className="flex items-center gap-2 select-none group/logo"
          >
            {/* 3D Brand Emblem - compact, refined and centered in collapsed mode */}
            <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
              <Image
                src="/nannex-icon.png"
                alt="nannex"
                width={28}
                height={28}
                className="w-7 h-7 object-contain shrink-0 group-hover/logo:scale-105 transition-transform duration-200"
                priority
              />
            </div>

            {/* Brand Wordmark - sleek typography that smoothly fades in on sidebar expansion */}
            <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Image
                src="/nannex-wordmark.png"
                alt="nannex"
                width={100}
                height={18}
                className="h-[18px] w-auto object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Top-aligned Content Container without awkward stretched spaces */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col justify-start [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* 2. Primary Navigation Section */}
          <div className="shrink-0 mb-3">
            <ul className="space-y-0.5">
              {visibleSidebarPrimary.map((item) => {
                const Icon = iconMap[item.icon];
                const isHome = item.label === "Home";
                const isWorkspaces = item.label === "Workspaces";
                const isInbox = item.label === "Inbox";
                const isChat = item.label === "Chat";
                const isTeams = item.label === "Teams";
                const isProjects = item.label === "Projects";
                const isBoards = item.label === "Boards";
                const isSprints = item.label === "Sprints";
                const isCalendar = item.label === "Calendar";
                const isMeetings = item.label === "Meetings";
                const isFiles = item.label === "Files";
                const isDocuments = item.label === "Documents";
                const isReports = item.label === "Reports";
                const hasWorkspaceAdmin = Boolean(currentWorkspace?.isOwner) || can("roles:manage") || can("members:assign_role") || can("members:remove") || can("members:invite") || can("teams:manage") || can("workspace:manage");
                const href = isHome ? "/" : isWorkspaces ? (hasWorkspaceAdmin ? "/workspaces/settings" : "/workspaces") : isInbox ? "/inbox" : isChat ? "/chat" : isTeams ? "/teams" : isProjects ? "/projects" : isBoards ? "/boards" : isSprints ? "/sprints" : isCalendar ? "/calendar" : isMeetings ? "/meetings" : isFiles ? "/files" : isDocuments ? "/documents" : isReports ? "/reports" : "#";
                
                const isActive = activeOverride
                  ? activeOverride === item.label
                  : (isHome && pathname === "/") || (isWorkspaces && pathname?.startsWith("/workspaces")) || (isInbox && pathname?.startsWith("/inbox")) || (isChat && pathname?.startsWith("/chat")) || (isTeams && pathname?.startsWith("/teams")) || (isProjects && pathname?.startsWith("/projects")) || (isBoards && pathname?.startsWith("/boards")) || (isSprints && pathname?.startsWith("/sprints")) || (isCalendar && pathname?.startsWith("/calendar")) || (isMeetings && pathname?.startsWith("/meetings")) || (isFiles && pathname?.startsWith("/files")) || (isDocuments && pathname?.startsWith("/documents")) || (isReports && pathname?.startsWith("/reports"));

                return (
                  <li key={item.label}>
                    <Link
                      href={href}
                      onClick={() => {
                        if (isHome || isWorkspaces || isInbox || isChat || isTeams || isProjects || isBoards || isSprints || isCalendar || isMeetings || isFiles || isDocuments || isReports) {
                          setActiveOverride(null);
                        } else {
                          setActiveOverride(item.label);
                        }
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-semibold transition-all ${
                        isActive
                          ? "bg-[#EEE8FF] text-indigo-600 font-extrabold shadow-2xs"
                          : "text-[#111827] hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center gap-3 truncate">
                        <span className="relative flex items-center justify-center shrink-0">
                          <Icon
                            size={18}
                            strokeWidth={isActive ? 2.3 : 1.9}
                            className={isActive ? "text-indigo-600" : "text-gray-600"}
                          />
                          {item.badge ? (
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500 border border-white" />
                          ) : null}
                        </span>
                        <span className="truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.label}</span>
                      </span>
                      {item.badge ? (
                        <span className="rounded-lg bg-[#EEE8FF] text-indigo-600 px-2 py-0.5 text-[10.5px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0 mr-4">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="border-b border-gray-100 pb-2 mt-1.5 mb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="flex w-[216px] items-center justify-between rounded-xl px-3 py-1.5 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                <span>More</span>
                <ChevronRight size={15} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* 3. Channels Section */}
          <div className="shrink-0">
            <div className="mb-1.5 flex w-[216px] items-center justify-between px-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[13px] font-extrabold text-[#111827]">
                Channels
              </span>
              {(Boolean(currentWorkspace?.isOwner) || can("channels:create") || currentUser?.role === "Admin") && (
                <Link
                  href="/chat?create=true"
                  title="Create Channel"
                  className="text-gray-500 hover:text-gray-800 p-0.5 rounded transition-colors"
                >
                  <Plus size={16} strokeWidth={2.2} />
                </Link>
              )}
            </div>
            {channels.length > 0 ? (
              <ul className="space-y-0.5 w-[216px]">
                {channels.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/chat?channel=${c.id}`}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-1 sm:py-1.5 text-[12.5px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors truncate"
                    >
                      <span className="text-gray-400 font-bold text-xs shrink-0">#</span>
                      <span className="truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {c.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-1 text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                No channels yet
              </div>
            )}
          </div>
        </div>

        {/* 4. Help & Support Footer pushed to bottom and elevated above floating desktop icon */}
        <div className="mt-auto shrink-0 pt-3 border-t border-gray-100/80 pb-2 z-10 w-[216px]">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <HelpCircle size={18} className="text-gray-500 shrink-0" strokeWidth={1.9} />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Help &amp; Support</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

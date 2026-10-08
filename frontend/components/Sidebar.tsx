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
  ShieldCheck,
} from "lucide-react";
import { sidebarPrimary, favorites } from "@/lib/uiConstants";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { API_URL, getAuthHeaders } from "@/lib/apis";
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

  const visibleSidebarPrimary = sidebarPrimary.filter(item => {
    // If Admin globally or Workspace Owner, show everything
    if (!currentUser || currentUser.role === "Admin" || currentWorkspace?.isOwner) return true;
    
    // For workspace members, check role permissions:
    if (item.label === "Reports" && !can("reports:view")) return false;
    return true;
  });

  return (
    <aside className="group hidden w-[72px] hover:w-[240px] transition-[width] duration-300 ease-in-out shrink-0 flex-col border-r border-gray-200/80 bg-white lg:flex h-screen overflow-hidden z-50 relative">
      <div className="w-[240px] flex flex-col h-full pt-4 pb-8 px-3">
        {/* 1. Seamless Logo Header Section */}
        <div className="flex shrink-0 items-center px-1 pb-3 mb-1 overflow-hidden h-14">
          <Link 
            href="/" 
            className="flex items-center shrink-0 overflow-hidden w-[36px] group-hover:w-[160px] transition-[width] duration-300 ease-in-out"
          >
            <Image
              src="/workflow-logo.png"
              alt="Workflow"
              width={200}
              height={56}
              className="h-9 w-[160px] min-w-[160px] object-contain object-left shrink-0 transition-all duration-300 group-hover:h-11 group-hover:min-w-[190px]"
              priority
            />
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

          {/* 3. Favorites Section positioned naturally beneath More */}
          <div className="shrink-0">
            <div className="mb-1.5 flex w-[216px] items-center justify-between px-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[13px] font-extrabold text-[#111827]">
                Favorites
              </span>
              <button className="text-gray-500 hover:text-gray-800 p-0.5 rounded transition-colors">
                <Plus size={16} strokeWidth={2.2} />
              </button>
            </div>
            <ul className="space-y-0.5 w-[216px]">
              {favorites.map((f) => (
                <li key={f.label}>
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-1 sm:py-1.5 text-[12.5px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors truncate">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${f.color}`} />
                    <span className="truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">{f.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. Admin Console for system administrators */}
        {currentUser?.role?.toLowerCase() === "admin" && (
          <div className="mt-auto shrink-0 pt-2 pb-1 border-t border-purple-100 z-10 w-[216px]">
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-bold text-purple-700 bg-purple-50/80 hover:bg-purple-100 transition-colors shadow-2xs"
            >
              <ShieldCheck size={18} className="text-purple-600 shrink-0" strokeWidth={2.2} />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Admin Console</span>
            </a>
          </div>
        )}

        {/* 5. Help & Support Footer pushed to bottom and elevated above floating desktop icon */}
        <div className={`${currentUser?.role?.toLowerCase() === "admin" ? "pt-1.5" : "mt-auto pt-3"} shrink-0 border-t border-gray-100/80 pb-2 z-10 w-[216px]`}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <HelpCircle size={18} className="text-gray-500 shrink-0" strokeWidth={1.9} />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Help &amp; Support</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

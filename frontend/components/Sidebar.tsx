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
import { sidebarPrimary, favorites } from "@/lib/uiConstants";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { API_URL } from "@/lib/apis";

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

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setCurrentUser(data);
      })
      .catch(() => {});
    }
  }, []);

  const visibleSidebarPrimary = sidebarPrimary.filter(item => {
    // If we haven't loaded the user yet, or they are an Admin, show everything
    if (!currentUser || currentUser.role === "Admin") return true;
    
    // For non-admins, restrict access to Teams, Reports, and advanced management tools
    // We strictly keep Inbox ("email feature"), Chat, Home, Files, Calendar, etc.
    const restrictedForNonAdmins = ["Teams", "Reports", "Boards", "Sprints"];
    return !restrictedForNonAdmins.includes(item.label);
  });

  return (
    <aside className="hidden w-[230px] sm:w-[240px] shrink-0 flex-col border-r border-gray-200/80 bg-white lg:flex h-screen overflow-hidden pt-4 pb-8 px-3.5">
      {/* 1. Seamless Logo Header Section */}
      <div className="flex shrink-0 items-center px-2 pb-3 mb-1">
        <Link href="/" className="flex items-center">
          <Image
            src="/workflow-logo.png"
            alt="Workflow"
            width={200}
            height={56}
            className="h-14 w-auto object-contain"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </Link>
      </div>

      {/* Top-aligned Content Container without awkward stretched spaces */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-start">
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
              const isDocuments = item.label === "Documents";
              const isFiles = item.label === "Files";
              const isReports = item.label === "Reports";
              const href = isHome ? "/" : isWorkspaces ? "/workspaces" : isInbox ? "/inbox" : isChat ? "/chat" : isTeams ? "/teams" : isProjects ? "/projects" : isBoards ? "/boards" : isSprints ? "/sprints" : isCalendar ? "/calendar" : isMeetings ? "/meetings" : isDocuments ? "/documents" : isFiles ? "/files" : isReports ? "/reports" : "#";
              
              const isActive = activeOverride
                ? activeOverride === item.label
                : (isHome && pathname === "/") || (isWorkspaces && pathname?.startsWith("/workspaces")) || (isInbox && pathname?.startsWith("/inbox")) || (isChat && pathname?.startsWith("/chat")) || (isTeams && pathname?.startsWith("/teams")) || (isProjects && pathname?.startsWith("/projects")) || (isBoards && pathname?.startsWith("/boards")) || (isSprints && pathname?.startsWith("/sprints")) || (isCalendar && pathname?.startsWith("/calendar")) || (isMeetings && pathname?.startsWith("/meetings")) || (isDocuments && pathname?.startsWith("/documents")) || (isFiles && pathname?.startsWith("/files")) || (isReports && pathname?.startsWith("/reports"));

              return (
                <li key={item.label}>
                  <Link
                    href={href}
                    onClick={() => {
                      if (isHome || isWorkspaces || isInbox || isChat || isTeams || isProjects || isBoards || isSprints || isCalendar || isMeetings || isDocuments || isFiles || isReports) {
                        setActiveOverride(null);
                      } else {
                        setActiveOverride(item.label);
                      }
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-[13px] font-semibold transition-all ${
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
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge ? (
                      <span className="rounded-lg bg-[#EEE8FF] text-indigo-600 px-2 py-0.5 text-[10.5px] font-extrabold">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="border-b border-gray-100 pb-2 mt-1.5 mb-2.5">
            <button className="flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
              <span>More</span>
              <ChevronRight size={15} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* 3. Favorites Section positioned naturally beneath More */}
        <div className="shrink-0">
          <div className="mb-1.5 flex items-center justify-between px-2.5">
            <span className="text-[13px] font-extrabold text-[#111827]">
              Favorites
            </span>
            <button className="text-gray-500 hover:text-gray-800 p-0.5 rounded transition-colors">
              <Plus size={16} strokeWidth={2.2} />
            </button>
          </div>
          <ul className="space-y-0.5">
            {favorites.map((f) => (
              <li key={f.label}>
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-1 sm:py-1.5 text-[12.5px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors truncate">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${f.color}`} />
                  <span className="truncate">{f.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Help & Support Footer pushed to bottom and elevated above floating desktop icon */}
      <div className="mt-auto shrink-0 pt-3 border-t border-gray-100/80 pb-2 z-10">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <HelpCircle size={18} className="text-gray-500 shrink-0" strokeWidth={1.9} />
          <span>Help &amp; Support</span>
        </button>
      </div>
    </aside>
  );
}

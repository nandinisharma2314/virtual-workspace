"use client";

import {
  Inbox as InboxIcon,
  Mail,
  AtSign,
  CheckSquare,
  CheckCircle2,
  Calendar,
  FileText,
  CalendarDays,
  Sparkles,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { inboxCategories, inboxPriorities, inboxProjects } from "@/lib/inboxTypes";

const iconMap: Record<string, React.ElementType> = {
  Inbox: InboxIcon,
  Mail: Mail,
  AtSign: AtSign,
  CheckSquare: CheckSquare,
  CheckCircle2: CheckCircle2,
  Calendar: Calendar,
  FileText: FileText,
  CalendarDays: CalendarDays,
  Sparkles: Sparkles,
  Settings: SlidersHorizontal,
};

type Props = {
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  selectedPriority: string | null;
  onSelectPriority: (p: string | null) => void;
  selectedProject: string | null;
  onSelectProject: (p: string | null) => void;
  counts?: Record<string, number>;
};

export default function InboxSidebar({
  selectedTab,
  onSelectTab,
  selectedPriority,
  onSelectPriority,
  selectedProject,
  onSelectProject,
  counts,
}: Props) {
  return (
    <div className="w-[210px] sm:w-[225px] lg:w-[235px] shrink-0 border-r border-gray-200/80 bg-white flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="h-11 shrink-0 border-b border-gray-200/80 px-3.5 flex items-center justify-between">
        <h2 className="text-[17px] font-black tracking-tight text-gray-900">
          Inbox
        </h2>
        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors">
          <Settings size={16} strokeWidth={2} />
        </button>
      </div>

      {/* High-density zero-scroll content container */}
      <div className="flex-1 min-h-0 px-2.5 py-2 flex flex-col justify-between overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Categories */}
        <div className="space-y-[1px] shrink-0">
          {inboxCategories.map((cat) => {
            const Icon = iconMap[cat.icon] || InboxIcon;
            const isActive = selectedTab === cat.key && !selectedPriority && !selectedProject;
            return (
              <button
                key={cat.key}
                onClick={() => onSelectTab(cat.key)}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1 text-[12.5px] font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50/90 text-blue-600 font-extrabold shadow-2xs"
                    : "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.4 : 1.9}
                    className={isActive ? "text-blue-600 shrink-0" : "text-gray-500 shrink-0"}
                  />
                  <span className="truncate">{cat.label}</span>
                </span>
                {counts && counts[cat.key] !== undefined && counts[cat.key] > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-md font-extrabold ${
                      isActive ? "bg-blue-100/90 text-blue-700" : "text-gray-400"
                    }`}
                  >
                    {counts[cat.key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Priority Section */}
        <div className="shrink-0 pt-1.5 border-t border-gray-100">
          <div className="px-2.5 mb-1">
            <span className="text-[11.5px] font-black uppercase tracking-wider text-gray-400">
              Priority
            </span>
          </div>
          <ul className="space-y-[1px]">
            {inboxPriorities.map((p) => {
              const isActive = selectedPriority === p.key;
              return (
                <li key={p.key}>
                  <button
                    onClick={() => onSelectPriority(p.key)}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1 text-[12.5px] font-semibold transition-all ${
                      isActive
                        ? "bg-gray-100 font-extrabold text-gray-900 shadow-2xs"
                        : "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${p.dotColor}`} />
                      <span className="truncate">{p.label}</span>
                    </span>
                    {counts && counts[p.key] !== undefined && counts[p.key] > 0 && <span className="text-[11px] text-gray-400 font-bold">{counts[p.key]}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Projects Section */}
        <div className="shrink-0 pt-1.5 border-t border-gray-100">
          <div className="px-2.5 mb-1">
            <span className="text-[11.5px] font-black uppercase tracking-wider text-gray-400">
              Projects
            </span>
          </div>
          <ul className="space-y-[1px] mb-1.5">
            {inboxProjects.map((proj) => {
              const isActive = selectedProject === proj.key;
              return (
                <li key={proj.key}>
                  <button
                    onClick={() => onSelectProject(proj.key)}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1 text-[12.5px] font-semibold transition-all ${
                      isActive
                        ? "bg-blue-50 font-extrabold text-blue-700 shadow-2xs"
                        : "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${proj.dotColor}`} />
                      <span className="truncate">{proj.label}</span>
                    </span>
                    {counts && counts[proj.key] !== undefined && counts[proj.key] > 0 && <span className="text-[11px] text-gray-400 font-bold">{counts[proj.key]}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="px-2.5 pb-0.5">
            <button className="text-[12px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all">
              View all projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

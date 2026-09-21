"use client";

import { InboxItem } from "@/lib/inboxTypes";
import Avatar from "@/components/Avatar";
import {
  ChevronDown,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  Calendar,
  FileText,
  Sparkles,
  GitMerge,
  AtSign,
} from "lucide-react";

type Props = {
  items: InboxItem[];
  selectedItemId: string;
  onSelectItem: (id: string) => void;
  selectedTab: string;
  onMarkAllRead: () => void;
};

export default function InboxList({
  items,
  selectedItemId,
  onSelectItem,
  selectedTab,
  onMarkAllRead,
}: Props) {
  const todayItems = items.filter((i) => i.dateGroup === "Today");
  const yesterdayItems = items.filter((i) => i.dateGroup === "Yesterday");
  const earlierItems = items.filter((i) => i.dateGroup === "Earlier");

  const renderIcon = (item: InboxItem) => {
    if (item.iconType === "avatar" || item.iconType === "task-avatar") {
      return (
        <div className="relative shrink-0 flex items-center justify-center">
          <Avatar person={item.avatarPerson || "rohit"} size={32} />
          {item.iconType === "avatar" && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-white shadow-xs">
              <AtSign size={8} strokeWidth={3} />
            </span>
          )}
        </div>
      );
    }
    if (item.iconType === "check" || item.iconType === "approval") {
      return (
        <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
          <CheckCircle2 size={17} strokeWidth={2.5} />
        </div>
      );
    }
    if (item.iconType === "meeting") {
      return (
        <div className="h-8 w-8 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs">
          <Calendar size={16} strokeWidth={2.3} />
        </div>
      );
    }
    if (item.iconType === "file") {
      return (
        <div className="h-8 w-8 shrink-0 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shadow-2xs">
          <FileText size={16} strokeWidth={2.3} />
        </div>
      );
    }
    if (item.iconType === "ai") {
      return (
        <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20">
          <Sparkles size={16} strokeWidth={2.3} />
        </div>
      );
    }
    if (item.iconType === "system") {
      return (
        <div className="h-8 w-8 shrink-0 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-xs">
          <GitMerge size={15} strokeWidth={2.2} />
        </div>
      );
    }
    return <Avatar person="avi" size={32} />;
  };

  const renderItemGroup = (title: string, groupItems: InboxItem[]) => {
    if (groupItems.length === 0) return null;

    return (
      <div className="shrink-0 mb-2.5 last:mb-0">
        <h3 className="text-[11.5px] font-black uppercase text-gray-400 tracking-wider mb-1.5 px-1">
          {title}
        </h3>
        <div className="space-y-2">
          {groupItems.map((item) => {
            const isSelected = item.id === selectedItemId;
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`group flex items-center gap-4 px-3.5 py-3 rounded-2xl transition-all cursor-pointer border relative ${
                  isSelected
                    ? "bg-blue-50/60 border-blue-200 shadow-sm ring-1 ring-blue-500/20"
                    : item.unread
                    ? "bg-white border-gray-200 shadow-2xs hover:border-gray-300 hover:shadow-sm"
                    : "bg-gray-50/50 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-2xs"
                }`}
              >
                {item.unread && !isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-md"></div>
                )}
                
                {/* Checkbox */}
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
                  />
                </div>

                {/* Icon or Avatar */}
                <div className="shrink-0">{renderIcon(item)}</div>

                {/* Main Text Content */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4
                      className={`text-[13.5px] leading-tight truncate ${
                        item.unread ? "font-black text-gray-900" : "font-extrabold text-gray-700"
                      }`}
                    >
                      {item.title}
                    </h4>
                  </div>
                  <p
                    className={`text-[12px] leading-tight truncate mt-0.5 ${
                      item.subtitle.startsWith("In #") || item.subtitle.includes("#")
                        ? "text-blue-600 font-bold"
                        : "text-gray-500 font-semibold"
                    }`}
                  >
                    {item.subtitle}
                  </p>
                  <p className="text-[12px] text-gray-500 line-clamp-1 font-medium mt-1">
                    {item.preview}
                  </p>
                </div>

                {/* Right Metadata */}
                <div className="flex flex-col items-end justify-center shrink-0 gap-2">
                  <div className="flex items-center">
                    <span
                      className={`${item.tagStyle.bg} ${item.tagStyle.text} border ${item.tagStyle.border} px-2 py-0.5 rounded-md text-[10.5px] font-extrabold tracking-wide`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-400">
                      {item.time}
                    </span>
                    {item.unread ? (
                      <span className="h-2 w-2 rounded-full bg-blue-600 shadow-xs shrink-0" title="Unread" />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-w-0 border-r border-gray-200/80 bg-white flex flex-col h-full overflow-hidden">
      {/* Header Bar */}
      <div className="h-11 shrink-0 border-b border-gray-200/80 px-4 flex items-center justify-between gap-3 bg-white z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <button className="flex items-center gap-1 font-extrabold text-[15px] text-gray-900 hover:text-blue-600 transition-colors shrink-0">
            <span>{selectedTab || "All"}</span>
            <ChevronDown size={14} className="text-gray-400" strokeWidth={2.4} />
          </button>
          <span className="text-[11.5px] font-semibold text-gray-400 truncate hidden sm:inline-block">
            {items.length} items • Sorted by: Newest
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button className="flex items-center gap-1 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1 text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all">
            <Filter size={12} className="text-gray-500" strokeWidth={2.4} />
            <span>Filter</span>
          </button>
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1 text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all"
          >
            <CheckCircle2 size={13} className="text-emerald-500" strokeWidth={2.4} />
            <span className="hidden md:inline">Mark all read</span>
          </button>
          <button className="rounded-lg border border-gray-200/80 p-1 text-gray-500 hover:bg-gray-50 hover:text-gray-700 shadow-2xs transition-all">
            <SlidersHorizontal size={13} strokeWidth={2.3} />
          </button>
        </div>
      </div>

      {/* High-density List Content without scrollbars */}
      <div className="flex-1 min-h-0 px-4 py-2.5 bg-[#FAFBFC]/50 flex flex-col justify-start overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-gray-400">
            <CheckCircle2 size={36} className="mb-2 text-gray-300" strokeWidth={1.5} />
            <p className="text-sm font-bold text-gray-700">No items found</p>
            <p className="text-xs text-gray-400 mt-0.5">There are no messages in this category.</p>
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full min-h-0">
            {renderItemGroup("Today", todayItems)}
            {renderItemGroup("Yesterday", yesterdayItems)}
            {renderItemGroup("Earlier", earlierItems)}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";
import {
  Star,
  UserPlus,
  MoreHorizontal,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Zap,
  SlidersHorizontal,
} from "lucide-react";

export default function ProjectHeader({ 
  activeTab, 
  setActiveTab 
}: { 
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {

  const tabs = [
    "Overview",
    "Board",
    "List",
    "Timeline",
    "Calendar",
    "Files",
    "Reports",
    "Settings",
  ];

  return (
    <div className="shrink-0 border-b border-gray-200/80 bg-white flex flex-col select-none">
      {/* Top Main Section */}
      <div className="px-5 pt-3 pb-1 flex flex-col justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[11.5px] font-semibold text-gray-400 mb-1">
          <span>Projects</span>
          <span>&gt;</span>
          <span className="text-gray-600 font-bold">Website Redesign</span>
        </div>

        {/* Title and Right Actions Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-[22px] font-black text-gray-900 tracking-tight leading-none">
              Website Redesign
            </h1>
            <button className="text-gray-400 hover:text-amber-500 transition-colors">
              <Star size={18} strokeWidth={2.2} />
            </button>
            <span className="bg-emerald-50 text-emerald-600 font-black text-[11px] px-2.5 py-0.5 rounded-lg border border-emerald-200/60 uppercase tracking-wide ml-1">
              On Track
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              <Avatar person="rohit" size={26} ring />
              <Avatar person="neha" size={26} ring />
              <Avatar person="priya" size={26} ring />
              <Avatar person="arjun" size={26} ring />
              <Avatar person="vikram" size={26} ring />
              <span className="flex h-[26px] items-center justify-center rounded-full bg-gray-100 px-2 text-[11px] font-black text-gray-700 ring-2 ring-white shadow-2xs">
                +8
              </span>
            </div>

            <button className="flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-800 px-3.5 py-1.5 text-xs font-extrabold shadow-2xs transition-all ml-1">
              <UserPlus size={14} strokeWidth={2.3} />
              <span>Share</span>
            </button>

            <button className="rounded-xl border border-gray-200/90 bg-white hover:bg-gray-50 p-1.5 text-gray-500 hover:text-gray-800 shadow-2xs transition-all">
              <MoreHorizontal size={16} strokeWidth={2.3} />
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-[12px] text-gray-500 font-medium mt-1">
          Redesign company website with improved UX, performance and modern design.
        </p>

        {/* Tabs Row */}
        <div className="flex items-center gap-6 mt-3 -mb-px overflow-x-auto [scrollbar-width:none]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-[#2563EB] text-[#2563EB] font-extrabold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

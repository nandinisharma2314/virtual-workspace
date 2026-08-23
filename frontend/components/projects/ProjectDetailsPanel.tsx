"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";
import { projectLabels, projectMilestones, projectRecentFiles } from "@/lib/projectData";
import {
  Calendar,
  Flag,
  CheckCircle2,
  Circle,
  Plus,
  Heart,
} from "lucide-react";

export default function ProjectDetailsPanel() {
  const [activeTab, setActiveTab] = useState("Details");
  const tabs = ["Details", "Activity", "Insights"];

  const renderFileIcon = (type: string) => {
    if (type === "pdf") {
      return (
        <div className="h-7 w-7 rounded-lg bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
          PDF
        </div>
      );
    }
    if (type === "docx") {
      return (
        <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
          Docx
        </div>
      );
    }
    return (
      <div className="h-7 w-7 rounded-lg bg-gray-900 text-white flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
        Fig
      </div>
    );
  };

  return (
    <div className="w-[305px] lg:w-[325px] xl:w-[340px] shrink-0 bg-white flex flex-col h-full overflow-hidden border-l border-gray-200/80 text-[#111827] select-none">
      {/* Header Tabs Row */}
      <div className="h-12 shrink-0 border-b border-gray-200/80 px-5 flex items-center gap-6 bg-white z-10 -mb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-full text-[13px] font-bold border-b-2 transition-all flex items-center ${
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

      {/* High-Density Zero-Scroll Content Area */}
      <div className="flex-1 min-h-0 px-4 py-3 flex flex-col justify-between overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-2">
        
        {/* About this project Section */}
        <div className="shrink-0 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-extrabold text-gray-900">
              About this project
            </h3>
            <button className="text-[12px] font-bold text-[#2563EB] hover:underline">
              Edit
            </button>
          </div>

          <div className="space-y-2 px-0.5">
            <div className="flex items-center gap-2.5 text-[12.5px]">
              <Avatar person="avi" size={24} />
              <span className="font-bold text-gray-800">Project Manager</span>
            </div>

            <div className="flex items-start gap-2.5 text-[12.5px]">
              <Calendar size={15} className="text-gray-400 shrink-0 mt-0.5" strokeWidth={2.2} />
              <div>
                <span className="block text-[11px] font-semibold text-gray-400 leading-tight">#Due Date</span>
                <span className="block font-bold text-gray-900 mt-0.5">Jul 30, 2025</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[12.5px]">
              <Flag size={15} className="text-gray-400 shrink-0" strokeWidth={2.2} />
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <Heart fill="currentColor" className="text-rose-500 shrink-0" size={14} />
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Progress Bar Row */}
          <div className="pt-0.5">
            <div className="flex items-center justify-between text-[11.5px] font-extrabold mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900">65%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-[#2563EB] w-[65%] rounded-full transition-all" />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full shrink-0" />

        {/* Labels Section */}
        <div className="shrink-0">
          <h3 className="text-[12.5px] font-extrabold text-gray-900 mb-1.5">
            Labels
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {projectLabels.map((lbl) => (
              <span
                key={lbl.label}
                className={`${lbl.bg} ${lbl.text} border ${lbl.border} px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wide`}
              >
                {lbl.label}
              </span>
            ))}
            <button
              className="h-6 w-6 rounded-lg border border-gray-200/90 bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shadow-2xs"
              title="Add label"
            >
              <Plus size={14} strokeWidth={2.3} />
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full shrink-0" />

        {/* Team Members Section */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12.5px] font-extrabold text-gray-900">
              Team Members <span className="text-gray-400 font-bold ml-1">14</span>
            </span>
            <button className="text-[11.5px] font-bold text-[#2563EB] hover:underline">
              View all
            </button>
          </div>
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            <Avatar person="rohit" size={26} ring />
            <Avatar person="neha" size={26} ring />
            <Avatar person="priya" size={26} ring />
            <Avatar person="arjun" size={26} ring />
            <Avatar person="vikram" size={26} ring />
            <Avatar person="avi" size={26} ring />
            <span className="flex h-[26px] items-center justify-center rounded-full bg-blue-50 text-blue-600 font-black px-2 text-[10.5px] ring-2 ring-white shadow-2xs">
              +9
            </span>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full shrink-0" />

        {/* Milestones Section */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[12.5px] font-extrabold text-gray-900">
              Milestones
            </h3>
            <button className="text-[11.5px] font-bold text-[#2563EB] hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-2">
            {projectMilestones.map((ms) => {
              return (
                <div key={ms.title} className="flex items-center justify-between gap-2 text-[12px]">
                  <div className="flex items-center gap-2 min-w-0">
                    {ms.status === "Completed" ? (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" strokeWidth={2.4} />
                    ) : ms.status === "In Progress" ? (
                      <div className="h-4.5 w-4.5 rounded-full border-2 border-blue-600 text-[#2563EB] font-black text-[8px] flex items-center justify-center shrink-0 shadow-2xs">
                        65
                      </div>
                    ) : (
                      <Circle size={18} className="text-gray-300 shrink-0" strokeWidth={2} />
                    )}
                    <div className="min-w-0 pr-1">
                      <span className="block font-bold text-gray-900 truncate leading-tight">
                        {ms.title}
                      </span>
                      <span className="block text-[11px] font-medium text-gray-400 mt-0.5 truncate">
                        {ms.date}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-black ${ms.statusColor} shrink-0`}>
                    {ms.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full shrink-0" />

        {/* Recent Files Section */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[12.5px] font-extrabold text-gray-900">
              Recent Files
            </h3>
            <button className="text-[11.5px] font-bold text-[#2563EB] hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-1">
            {projectRecentFiles.map((rf) => (
              <div key={rf.name} className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-50/80 transition-colors cursor-pointer">
                {renderFileIcon(rf.icon)}
                <div className="min-w-0 flex-1">
                  <span className="block text-[12px] font-extrabold text-gray-900 truncate leading-tight">
                    {rf.name}
                  </span>
                  <span className="block text-[11px] text-gray-400 font-medium truncate mt-0.5">
                    {rf.meta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Avatar from "@/components/Avatar";
import { API_URL } from "@/lib/apis";
import {
  Star,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";

export default function ProjectHeader({ 
  projectId,
  activeTab, 
  setActiveTab,
  project
}: { 
  projectId?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  project?: any;
}) {
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (!projectId) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
    fetch(`${API_URL}/projects/${projectId}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setProject(data); })
      .catch(() => {});
  }, [projectId]);

  const projectName = project?.name || (projectId ? `Project #${projectId}` : "Project Overview");
  const projectDesc = project?.description || "Collaborate on tasks, documents, and timelines.";
  const projectStatus = project?.status === "completed" ? "Completed" : project?.status === "at_risk" ? "At Risk" : "Active";

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
<<<<<<< Updated upstream
          <span className="text-gray-600 font-bold">{projectName}</span>
=======
          <span className="text-gray-600 font-bold">{project?.name || "Project"}</span>
>>>>>>> Stashed changes
        </div>

        {/* Title and Right Actions Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-[22px] font-black text-gray-900 tracking-tight leading-none">
<<<<<<< Updated upstream
              {projectName}
=======
              {project?.name || "Project"}
>>>>>>> Stashed changes
            </h1>
            <button className="text-gray-400 hover:text-amber-500 transition-colors">
              <Star size={18} strokeWidth={2.2} />
            </button>
            <span className={`font-black text-[11px] px-2.5 py-0.5 rounded-lg border uppercase tracking-wide ml-1 ${
              projectStatus === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200/60" :
              projectStatus === "At Risk" ? "bg-rose-50 text-rose-600 border-rose-200/60" :
              "bg-blue-50 text-blue-600 border-blue-200/60"
            }`}>
              {projectStatus}
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
<<<<<<< Updated upstream
        <p className="text-[12px] text-gray-500 font-medium mt-1">
          {projectDesc}
        </p>
=======
        {project?.description && (
          <p className="text-[12px] text-gray-500 font-medium mt-1">
            {project.description}
          </p>
        )}
>>>>>>> Stashed changes

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

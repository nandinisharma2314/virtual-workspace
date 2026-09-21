"use client";

import { useState, useEffect } from "react";
import Avatar from "@/components/Avatar";
import { API_URL } from "@/lib/apis";
import {
  Calendar,
  Flag,
  CheckCircle2,
  Circle,
  Plus,
  Heart,
  FileText,
  FileSpreadsheet,
  FileImage,
  FolderOpen
} from "lucide-react";

export default function ProjectDetailsPanel({ projectId, project }: { projectId?: string, project?: any }) {
  const [activeTab, setActiveTab] = useState("Details");
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const tabs = ["Details", "Activity", "Insights"];

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) return;
        const res = await fetch(`${API_URL}/files`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setRecentFiles(data.slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Failed to fetch project files:", err);
      }
    };
    fetchFiles();
  }, [projectId]);

  const renderFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === "pdf") {
      return (
        <div className="h-7 w-7 rounded-lg bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
          PDF
        </div>
      );
    }
    if (ext === "docx" || ext === "doc") {
      return (
        <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
          Doc
        </div>
      );
    }
    if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
      return (
        <div className="h-7 w-7 rounded-lg bg-purple-500 text-white flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
          IMG
        </div>
      );
    }
    return (
      <div className="h-7 w-7 rounded-lg bg-gray-700 text-white flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
        FILE
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

      {/* High-Density Content Area */}
      <div className="flex-1 min-h-0 px-4 py-3 flex flex-col justify-between overflow-y-auto gap-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        
        {/* About this project Section */}
        <div className="shrink-0 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-extrabold text-gray-900">
              Project Info
            </h3>
          </div>

          <div className="space-y-2 px-0.5">
            <div className="flex items-center gap-2.5 text-[12.5px]">
              <Flag size={15} className="text-gray-400 shrink-0" strokeWidth={2.2} />
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 capitalize">
                  {project?.status || "Active"}
                </span>
              </div>
            </div>
            
            {project?.createdAt && (
              <div className="flex items-center gap-2.5 text-[12.5px]">
                <Calendar size={15} className="text-gray-400 shrink-0" strokeWidth={2.2} />
                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                  <span className="text-gray-500 text-[11px] font-medium">Created:</span>
                  <span className="text-[12px]">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full shrink-0" />

        {/* Recent Files Section */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[12.5px] font-extrabold text-gray-900">
              Recent Files
            </h3>
          </div>
          {recentFiles.length > 0 ? (
            <div className="space-y-1.5">
              {recentFiles.map((rf) => (
                <div key={rf.id} className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-50/80 transition-colors cursor-pointer">
                  {renderFileIcon(rf.name)}
                  <div className="min-w-0 flex-1">
                    <span className="block text-[12px] font-extrabold text-gray-900 truncate leading-tight">
                      {rf.name}
                    </span>
                    <span className="block text-[11px] text-gray-400 font-medium truncate mt-0.5">
                      {rf.createdAt ? new Date(rf.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-gray-400">
              No files uploaded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

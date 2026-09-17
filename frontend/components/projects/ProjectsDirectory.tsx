"use client";

import { useState } from "react";
import { Search, Plus, Filter, LayoutGrid, List, ArrowUpDown, FolderOpen, MoreHorizontal, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useRouter } from "next/navigation";

const mockProjects = [
  {
    id: "mobile-app",
    name: "Mobile App Launch",
    description: "Launch iOS and Android versions of our core product.",
    status: "At Risk",
    progress: 42,
    dueDate: "Sep 15, 2025",
    members: ["arjun", "vikram"],
    category: "Engineering",
  },
  {
    id: "q3-marketing",
    name: "Q3 Marketing Campaign",
    description: "Plan and execute the Q3 marketing strategy across all channels.",
    status: "On Track",
    progress: 88,
    dueDate: "Aug 01, 2025",
    members: ["neha", "priya", "rohit", "arjun"],
    category: "Marketing",
  },
  {
    id: "security-audit",
    name: "Annual Security Audit",
    description: "Comprehensive security review and compliance check.",
    status: "Completed",
    progress: 100,
    dueDate: "May 20, 2025",
    members: ["vikram"],
    category: "Security",
  }
];

export default function ProjectsDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const router = useRouter();

  const filteredProjects = mockProjects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full h-full bg-[#FAFBFC] overflow-y-auto">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200/80 bg-white flex flex-col select-none px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Projects</h1>
            <p className="text-[13px] text-gray-500 font-medium mt-1">
              Manage your active projects, track progress, and collaborate with your team.
            </p>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors">
            <Plus size={16} strokeWidth={2.5} />
            Create Project
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-6">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200/80 bg-white py-1.5 pl-8 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200/90 bg-white hover:bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors">
              <Filter size={14} />
              Filter
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200/90 bg-white hover:bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors">
              <ArrowUpDown size={14} />
              Sort
            </button>
            <div className="h-4 w-px bg-gray-200 mx-1"></div>
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProjects.map(project => (
              <div 
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="group flex flex-col rounded-xl border border-gray-200/80 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FolderOpen size={20} strokeWidth={2.2} />
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                
                <h3 className="text-[15px] font-bold text-gray-900 leading-tight mb-1">{project.name}</h3>
                <p className="text-[12px] text-gray-500 line-clamp-2 min-h-[36px]">{project.description}</p>
                
                <div className="mt-4 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-gray-900">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        project.status === 'Completed' ? 'bg-emerald-500' : 
                        project.status === 'At Risk' ? 'bg-rose-500' : 
                        'bg-indigo-600'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center -space-x-1.5">
                    {project.members.slice(0, 3).map((m, i) => (
                      <Avatar key={i} person={m} size={24} ring />
                    ))}
                    {project.members.length > 3 && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[9px] font-bold text-gray-600 ring-2 ring-white">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {project.status === "Completed" ? (
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    ) : project.status === "At Risk" ? (
                      <AlertCircle size={12} className="text-rose-500" />
                    ) : (
                      <Clock size={12} className="text-amber-500" />
                    )}
                    <span className="text-[11px] font-bold text-gray-600">{project.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200/80 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80">
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Project Name</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Members</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, idx) => (
                  <tr 
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <FolderOpen size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-gray-900">{project.name}</div>
                          <div className="text-[12px] text-gray-500">{project.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        project.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                        project.status === 'At Risk' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-gray-100 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              project.status === 'Completed' ? 'bg-emerald-500' : 
                              project.status === 'At Risk' ? 'bg-rose-500' : 
                              'bg-indigo-600'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-semibold text-gray-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center -space-x-1.5">
                        {project.members.slice(0, 3).map((m, i) => (
                          <Avatar key={i} person={m} size={24} ring />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-medium text-gray-600">{project.dueDate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

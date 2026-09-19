"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, LayoutGrid, List, ArrowUpDown, FolderOpen, MoreHorizontal, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/apis";

export default function ProjectsDirectory() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        }),
      });

      if (res.ok) {
        setNewName("");
        setNewDescription("");
        setIsCreateModalOpen(false);
        fetchProjects();
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
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
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
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
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-7 w-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <FolderOpen size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-900">No projects found</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1 mb-6">
              {searchQuery ? "No projects match your search query." : "Get started by creating your first workspace project to track tasks and progress."}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <Plus size={16} strokeWidth={2.5} />
              Create Project
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="group flex flex-col rounded-xl border border-gray-200/80 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FolderOpen size={20} strokeWidth={2.2} />
                  </div>
                </div>

                <h3 className="text-[15px] font-bold text-gray-900 leading-tight mb-1">{project.name}</h3>
                <p className="text-[12px] text-gray-500 line-clamp-2 min-h-[36px]">{project.description || "No description provided."}</p>

                <div className="mt-4 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-gray-900">{project.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        project.status === "completed" ? "bg-emerald-500" :
                        project.status === "at_risk" ? "bg-rose-500" :
                        "bg-indigo-600"
                      }`}
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                    project.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                    project.status === "at_risk" ? "bg-rose-50 text-rose-700" :
                    "bg-blue-50 text-blue-700"
                  }`}>
                    {project.status || "Active"}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock size={12} />
                    <span className="text-[11px] font-medium text-gray-500">
                      {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ""}
                    </span>
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
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
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
                          <div className="text-[12px] text-gray-500">{project.description || "No description"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        project.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                        project.status === "at_risk" ? "bg-rose-50 text-rose-700" :
                        "bg-blue-50 text-blue-700"
                      }`}>
                        {project.status || "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              project.status === "completed" ? "bg-emerald-500" :
                              project.status === "at_risk" ? "bg-rose-500" :
                              "bg-indigo-600"
                            }`}
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-semibold text-gray-600">{project.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-medium text-gray-600">
                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ""}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create New Project</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Briefly describe the project goals..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
                >
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

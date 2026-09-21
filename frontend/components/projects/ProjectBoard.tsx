"use client";

import { useState, useEffect } from "react";
import Avatar from "@/components/Avatar";
import { API_URL } from "@/lib/apis";
import {
  Plus,
  MoreVertical,
  Calendar,
  CheckCircle2,
  X,
  CheckSquare
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  projectId?: number;
  assigneeName?: string;
  createdAt?: string;
}

const COLUMN_DEFS = [
  { id: "todo", title: "To Do", dotClass: "bg-gray-400" },
  { id: "in-progress", title: "In Progress", dotClass: "bg-blue-600" },
  { id: "review", title: "In Review", dotClass: "bg-amber-500" },
  { id: "done", title: "Done", dotClass: "bg-emerald-500" },
];

export default function ProjectBoard({ projectId }: { projectId?: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState("todo");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const res = await fetch(`${API_URL}/tasks`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = projectId
            ? data.filter((t) => String(t.projectId) === String(projectId))
            : data;
          setTasks(filtered);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          status: targetStatus,
          priority: newPriority,
          projectId: projectId ? parseInt(projectId, 10) : undefined,
        }),
      });

      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        setIsAddModalOpen(false);
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openAddTask = (status: string) => {
    setTargetStatus(status);
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFC] overflow-hidden select-none w-full">
      {/* Board Toolbar */}
      <div className="h-12 border-b border-gray-100 px-5 bg-white flex items-center justify-between shrink-0">
        <button
          onClick={() => openAddTask("todo")}
          className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-[11.5px] font-bold text-indigo-600 shadow-sm hover:bg-indigo-50 transition-colors"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Task
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="h-7 w-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 min-h-0 p-3.5 sm:p-5 grid grid-cols-4 gap-4 overflow-hidden">
          {COLUMN_DEFS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-[#F4F6F8]/60 p-2.5 sm:p-3 shadow-2xs overflow-hidden h-full min-h-0"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between shrink-0 mb-2 px-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${col.dotClass}`} />
                    <h3 className="text-[13.5px] font-black text-gray-900 truncate">
                      {col.title}
                    </h3>
                    <span className="text-[12px] font-bold text-gray-400 ml-0.5">
                      {colTasks.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <button
                      onClick={() => openAddTask(col.id)}
                      className="p-1 hover:text-gray-700 rounded-lg hover:bg-gray-200/50 transition-colors"
                      title="Add task to column"
                    >
                      <Plus size={15} strokeWidth={2.4} />
                    </button>
                  </div>
                </div>

                {/* Column Tasks Container */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 p-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {colTasks.length > 0 ? (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group relative rounded-xl border border-gray-200/90 bg-white p-2.5 shadow-2xs hover:shadow-sm hover:border-gray-300 transition-all shrink-0 flex flex-col justify-between gap-2 cursor-pointer"
                      >
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-1.5 min-w-0 flex-1">
                            {col.id === "done" && (
                              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                            )}
                            <h4 className="text-[12.5px] font-bold text-[#111827] leading-snug line-clamp-2">
                              {task.title}
                            </h4>
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-[11.5px] text-gray-500 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Priority Badge */}
                        {task.priority && (
                          <div className="flex items-center">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10.5px] font-extrabold tracking-wide uppercase ${
                                task.priority === "urgent" ? "bg-rose-50 text-rose-700" :
                                task.priority === "high" ? "bg-amber-50 text-amber-700" :
                                "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        )}

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-gray-400 text-[11px] font-semibold">
                          <div className="flex items-center gap-1.5 text-gray-700 font-bold truncate">
                            <Avatar name={task.assigneeName || "User"} size={20} />
                            <span className="truncate">{task.assigneeName || "Assigned"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={12} strokeWidth={2.2} />
                            <span>
                              {task.createdAt ? new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
                      <CheckSquare size={18} className="mb-1 text-gray-300" />
                      <p className="text-[11px]">No tasks</p>
                    </div>
                  )}
                </div>

                {/* Add Task Button at Bottom */}
                <div className="shrink-0 pt-1">
                  <button
                    onClick={() => openAddTask(col.id)}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[12px] font-bold text-gray-500 hover:text-gray-900 hover:bg-white/80 transition-all text-left"
                  >
                    <Plus size={15} strokeWidth={2.4} className="text-gray-400" />
                    <span>Add task</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add New Task</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement user authentication"
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
                  placeholder="Task description or acceptance criteria..."
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Column / Status
                  </label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newTitle.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
                >
                  {submitting ? "Adding..." : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

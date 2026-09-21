"use client";

import { useState, useEffect } from "react";
import Avatar from "@/components/Avatar";
import { CheckCircle2, Circle, Filter, ArrowUpDown, Layers, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/apis";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  projectId?: number;
  assigneeName?: string;
  dueDate?: string;
  createdAt?: string;
}

export default function ProjectList({ projectId }: { projectId?: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = projectId
            ? data.filter((t: any) => String(t.projectId) === String(projectId))
            : data;
          setTasks(filtered);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tasks in ProjectList:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const toggleTaskStatus = async (task: Task) => {
    const isCompleted = task.status === "completed" || task.status === "done";
    const nextStatus = isCompleted ? "todo" : "completed";
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
      const res = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFC] select-none w-full">
      {/* List Toolbar */}
      <div className="h-12 border-b border-gray-100 px-5 bg-white flex items-center gap-4 shrink-0">
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all">
          <Filter size={13} className="text-gray-500" strokeWidth={2.3} />
          <span>Filter</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all">
          <ArrowUpDown size={13} className="text-gray-500" strokeWidth={2.3} />
          <span>Sort</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all">
          <Layers size={13} className="text-gray-500" strokeWidth={2.3} />
          <span>Group by: Status</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 p-5 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-12 flex items-center justify-center text-gray-400 gap-2">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm font-semibold">Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-sm font-bold text-gray-600">No tasks found</p>
              <p className="text-xs text-gray-400 mt-1">Create a task in the Board view to get started.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-3 px-4 text-[12.5px] font-bold text-gray-500 w-[45%]">Task</th>
                  <th className="py-3 px-4 text-[12.5px] font-bold text-gray-500">Assignee</th>
                  <th className="py-3 px-4 text-[12.5px] font-bold text-gray-500">Status</th>
                  <th className="py-3 px-4 text-[12.5px] font-bold text-gray-500">Due Date</th>
                  <th className="py-3 px-4 text-[12.5px] font-bold text-gray-500">Priority</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const isCompleted = task.status === "completed" || task.status === "done";
                  const statusLabel = isCompleted ? "Done" : task.status === "in_progress" || task.status === "in-progress" ? "In Progress" : task.status === "review" ? "In Review" : "To Do";
                  const statusColor = isCompleted ? "text-emerald-600" : task.status === "in_progress" || task.status === "in-progress" ? "text-blue-600" : task.status === "review" ? "text-amber-500" : "text-gray-500";
                  const priorityLabel = (task.priority || "Medium").toUpperCase();
                  const priorityColor = priorityLabel === "HIGH" ? "text-rose-500" : priorityLabel === "LOW" ? "text-emerald-500" : "text-amber-500";
                  const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "—";

                  return (
                    <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                      <td className="py-3 px-4" onClick={() => toggleTaskStatus(task)}>
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                          ) : (
                            <Circle size={16} className="text-gray-300 shrink-0 group-hover:text-gray-400 transition-colors" strokeWidth={2} />
                          )}
                          <span className={`text-[13px] font-bold ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar person={task.assigneeName ? undefined : "avi"} size={22} />
                          <span className="text-[12.5px] font-semibold text-gray-700">{task.assigneeName || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[12px] font-extrabold ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[12.5px] font-semibold text-gray-600">{formattedDate}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[12px] font-extrabold ${priorityColor}`}>
                          {task.priority || "Medium"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/apis";
import { Loader2 } from "lucide-react";

export default function ProjectTimeline({ projectId }: { projectId?: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        console.error("Failed to fetch tasks in ProjectTimeline:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectId]);

  // Generate 14 days around today (-3 to +10 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });

  const rangeStartStr = days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const rangeEndStr = days[days.length - 1].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const todoTasks = tasks.filter(t => t.status === "todo" || !t.status);
  const inProgressTasks = tasks.filter(t => t.status === "in_progress" || t.status === "in-progress" || t.status === "inprogress");
  const doneTasks = tasks.filter(t => t.status === "completed" || t.status === "done");

  const getTaskBarSpan = (task: any, index: number) => {
    let startIdx = 1;
    let spanDays = 3;

    if (task.createdAt) {
      const created = new Date(task.createdAt);
      created.setHours(0, 0, 0, 0);
      const diffStart = Math.floor((created.getTime() - days[0].getTime()) / (1000 * 60 * 60 * 24));
      if (diffStart >= 0 && diffStart < 14) {
        startIdx = diffStart;
      } else if (diffStart < 0) {
        startIdx = 0;
      } else {
        startIdx = (index * 2) % 11;
      }
    } else {
      startIdx = (index * 2) % 11;
    }

    if (task.dueDate) {
      const due = new Date(task.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffDue = Math.floor((due.getTime() - days[0].getTime()) / (1000 * 60 * 60 * 24));
      if (diffDue >= startIdx) {
        spanDays = Math.min(14 - startIdx, Math.max(1, diffDue - startIdx + 1));
      }
    }

    const leftPercent = (startIdx / 14) * 100;
    const widthPercent = (spanDays / 14) * 100;

    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFC] select-none w-full">
      {/* Timeline Toolbar */}
      <div className="h-12 border-b border-gray-100 px-5 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[12px] font-bold text-gray-700">Project Timeline</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-bold text-gray-900">{rangeStartStr} – {rangeEndStr}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-5 bg-[#FAFBFC] flex flex-col">
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col">
          {/* Timeline Header */}
          <div className="flex shrink-0 border-b border-gray-100 bg-gray-50/50">
            <div className="w-56 shrink-0 py-3 px-4 border-r border-gray-100 text-[12.5px] font-bold text-gray-500 flex items-end">
              Task
            </div>
            <div className="flex-1 flex overflow-hidden">
              {days.map((dateObj, i) => {
                const isCurrentDay = dateObj.toDateString() === today.toDateString();
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end py-2 min-w-[30px] border-r border-gray-100 last:border-r-0">
                    <span className="text-[10px] font-bold text-gray-400 mb-1">
                      {dateObj.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className={`text-[12px] font-black ${isCurrentDay ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-700'}`}>
                      {dateObj.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Body */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="py-24 flex items-center justify-center text-gray-400 gap-2">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm font-semibold">Loading timeline...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-24 text-center text-gray-400">
                <p className="text-sm font-bold text-gray-600">No tasks on the timeline</p>
                <p className="text-xs text-gray-400 mt-1">Create tasks to plot them on the project timeline.</p>
              </div>
            ) : (
              <>
                {/* To Do Section */}
                {todoTasks.length > 0 && (
                  <>
                    <div className="py-2 px-4 bg-gray-50/30 text-[11.5px] font-bold text-gray-500 uppercase tracking-wider">
                      To Do ({todoTasks.length})
                    </div>
                    {todoTasks.map((t, idx) => {
                      const span = getTaskBarSpan(t, idx);
                      return (
                        <div key={t.id} className="flex border-b border-gray-50 relative h-10 group hover:bg-gray-50/50 transition-colors">
                          <div className="w-56 shrink-0 px-4 flex items-center border-r border-gray-100 text-[12.5px] font-semibold text-gray-800 truncate z-10 bg-inherit">
                            {t.title}
                          </div>
                          <div className="flex-1 relative flex items-center">
                            <div className="absolute inset-0 flex">
                              {Array(14).fill(0).map((_, i) => (
                                <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0 h-full" />
                              ))}
                            </div>
                            <div
                              className="absolute h-6 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold text-[11px] px-2 rounded-lg shadow-xs flex items-center truncate transition-colors z-10 cursor-pointer"
                              style={{ left: span.left, width: span.width }}
                            >
                              {t.title}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* In Progress Section */}
                {inProgressTasks.length > 0 && (
                  <>
                    <div className="py-2 px-4 bg-blue-50/30 text-[11.5px] font-bold text-blue-600 uppercase tracking-wider">
                      In Progress ({inProgressTasks.length})
                    </div>
                    {inProgressTasks.map((t, idx) => {
                      const span = getTaskBarSpan(t, idx);
                      return (
                        <div key={t.id} className="flex border-b border-gray-50 relative h-10 group hover:bg-gray-50/50 transition-colors">
                          <div className="w-56 shrink-0 px-4 flex items-center border-r border-gray-100 text-[12.5px] font-semibold text-gray-800 truncate z-10 bg-inherit">
                            {t.title}
                          </div>
                          <div className="flex-1 relative flex items-center">
                            <div className="absolute inset-0 flex">
                              {Array(14).fill(0).map((_, i) => (
                                <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0 h-full" />
                              ))}
                            </div>
                            <div
                              className="absolute h-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-[11px] px-2 rounded-lg shadow-xs flex items-center truncate transition-colors z-10 cursor-pointer"
                              style={{ left: span.left, width: span.width }}
                            >
                              {t.title}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Completed Section */}
                {doneTasks.length > 0 && (
                  <>
                    <div className="py-2 px-4 bg-emerald-50/30 text-[11.5px] font-bold text-emerald-600 uppercase tracking-wider">
                      Done ({doneTasks.length})
                    </div>
                    {doneTasks.map((t, idx) => {
                      const span = getTaskBarSpan(t, idx);
                      return (
                        <div key={t.id} className="flex border-b border-gray-50 relative h-10 group hover:bg-gray-50/50 transition-colors">
                          <div className="w-56 shrink-0 px-4 flex items-center border-r border-gray-100 text-[12.5px] font-semibold text-gray-800 truncate z-10 bg-inherit">
                            {t.title}
                          </div>
                          <div className="flex-1 relative flex items-center">
                            <div className="absolute inset-0 flex">
                              {Array(14).fill(0).map((_, i) => (
                                <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0 h-full" />
                              ))}
                            </div>
                            <div
                              className="absolute h-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] px-2 rounded-lg shadow-xs flex items-center truncate transition-colors z-10 cursor-pointer"
                              style={{ left: span.left, width: span.width }}
                            >
                              {t.title}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

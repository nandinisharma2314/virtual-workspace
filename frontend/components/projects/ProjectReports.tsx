"use client";

import { useState, useEffect } from "react";
import { Loader2, BarChart2, Calendar, Download, ChevronDown } from "lucide-react";
import { API_URL } from "@/lib/apis";

export default function ProjectReports({ projectId }: { projectId?: string }) {
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
        console.error("Failed to fetch tasks for project reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectId]);

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'in-progress' || t.status === 'inprogress' || t.status === 'review').length;
  const todo = tasks.filter(t => t.status === 'todo' || (!t.status && t.status !== 'completed' && t.status !== 'done')).length;

  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const todoPct = total > 0 ? Math.max(0, 100 - completedPct - inProgressPct) : 0;

  const highPriority = tasks.filter(t => (t.priority || '').toLowerCase() === 'high' || (t.priority || '').toLowerCase() === 'urgent').length;
  const medPriority = tasks.filter(t => (t.priority || '').toLowerCase() === 'medium' || !t.priority).length;
  const lowPriority = tasks.filter(t => (t.priority || '').toLowerCase() === 'low').length;
  const maxPriority = Math.max(highPriority, medPriority, lowPriority, 1);

  // Group tasks by assignee
  const assigneeMap: Record<string, number> = {};
  tasks.forEach(t => {
    const name = t.assigneeName || "Unassigned";
    assigneeMap[name] = (assigneeMap[name] || 0) + 1;
  });
  const assigneesList = Object.entries(assigneeMap)
    .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFC] select-none w-full">
      {/* Reports Toolbar */}
      <div className="h-12 border-b border-gray-100 px-5 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-indigo-600" />
          <span className="text-[13px] font-bold text-gray-900">Live Project Metrics</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200/80 bg-white px-3 py-1.5 text-[11.5px] font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-all">
            <Calendar size={13} className="text-gray-400" />
            <span>Last 30 Days</span>
            <ChevronDown size={13} className="text-gray-400 ml-1" />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-3 py-1.5 text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all">
            <Download size={13} className="text-gray-500" />
            <span>Export</span>
            <ChevronDown size={13} className="text-gray-400 ml-1" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-5 overflow-y-auto">
        {loading ? (
          <div className="py-24 flex items-center justify-center text-gray-400 gap-2">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-sm font-semibold">Calculating reports...</span>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-5">
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col justify-between">
                <span className="text-[12px] font-bold text-gray-500 mb-2">Total Tasks</span>
                <span className="text-2xl font-black text-gray-900">{total}</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col justify-between">
                <span className="text-[12px] font-bold text-gray-500 mb-2">Completed</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-gray-900">{completed}</span>
                  <span className="text-[11px] font-extrabold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">{completedPct}%</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col justify-between">
                <span className="text-[12px] font-bold text-gray-500 mb-2">In Progress</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-gray-900">{inProgress}</span>
                  <span className="text-[11px] font-extrabold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{inProgressPct}%</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col justify-between">
                <span className="text-[12px] font-bold text-gray-500 mb-2">To Do</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-gray-900">{todo}</span>
                  <span className="text-[11px] font-extrabold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{todoPct}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="flex flex-col gap-4">
                {/* Task Status */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs h-64 flex flex-col">
                  <h3 className="text-[13px] font-bold text-gray-800 mb-4">Task Status Distribution</h3>
                  <div className="flex-1 flex items-center justify-center gap-8">
                    {/* Ring Indicator */}
                    <div className="relative w-32 h-32 rounded-full border-[12px] border-emerald-500 flex items-center justify-center" style={{ borderRightColor: inProgress > 0 ? '#3B82F6' : '#22C55E', borderBottomColor: inProgress > 0 ? '#3B82F6' : '#E5E7EB', borderLeftColor: todo > 0 ? '#D1D5DB' : '#22C55E' }}>
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-black text-gray-900 leading-none">{total}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">Total</span>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="text-[12px] font-semibold text-gray-600 w-24">Done</span>
                        <span className="text-[12px] font-bold text-gray-900">{completed} <span className="text-gray-400 font-medium">({completedPct}%)</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                        <span className="text-[12px] font-semibold text-gray-600 w-24">In Progress</span>
                        <span className="text-[12px] font-bold text-gray-900">{inProgress} <span className="text-gray-400 font-medium">({inProgressPct}%)</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0"></span>
                        <span className="text-[12px] font-semibold text-gray-600 w-24">To Do</span>
                        <span className="text-[12px] font-bold text-gray-900">{todo} <span className="text-gray-400 font-medium">({todoPct}%)</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tasks by Assignee */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs h-64 flex flex-col">
                  <h3 className="text-[13px] font-bold text-gray-800 mb-4">Tasks by Assignee</h3>
                  <div className="flex-1 flex flex-col justify-start gap-3 pt-2 overflow-y-auto">
                    {assigneesList.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center my-auto">No assignees recorded yet.</p>
                    ) : (
                      assigneesList.slice(0, 5).map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-[11.5px] font-semibold text-gray-600 w-28 truncate">{item.name}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${item.pct}%` }}></div>
                          </div>
                          <span className="text-[11.5px] font-bold text-gray-900 w-6 text-right">{item.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-4">
                {/* Tasks by Priority */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs h-64 flex flex-col">
                  <h3 className="text-[13px] font-bold text-gray-800 mb-4">Tasks by Priority</h3>
                  <div className="flex-1 flex items-end justify-center gap-10 pb-4">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-500">{highPriority}</span>
                      <div className="w-10 bg-rose-500 rounded-t-lg transition-all" style={{ height: `${maxPriority > 0 ? Math.max(16, (highPriority / maxPriority) * 120) : 16}px` }}></div>
                      <span className="text-[11.5px] font-semibold text-gray-600">High</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-500">{medPriority}</span>
                      <div className="w-10 bg-amber-500 rounded-t-lg transition-all" style={{ height: `${maxPriority > 0 ? Math.max(16, (medPriority / maxPriority) * 120) : 16}px` }}></div>
                      <span className="text-[11.5px] font-semibold text-gray-600">Medium</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-500">{lowPriority}</span>
                      <div className="w-10 bg-emerald-500 rounded-t-lg transition-all" style={{ height: `${maxPriority > 0 ? Math.max(16, (lowPriority / maxPriority) * 120) : 16}px` }}></div>
                      <span className="text-[11.5px] font-semibold text-gray-600">Low</span>
                    </div>
                  </div>
                </div>

                {/* Progress Completion Status */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs h-64 flex flex-col justify-between">
                  <h3 className="text-[13px] font-bold text-gray-800 mb-2">Overall Completion Progress</h3>
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <span className="text-4xl font-black text-indigo-600 mb-2">{completedPct}%</span>
                    <span className="text-xs font-semibold text-gray-500 mb-4">{completed} of {total} tasks completed</span>
                    <div className="w-full max-w-xs h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${completedPct}%` }}></div>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 text-center">Calculated from live database tasks</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

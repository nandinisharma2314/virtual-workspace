"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/apis";

export default function ProjectCalendar({ projectId }: { projectId?: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
        console.error("Failed to fetch tasks in ProjectCalendar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevDays = Array.from({ length: startingDayOfWeek }, (_, i) => ({
    date: prevMonthLastDay - startingDayOfWeek + i + 1,
    isCurrentMonth: false,
    monthOffset: -1
  }));

  const currentDays = Array.from({ length: totalDays }, (_, i) => ({
    date: i + 1,
    isCurrentMonth: true,
    monthOffset: 0
  }));

  const totalCells = Math.ceil((prevDays.length + currentDays.length) / 7) * 7;
  const remainingSlots = totalCells - (prevDays.length + currentDays.length);
  const nextDays = Array.from({ length: Math.max(0, remainingSlots) }, (_, i) => ({
    date: i + 1,
    isCurrentMonth: false,
    monthOffset: 1
  }));

  const calendarDays = [...prevDays, ...currentDays, ...nextDays];

  const getEventsForDay = (dayDate: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    return tasks.filter(t => {
      const d = t.dueDate ? new Date(t.dueDate) : t.createdAt ? new Date(t.createdAt) : null;
      if (!d) return false;
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayDate;
    }).map(t => {
      const isDone = t.status === 'completed' || t.status === 'done';
      const isInProgress = t.status === 'in_progress' || t.status === 'in-progress';
      return {
        id: t.id,
        title: t.title,
        color: isDone ? "bg-emerald-100 text-emerald-800 border-emerald-200" : isInProgress ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-gray-100 text-gray-800 border-gray-200"
      };
    });
  };

  const monthLabel = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });
  const today = new Date();

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFC] select-none w-full">
      {/* Calendar Toolbar */}
      <div className="h-12 border-b border-gray-100 px-5 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-gray-900">{monthLabel}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="rounded-lg border border-gray-200/80 bg-white px-3 py-1.5 text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all"
        >
          Today
        </button>
      </div>

      <div className="flex-1 min-h-0 p-5 flex flex-col">
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50 shrink-0">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-2.5 text-center text-[12px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 gap-2">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm font-semibold">Loading calendar...</span>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-7 bg-gray-50 overflow-y-auto">
              {calendarDays.map((day, idx) => {
                const isToday = day.isCurrentMonth && day.date === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const events = getEventsForDay(day.date, day.isCurrentMonth);
                return (
                  <div key={idx} className="bg-white border-r border-b border-gray-100 p-2 flex flex-col min-h-[90px]">
                    <div className="flex justify-between items-start mb-1.5 shrink-0">
                      <span className={`text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        !day.isCurrentMonth ? 'text-gray-300' : isToday ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-700'
                      }`}>
                        {day.date}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border truncate ${event.color}`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

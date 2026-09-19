"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, Filter, Calendar as CalendarIcon, Settings, MoreHorizontal } from "lucide-react";
import { calendarWeekdays } from "@/lib/data";
import { API_URL } from "@/lib/apis";
import { toast } from "@/lib/toast";

const eventTypes = [
  { id: "marketing", label: "Marketing", color: "bg-rose-500", fg: "text-rose-700", border: "border-rose-200" },
  { id: "design", label: "Design", color: "bg-violet-500", fg: "text-violet-700", border: "border-violet-200" },
  { id: "development", label: "Development", color: "bg-blue-500", fg: "text-blue-700", border: "border-blue-200" },
  { id: "meetings", label: "Meetings", color: "bg-emerald-500", fg: "text-emerald-700", border: "border-emerald-200" },
  { id: "personal", label: "Personal", color: "bg-amber-500", fg: "text-amber-700", border: "border-amber-200" },
];

export default function CalendarView({ calendarData = [] }: { calendarData?: any[] }) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(eventTypes.map(e => e.id)));
  const [userRole, setUserRole] = useState("Member");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", startTime: "", endTime: "", attendees: "" });

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.role) setUserRole(data.role);
      })
      .catch(console.error);
    }
  }, []);

  const handleCreateEvent = async () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    try {
      const res = await fetch(`${API_URL}/meetings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(newEvent)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewEvent({ title: "", description: "", startTime: "", endTime: "", attendees: "" });
        toast.success("Event created successfully!");
        window.location.reload();
      } else {
        toast.error("Failed to create event. Ensure all fields are valid.");
      }
    } catch(e) {
      console.error(e);
      toast.error("Error creating event");
    }
  };

  const toggleFilter = (id: string) => {
    const next = new Set(activeFilters);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setActiveFilters(next);
  };

  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthYearLabel = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const gridWeeks = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();

    let firstDayWeekDay = firstDayOfMonth.getDay();
    let startOffset = (firstDayWeekDay + 6) % 7; 

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const allCells: Array<{ day: number; isOutside: boolean; month: number; year: number }> = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      allCells.push({
        day: prevMonthLastDay - i,
        isOutside: true,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
      });
    }

    for (let d = 1; d <= totalDaysInMonth; d++) {
      allCells.push({
        day: d,
        isOutside: false,
        month: month,
        year: year,
      });
    }

    const totalNeeded = allCells.length > 35 ? 42 : 35;
    const remaining = totalNeeded - allCells.length;
    for (let r = 1; r <= remaining; r++) {
      allCells.push({
        day: r,
        isOutside: true,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
      });
    }

    const weeks: typeof allCells[] = [];
    for (let i = 0; i < allCells.length; i += 7) {
      weeks.push(allCells.slice(i, i + 7));
    }
    return weeks;
  }, [currentDate]);

  const getEventsForDate = (cell: { day: number; isOutside: boolean; month: number; year: number }) => {
    let m = cell.month;
    let y = cell.year;
    
    // Fix month wrap-around
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }

    const pad = (n: number) => String(n).padStart(2, '0');
    // Just use the actual date string directly to match backend
    const matchingDateStr = `${y}-${pad(m + 1)}-${pad(cell.day)}`;

    return calendarData.filter(e => e.date === matchingDateStr);
  };

  const getEventStyle = (colorClass?: string) => {
    if (colorClass) return `${colorClass} text-white`;
    return "bg-indigo-500 text-white";
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const renderMiniCalendar = () => {
    // Generate mini calendar matching currentDate
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 text-gray-800 font-black text-[13px]">
          <span>{monthYearLabel}</span>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="text-gray-400 hover:text-gray-900 transition-colors"><ChevronLeft size={16} /></button>
            <button onClick={nextMonth} className="text-gray-400 hover:text-gray-900 transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <span key={i} className="text-[10px] font-bold text-gray-400">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
          {gridWeeks.flat().map((cell, i) => {
            const isToday = !cell.isOutside && cell.day === new Date().getDate() && cell.month === new Date().getMonth() && cell.year === new Date().getFullYear();
            return (
              <button key={i} className={`text-[11px] font-bold rounded-full w-6 h-6 flex items-center justify-center transition-colors ${isToday ? 'bg-indigo-600 text-white' : cell.isOutside ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-200'}`}>
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex select-none">
      
      {/* Sidebar for Calendars */}
      <div className="w-[220px] shrink-0 border-r border-gray-200/80 bg-[#FAFBFC] flex flex-col">
        {userRole === 'Admin' && (
          <div className="p-4 border-b border-gray-200/80">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full flex justify-center items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 px-3 text-[13px] font-black shadow-md shadow-indigo-500/20 transition-all"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create Event</span>
            </button>
          </div>
        )}
        
        <div className="p-4 flex-1 overflow-y-auto">
          {renderMiniCalendar()}

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-[11.5px] font-black text-gray-400 uppercase tracking-wider">My Calendars</h4>
              <button className="text-gray-400 hover:text-gray-900"><Plus size={14} /></button>
            </div>
            <div className="space-y-1.5">
              {eventTypes.map(type => (
                <label key={type.id} className="flex items-center gap-2.5 cursor-pointer group px-2 py-1 -mx-2 rounded-lg hover:bg-gray-100/80 transition-colors">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={activeFilters.has(type.id)}
                      onChange={() => toggleFilter(type.id)}
                    />
                    <div className={`w-4 h-4 rounded-[5px] border-2 flex items-center justify-center transition-colors ${activeFilters.has(type.id) ? type.color + ' border-transparent' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                      {activeFilters.has(type.id) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[12.5px] font-semibold text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        
        {/* Header Toolbar */}
        <div className="h-[60px] border-b border-gray-100 px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-[20px] font-black text-gray-900 flex items-center gap-2">
              <CalendarIcon size={22} className="text-indigo-600" />
              {monthYearLabel}
            </h2>
            <div className="flex items-center gap-1 ml-2">
              <button onClick={handleToday} className="px-3 py-1.5 text-[12px] font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-lg shadow-2xs transition-colors cursor-pointer">
                Today
              </button>
              <button onClick={prevMonth} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              <button onClick={nextMonth} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center w-56">
              <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" strokeWidth={2.2} />
              <input
                type="text"
                placeholder="Search events..."
                className="h-8 w-full rounded-xl border border-gray-200/80 bg-gray-50/50 pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            
            <div className="flex items-center bg-gray-100/80 rounded-xl p-0.5">
              <button className="px-3 py-1 text-[11.5px] font-bold text-gray-600 hover:text-gray-900 rounded-lg transition-colors">Day</button>
              <button className="px-3 py-1 text-[11.5px] font-bold text-gray-600 hover:text-gray-900 rounded-lg transition-colors">Week</button>
              <button className="px-3 py-1 text-[11.5px] font-extrabold text-indigo-700 bg-white shadow-sm rounded-lg transition-all">Month</button>
            </div>
            
            <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg border border-gray-200/80 bg-white shadow-2xs transition-colors">
              <Settings size={15} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/30 shrink-0">
          {calendarWeekdays.map(day => (
            <div key={day} className="py-2.5 text-center text-[12px] font-black text-gray-500 border-r border-gray-100 last:border-r-0 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-7 bg-gray-50/50" style={{ gridTemplateRows: `repeat(${gridWeeks.length}, minmax(0, 1fr))` }}>
          {gridWeeks.map((week, weekIndex) => (
            week.map((cell, dayIndex) => {
              const isToday = !cell.isOutside && cell.day === new Date().getDate() && cell.month === new Date().getMonth() && cell.year === new Date().getFullYear();
              const dayEvents = getEventsForDate(cell);
              
              return (
                <div key={`${weekIndex}-${dayIndex}`} className={`bg-white border-r border-b border-gray-100 last:border-r-0 p-1.5 flex flex-col group min-h-0 ${cell.isOutside ? 'bg-gray-50/50' : ''}`}>
                  <div className="flex justify-between items-start mb-1 shrink-0 px-1 pt-0.5">
                    <span className={`text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' : cell.isOutside ? 'text-gray-300' : 'text-gray-700'}`}>
                      {cell.day}
                    </span>
                    {!cell.isOutside && userRole === 'Admin' && (
                      <button 
                        onClick={() => {
                           const pad = (n: number) => String(n).padStart(2, '0');
                           const dateStr = `${cell.year}-${pad(cell.month+1)}-${pad(cell.day)}`;
                           setNewEvent({ ...newEvent, startTime: `${dateStr}T09:00:00`, endTime: `${dateStr}T10:00:00` });
                           setIsModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-md hover:bg-indigo-50"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {dayEvents.map((evt, i) => (
                      <div key={i} className={`text-[10.5px] font-bold px-1.5 py-1 rounded truncate flex flex-col gap-0.5 ${getEventStyle(evt.color)} transition-transform hover:scale-[1.02] cursor-pointer shadow-sm opacity-90 hover:opacity-100`}>
                        <div className="flex justify-between items-center w-full">
                          <span className="truncate">{evt.title}</span>
                        </div>
                        <span className="text-[9px] font-semibold opacity-80 uppercase tracking-wide">{evt.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ))}
        </div>
        
      </div>

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-200/80">
            <h3 className="text-[18px] font-black text-gray-900 mb-4">Create New Event</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">Event Title</label>
                <input 
                  type="text" 
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 p-2 text-[13px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="E.g., Q3 Planning Meeting"
                />
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 p-2 text-[13px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
                  placeholder="Optional details..."
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">Attendees (Emails or Names)</label>
                <input 
                  type="text" 
                  value={newEvent.attendees}
                  onChange={(e) => setNewEvent({...newEvent, attendees: e.target.value})}
                  className="w-full rounded-lg border border-gray-200 p-2 text-[13px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="E.g., nandini@example.com, john@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">Start Time (Local)</label>
                  <input 
                    type="datetime-local" 
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                    className="w-full rounded-lg border border-gray-200 p-2 text-[13px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">End Time (Local)</label>
                  <input 
                    type="datetime-local" 
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                    className="w-full rounded-lg border border-gray-200 p-2 text-[13px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateEvent}
                disabled={!newEvent.title || !newEvent.startTime || !newEvent.endTime}
                className="px-4 py-2 rounded-lg text-[13px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

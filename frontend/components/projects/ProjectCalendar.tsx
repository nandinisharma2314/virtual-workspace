"use client";

import { Plus, ChevronDown, MoreVertical } from "lucide-react";

export default function ProjectCalendar() {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = [
    { date: 27, prev: true }, { date: 28, prev: true }, { date: 29, prev: true }, { date: 30, prev: true }, { date: 1 }, { date: 2 }, { date: 3 },
    { date: 4 }, { date: 5 }, { date: 6 }, { date: 7 }, { date: 8 }, { date: 9 }, { date: 10 },
    { date: 11 }, { date: 12 }, { date: 13 }, { date: 14 }, { date: 15 }, { date: 16 }, { date: 17 },
    { date: 18 }, { date: 19 }, { date: 20 }, { date: 21 }, { date: 22 }, { date: 23 }, { date: 24 },
    { date: 25 }, { date: 26 }, { date: 27 }, { date: 28 }, { date: 29 }, { date: 30 }, { date: 31 },
  ];

  const getEventsForDay = (date: number, prev: boolean | undefined) => {
    if (prev) return [];
    if (date === 15) return [{ title: "Project kickoff", color: "bg-emerald-500", label: "Done" }];
    if (date === 28) return [{ title: "Design homepage UI", color: "bg-purple-500", label: "In Progress" }, { title: "Code review", color: "bg-amber-500", label: "In Review" }];
    if (date === 30) return [{ title: "Review homepage", color: "bg-amber-500", label: "In Review" }];
    return [];
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFC] select-none w-full">
      {/* Calendar Toolbar */}
      <div className="h-12 border-b border-gray-100 px-5 bg-white flex items-center justify-between shrink-0">
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-3 py-1.5 text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all">
          Month <ChevronDown size={14} className="text-gray-400" />
        </button>
        <button className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
          <MoreVertical size={16} />
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
        <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-gray-50 overflow-hidden">
          {calendarDays.map((day, idx) => {
            const events = getEventsForDay(day.date, day.prev);
            return (
              <div key={idx} className="bg-white border-r border-b border-gray-100 p-1.5 flex flex-col group min-h-0">
                <div className="flex justify-between items-start mb-1 shrink-0">
                  <span className={`text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${day.prev ? 'text-gray-300' : day.date === 28 ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                    {day.date}
                  </span>
                  {!day.prev && (
                    <button className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-100">
                      <Plus size={14} />
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {events.map((event, i) => (
                    <div key={i} className={`${event.color} bg-opacity-10 text-[10.5px] font-bold px-1.5 py-0.5 rounded truncate flex flex-col`}>
                       <span className="text-gray-900 truncate">{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}

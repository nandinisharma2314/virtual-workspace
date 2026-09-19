"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calendarWeekdays } from "@/lib/data";
import Link from "next/link";

interface ScheduleItem {
  color: string;
  title: string;
  time: string;
}

export default function CalendarCard({ calendarData = [] }: { calendarData?: any[] }) {
  // Initialize to the present date automatically
  const [currentDate, setCurrentDate] = useState(() => new Date());
  
  // Selected day state default to current day
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const activeSchedule = useMemo(() => {
    const selectedDateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const dayEvents = calendarData.filter((evt: any) => evt.date === selectedDateStr);
    return dayEvents;
  }, [selectedDay, selectedMonth, selectedYear, calendarData]);

  // Month navigation handlers
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

  // Dynamically build calendar grid
  const gridWeeks = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // JavaScript Sunday=0; Convert to Monday=0 (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
    let firstDayWeekDay = firstDayOfMonth.getDay();
    let startOffset = (firstDayWeekDay + 6) % 7; // Number of leading days from previous month

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const allCells: Array<{ day: number; isCurrentMonth: boolean; month: number; year: number }> = [];

    // Leading previous month days
    for (let i = startOffset - 1; i >= 0; i--) {
      allCells.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      allCells.push({
        day: d,
        isCurrentMonth: true,
        month: month,
        year: year,
      });
    }

    // Trailing next month days to complete 35 or 42 cells (5 or 6 rows)
    const totalNeeded = allCells.length > 35 ? 42 : 35;
    const remaining = totalNeeded - allCells.length;
    for (let r = 1; r <= remaining; r++) {
      allCells.push({
        day: r,
        isCurrentMonth: false,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
      });
    }

    // Chunk into 7-day weeks
    const weeks: typeof allCells[] = [];
    for (let i = 0; i < allCells.length; i += 7) {
      weeks.push(allCells.slice(i, i + 7));
    }
    return weeks;
  }, [currentDate]);

  const handleDateClick = (cell: { day: number; isCurrentMonth: boolean; month: number; year: number }) => {
    setSelectedDay(cell.day);
    setSelectedMonth(cell.month);
    setSelectedYear(cell.year);
    if (!cell.isCurrentMonth) {
      setCurrentDate(new Date(cell.year, cell.month, 1));
    }
  };

  const handleResetToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today.getDate());
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs overflow-hidden min-h-0">
      {/* Top title row */}
      <h3 className="text-[14px] font-extrabold text-[#111827] tracking-tight shrink-0 mb-2">
        Calendar
      </h3>

      {/* Month & navigation controls on dedicated functional row */}
      <div className="flex items-center justify-between shrink-0 mb-3">
        <span className="text-[13px] sm:text-[14px] font-bold text-gray-900">{monthYearLabel}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            aria-label="Previous Month"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-2xs transition-all active:scale-95"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={nextMonth}
            aria-label="Next Month"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-2xs transition-all active:scale-95"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 7-Column Interactive Days Grid */}
      <table className="w-full table-fixed text-center shrink-0">
        <thead>
          <tr className="text-[#6B7280] text-[11px] font-semibold">
            {calendarWeekdays.map((d) => (
              <th key={d} className="pb-2 font-semibold">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gridWeeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((cell, di) => {
                const isSelected =
                  cell.day === selectedDay &&
                  cell.month === selectedMonth &&
                  cell.year === selectedYear;

                return (
                  <td key={di} className="py-0.5">
                    <button
                      onClick={() => handleDateClick(cell)}
                      type="button"
                      className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[12px] transition-all focus:outline-none ${
                        isSelected
                          ? "bg-blue-600 font-bold text-white shadow-xs shadow-blue-500/30 scale-105"
                          : cell.isCurrentMonth
                          ? "text-[#111827] font-semibold hover:bg-gray-100 cursor-pointer"
                          : "text-gray-300 font-normal hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      {cell.day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dynamically Filtered Schedule Items with crisp horizontal line dividers */}
      <ul className="mt-3 border-y border-gray-100 divide-y divide-gray-100 flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col justify-around">
        {activeSchedule.length > 0 ? (
          activeSchedule.map((s, i) => (
            <li key={`${s.title}-${i}`} className="flex items-center justify-between gap-2 py-2.5 text-xs animate-fadeIn">
              <span className="flex items-center gap-2 min-w-0 truncate">
                <span className={`h-2 w-2 shrink-0 rounded-full ${s.color || 'bg-blue-500'}`} />
                <span className="font-semibold text-[#111827] text-[12px] truncate">{s.title}</span>
              </span>
              <span className="shrink-0 text-gray-400 font-medium text-[11px]">{s.time}</span>
            </li>
          ))
        ) : (
          <li className="flex-1 flex items-center justify-center text-[12px] text-gray-400 py-4">
            No events scheduled for this day
          </li>
        )}
      </ul>

      {/* Centered Interactive Bottom Link */}
      <div className="pt-2.5 pb-0.5 text-center shrink-0">
        <Link
          href="/calendar"
          className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all focus:outline-none active:scale-95 inline-block"
        >
          View full calendar
        </Link>
      </div>
    </div>
  );
}

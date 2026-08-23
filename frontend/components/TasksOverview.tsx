"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { tasksOverview as defaultTasksOverview, tasksOverviewWeekly, tasksOverviewMonthly } from "@/lib/data";
import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";



interface TasksOverviewProps {
  tasksOverview?: any[];
}

function TasksOverviewContent({ tasksOverview }: TasksOverviewProps) {
  const searchParams = useSearchParams();
  const rangeParam = searchParams.get('range') || 'Weekly';
  const selectedView = ["Daily", "Weekly", "Monthly"].includes(rangeParam) ? rangeParam : "Weekly";

  const dataMap: Record<string, any[]> = {
    Daily: tasksOverview || defaultTasksOverview,
    Weekly: tasksOverviewWeekly,
    Monthly: tasksOverviewMonthly,
  };

  const currentData = dataMap[selectedView];

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-3.5 shadow-2xs overflow-hidden min-h-0">
      <div className="flex items-center justify-between shrink-0 mb-1">
        <h3 className="text-xs font-bold text-gray-900 tracking-tight">Tasks Overview</h3>
      </div>
      
      <div className="flex-1 min-h-0 min-h-[50px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData} barGap={2} barCategoryGap="18%">
            <CartesianGrid vertical={false} stroke="#F1F2F4" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6B7280", fontSize: 10, fontWeight: 500 }}
              dy={4}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6B7280", fontSize: 10, fontWeight: 500 }}
              width={24}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "#F9FAFB" }}
              contentStyle={{
                borderRadius: 6,
                border: "1px solid #E5E7EB",
                fontSize: 11,
                padding: "4px 8px",
              }}
            />
            <Bar dataKey="inProgress" fill="#F59E0B" radius={[3, 3, 0, 0]} maxBarSize={6} />
            <Bar dataKey="todo" fill="#3B82F6" radius={[3, 3, 0, 0]} maxBarSize={6} />
            <Bar dataKey="completed" fill="#22C55E" radius={[3, 3, 0, 0]} maxBarSize={6} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 shrink-0 flex items-center justify-center gap-4 text-[11px] font-semibold text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-xs bg-[#22C55E] shrink-0" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-xs bg-[#F59E0B] shrink-0" /> In Progress
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-xs bg-[#3B82F6] shrink-0" /> To Do
        </span>
      </div>
    </div>
  );
}

export default function TasksOverview({ tasksOverview }: TasksOverviewProps) {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex-1 flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-3.5 shadow-2xs overflow-hidden min-h-0">
        <div className="flex items-center justify-between shrink-0 mb-1">
          <h3 className="text-xs font-bold text-gray-900 tracking-tight">Tasks Overview</h3>
        </div>
        <div className="flex-1 min-h-0 min-h-[50px] w-full pt-1 bg-gray-50 animate-pulse rounded-lg" />
      </div>
    }>
      <TasksOverviewContent tasksOverview={tasksOverview} />
    </Suspense>
  );
}

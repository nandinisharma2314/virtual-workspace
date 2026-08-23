"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { projectProgress as mockProjectProgress } from "@/lib/data";

export default function ProjectProgress({ projectProgress = mockProjectProgress }: { projectProgress?: any[] }) {
  const completedEntry = projectProgress?.find((p: any) => p.name === 'Completed');
  const overallProgress = completedEntry ? completedEntry.value : 0;

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-3.5 shadow-2xs overflow-hidden min-h-0">
      <h3 className="text-[13px] font-bold text-gray-900 tracking-tight shrink-0 mb-1">Project Progress</h3>

      <div className="flex items-center justify-between gap-3 flex-1 min-h-0 py-0.5">
        {/* Donut Chart container matching photo proportions */}
        <div className="relative h-[94px] w-[94px] shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={projectProgress}
                dataKey="value"
                innerRadius={32}
                outerRadius={46}
                paddingAngle={3}
                stroke="#FFFFFF"
                strokeWidth={1.5}
                startAngle={90}
                endAngle={-270}
              >
                {projectProgress.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-1">
            <span className="text-[16px] font-black text-gray-900 leading-none tracking-tight">{overallProgress}%</span>
            <span className="text-[6.5px] font-semibold text-gray-500 mt-1 leading-none tracking-tight">Overall Progress</span>
          </div>
        </div>

        {/* Legend List aligned to match chart height with equal justify-between spacing */}
        <ul className="flex-1 min-w-0 flex flex-col justify-between h-[92px] pl-2.5">
          {projectProgress.map((p) => (
            <li key={p.name} className="flex items-center justify-between text-[12px] leading-none">
              <span className="flex items-center gap-2 text-[#374151] font-semibold truncate pr-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="truncate leading-none">{p.name}</span>
              </span>
              <span className="font-bold text-[#374151] shrink-0 text-[12px] leading-none">{p.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

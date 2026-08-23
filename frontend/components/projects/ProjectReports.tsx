"use client";

import { Calendar, Download, ChevronDown } from "lucide-react";

export default function ProjectReports() {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFC] select-none w-full">
      {/* Reports Toolbar */}
      <div className="h-12 border-b border-gray-100 px-5 bg-white flex items-center justify-between shrink-0">
        <button className="flex items-center gap-2 rounded-lg border border-gray-200/80 bg-white px-3 py-1.5 text-[11.5px] font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-all">
          <Calendar size={13} className="text-gray-400" />
          <span>May 1 - May 31, 2025</span>
          <ChevronDown size={13} className="text-gray-400 ml-1" />
        </button>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-3 py-1.5 text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all">
          <Download size={13} className="text-gray-500" />
          <span>Export</span>
          <ChevronDown size={13} className="text-gray-400 ml-1" />
        </button>
      </div>

      <div className="flex-1 min-h-0 p-5 overflow-y-auto">

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <span className="text-[12px] font-bold text-gray-500 mb-2">Total Tasks</span>
          <span className="text-2xl font-black text-gray-900">45</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <span className="text-[12px] font-bold text-gray-500 mb-2">Completed</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-gray-900">18</span>
            <span className="text-[11px] font-extrabold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">40%</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <span className="text-[12px] font-bold text-gray-500 mb-2">In Progress</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-gray-900">15</span>
            <span className="text-[11px] font-extrabold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">33%</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <span className="text-[12px] font-bold text-gray-500 mb-2">To Do</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-gray-900">12</span>
            <span className="text-[11px] font-extrabold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">27%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          {/* Task Status */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs h-64 flex flex-col">
            <h3 className="text-[13px] font-bold text-gray-800 mb-4">Task Status</h3>
            <div className="flex-1 flex items-center justify-center gap-8">
              {/* Donut Chart Mockup */}
              <div className="relative w-32 h-32 rounded-full border-[12px] border-emerald-500 flex items-center justify-center" style={{ borderRightColor: '#3B82F6', borderBottomColor: '#3B82F6', borderLeftColor: '#D1D5DB' }}>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-gray-900 leading-none">45</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
                </div>
              </div>
              {/* Legend */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-[12px] font-semibold text-gray-600 w-20">Done</span>
                  <span className="text-[12px] font-bold text-gray-900">18 <span className="text-gray-400 font-medium">(40%)</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                  <span className="text-[12px] font-semibold text-gray-600 w-20">In Progress</span>
                  <span className="text-[12px] font-bold text-gray-900">15 <span className="text-gray-400 font-medium">(33%)</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0"></span>
                  <span className="text-[12px] font-semibold text-gray-600 w-20">To Do</span>
                  <span className="text-[12px] font-bold text-gray-900">12 <span className="text-gray-400 font-medium">(27%)</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks by Assignee */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs h-64 flex flex-col">
            <h3 className="text-[13px] font-bold text-gray-800 mb-4">Tasks by Assignee</h3>
            <div className="flex-1 flex flex-col justify-between pt-2">
              {[
                { name: 'Priya S.', count: 12, width: '100%' },
                { name: 'Arjun P.', count: 10, width: '85%' },
                { name: 'Neha S.', count: 9, width: '75%' },
                { name: 'Vikram J.', count: 8, width: '65%' },
                { name: 'Rohit V.', count: 6, width: '50%' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[11.5px] font-semibold text-gray-600 w-16 truncate">{item.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: item.width }}></div>
                  </div>
                  <span className="text-[11.5px] font-bold text-gray-900 w-4 text-right">{item.count}</span>
                </div>
              ))}
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
                <span className="text-[11px] font-bold text-gray-500">18</span>
                <div className="w-10 h-32 bg-rose-500 rounded-t-lg"></div>
                <span className="text-[11.5px] font-semibold text-gray-600">High</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-gray-500">17</span>
                <div className="w-10 h-28 bg-amber-500 rounded-t-lg"></div>
                <span className="text-[11.5px] font-semibold text-gray-600">Medium</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-gray-500">10</span>
                <div className="w-10 h-16 bg-emerald-500 rounded-t-lg"></div>
                <span className="text-[11.5px] font-semibold text-gray-600">Low</span>
              </div>
            </div>
          </div>

          {/* Completion Over Time */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs h-64 flex flex-col">
            <h3 className="text-[13px] font-bold text-gray-800 mb-4">Completion Over Time</h3>
            <div className="flex-1 relative mt-2">
              {/* Y-axis */}
              <div className="absolute left-0 top-0 bottom-6 w-6 flex flex-col justify-between text-[10px] font-semibold text-gray-400">
                <span>20</span>
                <span>15</span>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>
              {/* X-axis labels */}
              <div className="absolute left-8 right-0 bottom-0 flex justify-between text-[10px] font-semibold text-gray-400">
                <span>May 1</span>
                <span>May 8</span>
                <span>May 15</span>
                <span>May 22</span>
                <span>May 31</span>
              </div>
              {/* Chart area */}
              <div className="absolute left-8 right-4 top-1 bottom-6 border-l border-b border-gray-200/80">
                {/* SVG Line Chart */}
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    points="0,95 25,75 50,60 75,30 100,10"
                  />
                  <path
                    fill="rgba(59, 130, 246, 0.1)"
                    d="M0,95 L25,75 L50,60 L75,30 L100,10 L100,100 L0,100 Z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

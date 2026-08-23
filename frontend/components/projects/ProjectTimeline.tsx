"use client";

export default function ProjectTimeline() {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFC] select-none w-full">
      {/* Timeline Toolbar */}
      <div className="h-12 border-b border-gray-100 px-5 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-[11.5px] font-bold text-gray-600 hover:text-gray-900 transition-colors">
            Filters
          </button>
          <button className="flex items-center gap-1.5 text-[11.5px] font-bold text-gray-600 hover:text-gray-900 transition-colors">
            Zoom
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-bold text-gray-900">May 20 - Jun 14, 2023</span>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 text-[11.5px] font-bold text-gray-600 hover:text-gray-900 rounded-md transition-colors">Today</button>
            <button className="px-1 py-1 text-gray-400 hover:text-gray-700 transition-colors">&lt;</button>
            <button className="px-1 py-1 text-gray-400 hover:text-gray-700 transition-colors">&gt;</button>
          </div>
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
            {[25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7].map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end py-2 min-w-[30px] border-r border-gray-100 last:border-r-0">
                <span className="text-[10px] font-bold text-gray-400 mb-1">
                  {i < 7 ? 'May' : 'Jun'}
                </span>
                <span className={`text-[12px] font-black ${day === 28 ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-700'}`}>
                  {day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto">
          {/* To Do Section */}
          <div className="py-2 px-4 bg-gray-50/30 text-[11.5px] font-bold text-gray-400 uppercase tracking-wider">To Do</div>
          
          <div className="flex border-b border-gray-50 relative h-10 group hover:bg-gray-50/50 transition-colors">
            <div className="w-56 shrink-0 px-4 flex items-center border-r border-gray-100 text-[12.5px] font-semibold text-gray-800 truncate z-10 bg-inherit">
              Create wireframes
            </div>
            <div className="flex-1 relative flex items-center">
              {/* Background grid lines */}
              <div className="absolute inset-0 flex">
                {Array(14).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0 h-full" />
                ))}
              </div>
              {/* Bar */}
              <div className="absolute left-[14.2%] right-[57%] h-6 bg-gray-400 rounded-lg shadow-sm border border-gray-500/20 z-10" />
            </div>
          </div>
          
          <div className="flex border-b border-gray-50 relative h-10 group hover:bg-gray-50/50 transition-colors">
            <div className="w-56 shrink-0 px-4 flex items-center border-r border-gray-100 text-[12.5px] font-semibold text-gray-800 truncate z-10 bg-inherit">
              Setup analytics
            </div>
            <div className="flex-1 relative flex items-center">
              <div className="absolute inset-0 flex">
                {Array(14).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0 h-full" />
                ))}
              </div>
              <div className="absolute left-[21.4%] right-[50%] h-6 bg-gray-400 rounded-lg shadow-sm border border-gray-500/20 z-10" />
            </div>
          </div>

          <div className="flex border-b border-gray-50 relative h-10 group hover:bg-gray-50/50 transition-colors">
            <div className="w-56 shrink-0 px-4 flex items-center border-r border-gray-100 text-[12.5px] font-semibold text-gray-800 truncate z-10 bg-inherit">
              Write copy
            </div>
            <div className="flex-1 relative flex items-center">
              <div className="absolute inset-0 flex">
                {Array(14).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0 h-full" />
                ))}
              </div>
              <div className="absolute left-[28.5%] right-[28.5%] h-6 bg-gray-400 rounded-lg shadow-sm border border-gray-500/20 z-10" />
            </div>
          </div>

          {/* In Progress Section */}
          <div className="py-2 px-4 bg-gray-50/30 text-[11.5px] font-bold text-blue-500 uppercase tracking-wider">In Progress</div>
          
          <div className="flex border-b border-gray-50 relative h-10 group hover:bg-gray-50/50 transition-colors">
            <div className="w-56 shrink-0 px-4 flex items-center border-r border-gray-100 text-[12.5px] font-semibold text-gray-800 truncate z-10 bg-inherit">
              Design homepage UI
            </div>
            <div className="flex-1 relative flex items-center">
              <div className="absolute inset-0 flex">
                {Array(14).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0 h-full" />
                ))}
              </div>
              <div className="absolute left-[14.2%] right-[50%] h-6 bg-purple-500 rounded-lg shadow-sm border border-purple-600/20 z-10" />
            </div>
          </div>
          
          <div className="flex border-b border-gray-50 relative h-10 group hover:bg-gray-50/50 transition-colors">
            <div className="w-56 shrink-0 px-4 flex items-center border-r border-gray-100 text-[12.5px] font-semibold text-gray-800 truncate z-10 bg-inherit">
              Develop responsive nav
            </div>
            <div className="flex-1 relative flex items-center">
              <div className="absolute inset-0 flex">
                {Array(14).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0 h-full" />
                ))}
              </div>
              <div className="absolute left-[35.7%] right-[21.4%] h-6 bg-blue-500 rounded-lg shadow-sm border border-blue-600/20 z-10" />
            </div>
          </div>
          
          <div className="flex border-b border-gray-50 relative h-10 group hover:bg-gray-50/50 transition-colors">
            <div className="w-56 shrink-0 px-4 flex items-center border-r border-gray-100 text-[12.5px] font-semibold text-gray-800 truncate z-10 bg-inherit">
              Build components
            </div>
            <div className="flex-1 relative flex items-center">
              <div className="absolute inset-0 flex">
                {Array(14).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0 h-full" />
                ))}
              </div>
              <div className="absolute left-[42.8%] right-[14.2%] h-6 bg-blue-500 rounded-lg shadow-sm border border-blue-600/20 z-10" />
            </div>
          </div>

          {/* In Review Section */}
          <div className="py-2 px-4 bg-gray-50/30 text-[11.5px] font-bold text-amber-500 uppercase tracking-wider">In Review</div>
          
          <div className="flex border-b border-gray-50 relative h-10 group hover:bg-gray-50/50 transition-colors">
            <div className="w-56 shrink-0 px-4 flex items-center border-r border-gray-100 text-[12.5px] font-semibold text-gray-800 truncate z-10 bg-inherit">
              Review homepage
            </div>
            <div className="flex-1 relative flex items-center">
              <div className="absolute inset-0 flex">
                {Array(14).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0 h-full" />
                ))}
              </div>
              <div className="absolute left-[21.4%] right-[64.2%] h-6 bg-amber-500 rounded-lg shadow-sm border border-amber-600/20 z-10" />
            </div>
          </div>

          {/* Done Section */}
          <div className="py-2 px-4 bg-gray-50/30 text-[11.5px] font-bold text-emerald-500 uppercase tracking-wider">Done</div>
          
          <div className="flex border-b border-gray-50 relative h-10 group hover:bg-gray-50/50 transition-colors">
            <div className="w-56 shrink-0 px-4 flex items-center border-r border-gray-100 text-[12.5px] font-semibold text-gray-800 truncate z-10 bg-inherit">
              Kickoff meeting
            </div>
            <div className="flex-1 relative flex items-center">
              <div className="absolute inset-0 flex">
                {Array(14).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0 h-full" />
                ))}
              </div>
              <div className="absolute left-[0%] right-[85.7%] h-6 bg-emerald-500 rounded-lg shadow-sm border border-emerald-600/20 z-10" />
            </div>
          </div>
          
          <div className="flex border-b border-gray-50 relative h-10 group hover:bg-gray-50/50 transition-colors">
            <div className="w-56 shrink-0 px-4 flex items-center border-r border-gray-100 text-[12.5px] font-semibold text-gray-800 truncate z-10 bg-inherit">
              Requirements
            </div>
            <div className="flex-1 relative flex items-center">
              <div className="absolute inset-0 flex">
                {Array(14).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0 h-full" />
                ))}
              </div>
              <div className="absolute left-[7.1%] right-[71.4%] h-6 bg-emerald-500 rounded-lg shadow-sm border border-emerald-600/20 z-10" />
            </div>
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}

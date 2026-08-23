"use client";

import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, MessageSquare, Play, CheckCircle2, Zap, LayoutGrid, List, AlertCircle, Clock } from "lucide-react";
import Avatar from "./Avatar";

const sprintList = [
  { id: "sprint-12", name: "Sprint 12", status: "active", dates: "May 15 - May 29", completed: 8, total: 14 },
  { id: "sprint-13", name: "Sprint 13", status: "planned", dates: "May 30 - Jun 12", completed: 0, total: 12 },
  { id: "sprint-14", name: "Sprint 14", status: "planned", dates: "Jun 13 - Jun 26", completed: 0, total: 9 },
  { id: "backlog", name: "Backlog", status: "backlog", dates: "Unscheduled", completed: 0, total: 45 },
];

type Task = { id: string; title: string; type: string; points: number; assignee: string };

const initialTasks: Record<string, Task[]> = {
  "todo": [
    { id: "t1", title: "User authentication flow design", type: "Feature", points: 5, assignee: "avi" },
    { id: "t2", title: "Fix mobile navigation layout", type: "Bug", points: 2, assignee: "priya" },
    { id: "t7", title: "Write unit tests for utils", type: "Task", points: 3, assignee: "neha" }
  ],
  "inprogress": [
    { id: "t3", title: "Implement new dashboard widgets", type: "Feature", points: 8, assignee: "rohit" },
  ],
  "review": [
    { id: "t4", title: "Refactor user settings API", type: "Tech Debt", points: 3, assignee: "arjun" },
  ],
  "done": [
    { id: "t5", title: "Setup CI/CD deployment", type: "Task", points: 5, assignee: "neha" },
    { id: "t6", title: "Update primary color tokens", type: "Feature", points: 2, assignee: "avi" },
  ]
};

const columns = [
  { key: "todo", title: "To Do", bg: "bg-gray-50", accent: "bg-gray-400" },
  { key: "inprogress", title: "In Progress", bg: "bg-blue-50", accent: "bg-blue-500" },
  { key: "review", title: "In Review", bg: "bg-amber-50", accent: "bg-amber-500" },
  { key: "done", title: "Done", bg: "bg-emerald-50", accent: "bg-emerald-500" }
];

export default function SprintsView() {
  const [activeSprint, setActiveSprint] = useState("sprint-12");
  const [tasks, setTasks] = useState(initialTasks);
  const [viewMode, setViewMode] = useState("board");

  const moveTask = (taskId: string, sourceCol: string, targetCol: string) => {
    setTasks(prev => {
      const sourceTasks = [...prev[sourceCol]];
      const targetTasks = [...prev[targetCol]];
      const taskIndex = sourceTasks.findIndex(t => t.id === taskId);
      
      if (taskIndex > -1) {
        const [task] = sourceTasks.splice(taskIndex, 1);
        targetTasks.push(task);
      }
      
      return {
        ...prev,
        [sourceCol]: sourceTasks,
        [targetCol]: targetTasks
      };
    });
  };

  const currentSprintData = sprintList.find(s => s.id === activeSprint);
  const progressPct = currentSprintData && currentSprintData.total > 0 
    ? Math.round((currentSprintData.completed / currentSprintData.total) * 100) 
    : 0;

  return (
    <div className="flex w-full h-full min-h-0 overflow-hidden bg-white">
      {/* Sprints Sidebar */}
      <div className="w-[240px] shrink-0 border-r border-gray-200/80 bg-[#FAFBFC] flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-black tracking-tight text-gray-900 mb-3">Sprints & Backlog</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search sprints..." 
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200/80 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
          {sprintList.map((sprint) => {
            const isActive = activeSprint === sprint.id;
            return (
              <button
                key={sprint.id}
                onClick={() => setActiveSprint(sprint.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors border ${
                  isActive 
                    ? "bg-white border-gray-200/80 shadow-2xs" 
                    : "border-transparent hover:bg-gray-100/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[13px] font-bold ${isActive ? "text-indigo-600" : "text-gray-700"}`}>
                    {sprint.name}
                  </span>
                  {sprint.status === "active" && (
                    <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                      <Zap size={10} className="fill-emerald-700" /> Active
                    </span>
                  )}
                  {sprint.status === "planned" && (
                    <span className="text-[10px] font-semibold text-gray-400">Planned</span>
                  )}
                  {sprint.status === "backlog" && (
                    <span className="text-[10px] font-semibold text-gray-400">Backlog</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between">
                  <span>{sprint.dates}</span>
                  {sprint.status !== "backlog" && (
                    <span>{sprint.completed}/{sprint.total} pts</span>
                  )}
                </div>
                {isActive && sprint.status === "active" && (
                  <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPct}%` }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="p-3 border-t border-gray-100 shrink-0">
          <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors">
            <Plus size={14} />
            Create Sprint
          </button>
        </div>
      </div>

      {/* Main Sprint Board Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-white">
        {/* Sprint Header */}
        <div className="px-5 py-4 border-b border-gray-100 shrink-0 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-black tracking-tight text-gray-900">{currentSprintData?.name}</h1>
              {currentSprintData?.status === "active" && (
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Play size={10} className="fill-emerald-600" /> In Progress
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium">Goal: Deliver core authentication and dashboard widgets.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 rounded-lg bg-gray-100/80 p-0.5 mr-2">
              <button 
                onClick={() => setViewMode("board")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${viewMode === "board" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"}`}
              >
                <LayoutGrid size={13} /> Board
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${viewMode === "list" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"}`}
              >
                <List size={13} /> List
              </button>
            </div>
            
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors">
              <Filter size={14} className="text-gray-500" />
              Filter
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all">
              <Plus size={14} strokeWidth={2.5} />
              Add Task
            </button>
            {currentSprintData?.status === "active" && (
               <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all ml-1">
                 Complete Sprint
               </button>
            )}
          </div>
        </div>

        {/* Board View */}
        {viewMode === "board" && (
          <div className="flex-1 min-h-0 p-5 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 h-full min-h-0">
              {columns.map(col => (
                <div key={col.key} className={`rounded-xl ${col.bg} p-2.5 border border-gray-100/80 flex flex-col min-h-0 overflow-hidden`}>
                  <div className="flex items-center justify-between px-1 mb-2.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.accent}`} />
                      <span className="text-[12px] font-black text-gray-800">{col.title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-2xs">
                      {tasks[col.key]?.length || 0}
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pb-2">
                    {tasks[col.key]?.map(task => (
                      <div key={task.id} className="bg-white rounded-lg p-2.5 border border-gray-200/70 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer relative">
                        <div className="flex justify-between items-start mb-1.5">
                          <p className="text-[12px] font-bold text-gray-900 leading-snug pr-4">{task.title}</p>
                          <button className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1
                              ${task.type === "Bug" ? "bg-rose-100 text-rose-700" : 
                                task.type === "Feature" ? "bg-indigo-100 text-indigo-700" : 
                                task.type === "Tech Debt" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}
                            >
                              {task.type === "Bug" && <AlertCircle size={10} />}
                              {task.type === "Feature" && <Zap size={10} />}
                              {task.type}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[20px]">
                              {task.points}
                            </span>
                          </div>
                          
                          <Avatar person={task.assignee} size={20} />
                        </div>

                        {/* Interactive Move Actions (Simulated functionality) */}
                        <div className="absolute inset-x-0 bottom-0 top-0 bg-white/95 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 pointer-events-none group-hover:pointer-events-auto shadow-sm border border-indigo-100">
                          {columns.map(c => c.key !== col.key && (
                            <button
                              key={c.key}
                              onClick={(e) => { e.stopPropagation(); moveTask(task.id, col.key, c.key); }}
                              className="px-2 py-1 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 rounded text-[10px] font-bold transition-colors border border-gray-200"
                            >
                              To {c.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <button className="w-full py-1.5 rounded-lg border border-dashed border-gray-300 text-[11px] font-semibold text-gray-500 hover:text-gray-800 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 mt-1">
                      <Plus size={13} /> Add Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List View (Placeholder just to show view switching functionality) */}
        {viewMode === "list" && (
           <div className="flex-1 min-h-0 p-5 overflow-auto">
             <div className="border border-gray-200/80 rounded-xl overflow-hidden shadow-2xs">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-50 border-b border-gray-200/80">
                     <th className="px-4 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Task</th>
                     <th className="px-4 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                     <th className="px-4 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                     <th className="px-4 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Points</th>
                     <th className="px-4 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Assignee</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 bg-white">
                   {columns.flatMap(c => (tasks[c.key] || []).map(t => ({...t, status: c.title}))).map(task => (
                     <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-4 py-3 text-[13px] font-bold text-gray-900">{task.title}</td>
                       <td className="px-4 py-3">
                         <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{task.status}</span>
                       </td>
                       <td className="px-4 py-3">
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${task.type === 'Bug' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>{task.type}</span>
                       </td>
                       <td className="px-4 py-3 text-[12px] font-semibold text-gray-600">{task.points} pts</td>
                       <td className="px-4 py-3 text-right">
                         <div className="flex justify-end"><Avatar person={task.assignee} size={24} /></div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}

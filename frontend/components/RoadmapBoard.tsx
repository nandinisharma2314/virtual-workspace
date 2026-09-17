"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, Filter, LayoutGrid, List, Milestone, GanttChartSquare, X } from "lucide-react";
import { roadmap as mockRoadmap } from "@/lib/data";
import Avatar from "./Avatar";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GanttChartView from "./boards/GanttChartView";

const tabs = [
  { key: "board", label: "Board", icon: LayoutGrid },
  { key: "list", label: "List", icon: List },
  { key: "timeline", label: "Timeline", icon: Milestone },
  { key: "gantt", label: "Gantt", icon: GanttChartSquare },
];

export default function RoadmapBoard({
  roadmap = mockRoadmap,
  boardTitle = "Product Roadmap",
  bgGradient,
}: {
  roadmap?: any[];
  boardTitle?: string;
  bgGradient?: string;
}) {
  const [localRoadmap, setLocalRoadmap] = useState(roadmap);
  useEffect(() => { setLocalRoadmap(roadmap); }, [roadmap]);

  const [tab, setTab] = useState("board");
  const router = useRouter();
  
  const [addingColumn, setAddingColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState("todo");

  const [backendTasks, setBackendTasks] = useState<any[]>([]);

  const fetchTasks = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const res = await fetch("http://localhost:3001/tasks", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBackendTasks(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChangeStatus = async (task: any, currentColKey: string, targetColKey: string) => {
    if (currentColKey === targetColKey) return;
    
    const isMock = String(task.id).startsWith('c-') || String(task.id).startsWith('t-') || !task.tagColor?.includes('bg-indigo-100');

    if (!isMock && task.id) {
      const statusMap: Record<string, string> = {
        todo: 'todo',
        inprogress: 'in_progress',
        review: 'review',
        done: 'completed'
      };
      
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        await fetch(`http://localhost:3001/tasks/${task.id}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: statusMap[targetColKey] || 'todo' })
        });
        fetchTasks();
      } catch (e) {
        console.error(e);
      }
    } else {
      setLocalRoadmap(prev => prev.map(col => {
        if (col.key === currentColKey) {
          return { ...col, tasks: col.tasks.filter((t: any) => (t.id || t.title) !== (task.id || task.title)) };
        }
        if (col.key === targetColKey) {
          return { ...col, tasks: [task, ...col.tasks] };
        }
        return col;
      }));
    }
  };

  const filteredRoadmap = localRoadmap.map(col => {
    const colBackendTasks = backendTasks.filter(t => {
       if (col.key === 'todo') return t.status === 'todo';
       if (col.key === 'inprogress') return t.status === 'in_progress';
       if (col.key === 'review') return t.status === 'review';
       if (col.key === 'done') return t.status === 'completed';
       return false;
    }).map(t => ({
       id: t.id,
       title: t.title,
       tag: 'NEW',
       tagColor: 'bg-indigo-100 text-indigo-700',
       people: ['avi'], // placeholder user
       comments: 0
    }));

    const combinedTasks = [...colBackendTasks, ...col.tasks];

    return {
      ...col,
      count: combinedTasks.length,
      tasks: combinedTasks.filter((t: any) => 
        !filterQuery || 
        t.title.toLowerCase().includes(filterQuery.toLowerCase()) || 
        (t.tag && t.tag.toLowerCase().includes(filterQuery.toLowerCase()))
      )
    };
  });

  const handleAddTask = async (columnKey: string, title?: string) => {
    const taskTitle = title !== undefined ? title : newTaskTitle;
    if (!taskTitle.trim()) {
      setAddingColumn(null);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const statusMap: Record<string, string> = {
        todo: 'todo',
        inprogress: 'in_progress',
        done: 'completed'
      };
      
      await fetch("http://localhost:3001/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: taskTitle,
          status: statusMap[columnKey] || 'todo',
        })
      });
      setNewTaskTitle("");
      setAddingColumn(null);
      setIsTaskModalOpen(false);
      fetchTasks();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGlobalAddTask = () => {
    handleAddTask(newTaskStatus);
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-3 shadow-2xs overflow-hidden min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {bgGradient && (
              <div className={`w-3.5 h-3.5 rounded-md bg-gradient-to-tr ${bgGradient} shrink-0 shadow-2xs`} />
            )}
            <h3 className="text-xs font-extrabold text-gray-900 tracking-tight">{boardTitle}</h3>
          </div>
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100/80 p-0.5">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all ${
                    isActive ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Icon size={12} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1 rounded-lg border border-gray-200/80 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors"
            >
              <Filter size={12} className={filterQuery ? "text-indigo-600" : "text-gray-500"} />
              Filter {filterQuery && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5" />}
            </button>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-2 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-100">
                  <input 
                     type="text" 
                     autoFocus
                     placeholder="Search tasks or tags..." 
                     className="w-full text-[11px] font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
                     value={filterQuery}
                     onChange={e => setFilterQuery(e.target.value)}
                  />
                  {filterQuery && (
                    <button 
                      onClick={() => { setFilterQuery(''); setIsFilterOpen(false); }}
                      className="text-[10px] font-bold text-gray-500 hover:text-rose-500 text-left px-1 mt-0.5 transition-colors"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsTaskModalOpen(!isTaskModalOpen)}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all"
            >
              <Plus size={13} strokeWidth={2.5} />
              Add Task
            </button>
            {isTaskModalOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsTaskModalOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100">
                  <h4 className="text-[11px] font-bold text-gray-800">Create New Task</h4>
                  <input 
                     type="text" 
                     autoFocus
                     placeholder="Task title..." 
                     className="w-full text-[11px] font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
                     value={newTaskTitle}
                     onChange={e => setNewTaskTitle(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleGlobalAddTask()}
                  />
                  <select 
                     className="w-full text-[11px] font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner cursor-pointer"
                     value={newTaskStatus}
                     onChange={e => setNewTaskStatus(e.target.value)}
                  >
                     <option value="todo">To Do</option>
                     <option value="inprogress">In Progress</option>
                     <option value="done">Done</option>
                  </select>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <button onClick={() => setIsTaskModalOpen(false)} className="text-[10px] font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancel</button>
                    <button onClick={handleGlobalAddTask} disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs">
                       {isSubmitting ? "..." : "Save Task"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {tab === 'board' && (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4 flex-1 min-h-0 overflow-hidden">
          {filteredRoadmap.map((col) => (
            <div key={col.key} className={`rounded-xl ${col.headerBg} p-2 border border-gray-100/60 flex flex-col justify-between min-h-0 overflow-hidden`}>
              <div className="mb-1.5 shrink-0 flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`h-2 w-2 rounded-full ${col.accent} shrink-0`} />
                  <span className="text-[11px] font-bold text-gray-800 truncate">{col.title}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-1.5 py-0.5 rounded-full border border-gray-100 shrink-0">{col.count}</span>
              </div>

              <div className="flex-1 min-h-0 flex flex-col gap-1.5 justify-start overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <AnimatePresence mode="popLayout">
                  {col.tasks.map((task: any, idx: number) => {
                    const uniqueKey = task.id ? `task-${task.id}` : `mock-${task.title}-${idx}`;
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        key={uniqueKey}
                        className="rounded-lg border border-gray-200/70 bg-white px-2.5 py-1.5 shadow-2xs hover:border-indigo-200 hover:shadow-2xs transition-all group cursor-pointer shrink-0"
                      >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {col.key !== 'done' && (
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleChangeStatus(task, col.key, 'done');
                            }}
                            className="h-3.5 w-3.5 mt-0.5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Mark as done"
                          />
                        )}
                        <p className={`text-[11px] font-bold leading-tight group-hover:text-indigo-600 transition-colors truncate ${col.key === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {task.title}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${task.tagColor || 'bg-gray-100 text-gray-500'}`}
                      >
                        {task.tag}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="flex -space-x-1 overflow-hidden">
                        {task.people.map((p: string) => (
                          <Avatar key={p} person={p} size={16} ring />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {task.comments ? (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400">
                            <MessageSquare size={11} />
                            {task.comments}
                          </span>
                        ) : null}
                        <select
                          className="text-[9px] font-bold bg-gray-50 border border-gray-200/80 rounded px-1 py-0.5 text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none focus:border-indigo-300 transition-colors"
                          value={col.key}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleChangeStatus(task, col.key, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="todo">To Do</option>
                          <option value="inprogress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>

              {addingColumn === col.key ? (
                <div className="mt-1.5 shrink-0 flex flex-col gap-1.5 rounded-lg border border-indigo-200 bg-white p-1.5 shadow-2xs">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTask(col.key);
                      if (e.key === "Escape") setAddingColumn(null);
                    }}
                    disabled={isSubmitting}
                    className="w-full text-[11px] font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setAddingColumn(null)} className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors" disabled={isSubmitting}>
                      <X size={12} />
                    </button>
                    <button onClick={() => handleAddTask(col.key)} className="rounded bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white hover:bg-indigo-700 transition-colors" disabled={isSubmitting}>
                      {isSubmitting ? "..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setAddingColumn(col.key);
                    setNewTaskTitle("");
                  }}
                  className="mt-1.5 shrink-0 flex w-full items-center justify-center gap-1 rounded-lg bg-white/70 py-1 text-[11px] font-semibold text-gray-600 hover:bg-white transition-all shadow-2xs border border-transparent hover:border-gray-200/60"
                >
                  <Plus size={12} />
                  Add task
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'list' && (
        <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50/50 rounded-lg border border-gray-100/80 p-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filteredRoadmap.map((col) => (
            <div key={col.key} className="mb-4 last:mb-0">
               <h4 className="text-[11px] font-bold text-gray-800 mb-2 px-1 flex items-center gap-2">
                 <span className={`h-2 w-2 rounded-full ${col.accent}`} /> {col.title} ({col.count})
               </h4>
               <div className="flex flex-col gap-1.5">
                 {col.tasks.map((task: any, idx: number) => (
                   <div key={task.id || `${task.title}-${idx}`} className="flex items-center justify-between bg-white border border-gray-200/60 rounded-md p-2 shadow-2xs hover:border-indigo-200 transition-colors cursor-pointer group">
                     <div className="flex items-center gap-3">
                       <span className="text-[11px] font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">{task.title}</span>
                     </div>
                     <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${task.tagColor}`}>{task.tag}</span>
                   </div>
                 ))}
                 {col.tasks.length === 0 && <span className="text-[10px] text-gray-400 italic px-2">No tasks</span>}
               </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2 bg-gray-50/30 rounded-lg border border-gray-100/80 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
           <div className="relative border-l-2 border-indigo-100 ml-3 flex flex-col gap-4 py-2">
             {filteredRoadmap.flatMap(col => col.tasks).map((task: any, i: number) => (
               <div key={task.id || `${task.title}-${i}`} className="relative pl-6 group">
                 <div className="absolute w-3 h-3 bg-indigo-500 rounded-full border-2 border-white -left-[7px] top-1 shadow-sm group-hover:scale-125 transition-transform" />
                 <div className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-2xs hover:shadow-sm hover:border-indigo-100 transition-all cursor-pointer">
                   <div className="flex items-center gap-2 mb-1.5">
                     <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Aug {15 + (i * 2)}</span>
                     <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${task.tagColor}`}>{task.tag}</span>
                   </div>
                   <p className="text-[11px] font-semibold text-gray-800 leading-tight">{task.title}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {tab === 'gantt' && (
        <div className="flex-1 min-h-0 h-full overflow-hidden flex flex-col">
          <GanttChartView
            columns={filteredRoadmap}
            boardTitle={boardTitle}
            onStatusChange={handleChangeStatus}
            onAddTask={(status, title) => handleAddTask(status, title)}
          />
        </div>
      )}
    </div>
  );
}

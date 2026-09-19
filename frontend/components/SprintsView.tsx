"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, MoreHorizontal, MessageSquare, Play, CheckCircle2, Zap, LayoutGrid, List, AlertCircle, Clock, X } from "lucide-react";
import Avatar from "./Avatar";
import { API_URL } from "@/lib/apis";

const initialSprintList: any[] = [];

type Task = { id: string; title: string; type: string; points: number; assignee: string };

const initialTasks: Record<string, Task[]> = {
  "todo": [],
  "inprogress": [],
  "review": [],
  "done": []
};

const columns = [
  { key: "todo", title: "To Do", bg: "bg-gray-50", accent: "bg-gray-400" },
  { key: "inprogress", title: "In Progress", bg: "bg-blue-50", accent: "bg-blue-500" },
  { key: "review", title: "In Review", bg: "bg-amber-50", accent: "bg-amber-500" },
  { key: "done", title: "Done", bg: "bg-emerald-50", accent: "bg-emerald-500" }
];

export default function SprintsView() {
  const [sprints, setSprints] = useState(initialSprintList);
  const [activeSprint, setActiveSprint] = useState("");
  const [tasks, setTasks] = useState(initialTasks);
  const [viewMode, setViewMode] = useState("board");
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isCompleteSprintModalOpen, setIsCompleteSprintModalOpen] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState("All");
  const [targetColumn, setTargetColumn] = useState("todo");
  const [newTaskForm, setNewTaskForm] = useState({ title: "", type: "Feature", points: 3, assignee: "" });
  const [teamMembers, setTeamMembers] = useState<{ id: number, name: string }[]>([]);

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      const headers = { "Authorization": `Bearer ${token}` };
      
      Promise.all([
        fetch(`${API_URL}/users`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/sprints`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/tasks`, { headers }).then(r => r.json())
      ]).then(([usersData, sprintsData, tasksData]) => {
        setTeamMembers(usersData);
        if (usersData.length > 0) {
          setNewTaskForm(prev => ({ ...prev, assignee: usersData[0].name }));
        }

        if (sprintsData && sprintsData.length > 0) {
          const formattedSprints = sprintsData.map((s: any) => {
            const start = s.startDate ? new Date(s.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
            const end = s.endDate ? new Date(s.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
            
            const sprintTasks = (tasksData || []).filter((t: any) => t.sprintId === s.id);
            const total = sprintTasks.reduce((acc: number, t: any) => acc + (t.estimatedHours || 0), 0);
            const completed = sprintTasks.filter((t: any) => t.status === 'done').reduce((acc: number, t: any) => acc + (t.estimatedHours || 0), 0);

            return {
              id: s.id.toString(),
              name: s.name,
              status: s.status,
              dates: start && end ? `${start} - ${end}` : 'Unscheduled',
              completed,
              total
            };
          });
          setSprints(formattedSprints);
          setActiveSprint(formattedSprints[0].id);
        }

        if (tasksData && tasksData.length > 0) {
          const newTasksState: Record<string, Task[]> = { todo: [], inprogress: [], review: [], done: [] };
          tasksData.forEach((t: any) => {
            const taskObj: Task = {
              id: t.id.toString(),
              title: t.title,
              type: t.priority || 'Task',
              points: t.estimatedHours || 0,
              assignee: t.assigneeName || 'unassigned'
            };
            const col = t.status || 'todo';
            if (newTasksState[col]) {
              newTasksState[col].push(taskObj);
            }
          });
          setTasks(newTasksState);
        }
      }).catch(console.error);
    }
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    const assignee = teamMembers.find(m => m.name === newTaskForm.assignee);
    const sprintId = activeSprint && !isNaN(Number(activeSprint)) ? Number(activeSprint) : undefined;
    
    fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({
        title: newTaskForm.title,
        priority: newTaskForm.type,
        estimatedHours: Number(newTaskForm.points),
        assigneeId: assignee ? assignee.id : undefined,
        sprintId: sprintId,
        status: targetColumn
      })
    })
    .then(res => res.json())
    .then(savedTask => {
      const newTask: Task = {
        id: savedTask.id ? savedTask.id.toString() : `t${Date.now()}`,
        title: newTaskForm.title,
        type: newTaskForm.type,
        points: Number(newTaskForm.points),
        assignee: newTaskForm.assignee
      };
      
      setTasks(prev => ({
        ...prev,
        [targetColumn]: [...(prev[targetColumn] || []), newTask]
      }));
      setIsAddTaskModalOpen(false);
      setNewTaskForm({ title: "", type: "Feature", points: 3, assignee: teamMembers[0]?.name || "" });
    }).catch(console.error);
  };

  const handleCompleteSprint = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    const sprintId = activeSprint && !isNaN(Number(activeSprint)) ? Number(activeSprint) : null;
    
    setSprints(prev => prev.map(s => {
      if (s.id === activeSprint) return { ...s, status: "completed" };
      return s;
    }));
    setIsCompleteSprintModalOpen(false);

    if (sprintId) {
      fetch(`${API_URL}/sprints/${sprintId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: "completed" })
      }).catch(console.error);
    }
  };

  const moveTask = (taskId: string, sourceCol: string, targetCol: string) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
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

    if (!taskId.startsWith('sprint') && !taskId.startsWith('t') && !isNaN(Number(taskId))) {
      fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: targetCol })
      }).catch(console.error);
    }
  };

  const currentSprintData = sprints.find(s => s.id === activeSprint);
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
          {sprints.map((sprint) => {
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
                    <span>{sprint.status === "active" ? "Actual " : ""}{sprint.completed}/{sprint.total} pts</span>
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
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter size={14} className="text-gray-500" />
              </div>
              <select
                value={filterAssignee}
                onChange={e => setFilterAssignee(e.target.value)}
                className="appearance-none flex items-center gap-1.5 rounded-lg border border-gray-200/80 pl-8 pr-8 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="All">All Assignees</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.name}>{member.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => { setTargetColumn("todo"); setIsAddTaskModalOpen(true); }}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all"
            >
              <Plus size={14} strokeWidth={2.5} />
              Add Task
            </button>
            {currentSprintData?.status === "active" && (
               <button 
                 onClick={() => setIsCompleteSprintModalOpen(true)}
                 className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all ml-1"
               >
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
                    {tasks[col.key]?.filter(t => filterAssignee === "All" || t.assignee === filterAssignee).map(task => (
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
                    
                    <button 
                      onClick={() => { setTargetColumn(col.key); setIsAddTaskModalOpen(true); }}
                      className="w-full py-1.5 rounded-lg border border-dashed border-gray-300 text-[11px] font-semibold text-gray-500 hover:text-gray-800 hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 mt-1"
                    >
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

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-black tracking-tight text-gray-900">Add New Task</h2>
              <button 
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[14px] text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g. Implement user authentication"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Type</label>
                  <select
                    value={newTaskForm.type}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, type: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[14px] text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Feature">Feature</option>
                    <option value="Bug">Bug</option>
                    <option value="Task">Task</option>
                    <option value="Tech Debt">Tech Debt</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Story Points</label>
                  <input
                    type="number"
                    min="1"
                    max="21"
                    value={newTaskForm.points}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, points: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[14px] text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Assignee</label>
                <select
                  value={newTaskForm.assignee}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, assignee: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[14px] text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {teamMembers.length === 0 ? (
                    <option value="" disabled>Loading team...</option>
                  ) : (
                    teamMembers.map(member => (
                      <option key={member.id} value={member.name}>
                        {member.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-[13px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Complete Sprint Modal */}
      {isCompleteSprintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-gray-900 mb-2">Complete Sprint</h2>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to complete this sprint? Any unfinished tasks will remain in their columns.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsCompleteSprintModalOpen(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors w-full"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSprint}
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors w-full"
              >
                Complete Sprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

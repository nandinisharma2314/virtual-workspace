"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Filter,
  LayoutGrid,
  List,
  Milestone,
  GanttChartSquare,
  X,
  Trash2,
  CheckSquare,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { API_URL, getAuthHeaders, getActiveWorkspaceId } from "@/lib/apis";
import { useWorkspace } from "@/lib/WorkspaceContext";
import Avatar from "./Avatar";
import { motion, AnimatePresence } from "framer-motion";
import GanttChartView from "./boards/GanttChartView";
import CardDetailModal from "./boards/CardDetailModal";

const tabs = [
  { key: "board", label: "Board", icon: LayoutGrid },
  { key: "list", label: "List", icon: List },
  { key: "timeline", label: "Timeline", icon: Milestone },
  { key: "gantt", label: "Gantt", icon: GanttChartSquare },
];

export default function RoadmapBoard({
  board,
  roadmap,
  boardTitle = "Kanban Board",
  bgGradient,
  onBoardUpdated,
}: {
  board?: any;
  roadmap?: any;
  boardTitle?: string;
  bgGradient?: string;
  onBoardUpdated?: () => void;
}) {
  const { currentWorkspace } = useWorkspace();
  const [tab, setTab] = useState("board");
  const [filterQuery, setFilterQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // New list creation
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListAccent, setNewListAccent] = useState("bg-indigo-500");

  // New task creation inside column
  const [addingTaskColId, setAddingTaskColId] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Card detail modal
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  // Workspace members for assignee dropdown
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);

  useEffect(() => {
    const wsId = currentWorkspace?.id || getActiveWorkspaceId();
    if (wsId) {
      fetch(`${API_URL}/workspaces/${wsId}/members`, {
        headers: getAuthHeaders({ "x-workspace-id": String(wsId) }),
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setWorkspaceMembers(data.map((m: any) => ({
              id: m.userId || m.id,
              name: m.name,
              avatar: m.avatar,
              email: m.email,
            })));
          }
        })
        .catch(console.error);
    }
  }, [currentWorkspace?.id]);

  // Lists from backend board
  const lists: any[] = board?.lists || (Array.isArray(roadmap) ? roadmap : null) || [
    { id: 1, title: "To Do", accent: "bg-gray-400", tasks: [] },
    { id: 2, title: "In Progress", accent: "bg-blue-500", tasks: [] },
    { id: 3, title: "In Review", accent: "bg-amber-500", tasks: [] },
    { id: 4, title: "Done", accent: "bg-emerald-500", tasks: [] },
  ];

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !board?.id) return;
    try {
      const res = await fetch(`${API_URL}/boards/${board.id}/lists`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          title: newListTitle.trim(),
          accent: newListAccent,
        }),
      });
      if (res.ok) {
        setNewListTitle("");
        setIsAddingList(false);
        onBoardUpdated?.();
      }
    } catch (e) {
      console.error("Failed to add list:", e);
    }
  };

  const handleDeleteList = async (listId: number) => {
    if (!board?.id) return;
    try {
      await fetch(`${API_URL}/boards/${board.id}/lists/${listId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      onBoardUpdated?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTask = async (list: any) => {
    if (!newTaskTitle.trim() || !board?.id) {
      setAddingTaskColId(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const wsId = currentWorkspace?.id || getActiveWorkspaceId();
      let status = "todo";
      const titleLower = list.title.toLowerCase();
      if (titleLower.includes("done") || titleLower.includes("complete")) status = "completed";
      else if (titleLower.includes("progress")) status = "in_progress";
      else if (titleLower.includes("review")) status = "review";

      await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          status,
          boardId: board.id,
          boardListId: list.id,
          workspaceId: wsId ? Number(wsId) : undefined,
        }),
      });

      setNewTaskTitle("");
      setAddingTaskColId(null);
      onBoardUpdated?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveCard = async (taskId: number, targetListId: number) => {
    if (!board?.id) return;
    try {
      await fetch(`${API_URL}/boards/${board.id}/cards/move`, {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          taskId,
          targetListId,
        }),
      });
      onBoardUpdated?.();
    } catch (e) {
      console.error("Failed to move card:", e);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("text/plain", String(taskId));
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetListId: number) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData("text/plain");
    const taskId = idStr ? Number(idStr) : draggedTaskId;
    if (taskId) {
      handleMoveCard(taskId, targetListId);
    }
    setDraggedTaskId(null);
  };

  // Filter tasks
  const filteredLists = lists.map((list) => {
    const tasks = (list.tasks || []).filter((t: any) => {
      if (!filterQuery) return true;
      const q = filterQuery.toLowerCase();
      return (
        t.title?.toLowerCase().includes(q) ||
        t.issueType?.toLowerCase().includes(q) ||
        t.assigneeName?.toLowerCase().includes(q)
      );
    });
    return {
      ...list,
      tasks,
    };
  });

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm overflow-hidden min-h-0">
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {bgGradient && (
              <div className={`w-4 h-4 rounded-md bg-gradient-to-tr ${bgGradient} shrink-0 shadow-xs`} />
            )}
            <h3 className="text-sm font-black text-gray-900 tracking-tight">{boardTitle}</h3>
          </div>

          <div className="flex items-center gap-0.5 rounded-xl bg-gray-100/80 p-0.5">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    isActive ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Icon size={13} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200/80 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <Filter size={13} className={filterQuery ? "text-indigo-600" : "text-gray-400"} />
              Filter {filterQuery && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5" />}
            </button>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-3 flex flex-col gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search cards..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                  {filterQuery && (
                    <button
                      onClick={() => {
                        setFilterQuery("");
                        setIsFilterOpen(false);
                      }}
                      className="text-xs font-bold text-gray-500 hover:text-rose-500 text-left px-1 transition"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Add Column Button */}
          <button
            onClick={() => setIsAddingList(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 transition"
          >
            <Plus size={14} /> Add Column
          </button>
        </div>
      </div>

      {/* Add Column Popup Form */}
      {isAddingList && (
        <form
          onSubmit={handleAddList}
          className="mb-3 p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center gap-3 shrink-0"
        >
          <input
            type="text"
            autoFocus
            placeholder="New column title (e.g. QA, Backlog, Released)..."
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            className="flex-1 text-xs px-3 py-2 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-xs"
            >
              Add Column
            </button>
            <button
              type="button"
              onClick={() => setIsAddingList(false)}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
        </form>
      )}

      {/* Main Board View */}
      {tab === "board" && (
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden flex gap-4 pb-2">
          {filteredLists.map((list) => (
            <div
              key={list.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, list.id)}
              className="w-80 shrink-0 bg-gray-50/80 rounded-2xl p-3 border border-gray-100 flex flex-col justify-between min-h-0 max-h-full"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 mb-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${list.accent || "bg-gray-400"}`} />
                  <span className="text-xs font-bold text-gray-900">{list.title}</span>
                  <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                    {list.tasks?.length || 0}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="p-1 text-gray-400 hover:text-rose-500 rounded transition"
                  title="Delete column"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Cards Container */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
                <AnimatePresence mode="popLayout">
                  {list.tasks?.map((task: any) => (
                    <motion.div
                      layout
                      key={task.id}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, task.id)}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsCardModalOpen(true);
                      }}
                      className="bg-white rounded-xl p-3 border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group space-y-2.5"
                    >
                      {/* Cover Color Strip */}
                      {task.coverColor && <div className={`h-2 w-full rounded-full ${task.coverColor}`} />}

                      {/* Header tags: Issue Type & Story Points */}
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            task.issueType === "bug"
                              ? "bg-rose-100 text-rose-700"
                              : task.issueType === "story"
                              ? "bg-emerald-100 text-emerald-700"
                              : task.issueType === "epic"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {task.issueType || "task"}
                        </span>

                        {task.storyPoints !== undefined && task.storyPoints !== null && (
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                            {task.storyPoints} pts
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <p className="text-xs font-bold text-gray-800 leading-snug group-hover:text-indigo-600 transition-colors">
                        {task.title}
                      </p>

                      {/* Card Footer: Checklists, Comments, Assignee */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-[11px] text-gray-400">
                        <div className="flex items-center gap-2.5">
                          {task.checklistTotal > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                              <CheckSquare size={12} className={task.checklistCompleted === task.checklistTotal ? "text-emerald-500" : ""} />
                              {task.checklistCompleted}/{task.checklistTotal}
                            </span>
                          )}

                          {task.commentsCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                              <MessageSquare size={12} />
                              {task.commentsCount}
                            </span>
                          )}
                        </div>

                        {task.assigneeName && (
                          <div
                            className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[9px]"
                            title={task.assigneeName}
                          >
                            {task.assigneeName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add Card to Column */}
              {addingTaskColId === list.id ? (
                <div className="mt-2.5 p-2 bg-white rounded-xl border border-indigo-200 shadow-xs space-y-2 shrink-0">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Enter card title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateTask(list);
                      if (e.key === "Escape") setAddingTaskColId(null);
                    }}
                    className="w-full text-xs font-semibold px-2 py-1 outline-none text-gray-800"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAddingTaskColId(null)}
                      className="p-1 text-gray-400 hover:text-gray-700"
                    >
                      <X size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleCreateTask(list)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAddingTaskColId(list.id);
                    setNewTaskTitle("");
                  }}
                  className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition shrink-0"
                >
                  <Plus size={13} /> Add Card
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* List, Timeline, and Gantt alternative tabs */}
      {tab === "list" && (
        <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50/50 rounded-2xl p-4 space-y-4">
          {filteredLists.map((list) => (
            <div key={list.id} className="space-y-2">
              <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${list.accent}`} /> {list.title} (
                {list.tasks?.length || 0})
              </h4>
              <div className="space-y-1.5">
                {list.tasks?.map((task: any) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setIsCardModalOpen(true);
                    }}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200/80 hover:border-indigo-300 transition cursor-pointer"
                  >
                    <span className="text-xs font-bold text-gray-800">{task.title}</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {task.issueType || "task"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "timeline" && (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-gray-50/30 rounded-2xl">
          <div className="relative border-l-2 border-indigo-200 ml-4 space-y-4">
            {filteredLists
              .flatMap((l) => l.tasks || [])
              .map((task: any, idx: number) => (
                <div key={task.id || idx} className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-indigo-600 rounded-full border-2 border-white -left-[7px] top-1.5" />
                  <div
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setIsCardModalOpen(true);
                    }}
                    className="p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-300 shadow-2xs transition cursor-pointer"
                  >
                    <span className="text-xs font-bold text-gray-800">{task.title}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {tab === "gantt" && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <GanttChartView
            columns={filteredLists}
            boardTitle={boardTitle}
            onStatusChange={(task, cur, target) => {
              const targetList = lists.find((l) => l.title.toLowerCase().includes(target));
              if (targetList) handleMoveCard(task.id, targetList.id);
            }}
            onAddTask={(status, title) => {}}
          />
        </div>
      )}

      {/* Card Detail Modal */}
      <CardDetailModal
        taskId={selectedTaskId}
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onTaskUpdated={() => {
          onBoardUpdated?.();
        }}
        workspaceMembers={workspaceMembers}
        lists={lists.map((l) => ({ id: l.id, title: l.title }))}
      />
    </div>
  );
}

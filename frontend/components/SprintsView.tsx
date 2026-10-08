"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Play,
  CheckCircle2,
  Zap,
  LayoutGrid,
  List as ListIcon,
  AlertCircle,
  Clock,
  X,
  Calendar as CalendarIcon,
  Target,
  ArrowRight,
  ChevronDown,
  Layers,
  Sparkles,
  Bookmark,
} from "lucide-react";
import Avatar from "./Avatar";
import { API_URL, getAuthHeaders, getActiveWorkspaceId } from "@/lib/apis";
import { useWorkspace } from "@/lib/WorkspaceContext";
import CardDetailModal from "./boards/CardDetailModal";
import { motion, AnimatePresence } from "framer-motion";

function normalizeStatus(status?: string): string {
  if (!status) return "todo";
  const s = status.toLowerCase().trim();
  if (s === "inprogress" || s === "in_progress" || s === "in-progress") return "in_progress";
  if (s === "done" || s === "completed") return "completed";
  if (s === "review" || s === "in_review") return "review";
  return "todo";
}

const columns = [
  { key: "todo", title: "To Do", bg: "bg-gray-50", accent: "bg-gray-400" },
  { key: "in_progress", title: "In Progress", bg: "bg-blue-50", accent: "bg-blue-500" },
  { key: "review", title: "In Review", bg: "bg-amber-50", accent: "bg-amber-500" },
  { key: "completed", title: "Done", bg: "bg-emerald-50", accent: "bg-emerald-500" },
];

export default function SprintsView() {
  const { currentWorkspace, can } = useWorkspace();
  const canManageSprints = Boolean(currentWorkspace?.isOwner) || can("sprints:manage");
  const canCreateTask = Boolean(currentWorkspace?.isOwner) || can("tasks:create");

  const [sprints, setSprints] = useState<any[]>([]);
  const [activeSprintId, setActiveSprintId] = useState<string>("");
  const [workspaceTasks, setWorkspaceTasks] = useState<any[]>([]);
  const [backlogTasks, setBacklogTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"board" | "backlog">("board");

  // Modals
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false);
  const [isStartSprintModalOpen, setIsStartSprintModalOpen] = useState(false);
  const [isCompleteSprintModalOpen, setIsCompleteSprintModalOpen] = useState(false);
  const [sprintToStart, setSprintToStart] = useState<any>(null);

  // Forms
  const [newSprintName, setNewSprintName] = useState("");
  const [newSprintGoal, setNewSprintGoal] = useState("");
  const [startSprintGoal, setStartSprintGoal] = useState("");
  const [startSprintDuration, setStartSprintDuration] = useState("2 weeks");
  const [startSprintStartDate, setStartSprintStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [startSprintEndDate, setStartSprintEndDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [completeSprintRollover, setCompleteSprintRollover] = useState<string>("backlog");

  // Quick Issue Creation
  const [quickTitle, setQuickTitle] = useState("");
  const [quickSprintTarget, setQuickSprintTarget] = useState<string | null>(null);

  // Card modal
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Team members
  const [teamMembers, setTeamMembers] = useState<{ id: number; name: string; avatar?: string; email: string }[]>([]);

  const loadSprintsAndTasks = useCallback(async () => {
    const wsId = currentWorkspace?.id || getActiveWorkspaceId();
    if (!wsId) return;
    const headers = getAuthHeaders({ "x-workspace-id": String(wsId) });

    try {
      const [membersRes, sprintsRes, tasksRes, backlogRes] = await Promise.all([
        fetch(`${API_URL}/workspaces/${wsId}/members`, { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API_URL}/sprints?workspaceId=${wsId}`, { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API_URL}/tasks?workspaceId=${wsId}`, { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API_URL}/sprints/backlog?workspaceId=${wsId}`, { headers }).then((r) => (r.ok ? r.json() : [])),
      ]);

      const normalizedMembers = Array.isArray(membersRes)
        ? membersRes.map((m: any) => ({
            id: m.userId || m.id,
            name: m.name,
            avatar: m.avatar,
            email: m.email,
          }))
        : [];
      setTeamMembers(normalizedMembers);

      if (Array.isArray(sprintsRes)) {
        setSprints(sprintsRes);
        // Find active sprint, or fallback to first planned sprint
        const active = sprintsRes.find((s: any) => s.status === "active") || sprintsRes[0];
        if (active) {
          setActiveSprintId(String(active.id));
        } else {
          setActiveSprintId("");
        }
      }

      if (Array.isArray(tasksRes)) {
        setWorkspaceTasks(tasksRes);
      }

      if (Array.isArray(backlogRes)) {
        setBacklogTasks(backlogRes);
      }
    } catch (e) {
      console.error("Failed to load sprints and tasks:", e);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    loadSprintsAndTasks();
  }, [loadSprintsAndTasks]);

  const activeSprint = sprints.find((s) => String(s.id) === activeSprintId);

  // Filter tasks for active sprint board
  const activeSprintTasks = workspaceTasks.filter(
    (t) => activeSprint && t.sprintId === activeSprint.id
  );

  const boardColumns = columns.map((col) => {
    const tasks = activeSprintTasks.filter((t) => normalizeStatus(t.status) === col.key);
    return {
      ...col,
      tasks,
    };
  });

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;
    try {
      const wsId = currentWorkspace?.id || getActiveWorkspaceId();
      const res = await fetch(`${API_URL}/sprints`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          name: newSprintName.trim(),
          goal: newSprintGoal.trim() || undefined,
          workspaceId: wsId ? Number(wsId) : undefined,
        }),
      });
      if (res.ok) {
        setIsCreateSprintModalOpen(false);
        setNewSprintName("");
        setNewSprintGoal("");
        loadSprintsAndTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintToStart) return;
    try {
      const res = await fetch(`${API_URL}/sprints/${sprintToStart.id}/start`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          startDate: startSprintStartDate,
          endDate: startSprintEndDate,
          goal: startSprintGoal.trim() || sprintToStart.goal,
        }),
      });
      if (res.ok) {
        setIsStartSprintModalOpen(false);
        setSprintToStart(null);
        setActiveTab("board");
        loadSprintsAndTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSprint) return;
    try {
      const rolloverTarget = completeSprintRollover === "backlog" ? undefined : Number(completeSprintRollover);
      const res = await fetch(`${API_URL}/sprints/${activeSprint.id}/complete`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          rolloverToSprintId: rolloverTarget,
        }),
      });
      if (res.ok) {
        setIsCompleteSprintModalOpen(false);
        loadSprintsAndTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignTaskToSprint = async (taskId: number, sprintId: number | null) => {
    try {
      await fetch(`${API_URL}/sprints/${sprintId || 0}/tasks`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          taskIds: [taskId],
        }),
      });
      loadSprintsAndTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickCreateIssue = async (targetSprintId: number | null) => {
    if (!quickTitle.trim()) {
      setQuickSprintTarget(null);
      return;
    }
    try {
      const wsId = currentWorkspace?.id || getActiveWorkspaceId();
      await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          title: quickTitle.trim(),
          sprintId: targetSprintId || undefined,
          workspaceId: wsId ? Number(wsId) : undefined,
          issueType: "story",
          storyPoints: 3,
        }),
      });
      setQuickTitle("");
      setQuickSprintTarget(null);
      loadSprintsAndTasks();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden p-5">
      {/* Top Header: Title, Active Sprint Selector, Tabs, Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 shrink-0 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Zap size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 tracking-tight">Agile Sprints</h2>
              <p className="text-[11px] text-gray-400 font-medium">Jira-style sprint lifecycles & backlog management</p>
            </div>
          </div>

          {/* Primary View Toggle (Board vs Backlog) */}
          <div className="flex items-center bg-gray-100/80 p-0.5 rounded-xl ml-4">
            <button
              onClick={() => setActiveTab("board")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                activeTab === "board" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LayoutGrid size={13} /> Active Sprint Board
            </button>
            <button
              onClick={() => setActiveTab("backlog")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                activeTab === "backlog" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <ListIcon size={13} /> Backlog
            </button>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {canManageSprints && activeTab === "board" && activeSprint?.status === "active" && (
            <button
              onClick={() => setIsCompleteSprintModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <CheckCircle2 size={14} /> Complete Sprint
            </button>
          )}

          {canManageSprints && (
            <button
              onClick={() => setIsCreateSprintModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus size={14} /> Create Sprint
            </button>
          )}
        </div>
      </div>

      {/* View Mode 1: Active Sprint Board */}
      {activeTab === "board" && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Active Sprint Summary Banner */}
          {activeSprint ? (
            <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100/80 rounded-2xl px-4 py-2.5 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-indigo-900">{activeSprint.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    activeSprint.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {activeSprint.status}
                </span>
                {activeSprint.goal && (
                  <span className="text-xs text-gray-500 italic max-w-md truncate">
                    Goal: &quot;{activeSprint.goal}&quot;
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                <span>Total Points: {activeSprint.totalPoints || 0}</span>
                <span>Completed: {activeSprint.completedPoints || 0}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 mb-4">
              <p className="text-sm font-bold text-gray-600">No active sprint running.</p>
              <p className="text-xs text-gray-400 mt-1">Switch to the Backlog tab to start a sprint or create new issues.</p>
            </div>
          )}

          {/* Kanban Columns */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-2">
            {boardColumns.map((col) => (
              <div
                key={col.key}
                className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100 flex flex-col justify-between min-h-0"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 mb-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.accent}`} />
                    <span className="text-xs font-bold text-gray-800">{col.title}</span>
                    <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                      {col.tasks.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
                  {col.tasks.map((task: any) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsCardModalOpen(true);
                      }}
                      className="bg-white rounded-xl p-3 border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            task.issueType === "bug"
                              ? "bg-rose-100 text-rose-700"
                              : task.issueType === "story"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {task.issueType || "story"}
                        </span>
                        {task.storyPoints !== undefined && (
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {task.storyPoints} pts
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-gray-800 leading-snug group-hover:text-indigo-600 transition-colors">
                        {task.title}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-[10px] text-gray-400">
                        <span>#{task.id}</span>
                        {task.assigneeName && (
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[9px]">
                            {task.assigneeName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Mode 2: Jira Backlog View */}
      {activeTab === "backlog" && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-1">
          {/* Sprints List (Planned & Active Sprints) */}
          {sprints.map((sprint) => {
            const sprintTasks = workspaceTasks.filter((t) => t.sprintId === sprint.id);
            const sprintPoints = sprintTasks.reduce(
              (acc, t) => acc + (t.storyPoints || t.estimatedHours || 0),
              0
            );

            return (
              <div key={sprint.id} className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
                {/* Sprint Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-extrabold text-gray-900">{sprint.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sprint.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : sprint.status === "completed"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {sprint.status}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      ({sprintTasks.length} issues · {sprintPoints} points)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {canManageSprints && sprint.status === "planned" && (
                      <button
                        onClick={() => {
                          setSprintToStart(sprint);
                          setStartSprintGoal(sprint.goal || "");
                          setIsStartSprintModalOpen(true);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
                      >
                        <Play size={12} /> Start Sprint
                      </button>
                    )}
                  </div>
                </div>

                {/* Sprint Issues List */}
                <div className="space-y-1.5 border-t border-gray-100 pt-2">
                  {sprintTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTaskId(t.id);
                        setIsCardModalOpen(true);
                      }}
                      className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-indigo-50/50 rounded-xl border border-gray-100 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            t.issueType === "bug"
                              ? "bg-rose-100 text-rose-700"
                              : t.issueType === "story"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {t.issueType || "story"}
                        </span>
                        <span className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {t.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {canManageSprints && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignTaskToSprint(t.id, null);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-gray-400 hover:text-rose-600 transition"
                          >
                            Move to Backlog
                          </button>
                        )}
                        <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                          {t.storyPoints || 0} pts
                        </span>
                        {t.assigneeName && (
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[9px]">
                            {t.assigneeName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Quick Add Issue into this Sprint */}
                  {canCreateTask && (
                    quickSprintTarget === String(sprint.id) ? (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-indigo-200">
                        <input
                          type="text"
                          autoFocus
                          placeholder="What needs to be done?"
                          value={quickTitle}
                          onChange={(e) => setQuickTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleQuickCreateIssue(sprint.id);
                            if (e.key === "Escape") setQuickSprintTarget(null);
                          }}
                          className="flex-1 text-xs px-2 py-1 bg-white rounded-lg border border-gray-200 outline-none"
                        />
                        <button
                          onClick={() => handleQuickCreateIssue(sprint.id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                        >
                          Create
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setQuickSprintTarget(String(sprint.id));
                          setQuickTitle("");
                        }}
                        className="w-full text-left py-2 px-3 text-xs font-bold text-gray-400 hover:text-indigo-600 flex items-center gap-1.5 transition"
                      >
                        <Plus size={13} /> Create issue in {sprint.name}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}

          {/* Backlog Container */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-extrabold text-gray-900">Backlog</h3>
                <span className="text-xs font-bold text-gray-400">
                  ({backlogTasks.length} issues ·{" "}
                  {backlogTasks.reduce((acc, t) => acc + (t.storyPoints || t.estimatedHours || 0), 0)} points)
                </span>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-gray-100 pt-2">
              {backlogTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTaskId(t.id);
                    setIsCardModalOpen(true);
                  }}
                  className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-indigo-50/50 rounded-xl border border-gray-100 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        t.issueType === "bug"
                          ? "bg-rose-100 text-rose-700"
                          : t.issueType === "story"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {t.issueType || "story"}
                    </span>
                    <span className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {t.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Move to Sprint dropdown */}
                    {canManageSprints && sprints.length > 0 && (
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignTaskToSprint(t.id, Number(e.target.value));
                          }
                        }}
                        defaultValue=""
                        className="opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-600 hover:text-indigo-600 transition"
                      >
                        <option value="" disabled>
                          Move to Sprint...
                        </option>
                        {sprints.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                      {t.storyPoints || 0} pts
                    </span>
                  </div>
                </div>
              ))}

              {/* Quick Add Issue into Backlog */}
              {quickSprintTarget === "backlog" ? (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-indigo-200">
                  <input
                    type="text"
                    autoFocus
                    placeholder="What needs to be done in backlog?"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleQuickCreateIssue(null);
                      if (e.key === "Escape") setQuickSprintTarget(null);
                    }}
                    className="flex-1 text-xs px-2 py-1 bg-white rounded-lg border border-gray-200 outline-none"
                  />
                  <button
                    onClick={() => handleQuickCreateIssue(null)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                  >
                    Create
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setQuickSprintTarget("backlog");
                    setQuickTitle("");
                  }}
                  className="w-full text-left py-2 px-3 text-xs font-bold text-gray-400 hover:text-indigo-600 flex items-center gap-1.5 transition"
                >
                  <Plus size={13} /> Create issue in Backlog
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Sprint */}
      {isCreateSprintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateSprint}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900">Create New Sprint</h3>
              <button
                type="button"
                onClick={() => setIsCreateSprintModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Sprint Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sprint 1 - Core Auth & Onboarding"
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Sprint Goal</label>
              <textarea
                placeholder="What is this sprint's key objective?"
                value={newSprintGoal}
                onChange={(e) => setNewSprintGoal(e.target.value)}
                rows={2}
                className="w-full text-xs font-medium px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCreateSprintModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Create Sprint
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Start Sprint */}
      {isStartSprintModalOpen && sprintToStart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleStartSprint}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900">Start Sprint: {sprintToStart.name}</h3>
              <button
                type="button"
                onClick={() => setIsStartSprintModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Sprint Goal</label>
              <textarea
                placeholder="Define this sprint's deliverable goal..."
                value={startSprintGoal}
                onChange={(e) => setStartSprintGoal(e.target.value)}
                rows={2}
                className="w-full text-xs font-medium px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Start Date</label>
                <input
                  type="date"
                  value={startSprintStartDate}
                  onChange={(e) => setStartSprintStartDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">End Date</label>
                <input
                  type="date"
                  value={startSprintEndDate}
                  onChange={(e) => setStartSprintEndDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsStartSprintModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Start Sprint
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Complete Sprint */}
      {isCompleteSprintModalOpen && activeSprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCompleteSprint}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900">Complete Sprint: {activeSprint.name}</h3>
              <button
                type="button"
                onClick={() => setIsCompleteSprintModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              This sprint contains{" "}
              <strong>{activeSprintTasks.filter((t) => normalizeStatus(t.status) === "completed").length}</strong> completed
              issues and{" "}
              <strong>{activeSprintTasks.filter((t) => normalizeStatus(t.status) !== "completed").length}</strong> open
              issues.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Move open issues to:</label>
              <select
                value={completeSprintRollover}
                onChange={(e) => setCompleteSprintRollover(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 outline-none"
              >
                <option value="backlog">Backlog</option>
                {sprints
                  .filter((s) => s.id !== activeSprint.id && s.status === "planned")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCompleteSprintModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Complete Sprint
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Card Detail Modal */}
      <CardDetailModal
        taskId={selectedTaskId}
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onTaskUpdated={() => loadSprintsAndTasks()}
        workspaceMembers={teamMembers}
      />
    </div>
  );
}

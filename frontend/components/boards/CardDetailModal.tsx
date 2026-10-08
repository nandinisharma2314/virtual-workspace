"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  User,
  Tag,
  Clock,
  MessageSquare,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Check,
  Send,
  Layers,
  Flag,
  FileText,
} from "lucide-react";
import { API_URL, getAuthHeaders } from "@/lib/apis";
import { toast } from "@/lib/toast";
import Avatar from "@/components/Avatar";

interface CardDetailModalProps {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
  workspaceMembers?: { id: number; name: string; avatar?: string; email: string }[];
  lists?: { id: number; title: string }[];
}

const ISSUE_TYPES = [
  { value: "task", label: "Task", color: "bg-blue-500", text: "text-blue-700" },
  { value: "story", label: "Story", color: "bg-emerald-500", text: "text-emerald-700" },
  { value: "bug", label: "Bug", color: "bg-rose-500", text: "text-rose-700" },
  { value: "epic", label: "Epic", color: "bg-purple-500", text: "text-purple-700" },
];

const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21];

const COVER_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-amber-500",
  "bg-rose-500",
  "bg-purple-600",
  "bg-indigo-600",
  "bg-slate-700",
];

export default function CardDetailModal({
  taskId,
  isOpen,
  onClose,
  onTaskUpdated,
  workspaceMembers = [],
  lists = [],
}: CardDetailModalProps) {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [issueType, setIssueType] = useState("task");
  const [storyPoints, setStoryPoints] = useState<number | null>(null);
  const [coverColor, setCoverColor] = useState<string | null>(null);
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<string>("");

  // Checklists and comments
  const [checklists, setChecklists] = useState<any[]>([]);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [newItemText, setNewItemText] = useState<Record<number, string>>({});

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}/full`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTask(data);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setStatus(data.status || "todo");
        setPriority(data.priority || "medium");
        setIssueType(data.issueType || "task");
        setStoryPoints(data.storyPoints || null);
        setCoverColor(data.coverColor || null);
        setAssigneeId(data.assigneeId || null);
        setDueDate(data.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : "");
        setChecklists(data.checklists || []);
        setComments(data.comments || []);
        setActivities(data.activities || []);
      }
    } catch (e) {
      console.error("Failed to load task details:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId]);

  if (!isOpen || !taskId) return null;

  const handleSaveField = async (fieldsToUpdate: Record<string, any>) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(fieldsToUpdate),
      });
      if (res.ok) {
        onTaskUpdated?.();
      }
    } catch (e) {
      console.error("Failed to update task:", e);
    }
  };

  const handleAddChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}/checklists`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ title: newChecklistTitle.trim() }),
      });
      if (res.ok) {
        const cl = await res.json();
        setChecklists((prev) => [...prev, cl]);
        setNewChecklistTitle("");
        setAddingChecklist(false);
        onTaskUpdated?.();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddChecklistItem = async (clId: number) => {
    const text = newItemText[clId];
    if (!text || !text.trim()) return;
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}/checklists/${clId}/items`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ title: text.trim() }),
      });
      if (res.ok) {
        const item = await res.json();
        setChecklists((prev) =>
          prev.map((cl) => (cl.id === clId ? { ...cl, items: [...(cl.items || []), item] } : cl))
        );
        setNewItemText((prev) => ({ ...prev, [clId]: "" }));
        onTaskUpdated?.();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleItem = async (clId: number, itemId: number, currentCompleted: boolean) => {
    try {
      const nextCompleted = !currentCompleted;
      setChecklists((prev) =>
        prev.map((cl) =>
          cl.id === clId
            ? {
                ...cl,
                items: cl.items.map((i: any) =>
                  i.id === itemId ? { ...i, isCompleted: nextCompleted } : i
                ),
              }
            : cl
        )
      );

      await fetch(`${API_URL}/tasks/${taskId}/checklists/${clId}/items/${itemId}`, {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ isCompleted: nextCompleted }),
      });
      onTaskUpdated?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (clId: number, itemId: number) => {
    try {
      setChecklists((prev) =>
        prev.map((cl) =>
          cl.id === clId
            ? { ...cl, items: cl.items.filter((i: any) => i.id !== itemId) }
            : cl
        )
      );
      await fetch(`${API_URL}/tasks/${taskId}/checklists/${clId}/items/${itemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      onTaskUpdated?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteChecklist = async (clId: number) => {
    try {
      setChecklists((prev) => prev.filter((cl) => cl.id !== clId));
      await fetch(`${API_URL}/tasks/${taskId}/checklists/${clId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      onTaskUpdated?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [comment, ...prev]);
        setNewComment("");
        onTaskUpdated?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Cover Banner */}
        {coverColor && <div className={`h-16 w-full ${coverColor} shrink-0 transition-colors duration-300`} />}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider text-white ${
                ISSUE_TYPES.find((t) => t.value === issueType)?.color || "bg-blue-500"
              }`}
            >
              {issueType}
            </span>
            <span className="text-xs text-gray-400 font-medium">#{taskId}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-7 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details, Checklists, Comments */}
          <div className="lg:col-span-2 space-y-7">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleSaveField({ title })}
                className="w-full text-xl font-bold text-gray-900 border-none hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl px-3 py-1.5 transition-all outline-none"
                placeholder="Card title..."
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} /> Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleSaveField({ description })}
                rows={3}
                placeholder="Add more detailed notes or requirements..."
                className="w-full text-sm text-gray-700 bg-gray-50 hover:bg-gray-100/70 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-2xl p-4 border border-transparent focus:border-indigo-400 outline-none transition-all resize-y"
              />
            </div>

            {/* Checklists Section */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare size={14} /> Checklists
                </label>
                {!addingChecklist && (
                  <button
                    onClick={() => setAddingChecklist(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Checklist
                  </button>
                )}
              </div>

              {addingChecklist && (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
                  <input
                    type="text"
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    placeholder="Checklist title (e.g. Acceptance Criteria)"
                    className="w-full text-sm px-3 py-2 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddChecklist}
                      className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      Create Checklist
                    </button>
                    <button
                      onClick={() => setAddingChecklist(false)}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {checklists.map((cl) => {
                const total = cl.items?.length || 0;
                const completed = cl.items?.filter((i: any) => i.isCompleted).length || 0;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <div key={cl.id} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800">{cl.title}</span>
                      <button
                        onClick={() => handleDeleteChecklist(cl.id)}
                        className="text-gray-400 hover:text-rose-500 transition p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                        <span>{percent}% Completed</span>
                        <span>
                          {completed}/{total}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-1.5 pt-1">
                      {cl.items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between group p-2 hover:bg-white rounded-xl transition"
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={item.isCompleted}
                              onChange={() => handleToggleItem(cl.id, item.id, item.isCompleted)}
                              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                            />
                            <span
                              className={`text-sm truncate ${
                                item.isCompleted ? "line-through text-gray-400" : "text-gray-700"
                              }`}
                            >
                              {item.title}
                            </span>
                          </label>
                          <button
                            onClick={() => handleDeleteItem(cl.id, item.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 p-1 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Item Input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newItemText[cl.id] || ""}
                        onChange={(e) =>
                          setNewItemText((prev) => ({ ...prev, [cl.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddChecklistItem(cl.id);
                        }}
                        placeholder="Add an item..."
                        className="flex-1 text-xs px-3 py-2 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleAddChecklistItem(cl.id)}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comments & Activity Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={14} /> Comments & Activity
              </label>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-md transition"
                >
                  <Send size={14} /> Post
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3 p-3 bg-gray-50/60 rounded-2xl border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {c.userName?.slice(0, 2).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{c.userName}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Properties Sidebar */}
          <div className="space-y-6 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  handleSaveField({ status: e.target.value });
                }}
                className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-xl border border-gray-200 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Done</option>
              </select>
            </div>

            {/* Issue Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Issue Type</label>
              <select
                value={issueType}
                onChange={(e) => {
                  setIssueType(e.target.value);
                  handleSaveField({ issueType: e.target.value });
                }}
                className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-xl border border-gray-200 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ISSUE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Story Points */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Story Points</label>
              <div className="flex flex-wrap gap-1.5">
                {STORY_POINTS.map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => {
                      const nextPts = storyPoints === pts ? null : pts;
                      setStoryPoints(nextPts);
                      handleSaveField({ storyPoints: nextPts });
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                      storyPoints === pts
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {pts}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assignee</label>
              <select
                value={assigneeId || ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  setAssigneeId(val);
                  handleSaveField({ assigneeId: val });
                }}
                className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-xl border border-gray-200 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                {workspaceMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Priority</label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  handleSaveField({ priority: e.target.value });
                }}
                className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-xl border border-gray-200 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  handleSaveField({ dueDate: e.target.value || null });
                }}
                className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-xl border border-gray-200 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Card Cover Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Card Cover</label>
              <div className="flex flex-wrap gap-2">
                {COVER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      const nextColor = coverColor === color ? null : color;
                      setCoverColor(nextColor);
                      handleSaveField({ coverColor: nextColor });
                    }}
                    className={`w-6 h-6 rounded-full ${color} transition transform hover:scale-110 flex items-center justify-center text-white ${
                      coverColor === color ? "ring-2 ring-offset-2 ring-indigo-500" : ""
                    }`}
                  >
                    {coverColor === color && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

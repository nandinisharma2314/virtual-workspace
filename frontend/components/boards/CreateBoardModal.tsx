"use client";

import React, { useState } from "react";
import {
  X,
  Layout,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export interface CustomBoard {
  id: string;
  title: string;
  workspace: string;
  visibility: "workspace" | "private" | "public";
  bgGradient: string;
  templateId?: string;
  createdAt: string;
}

export const boardGradients = [
  {
    id: "cosmic-nebula",
    name: "Cosmic Nebula",
    gradient: "from-indigo-950 via-indigo-800 to-purple-700",
    thumb: "from-indigo-700 to-purple-800",
  },
  {
    id: "sunset-horizon",
    name: "Sunset Horizon",
    gradient: "from-rose-600 via-orange-500 to-amber-400",
    thumb: "from-rose-500 to-amber-400",
  },
  {
    id: "deep-oceanic",
    name: "Deep Oceanic",
    gradient: "from-slate-900 via-blue-900 to-cyan-700",
    thumb: "from-blue-700 to-cyan-600",
  },
  {
    id: "emerald-forest",
    name: "Emerald Forest",
    gradient: "from-emerald-900 via-teal-800 to-green-600",
    thumb: "from-emerald-700 to-teal-600",
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    gradient: "from-purple-900 via-violet-700 to-pink-600",
    thumb: "from-purple-700 to-pink-600",
  },
  {
    id: "midnight-slate",
    name: "Midnight Slate",
    gradient: "from-slate-900 via-slate-800 to-indigo-950",
    thumb: "from-slate-800 to-indigo-900",
  },
];

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardCreated?: (board: CustomBoard) => void;
  defaultWorkspace?: string;
}

export default function CreateBoardModal({
  isOpen,
  onClose,
  onBoardCreated,
  defaultWorkspace = "Acme Inc.",
}: CreateBoardModalProps) {
  const router = useRouter();
  const [boardTitle, setBoardTitle] = useState("");
  const [selectedBg, setSelectedBg] = useState(boardGradients[0]);
  const [visibility, setVisibility] = useState<"workspace" | "private" | "public">("workspace");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("blank");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardTitle.trim()) {
      setShowValidation(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const newBoard: CustomBoard = {
        id: `board-${Date.now()}`,
        title: boardTitle.trim(),
        workspace: defaultWorkspace,
        visibility,
        bgGradient: selectedBg.gradient,
        templateId: selectedTemplate === "blank" ? undefined : selectedTemplate,
        createdAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        // Save to custom boards list
        const existingRaw = localStorage.getItem("custom_workspace_boards");
        const existing: CustomBoard[] = existingRaw ? JSON.parse(existingRaw) : [];
        const updated = [newBoard, ...existing];
        localStorage.setItem("custom_workspace_boards", JSON.stringify(updated));

        // Set active board configuration
        localStorage.setItem("active_board_id", newBoard.id);
        localStorage.setItem("active_board_title", newBoard.title);
        localStorage.setItem("active_board_bg", newBoard.bgGradient);

        if (newBoard.templateId) {
          localStorage.setItem("active_board_template", newBoard.templateId);
        } else {
          localStorage.removeItem("active_board_template");
        }
      }

      if (onBoardCreated) {
        onBoardCreated(newBoard);
      }

      onClose();
      if (newBoard.templateId) {
        router.push(`/boards?template=${newBoard.templateId}`);
      } else {
        router.push(`/boards?id=${newBoard.id}`);
      }
    } catch (err) {
      console.error("Failed to create board:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-[440px] bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Layout size={17} className="text-indigo-600" />
              <span>Create board</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {/* Live Board Preview (WorkFlow Method) */}
            <div className="flex justify-center pt-1">
              <div
                className={`w-full h-32 rounded-xl bg-gradient-to-r ${selectedBg.gradient} p-3.5 flex flex-col justify-between relative overflow-hidden shadow-sm border border-white/20 select-none transition-all duration-300`}
              >
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between text-white">
                  <span className="font-black text-sm tracking-tight truncate drop-shadow-sm max-w-[280px]">
                    {boardTitle.trim() || "Board title"}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                  </div>
                </div>

                {/* Mini Kanban Columns Preview Graphic */}
                <div className="relative z-10 flex gap-2 h-14 opacity-85">
                  <div className="w-1/3 h-full bg-white/20 backdrop-blur-xs rounded-md p-1 flex flex-col gap-1">
                    <div className="h-1.5 w-12 bg-white/60 rounded-full" />
                    <div className="h-4 bg-white/30 rounded-xs" />
                  </div>
                  <div className="w-1/3 h-full bg-white/20 backdrop-blur-xs rounded-md p-1 flex flex-col gap-1">
                    <div className="h-1.5 w-10 bg-white/60 rounded-full" />
                    <div className="h-4 bg-white/30 rounded-xs" />
                    <div className="h-3 bg-white/20 rounded-xs" />
                  </div>
                  <div className="w-1/3 h-full bg-white/20 backdrop-blur-xs rounded-md p-1 flex flex-col gap-1">
                    <div className="h-1.5 w-8 bg-white/60 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Background Picker */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                Background
              </label>
              <div className="grid grid-cols-6 gap-2">
                {boardGradients.map((bg) => {
                  const isSelected = selectedBg.id === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setSelectedBg(bg)}
                      className={`h-9 rounded-lg bg-gradient-to-r ${bg.gradient} transition-all cursor-pointer flex items-center justify-center relative overflow-hidden ${
                        isSelected
                          ? "ring-2 ring-indigo-600 ring-offset-2 scale-105 shadow-xs"
                          : "opacity-85 hover:opacity-100"
                      }`}
                      title={bg.name}
                    >
                      {isSelected && <Check size={14} className="text-white drop-shadow-sm" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Board Title Input */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                Board title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Q4 Sprint, Launch Planning"
                value={boardTitle}
                onChange={(e) => {
                  setBoardTitle(e.target.value);
                  if (showValidation && e.target.value.trim()) setShowValidation(false);
                }}
                autoFocus
                className={`w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition-all font-medium ${
                  showValidation && !boardTitle.trim()
                    ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                    : "border-gray-200 focus:border-indigo-500"
                }`}
              />
              {showValidation && !boardTitle.trim() && (
                <p className="text-[11px] font-semibold text-rose-500 mt-1">
                  👋 Board title is required
                </p>
              )}
            </div>

            {/* Workspace & Visibility Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                  Workspace
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-bold flex items-center justify-between">
                  <span className="truncate">{defaultWorkspace}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as "workspace" | "private" | "public")}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="workspace">Workspace (Acme Inc.)</option>
                  <option value="private">Private (Only members)</option>
                  <option value="public">Public (Anyone)</option>
                </select>
              </div>
            </div>

            {/* Template Selector (Optional) */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
                <span>Starter Template (Optional)</span>
                <span className="text-[10px] text-gray-400 font-normal">Preloaded columns</span>
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="blank">Blank Kanban Board (Standard)</option>
                <option value="my-tasks">My Tasks Board (Personal Kanban & Town Halls)</option>
                <option value="new-hire">New Hire Onboarding (30-Day Portal & Team)</option>
                <option value="tier-list">Tech Stack Tier List (Ranking Board)</option>
                <option value="feedback-intake">Feedback Intake & Bug Triage</option>
                <option value="sales-deal">Enterprise Sales Deal Pipeline</option>
                <option value="remote-standup">Async Daily Standup & Sync</option>
                <option value="team-learning">Team Academy & Training Hub</option>
              </select>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !boardTitle.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

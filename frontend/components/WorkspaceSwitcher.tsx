"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/lib/WorkspaceContext";
import {
  ChevronDown,
  Check,
  Plus,
  Shield,
  Briefcase,
  Users,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function WorkspaceSwitcher() {
  const {
    workspaces,
    currentWorkspace,
    currentMember,
    setCurrentWorkspaceId,
    createWorkspace,
    can,
  } = useWorkspace();

  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectWorkspace = (id: number) => {
    setCurrentWorkspaceId(id);
    setIsOpen(false);
    toast.success("Switched workspace");
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createWorkspace(newWsName.trim(), newWsDesc.trim() || undefined);
      if (created) {
        toast.success(`Workspace "${created.name}" created!`);
        setIsModalOpen(false);
        setNewWsName("");
        setNewWsDesc("");
        setIsOpen(false);
      } else {
        toast.error("Failed to create workspace");
      }
    } catch (err) {
      toast.error("Error creating workspace");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabel =
    currentMember?.customRoleLabel ||
    currentMember?.roleName ||
    (currentWorkspace?.isOwner ? "Admin" : "Member");

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-gray-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 shadow-2xs hover:border-gray-300 transition-all cursor-pointer group"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-[10px] font-black text-white shadow-xs">
          {currentWorkspace?.name ? currentWorkspace.name[0].toUpperCase() : "W"}
        </span>
        <span className="max-w-[130px] truncate text-gray-900 font-bold">
          {currentWorkspace?.name || "Select Workspace"}
        </span>
        <span className="rounded-md bg-indigo-50 border border-indigo-100/80 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 tracking-tight">
          {roleLabel}
        </span>
        <ChevronDown
          size={13}
          className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-indigo-600" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+8px)] w-72 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Current Workspace Header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Active Workspace
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 truncate">
                {currentWorkspace?.name}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Workspaces List */}
          <div className="my-1.5 max-h-52 overflow-y-auto space-y-0.5">
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
              Your Workspaces ({workspaces.length})
            </div>
            {workspaces.map((ws) => {
              const isSelected = ws.id === currentWorkspace?.id;
              const wsRole =
                ws.currentMember?.customRoleLabel ||
                ws.currentMember?.roleName ||
                (ws.isOwner ? "Admin" : "Member");

              return (
                <button
                  key={ws.id}
                  onClick={() => handleSelectWorkspace(ws.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/80 text-indigo-950 font-bold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {ws.name[0].toUpperCase()}
                    </span>
                    <div className="truncate">
                      <div className="truncate font-semibold text-gray-900">{ws.name}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{wsRole}</div>
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-indigo-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="pt-1.5 border-t border-gray-100 space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/workspaces/settings");
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors cursor-pointer"
            >
              <Shield size={14} className="text-indigo-600" />
              <span>Roles, Permissions & Members</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                setIsModalOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Briefcase size={18} />
                </span>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    Create New Workspace
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    You will be the Workspace Admin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Workspace Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Studio, Alpha Project"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="What is this workspace used for?"
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newWsName.trim()}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

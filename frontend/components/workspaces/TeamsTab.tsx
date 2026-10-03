"use client";

import React, { useState, useEffect } from "react";
import { API_URL, getAuthHeaders } from "@/lib/apis";
import { toast } from "@/lib/toast";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import { useWorkspace } from "@/lib/WorkspaceContext";

interface Team {
  id: number;
  name: string;
  description: string | null;
  workspaceId: number;
  leadId: number | null;
  managerId: number | null;
  createdAt: string;
}

interface WorkspaceMember {
  userId: number;
  name: string;
  email: string;
}

export default function TeamsTab({ members }: { members: WorkspaceMember[] }) {
  const { currentWorkspace, can } = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  const canManageTeams = Boolean(currentWorkspace?.isOwner) || can("teams:manage");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leadId, setLeadId] = useState<number | "">("");
  const [managerId, setManagerId] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTeams = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/teams?workspaceId=${workspaceId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      } else {
        toast.error("Failed to load teams");
      }
    } catch (err) {
      toast.error("Error loading teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [workspaceId]);

  const handleOpenModal = (team?: Team) => {
    if (!canManageTeams) return;
    if (team) {
      setEditingTeam(team);
      setName(team.name);
      setDescription(team.description || "");
      setLeadId(team.leadId || "");
      setManagerId(team.managerId || "");
    } else {
      setEditingTeam(null);
      setName("");
      setDescription("");
      setLeadId("");
      setManagerId("");
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !name.trim() || !canManageTeams) return;

    setIsSubmitting(true);
    try {
      const url = editingTeam
        ? `${API_URL}/teams/${editingTeam.id}`
        : `${API_URL}/teams`;
      const method = editingTeam ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          workspaceId,
          leadId: leadId ? Number(leadId) : null,
          managerId: managerId ? Number(managerId) : null,
        }),
      });

      if (res.ok) {
        toast.success(editingTeam ? "Team updated!" : "Team created!");
        setIsModalOpen(false);
        loadTeams();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save team");
      }
    } catch (err) {
      toast.error("Error saving team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (teamId: number) => {
    if (!canManageTeams) return;
    if (!confirm("Are you sure you want to delete this team?")) return;
    try {
      const res = await fetch(`${API_URL}/teams/${teamId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast.success("Team deleted");
        loadTeams();
      } else {
        toast.error("Failed to delete team");
      }
    } catch (err) {
      toast.error("Error deleting team");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading teams...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-black text-gray-900 tracking-tight">Teams Management</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Create teams, assign leads and managers.
          </p>
        </div>
        {canManageTeams && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Create Team</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team) => {
          const lead = members.find((m) => m.userId === team.leadId);
          const manager = members.find((m) => m.userId === team.managerId);

          return (
            <div
              key={team.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all duration-200"
            >
              <div>
                <h3 className="text-base font-extrabold text-gray-900">{team.name}</h3>
                <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed min-h-[36px]">
                  {team.description || "No description provided."}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-bold">Team Lead:</span>
                    <span className="font-semibold text-gray-800">{lead ? lead.name : "Unassigned"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-bold">Reporting Manager:</span>
                    <span className="font-semibold text-gray-800">{manager ? manager.name : "Unassigned"}</span>
                  </div>
                </div>
              </div>

              {canManageTeams && (
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenModal(team)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Edit Team</span>
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-rose-50"
                    title="Delete team"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900">
                {editingTeam ? "Edit Team" : "Create Team"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="e.g. Frontend Engineering"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="Short description"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Team Lead</label>
                  <select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reporting Manager</label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

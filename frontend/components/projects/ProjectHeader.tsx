"use client";

import { useState, useEffect } from "react";
import Avatar from "@/components/Avatar";
import { API_URL, getAuthHeaders } from "@/lib/apis";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { toast } from "@/lib/toast";
import {
  Star,
  UserPlus,
  MoreHorizontal,
  X,
  Shield,
  Trash2,
  Users,
  Check,
  User,
} from "lucide-react";

interface ProjectMember {
  userId: number;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
}

export default function ProjectHeader({
  projectId,
  activeTab,
  setActiveTab,
  project,
}: {
  projectId?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  project?: any;
}) {
  const { currentWorkspace, can } = useWorkspace();
  const [localProject, setLocalProject] = useState<any>(null);

  // Assign Members Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [selectedRole, setSelectedRole] = useState("Contributor");
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchProjectData = async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setLocalProject(data);
      }
    } catch (err) {
      console.error("Error fetching project data:", err);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  // Load workspace members when assign modal opens
  useEffect(() => {
    if (isAssignModalOpen && currentWorkspace?.id) {
      fetch(`${API_URL}/workspaces/${currentWorkspace.id}/members`, {
        headers: getAuthHeaders(),
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setWorkspaceMembers(data))
        .catch(() => {});
    }
  }, [isAssignModalOpen, currentWorkspace?.id]);

  const currentProject = localProject || project;
  const projectName =
    currentProject?.name || (projectId ? `Project #${projectId}` : "Project Overview");
  const projectDesc =
    currentProject?.description || "Collaborate on tasks, files, and timelines.";
  const projectStatus =
    currentProject?.status === "completed"
      ? "Completed"
      : currentProject?.status === "at_risk"
      ? "At Risk"
      : "Active";

  const assignedMembers: ProjectMember[] = currentProject?.members || [];

  // Handle assigning a member to the project
  const handleAssignMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedUserId) return;

    setIsAssigning(true);
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          userId: Number(selectedUserId),
          role: selectedRole,
        }),
      });

      if (res.ok) {
        toast.success("Member assigned to project!");
        setSelectedUserId("");
        fetchProjectData();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to assign member");
      }
    } catch (err) {
      toast.error("Error assigning member");
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle removing a member from the project
  const handleRemoveMember = async (userId: number, memberName: string) => {
    if (!projectId) return;
    if (!confirm(`Remove ${memberName} from this project?`)) return;

    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        toast.success("Member removed from project");
        fetchProjectData();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to remove member");
      }
    } catch (err) {
      toast.error("Error removing member");
    }
  };

  const canViewReports = Boolean(currentWorkspace?.isOwner) || can("reports:view");
  const tabs = [
    "Overview",
    "Board",
    "List",
    "Timeline",
    "Calendar",
    "Files",
    ...(canViewReports ? ["Reports"] : []),
  ];

  return (
    <div className="shrink-0 border-b border-gray-200/80 bg-white flex flex-col select-none">
      {/* Top Main Section */}
      <div className="px-5 pt-3 pb-1 flex flex-col justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[11.5px] font-semibold text-gray-400 mb-1">
          <span>Projects</span>
          <span>&gt;</span>
          <span className="text-gray-600 font-bold">{projectName}</span>
        </div>

        {/* Title and Right Actions Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-[22px] font-black text-gray-900 tracking-tight leading-none">
              {projectName}
            </h1>
            <button className="text-gray-400 hover:text-amber-500 transition-colors">
              <Star size={18} strokeWidth={2.2} />
            </button>
            <span
              className={`font-black text-[11px] px-2.5 py-0.5 rounded-lg border uppercase tracking-wide ml-1 ${
                projectStatus === "Completed"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200/60"
                  : projectStatus === "At Risk"
                  ? "bg-rose-50 text-rose-600 border-rose-200/60"
                  : "bg-blue-50 text-blue-600 border-blue-200/60"
              }`}
            >
              {projectStatus}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Real Assigned Members Avatars */}
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {assignedMembers.length > 0 ? (
                <>
                  {assignedMembers.slice(0, 5).map((m) => (
                    <div
                      key={m.userId}
                      title={`${m.name} (${m.role})`}
                      className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-[10px] font-bold text-white ring-2 ring-white shadow-2xs"
                    >
                      {m.name ? m.name[0].toUpperCase() : "U"}
                    </div>
                  ))}
                  {assignedMembers.length > 5 && (
                    <span className="flex h-[26px] items-center justify-center rounded-full bg-gray-100 px-2 text-[11px] font-black text-gray-700 ring-2 ring-white shadow-2xs">
                      +{assignedMembers.length - 5}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[11px] text-gray-400 font-medium italic">
                  No members assigned
                </span>
              )}
            </div>

            {/* Share / Assign Button */}
            {can("projects:assign") && (
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-800 px-3.5 py-1.5 text-xs font-extrabold shadow-2xs transition-all ml-1 cursor-pointer"
              >
                <UserPlus size={14} strokeWidth={2.3} />
                <span>Assign Team</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtitle */}
        {projectDesc && (
          <p className="text-[12px] text-gray-500 font-medium mt-1">{projectDesc}</p>
        )}

        {/* Tabs Row */}
        <div className="flex items-center gap-6 mt-3 -mb-px overflow-x-auto [scrollbar-width:none]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-[#2563EB] text-[#2563EB] font-extrabold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ASSIGN PROJECT MEMBERS MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 md:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Users size={18} />
                </span>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    Project Team & Assignments
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Assign workspace managers, supervisors, and employees
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form to Assign New Member */}
            <form onSubmit={handleAssignMember} className="mt-4 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/70 space-y-3">
              <div className="text-xs font-bold text-indigo-950">Add Member to Project:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Select Member
                  </label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                  >
                    <option value="" disabled>
                      Choose workspace member...
                    </option>
                    {workspaceMembers
                      .filter((wm) => !assignedMembers.some((am) => am.userId === wm.userId))
                      .map((wm) => (
                        <option key={wm.userId} value={wm.userId}>
                          {wm.name} ({wm.customRoleLabel || wm.roleName || "Member"})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Project Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                  >
                    <option value="Manager">Project Manager</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Lead Developer">Lead Developer</option>
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="Contributor">Contributor</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isAssigning || !selectedUserId}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isAssigning ? "Assigning..." : "Assign to Project"}
                </button>
              </div>
            </form>

            {/* Currently Assigned List */}
            <div className="mt-5">
              <div className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                Currently Assigned ({assignedMembers.length})
              </div>

              {assignedMembers.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400 italic bg-gray-50 rounded-xl">
                  No members are currently assigned to this project.
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {assignedMembers.map((m) => (
                    <div
                      key={m.userId}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-2.5 hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">
                          {m.name ? m.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{m.name}</div>
                          <div className="text-[10px] text-gray-400">{m.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                          {m.role || "Member"}
                        </span>
                        <button
                          onClick={() => handleRemoveMember(m.userId, m.name)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove from project"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

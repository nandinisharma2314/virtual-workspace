"use client";

import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { API_URL, getAuthHeaders } from "@/lib/apis";
import { toast } from "@/lib/toast";
import {
  Shield,
  Users,
  Mail,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  Lock,
  Sparkles,
  UserCheck,
  Building,
  Key,
  Copy,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import TeamsTab from "@/components/workspaces/TeamsTab";

interface PermissionDef {
  key: string;
  label: string;
  group: "Workspace" | "Members" | "Projects" | "Tasks" | "Collaboration" | "Analytics";
  description?: string;
}

interface WorkspaceRole {
  id: number;
  workspaceId: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
}

interface WorkspaceMember {
  memberId: number;
  userId: number;
  name: string;
  email: string;
  avatar?: string | null;
  department?: string | null;
  status: string;
  joinedAt: string;
  customRoleLabel?: string | null;
  roleId?: number | null;
  roleName?: string | null;
  roleIsSystem?: boolean;
  permissions?: string[];
}

interface WorkspaceInvite {
  id: number;
  email: string;
  token: string;
  roleId: number;
  customRoleLabel?: string | null;
  status: string;
  createdAt: string;
  expiresAt: string;
  roleName?: string | null;
}

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const { currentWorkspace, can, refreshWorkspaces } = useWorkspace();

  const [activeTab, setActiveTab] = useState<"roles" | "members" | "invites" | "teams" | "general">("roles");
  const [loading, setLoading] = useState(true);

  // Data states
  const [permissionsList, setPermissionsList] = useState<PermissionDef[]>([]);
  const [roles, setRoles] = useState<WorkspaceRole[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);

  // Search & Filter
  const [memberSearch, setMemberSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Create Role Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<WorkspaceRole | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);
  const [permissionGroupFilter, setPermissionGroupFilter] = useState<string>("All");

  // Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState<number | "">("");
  const [inviteCustomLabel, setInviteCustomLabel] = useState("");
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  // General Settings state
  const [wsName, setWsName] = useState("");
  const [wsDesc, setWsDesc] = useState("");
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Member editing state
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [memberCustomLabelInput, setMemberCustomLabelInput] = useState("");

  const workspaceId = currentWorkspace?.id;

  // Load Permissions definitions
  useEffect(() => {
    async function loadPermissions() {
      try {
        const res = await fetch(`${API_URL}/workspaces/permissions`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setPermissionsList(data);
        }
      } catch (err) {
        console.error("Failed to load permissions list:", err);
      }
    }
    loadPermissions();
  }, []);

  // Load Workspace Data
  const loadWorkspaceData = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [rolesRes, membersRes, invitesRes] = await Promise.all([
        fetch(`${API_URL}/workspaces/${workspaceId}/roles`, { headers }),
        fetch(`${API_URL}/workspaces/${workspaceId}/members`, { headers }),
        fetch(`${API_URL}/workspaces/${workspaceId}/invites`, { headers }),
      ]);

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvites(invitesData);
      }
    } catch (err) {
      console.error("Failed to load workspace data:", err);
      toast.error("Failed to load workspace data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceData();
      setWsName(currentWorkspace.name || "");
      setWsDesc(currentWorkspace.description || "");
    }
  }, [workspaceId]);

  // Group permissions by group
  const groupedPermissions = useMemo(() => {
    const map: Record<string, PermissionDef[]> = {};
    permissionsList.forEach((p) => {
      if (!map[p.group]) map[p.group] = [];
      map[p.group].push(p);
    });
    return map;
  }, [permissionsList]);

  const permissionGroups = ["All", ...Object.keys(groupedPermissions)];

  // Preset templates for roles
  const handleApplyTemplate = (templateName: string) => {
    if (templateName === "all") {
      setSelectedPermissions(permissionsList.map((p) => p.key));
    } else if (templateName === "clear") {
      setSelectedPermissions([]);
    } else if (templateName === "supervisor") {
      setSelectedPermissions([
        "projects:read_all",
        "projects:assign",
        "tasks:create",
        "tasks:read_all",
        "tasks:edit_all",
        "tasks:assign",
        "sprints:manage",
        "channels:create",
        "files:manage",
        "documents:manage",
        "meetings:manage",
        "reports:view",
      ]);
    } else if (templateName === "manager") {
      setSelectedPermissions([
        "members:invite",
        "projects:create",
        "projects:read_all",
        "projects:edit",
        "projects:assign",
        "tasks:create",
        "tasks:read_all",
        "tasks:edit_all",
        "tasks:assign",
        "sprints:manage",
        "teams:manage",
        "channels:create",
        "files:manage",
        "documents:manage",
        "meetings:manage",
        "reports:view",
      ]);
    } else if (templateName === "employee") {
      setSelectedPermissions([
        "projects:read_assigned",
        "tasks:read_assigned",
        "tasks:edit_assigned",
        "files:manage",
        "documents:manage",
      ]);
    }
  };

  // Open Create/Edit Role modal
  const handleOpenRoleModal = (roleToEdit?: WorkspaceRole) => {
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setRoleName(roleToEdit.name);
      setRoleDesc(roleToEdit.description || "");
      setSelectedPermissions(roleToEdit.permissions || []);
    } else {
      setEditingRole(null);
      setRoleName("");
      setRoleDesc("");
      setSelectedPermissions([]);
    }
    setPermissionGroupFilter("All");
    setIsRoleModalOpen(true);
  };

  // Save Role
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !roleName.trim()) return;

    setIsSubmittingRole(true);
    try {
      const url = editingRole
        ? `${API_URL}/workspaces/${workspaceId}/roles/${editingRole.id}`
        : `${API_URL}/workspaces/${workspaceId}/roles`;
      const method = editingRole ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: roleName.trim(),
          description: roleDesc.trim() || undefined,
          permissions: selectedPermissions,
        }),
      });

      if (res.ok) {
        toast.success(editingRole ? "Role updated successfully" : "Custom role created!");
        setIsRoleModalOpen(false);
        loadWorkspaceData();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save role");
      }
    } catch (err) {
      toast.error("Error saving role");
    } finally {
      setIsSubmittingRole(false);
    }
  };

  // Delete Role
  const handleDeleteRole = async (role: WorkspaceRole) => {
    if (!workspaceId) return;
    if (role.isSystem) {
      toast.error("System built-in roles cannot be deleted");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete role "${role.name}"? Members assigned to this role will automatically revert to Normal Employee.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/workspaces/${workspaceId}/roles/${role.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        toast.success("Role deleted successfully");
        loadWorkspaceData();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete role");
      }
    } catch (err) {
      toast.error("Error deleting role");
    }
  };

  // Update Member Role
  const handleUpdateMemberRole = async (targetUserId: number, newRoleId: number) => {
    if (!workspaceId) return;
    try {
      const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members/${targetUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ roleId: newRoleId }),
      });

      if (res.ok) {
        toast.success("Member role updated!");
        loadWorkspaceData();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update member role");
      }
    } catch (err) {
      toast.error("Error updating member role");
    }
  };

  // Save Member Custom Label
  const handleSaveMemberCustomLabel = async (targetUserId: number) => {
    if (!workspaceId) return;
    try {
      const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members/${targetUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ customRoleLabel: memberCustomLabelInput.trim() || undefined }),
      });

      if (res.ok) {
        toast.success("Custom role label updated!");
        setEditingMemberId(null);
        loadWorkspaceData();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update label");
      }
    } catch (err) {
      toast.error("Error updating custom label");
    }
  };

  // Remove Member
  const handleRemoveMember = async (targetUserId: number, memberName: string) => {
    if (!workspaceId) return;
    if (!confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members/${targetUserId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        toast.success("Member removed from workspace");
        loadWorkspaceData();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to remove member");
      }
    } catch (err) {
      toast.error("Error removing member");
    }
  };

  // Open Invite Modal
  const handleOpenInviteModal = () => {
    setInviteEmail("");
    // Default to 'Normal Employee' role
    const defaultEmp = roles.find((r) => r.name === "Normal Employee");
    setInviteRoleId(defaultEmp ? defaultEmp.id : roles[0]?.id || "");
    setInviteCustomLabel("");
    setIsInviteModalOpen(true);
  };

  // Submit Invite
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !inviteEmail.trim() || !inviteRoleId) return;

    setIsSubmittingInvite(true);
    try {
      const res = await fetch(`${API_URL}/workspaces/${workspaceId}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          roleId: Number(inviteRoleId),
          customRoleLabel: inviteCustomLabel.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.autoAccepted) {
          toast.success("Existing user was automatically added to the workspace!");
        } else {
          toast.success("Invitation generated! You can copy the invite link.");
        }
        setIsInviteModalOpen(false);
        loadWorkspaceData();
      } else {
        toast.error(data.message || "Failed to invite member");
      }
    } catch (err) {
      toast.error("Error sending invite");
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // Save General Settings
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !wsName.trim()) return;

    setIsSavingGeneral(true);
    try {
      const res = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: wsName.trim(),
          description: wsDesc.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Workspace updated successfully!");
        refreshWorkspaces();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update workspace");
      }
    } catch (err) {
      toast.error("Error updating workspace");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  // Copy Invite link
  const handleCopyInviteLink = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied to clipboard!");
  };

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.customRoleLabel?.toLowerCase().includes(memberSearch.toLowerCase());
      const matchesRole = roleFilter === "all" || String(m.roleId) === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, memberSearch, roleFilter]);

  if (!currentWorkspace) {
    return (
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
                <Building size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">No Active Workspace</h2>
              <p className="text-sm text-gray-500 mt-2">
                Please create or select a workspace to configure roles, permissions, and members.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-7 text-white shadow-xl mb-8 border border-indigo-900/30">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-2xl font-black text-white shadow-lg ring-4 ring-white/10">
                  {currentWorkspace.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-black tracking-tight text-white">
                      {currentWorkspace.name}
                    </h1>
                    <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                      {currentWorkspace.isOwner ? "Workspace Owner" : "Active Member"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-indigo-200/80 max-w-xl font-medium">
                    {currentWorkspace.description ||
                      "Workspace access control, custom roles, permissions matrix, and team member management."}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/10 self-start md:self-auto">
                <button
                  onClick={() => setActiveTab("roles")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "roles"
                      ? "bg-white text-indigo-950 shadow-md"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Shield size={14} className={activeTab === "roles" ? "text-indigo-600" : ""} />
                  <span>Roles & Permissions</span>
                  <span className="ml-1 rounded-md bg-indigo-100/20 px-1.5 py-0.2 text-[10px]">
                    {roles.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("members")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "members"
                      ? "bg-white text-indigo-950 shadow-md"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Users size={14} className={activeTab === "members" ? "text-indigo-600" : ""} />
                  <span>Members</span>
                  <span className="ml-1 rounded-md bg-indigo-100/20 px-1.5 py-0.2 text-[10px]">
                    {members.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("teams")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "teams"
                      ? "bg-white text-indigo-950 shadow-md"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Building size={14} className={activeTab === "teams" ? "text-indigo-600" : ""} />
                  <span>Teams</span>
                </button>

                <button
                  onClick={() => setActiveTab("invites")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "invites"
                      ? "bg-white text-indigo-950 shadow-md"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Mail size={14} className={activeTab === "invites" ? "text-indigo-600" : ""} />
                  <span>Invitations</span>
                  {invites.length > 0 && (
                    <span className="ml-1 rounded-md bg-amber-400 text-slate-900 px-1.5 py-0.2 text-[10px] font-black">
                      {invites.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("general")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "general"
                      ? "bg-white text-indigo-950 shadow-md"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <SettingsIcon size={14} className={activeTab === "general" ? "text-indigo-600" : ""} />
                  <span>General</span>
                </button>
              </div>
            </div>

            {/* Subtle aesthetic backdrop circles */}
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
          </div>

          {/* TAB 1: ROLES & PERMISSIONS */}
          {activeTab === "roles" && (
            <div className="space-y-6">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
                <div>
                  <h2 className="text-base font-black text-gray-900 tracking-tight">
                    Workspace Roles & Permission Matrices
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Define custom roles, assign specific capability matrices, and manage custom display labels.
                  </p>
                </div>

                <button
                  onClick={() => handleOpenRoleModal()}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer self-start sm:self-auto group"
                >
                  <Plus size={15} className="group-hover:rotate-90 transition-transform" />
                  <span>Create Custom Role</span>
                </button>
              </div>

              {/* Roles Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {roles.map((role) => {
                  const permCount = role.permissions?.length || 0;
                  const isOwnerAdmin = role.name === "Admin";
                  const badgeColor = isOwnerAdmin
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : role.isSystem
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200";

                  return (
                    <div
                      key={role.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span
                            className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${badgeColor}`}
                          >
                            {role.isSystem ? "Built-in System Role" : "Custom Role"}
                          </span>
                          <span className="text-[11px] font-bold text-gray-400">
                            {permCount} {permCount === 1 ? "Permission" : "Permissions"}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {role.name}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed min-h-[36px]">
                          {role.description || "Custom defined role for workspace operations."}
                        </p>

                        {/* Quick preview of key permissions */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Key Capabilities:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions?.slice(0, 4).map((p) => (
                              <span
                                key={p}
                                className="inline-flex items-center rounded-md bg-gray-50 border border-gray-200/70 px-2 py-0.5 text-[10.5px] font-semibold text-gray-700"
                              >
                                {p.replace(":", " → ")}
                              </span>
                            ))}
                            {permCount > 4 && (
                              <span className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                                +{permCount - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <button
                          onClick={() => handleOpenRoleModal(role)}
                          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>{role.isSystem ? "View Matrix" : "Edit Role"}</span>
                        </button>

                        {!role.isSystem && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-rose-50"
                            title="Delete custom role"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: WORKSPACE MEMBERS */}
          {activeTab === "members" && (
            <div className="space-y-6">
              {/* Filter & Action Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search member by name or email..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    {roles.map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleOpenInviteModal}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer self-start md:self-auto"
                >
                  <Mail size={15} />
                  <span>Invite New Member</span>
                </button>
              </div>

              {/* Members Table */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-black uppercase tracking-wider text-gray-400">
                      <th className="py-3 px-5">Member</th>
                      <th className="py-3 px-5">Assigned Role</th>
                      <th className="py-3 px-5">Custom Display Title</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {filteredMembers.map((m) => {
                      const isSelf = m.userId === currentWorkspace.ownerId;
                      const isEditingThis = editingMemberId === m.memberId;

                      return (
                        <tr key={m.memberId} className="hover:bg-gray-50/70 transition-colors">
                          {/* Member info */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-xs font-black text-white shadow-xs">
                                {m.name ? m.name[0].toUpperCase() : "U"}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                  <span>{m.name}</span>
                                  {isSelf && (
                                    <span className="rounded bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.2 text-[9.5px] font-extrabold">
                                      Owner
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-400 font-medium">{m.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role Dropdown */}
                          <td className="py-3.5 px-5">
                            <select
                              value={m.roleId || ""}
                              onChange={(e) => handleUpdateMemberRole(m.userId, Number(e.target.value))}
                              disabled={isSelf}
                              className="rounded-xl border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 transition-all cursor-pointer shadow-2xs"
                            >
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Custom Role Label */}
                          <td className="py-3.5 px-5">
                            {isEditingThis ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={memberCustomLabelInput}
                                  onChange={(e) => setMemberCustomLabelInput(e.target.value)}
                                  placeholder="e.g. Lead Mobile Dev"
                                  className="rounded-lg border border-indigo-300 bg-white px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                  onClick={() => handleSaveMemberCustomLabel(m.userId)}
                                  className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                                  title="Save label"
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  onClick={() => setEditingMemberId(null)}
                                  className="p-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                                  title="Cancel"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group/label">
                                <span className="rounded-md bg-indigo-50/70 border border-indigo-100/70 px-2 py-0.5 text-xs font-semibold text-indigo-800">
                                  {m.customRoleLabel || m.roleName || "Member"}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingMemberId(m.memberId);
                                    setMemberCustomLabelInput(m.customRoleLabel || "");
                                  }}
                                  className="opacity-0 group-hover/label:opacity-100 p-1 text-gray-400 hover:text-indigo-600 transition-opacity cursor-pointer"
                                  title="Edit custom title"
                                >
                                  <Edit3 size={12} />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-5 text-right">
                            {!isSelf && (
                              <button
                                onClick={() => handleRemoveMember(m.userId, m.name)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove member"
                              >
                                <Trash2 size={14} />
                                <span>Remove</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TEAMS */}
          {activeTab === "teams" && (
            <TeamsTab members={members} />
          )}

          {/* TAB 4: INVITATIONS */}
          {activeTab === "invites" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
                <div>
                  <h2 className="text-base font-black text-gray-900 tracking-tight">
                    Pending Workspace Invitations
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Invite new colleagues by email with pre-configured roles and custom titles.
                  </p>
                </div>

                <button
                  onClick={handleOpenInviteModal}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={15} />
                  <span>Send New Invitation</span>
                </button>
              </div>

              {invites.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
                    <Mail size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">No Pending Invitations</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    All invited team members have joined or you have not sent any invites yet.
                  </p>
                  <button
                    onClick={handleOpenInviteModal}
                    className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
                  >
                    Invite Colleague
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-black uppercase tracking-wider text-gray-400">
                        <th className="py-3 px-5">Recipient Email</th>
                        <th className="py-3 px-5">Assigned Role</th>
                        <th className="py-3 px-5">Custom Label</th>
                        <th className="py-3 px-5">Sent Date</th>
                        <th className="py-3 px-5">Status</th>
                        <th className="py-3 px-5 text-right">Invite Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {invites.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-gray-900">{inv.email}</td>
                          <td className="py-3.5 px-5">
                            <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                              {inv.roleName || "Member"}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-gray-600 font-medium">
                            {inv.customRoleLabel || "—"}
                          </td>
                          <td className="py-3.5 px-5 text-gray-400">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                inv.status === "accepted"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => handleCopyInviteLink(inv.token)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
                            >
                              <Copy size={12} className="text-gray-400" />
                              <span>Copy Link</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GENERAL WORKSPACE SETTINGS */}
          {activeTab === "general" && (
            <div className="max-w-2xl bg-white p-7 rounded-3xl border border-gray-200 shadow-2xs">
              <h2 className="text-base font-black text-gray-900 tracking-tight">
                General Workspace Details
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Update the workspace name, slug, and general metadata.
              </p>

              <form onSubmit={handleSaveGeneral} className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Workspace Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Workspace Slug <span className="text-gray-400 font-normal">(Read-only)</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={currentWorkspace.slug}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={wsDesc}
                    onChange={(e) => setWsDesc(e.target.value)}
                    placeholder="Briefly describe this workspace's purpose..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingGeneral || !wsName.trim()}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isSavingGeneral ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT ROLE MODAL WITH PERMISSION MATRIX */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
                  <Shield size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    {editingRole ? `Edit Role: ${editingRole.name}` : "Create Custom Role"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Configure granular capabilities and assign permission checkboxes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="mt-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Role Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingRole?.isSystem}
                    placeholder="e.g. Field Supervisor, QA Lead"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Description <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Brief summary of duties..."
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Template Presets */}
              <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100/70 p-3.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-600" />
                  <span>Quick Templates:</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("all")}
                    className="rounded-lg bg-white border border-indigo-200/80 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("manager")}
                    className="rounded-lg bg-white border border-indigo-200/80 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    Manager Template
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("supervisor")}
                    className="rounded-lg bg-white border border-indigo-200/80 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    Supervisor Template
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("employee")}
                    className="rounded-lg bg-white border border-indigo-200/80 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    Normal Employee Template
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("clear")}
                    className="rounded-lg bg-white border border-gray-200 px-2.5 py-1 text-[11px] font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer shadow-2xs"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Permission Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-gray-100">
                {permissionGroups.map((grp) => (
                  <button
                    type="button"
                    key={grp}
                    onClick={() => setPermissionGroupFilter(grp)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      permissionGroupFilter === grp
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>

              {/* Permissions Matrix Checkbox List */}
              <div className="max-h-72 overflow-y-auto pr-1 space-y-4">
                {Object.entries(groupedPermissions)
                  .filter(
                    ([group]) =>
                      permissionGroupFilter === "All" || permissionGroupFilter === group
                  )
                  .map(([group, perms]) => (
                    <div key={group} className="rounded-2xl border border-gray-200 bg-white p-3.5">
                      <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 mb-2 flex items-center justify-between">
                        <span>{group} Permissions</span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {perms.filter((p) => selectedPermissions.includes(p.key)).length} of{" "}
                          {perms.length} selected
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((p) => {
                          const isChecked = selectedPermissions.includes(p.key);
                          return (
                            <label
                              key={p.key}
                              className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                                isChecked
                                  ? "bg-indigo-50/60 border-indigo-200 text-indigo-950 font-bold"
                                  : "border-gray-100 bg-gray-50/40 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPermissions([...selectedPermissions, p.key]);
                                  } else {
                                    setSelectedPermissions(
                                      selectedPermissions.filter((k) => k !== p.key)
                                    );
                                  }
                                }}
                                className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <div className="text-left">
                                <div className="text-xs">{p.label}</div>
                                {p.description && (
                                  <div className="text-[10px] text-gray-400 font-normal leading-tight mt-0.5">
                                    {p.description}
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500 font-bold">
                  {selectedPermissions.length} permissions assigned to this role
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRole || !roleName.trim()}
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isSubmittingRole ? "Saving..." : "Save Role Matrix"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE MEMBER MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Mail size={18} />
                </span>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    Invite to Workspace
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Grant workspace access with a predefined role
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Colleague Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Assigned Workspace Role <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={inviteRoleId}
                  onChange={(e) => setInviteRoleId(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.isSystem ? "(Built-in)" : "(Custom)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Custom Role Display Label{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Tech Lead, Field Coordinator"
                  value={inviteCustomLabel}
                  onChange={(e) => setInviteCustomLabel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInvite || !inviteEmail.trim() || !inviteRoleId}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmittingInvite ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

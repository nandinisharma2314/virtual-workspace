"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/AdminTopbar";
import { API_URL } from "@/lib/apis";
import { toast } from "@/lib/toast";
import {
  Users,
  Search,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Filter,
  UserCheck,
  UserX,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error("Failed to load user directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        toast.success(`User role updated to ${newRole}`);
      } else {
        toast.error("Failed to update user role.");
      }
    } catch (err) {
      toast.error("Network error while updating user.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus.toLowerCase() === "active" ? "Suspended" : "Active";
    setUpdatingId(userId);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
        );
        toast.info(`User status updated to ${nextStatus}`);
      } else {
        toast.error("Failed to update user status.");
      }
    } catch (err) {
      toast.error("Network error while updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <AdminTopbar title="User Directory & Permissions" subtitle="Assign organizational roles and enforce account access policies" />

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Controls Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name, email, department..."
              className="w-full bg-white border border-gray-200/80 rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200/80 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Sync Users</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-24 flex items-center justify-center text-gray-400 gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm font-semibold">Loading users from PostgreSQL...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Users size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-bold text-gray-700">No users found</p>
              <p className="text-xs text-gray-400 mt-0.5">Try a different search term.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11.5px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => {
                  const isActive = (u.status || "Active").toLowerCase() === "active";
                  const isUpdating = updatingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xs shadow-2xs">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-900 text-xs">{u.name}</p>
                            <p className="text-[11px] text-gray-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-600">
                        {u.department || "General"}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={u.role || "Member"}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          disabled={isUpdating}
                          className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Member">Member</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wide ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {u.status || "Active"}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status || "Active")}
                          disabled={isUpdating}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                            isActive
                              ? "bg-rose-50 hover:bg-rose-100 text-rose-700"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isUpdating ? "Updating..." : isActive ? "Suspend" : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


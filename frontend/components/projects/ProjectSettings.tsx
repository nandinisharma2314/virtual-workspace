"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/apis";
import { toast } from "@/lib/toast";
import { Loader2, AlertTriangle, Save } from "lucide-react";

export default function ProjectSettings({ projectId }: { projectId?: string }) {
  const [activeTab, setActiveTab] = useState("General");
  const settingsTabs = ["General", "Status & Access", "Danger Zone"];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
    fetch(`${API_URL}/projects/${projectId}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setName(data.name || "");
          setDescription(data.description || "");
          setStatus(data.status || "active");
        }
      })
      .catch((err) => {
        console.error("Failed to load project settings:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.info("Select a specific project to modify settings.");
      return;
    }
    if (!name.trim()) {
      toast.warning("Project name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          status: status
        })
      });

      if (res.ok) {
        toast.success("Project settings updated successfully!");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.message || "Failed to update project settings.");
      }
    } catch (err) {
      toast.error("Network error while updating project settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 p-5 bg-[#FAFBFC] overflow-hidden flex select-none gap-8">
      {/* Settings Sidebar */}
      <div className="w-56 shrink-0 flex flex-col">
        <h2 className="text-[14px] font-black text-gray-900 mb-4 px-3">Project Settings</h2>
        <div className="flex-1 overflow-y-auto space-y-0.5">
          {settingsTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2 rounded-xl text-[12.5px] font-bold transition-all ${
                activeTab === tab
                  ? "bg-[#EEE8FF] text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-y-auto">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-gray-400 gap-2">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-sm font-semibold">Loading settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="max-w-2xl p-8">
            <h3 className="text-[16px] font-black text-gray-900 mb-6">{activeTab} Settings</h3>

            {activeTab === "General" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Project Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter project name"
                    className="w-full h-10 rounded-xl border border-gray-200/80 bg-white px-3 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Project Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this project's purpose and scope..."
                    className="w-full rounded-xl border border-gray-200/80 bg-white p-3 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Project Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-10 rounded-xl border border-gray-200/80 bg-white px-3 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all font-medium"
                  >
                    <option value="active">Active (On Track)</option>
                    <option value="in_progress">In Progress</option>
                    <option value="at_risk">At Risk</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-[12.5px] font-extrabold shadow-2xs shadow-indigo-500/20 transition-all flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Status & Access" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Access Scope</label>
                  <div className="border border-gray-200/80 rounded-xl p-4 bg-gray-50/50">
                    <p className="text-[13px] font-bold text-gray-900">Workspace Members</p>
                    <p className="text-[12px] text-gray-500 mt-1">All members with access to this workspace can view and collaborate on this project.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-[12.5px] font-extrabold shadow-2xs shadow-indigo-500/20 transition-all flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Danger Zone" && (
              <div className="space-y-4">
                <div className="border border-rose-200 bg-rose-50/30 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                    <div className="flex-1">
                      <h4 className="text-[13px] font-bold text-rose-900">Delete Project</h4>
                      <p className="text-[12px] text-rose-700 mt-1">
                        Permanently removes this project and its tasks. This action cannot be undone.
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!projectId) return;
                          toast.error("Contact workspace admin to archive or delete this project.");
                        }}
                        className="mt-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-[12px] font-bold transition-all"
                      >
                        Delete this project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

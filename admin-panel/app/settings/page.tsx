"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/AdminTopbar";
import { API_URL } from "@/lib/apis";
import { toast } from "@/lib/toast";
import {
  SlidersHorizontal,
  Building,
  HardDrive,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [workspaceName, setWorkspaceName] = useState("Workspace");
  const [logoInitial, setLogoInitial] = useState("W");
  const [defaultTimezone, setDefaultTimezone] = useState("Asia/Kolkata (GMT+05:30)");
  const [defaultLanguage, setDefaultLanguage] = useState("English (US)");
  const [maxUploadSizeMB, setMaxUploadSizeMB] = useState(25);
  const [allowedExtensions, setAllowedExtensions] = useState("pdf, fig, png, jpg, docx, zip, mp4");

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [newSuggestion, setNewSuggestion] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingSuggestions, setSavingSuggestions] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [resSettings, resSuggestions] = await Promise.all([
          fetch(`${API_URL}/admin/settings`),
          fetch(`${API_URL}/admin/ai-suggestions`),
        ]);

        if (resSettings.ok) {
          const cfg = await resSettings.json();
          if (cfg) {
            setWorkspaceName(cfg.workspaceName || "Workspace");
            setLogoInitial(cfg.logoInitial || "W");
            setDefaultTimezone(cfg.defaultTimezone || "Asia/Kolkata (GMT+05:30)");
            setDefaultLanguage(cfg.defaultLanguage || "English (US)");
            setMaxUploadSizeMB(cfg.maxUploadSizeMB || 25);
            setAllowedExtensions(Array.isArray(cfg.allowedExtensions) ? cfg.allowedExtensions.join(", ") : "pdf, fig, png, jpg, docx, zip");
          }
        }

        if (resSuggestions.ok) {
          const sugg = await resSuggestions.json();
          if (Array.isArray(sugg)) setAiSuggestions(sugg);
        }
      } catch (err) {
        toast.error("Failed to load workspace settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
      const exts = allowedExtensions.split(",").map((s) => s.trim()).filter(Boolean);

      const res = await fetch(`${API_URL}/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          workspaceName: workspaceName.trim(),
          logoInitial: logoInitial.trim().toUpperCase() || "W",
          defaultTimezone,
          defaultLanguage,
          maxUploadSizeMB: Number(maxUploadSizeMB) || 25,
          allowedExtensions: exts,
        }),
      });

      if (res.ok) {
        toast.success("Workspace parameters updated in PostgreSQL!");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (err) {
      toast.error("Network error while updating settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;

    const updated = [...aiSuggestions, newSuggestion.trim()];
    setSavingSuggestions(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
      const res = await fetch(`${API_URL}/admin/ai-suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ suggestions: updated }),
      });

      if (res.ok) {
        setAiSuggestions(updated);
        setNewSuggestion("");
        toast.success("AI suggestion prompt added!");
      } else {
        toast.error("Failed to update AI suggestions.");
      }
    } catch (err) {
      toast.error("Network error saving suggestions.");
    } finally {
      setSavingSuggestions(false);
    }
  };

  const handleDeleteSuggestion = async (indexToDelete: number) => {
    const updated = aiSuggestions.filter((_, i) => i !== indexToDelete);
    setSavingSuggestions(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
      const res = await fetch(`${API_URL}/admin/ai-suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ suggestions: updated }),
      });

      if (res.ok) {
        setAiSuggestions(updated);
        toast.info("Prompt removed.");
      }
    } catch (err) {
      toast.error("Network error removing suggestion.");
    } finally {
      setSavingSuggestions(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <AdminTopbar title="Workspace System Settings" subtitle="Configure organization identity, storage quotas, and assistant prompts" />

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {loading ? (
          <div className="py-24 flex items-center justify-center text-gray-400 gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm font-semibold">Loading system settings...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
            {/* Left Column: Organization & Storage */}
            <form onSubmit={handleSaveSystemSettings} className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">Workspace Identity</h3>
                  <p className="text-[11px] font-medium text-gray-400">Global display branding across all client apps</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Workspace Name</label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Logo Mark</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={logoInitial}
                    onChange={(e) => setLogoInitial(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-black text-center focus:outline-none focus:border-indigo-500 focus:bg-white uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Default Timezone</label>
                  <input
                    type="text"
                    value={defaultTimezone}
                    onChange={(e) => setDefaultTimezone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Language</label>
                  <input
                    type="text"
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <HardDrive size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">File Storage Policies</h3>
                  <p className="text-[11px] font-medium text-gray-400">Cloudflare R2 storage thresholds</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Max Upload File Size (MB)</label>
                <input
                  type="number"
                  min={1}
                  max={250}
                  value={maxUploadSizeMB}
                  onChange={(e) => setMaxUploadSizeMB(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Allowed File Extensions (comma-separated)</label>
                <input
                  type="text"
                  value={allowedExtensions}
                  onChange={(e) => setAllowedExtensions(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {savingSettings ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  <span>{savingSettings ? "Saving Settings..." : "Save Workspace Parameters"}</span>
                </button>
              </div>
            </form>

            {/* Right Column: AI Assistant Prompts */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">AI Assistant Quick Suggestions</h3>
                    <p className="text-[11px] font-medium text-gray-400">Prompts shown to workspace users in the dashboard</p>
                  </div>
                </div>

                <form onSubmit={handleAddSuggestion} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newSuggestion}
                    onChange={(e) => setNewSuggestion(e.target.value)}
                    placeholder="e.g. Find tasks with blocked status"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={savingSuggestions || !newSuggestion.trim()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </form>

                <div className="space-y-2">
                  {aiSuggestions.map((sugg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/60 transition-colors text-xs font-semibold text-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={13} className="text-purple-500 shrink-0" />
                        <span>{sugg}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSuggestion(idx)}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Remove Prompt"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-[11px] text-purple-800 font-medium">
                Changes to prompt suggestions are synchronized live with the main workspace AI assistant card.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/AdminTopbar";
import { API_URL } from "@/lib/apis";
import { toast, confirmDialog } from "@/lib/toast";
import {
  FolderKanban,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Check,
  X,
  Loader2,
  Layers,
  Layout,
  Tag,
} from "lucide-react";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("engineering");
  const [defaultTab, setDefaultTab] = useState("Board");
  const [bannerGradient, setBannerGradient] = useState("from-indigo-600 to-violet-800");
  const [columnsInput, setColumnsInput] = useState("To Do, In Progress, Review, Done");
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const [resTemplates, resCategories] = await Promise.all([
        fetch(`${API_URL}/admin/templates`),
        fetch(`${API_URL}/admin/categories`),
      ]);

      if (resTemplates.ok) {
        const tpls = await resTemplates.json();
        setTemplates(Array.isArray(tpls) ? tpls : []);
      }
      if (resCategories.ok) {
        const cats = await resCategories.json();
        setCategories(Array.isArray(cats) ? cats : []);
      }
    } catch (err) {
      toast.error("Failed to load templates from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("Please enter a template name.");
      return;
    }

    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
      
      const columns = columnsInput
        .split(",")
        .map((c, i) => ({ id: `col-${i + 1}`, title: c.trim(), cards: [] }))
        .filter((c) => c.title.length > 0);

      const payload = {
        name: name.trim(),
        category,
        description: description.trim() || "Custom starter template",
        icon: "layout",
        defaultTab: defaultTab.trim() || "Board",
        bannerGradient,
        templateConfig: {
          boardName: name.trim(),
          bgImage: "/cosmic_board_bg.jpg",
          columns,
        },
      };

      const res = await fetch(`${API_URL}/admin/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Starter template created successfully in PostgreSQL!");
        setIsModalOpen(false);
        fetchTemplates();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.message || "Failed to create template.");
      }
    } catch (err) {
      toast.error("Network error while creating template.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = (id: string, templateName: string) => {
    confirmDialog({
      title: "Delete Starter Template",
      message: `Are you sure you want to delete "${templateName}"? Users will no longer be able to select it when creating channels or boards.`,
      type: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
          const res = await fetch(`${API_URL}/admin/templates/${id}`, {
            method: "DELETE",
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          });
          if (res.ok) {
            toast.success("Template deleted from database.");
            fetchTemplates();
          } else {
            toast.error("Failed to delete template.");
          }
        } catch (err) {
          toast.error("Network error while deleting template.");
        }
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <AdminTopbar title="Channel & Board Templates" subtitle="Configure starter blueprints for project boards and chat spaces" />

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-gray-900">Database Templates Catalog</h2>
            <p className="text-xs text-gray-500 font-medium">Available for all workspace users to bootstrap boards</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTemplates}
              disabled={loading}
              className="p-2 rounded-xl bg-white border border-gray-200/80 text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => {
                setName("");
                setDescription("");
                setCategory("engineering");
                setDefaultTab("Board");
                setBannerGradient("from-indigo-600 to-violet-800");
                setColumnsInput("Backlog, In Progress, Review, Done");
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create Starter Template</span>
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="py-24 flex items-center justify-center text-gray-400 gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm font-semibold">Loading templates from PostgreSQL...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map((tpl) => {
              const columns = tpl.templateConfig?.columns || [];
              return (
                <div
                  key={tpl.id}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div className={`h-24 bg-gradient-to-r ${tpl.bannerGradient || 'from-indigo-600 to-purple-800'} p-4 flex flex-col justify-between text-white relative`}>
                    <span className="bg-black/40 backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded-md self-start uppercase tracking-wider">
                      {tpl.category || "General"}
                    </span>
                    <h3 className="text-sm font-black drop-shadow-xs truncate">{tpl.name}</h3>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {tpl.description}
                    </p>

                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                        Preconfigured Columns ({columns.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {columns.slice(0, 4).map((col: any, idx: number) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-700 text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {col.title}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11.5px]">
                      <span className="text-gray-400 font-medium">Default Tab: <strong className="text-gray-700">{tpl.defaultTab || "Board"}</strong></span>
                      <button
                        onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Template"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FolderKanban size={16} />
                  </div>
                  <h3 className="text-sm font-black text-gray-900">Create Starter Template</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTemplate} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Incident Response War Room"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe how teams should use this blueprint..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Default Stage Columns (comma-separated)</label>
                  <input
                    type="text"
                    value={columnsInput}
                    onChange={(e) => setColumnsInput(e.target.value)}
                    placeholder="e.g. Triaged, Investigation, In Fix, Verified"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Banner Gradient (Tailwind classes)</label>
                  <input
                    type="text"
                    value={bannerGradient}
                    onChange={(e) => setBannerGradient(e.target.value)}
                    placeholder="from-emerald-600 to-cyan-800"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {saving && <Loader2 className="animate-spin" size={13} />}
                    <span>{saving ? "Saving..." : "Save Template"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


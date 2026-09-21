"use client";

import React, { useState, useEffect } from "react";
import AdminTopbar from "@/components/AdminTopbar";
import { API_URL } from "@/lib/apis";
import { toast, confirmDialog } from "@/lib/toast";
import {
  Palette,
  Image as ImageIcon,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Check,
  X,
  Loader2,
  Layers,
} from "lucide-react";

export default function AdminThemesPage() {
  const [activeTab, setActiveTab] = useState<"wallpapers" | "gradients">("wallpapers");
  const [wallpapers, setWallpapers] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"wallpaper" | "gradient">("wallpaper");
  const [name, setName] = useState("");
  const [imageOrGradient, setImageOrGradient] = useState("");
  const [category, setCategory] = useState("Custom");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const [resWallpapers, resThemes] = await Promise.all([
        fetch(`${API_URL}/admin/wallpapers`),
        fetch(`${API_URL}/admin/themes`),
      ]);

      if (resWallpapers.ok) {
        const wp = await resWallpapers.json();
        setWallpapers(Array.isArray(wp) ? wp : []);
      }
      if (resThemes.ok) {
        const th = await resThemes.json();
        setThemes(Array.isArray(th) ? th : []);
      }
    } catch (err) {
      toast.error("Failed to load themes and wallpapers from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleOpenAddModal = (type: "wallpaper" | "gradient") => {
    setModalType(type);
    setName("");
    setImageOrGradient(type === "gradient" ? "from-cyan-500 via-blue-600 to-indigo-700" : "");
    setCategory(type === "gradient" ? "Vibrant" : "Office");
    setDesc("");
    setIsModalOpen(true);
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("Please provide a name.");
      return;
    }
    if (!imageOrGradient.trim()) {
      toast.warning(modalType === "wallpaper" ? "Please provide an image URL." : "Please provide gradient classes.");
      return;
    }

    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
      const endpoint = modalType === "wallpaper" ? `${API_URL}/admin/wallpapers` : `${API_URL}/admin/themes`;
      
      const payload = modalType === "wallpaper"
        ? { name: name.trim(), image: imageOrGradient.trim(), desc: desc.trim(), category: category.trim() }
        : { name: name.trim(), gradient: imageOrGradient.trim(), bgClass: `bg-gradient-to-r ${imageOrGradient.trim()}`, category: category.trim() };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`${modalType === "wallpaper" ? "Wallpaper" : "Theme"} added successfully!`);
        setIsModalOpen(false);
        fetchAssets();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.message || "Failed to save asset.");
      }
    } catch (err) {
      toast.error("Network error while creating asset.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, type: "wallpaper" | "theme", assetName: string) => {
    confirmDialog({
      title: `Delete ${type === "wallpaper" ? "Wallpaper" : "Theme"}`,
      message: `Are you sure you want to delete "${assetName}"? It will no longer be available in the chat wallpaper picker.`,
      type: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
          const endpoint = type === "wallpaper" ? `${API_URL}/admin/wallpapers/${id}` : `${API_URL}/admin/themes/${id}`;
          const res = await fetch(endpoint, {
            method: "DELETE",
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          });
          if (res.ok) {
            toast.success("Asset deleted successfully.");
            fetchAssets();
          } else {
            toast.error("Failed to delete asset.");
          }
        } catch (err) {
          toast.error("Network error while deleting asset.");
        }
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <AdminTopbar title="Chat Themes & Wallpapers" subtitle="Manage dynamic background images and gradient palettes" />

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-200/80 shadow-2xs">
            <button
              onClick={() => setActiveTab("wallpapers")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "wallpapers"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ImageIcon size={15} />
              <span>Photo Wallpapers ({wallpapers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("gradients")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "gradients"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Palette size={15} />
              <span>Gradient Themes ({themes.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAssets}
              disabled={loading}
              className="p-2 rounded-xl bg-white border border-gray-200/80 text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => handleOpenAddModal(activeTab === "wallpapers" ? "wallpaper" : "gradient")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add {activeTab === "wallpapers" ? "Wallpaper" : "Theme"}</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-24 flex items-center justify-center text-gray-400 gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm font-semibold">Loading assets from PostgreSQL...</span>
          </div>
        ) : activeTab === "wallpapers" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {wallpapers.map((wp) => (
              <div
                key={wp.id}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs group flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div className="relative h-36 bg-gray-100 overflow-hidden">
                  <img
                    src={wp.image}
                    alt={wp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {wp.category || "General"}
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="text-xs font-black text-gray-900 truncate">{wp.name}</h3>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{wp.desc || wp.image}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(wp.id, "wallpaper", wp.name)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Wallpaper"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {themes.map((th) => (
              <div
                key={th.id}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs group flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div className={`h-28 bg-gradient-to-r ${th.gradient} p-4 flex flex-col justify-between text-white shadow-inner relative`}>
                  <span className="bg-black/30 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-md self-start">
                    {th.category || "Gradient"}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
                      <Sparkles size={12} />
                    </div>
                    <span className="text-xs font-black drop-shadow-xs">{th.name}</span>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between bg-white">
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="text-xs font-black text-gray-900 truncate">{th.name}</h3>
                    <p className="text-[10px] font-mono text-gray-400 truncate mt-0.5">{th.gradient}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(th.id, "theme", th.name)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Theme"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    {modalType === "wallpaper" ? <ImageIcon size={16} /> : <Palette size={16} />}
                  </div>
                  <h3 className="text-sm font-black text-gray-900">
                    Add New {modalType === "wallpaper" ? "Wallpaper" : "Gradient Theme"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={modalType === "wallpaper" ? "e.g. Nordic Fjords" : "e.g. Aurora Borealis"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {modalType === "wallpaper" ? "Image URL / Path" : "Tailwind Gradient Classes"}
                  </label>
                  <input
                    type="text"
                    value={imageOrGradient}
                    onChange={(e) => setImageOrGradient(e.target.value)}
                    placeholder={modalType === "wallpaper" ? "e.g. https://... or /image_bg.jpg" : "from-violet-600 via-purple-600 to-indigo-800"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Nature, Abstract"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Brief note"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Live Card Preview</label>
                  {modalType === "wallpaper" ? (
                    <div className="h-28 rounded-xl border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {imageOrGradient ? (
                        <img src={imageOrGradient} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-[11px] font-medium">Image preview will appear here</span>
                      )}
                    </div>
                  ) : (
                    <div className={`h-24 rounded-xl bg-gradient-to-r ${imageOrGradient} p-3 flex flex-col justify-between text-white shadow-inner`}>
                      <span className="text-[10px] font-bold bg-black/30 px-2 py-0.5 rounded self-start">Preview</span>
                      <span className="text-xs font-black">{name || "Theme Name"}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
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
                    <span>{saving ? "Saving to DB..." : "Save to Database"}</span>
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


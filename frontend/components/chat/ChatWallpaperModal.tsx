"use client";

import React, { useState } from "react";
import {
  X,
  Check,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Layout,
  Eye,
  RotateCcw,
  ArrowRight,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { channelTemplates, ChannelTemplate } from "@/lib/templateData";
import { BOARD_BACKGROUNDS } from "./templates/MyTasksBoard";
import { channelThemes } from "./CreateChannelModal";

interface ChatWallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  channelName?: string;
  currentBg?: string | null;
  currentTemplateId?: string | null;
  onSelectWallpaper: (bgUrlOrGradient: string, templateId?: string) => void;
  onResetDefault: () => void;
}

export default function ChatWallpaperModal({
  isOpen,
  onClose,
  channelId,
  channelName = "general",
  currentBg,
  currentTemplateId,
  onSelectWallpaper,
  onResetDefault,
}: ChatWallpaperModalProps) {
  const [activeTab, setActiveTab] = useState<"photos" | "templates" | "gradients">("photos");
  const [selectedBg, setSelectedBg] = useState<string>(currentBg || BOARD_BACKGROUNDS[0].image);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(currentTemplateId || undefined);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(35); // 0 to 60%

  if (!isOpen) return null;

  const isGradient = selectedBg.startsWith("from-") || selectedBg.startsWith("bg-");
  const isDefaultWhite = !selectedBg || selectedBg === "white" || selectedBg === "default";

  const handleApply = () => {
    onSelectWallpaper(selectedBg, selectedTemplate);
    onClose();
  };

  const handleSelectPhoto = (photoUrl: string) => {
    setSelectedBg(photoUrl);
    // Find matching template if any
    const matchingTemplate = channelTemplates.find(
      (t) => t.templateConfig?.bgImage === photoUrl
    );
    if (matchingTemplate) {
      setSelectedTemplate(matchingTemplate.id);
    }
  };

  const handleSelectTemplate = (template: ChannelTemplate) => {
    setSelectedTemplate(template.id);
    const bgUrl = template.templateConfig?.bgImage || BOARD_BACKGROUNDS[0].image;
    setSelectedBg(bgUrl);
  };

  const handleSelectGradient = (gradClass: string) => {
    setSelectedBg(gradClass);
    setSelectedTemplate(undefined);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white border border-gray-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FAFBFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs border border-indigo-100">
              <Sparkles size={16} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-[15px] font-black tracking-tight text-gray-900 flex items-center gap-1.5">
                <span>Chat Wallpaper & Templates</span>
                <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  #{channelName.replace(/^#\s*/, "")}
                </span>
              </h2>
              <p className="text-[11.5px] text-gray-500 font-medium">
                Apply photographic board templates or custom themes to your chat background
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div className="shrink-0 px-6 pt-3 pb-2 border-b border-gray-100 flex items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("photos")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "photos"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <ImageIcon size={13} />
              <span>Template Wallpapers ({BOARD_BACKGROUNDS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("templates")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "templates"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Layout size={13} />
              <span>Channel Templates ({channelTemplates.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("gradients")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "gradients"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Palette size={13} />
              <span>Gradients & Solid</span>
            </button>
          </div>

          <button
            onClick={() => {
              onResetDefault();
              setSelectedBg("default");
              setSelectedTemplate(undefined);
            }}
            className="text-[11.5px] font-bold text-gray-500 hover:text-rose-600 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset to default clean white background"
          >
            <RotateCcw size={12} />
            <span>Reset to White</span>
          </button>
        </div>

        {/* Content Body: Split between List & Live Interactive Preview */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left / Top: Selection Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {/* Tab 1: Photographic Wallpapers */}
            {activeTab === "photos" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                    High-Definition Photographic Wallpapers
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Rendered with frosted glass bubbles
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BOARD_BACKGROUNDS.map((bg) => {
                    const isSelected = selectedBg === bg.image;
                    return (
                      <div
                        key={bg.id}
                        onClick={() => handleSelectPhoto(bg.image)}
                        className={`group rounded-2xl overflow-hidden border p-1 transition-all cursor-pointer relative flex flex-col ${
                          isSelected
                            ? "ring-2 ring-indigo-600 border-transparent shadow-lg bg-indigo-50/50"
                            : "border-gray-200 hover:border-indigo-200 hover:shadow-md bg-white"
                        }`}
                      >
                        <div
                          className="h-28 w-full rounded-xl bg-cover bg-center relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.01]"
                          style={{ backgroundImage: `url('${bg.image}')` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}

                          <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                            <span className="text-xs font-black drop-shadow-sm block truncate">
                              {bg.name}
                            </span>
                            <span className="text-[10px] text-white/80 block truncate font-medium">
                              {bg.desc}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Full Channel Templates */}
            {activeTab === "templates" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                    Pre-configured Channel Workflows & Wallpapers
                  </span>
                  <span className="text-[11px] text-indigo-600 font-bold">
                    Sets wallpaper & workflow tabs
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {channelTemplates.map((t) => {
                    const bgThumb = t.templateConfig?.bgImage || BOARD_BACKGROUNDS[0].image;
                    const isSelected = selectedTemplate === t.id;

                    return (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTemplate(t)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs"
                            : "bg-white border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/70"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Mini Background Preview */}
                          <div
                            className="w-14 h-11 rounded-xl overflow-hidden bg-cover bg-center shrink-0 border border-black/10 shadow-xs relative"
                            style={{ backgroundImage: `url('${bgThumb}')` }}
                          >
                            <div className="absolute inset-0 bg-black/20" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-gray-900 truncate">
                                {t.name}
                              </span>
                              {t.badge && (
                                <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold shrink-0">
                                  {t.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">
                              {t.tagline || `${t.tabs?.length || 3} custom tabs included`}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-gray-400 hover:text-indigo-600 flex items-center gap-0.5 shrink-0">
                            Select <ArrowRight size={11} />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Gradients & Colors */}
            {activeTab === "gradients" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                    Minimal Solid Theme
                  </span>
                  <button
                    onClick={() => {
                      setSelectedBg("default");
                      setSelectedTemplate(undefined);
                    }}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isDefaultWhite
                        ? "bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-gray-300 shadow-2xs flex items-center justify-center font-bold text-gray-500 text-xs">
                        Light
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Clean Light (Default)</div>
                        <div className="text-[10.5px] text-gray-500">Pure white background with standard contrast</div>
                      </div>
                    </div>
                    {isDefaultWhite && <Check size={16} className="text-indigo-600 font-black" />}
                  </button>
                </div>

                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                    Vibrant Color Gradients
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {channelThemes.map((theme) => {
                      const isSelected = selectedBg === theme.gradient;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => handleSelectGradient(theme.gradient)}
                          className={`h-16 rounded-xl bg-gradient-to-r ${theme.gradient} p-2 text-left relative overflow-hidden transition-all cursor-pointer flex flex-col justify-end text-white ${
                            isSelected
                              ? "ring-2 ring-indigo-600 ring-offset-2 scale-[1.02] shadow-md"
                              : "opacity-90 hover:opacity-100"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-xs">
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}
                          <span className="text-[11px] font-bold drop-shadow-xs">{theme.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right / Bottom: Live Real-time Chat Simulation Preview */}
          <div className="w-full md:w-[320px] lg:w-[350px] shrink-0 border-t md:border-t-0 md:border-l border-gray-200/80 bg-[#FAFBFC] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Eye size={12} className="text-indigo-600" />
                  Live Chat Preview
                </span>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-200/70 px-1.5 py-0.5 rounded">
                  Instant
                </span>
              </div>

              {/* Mock Chat Viewport */}
              <div
                className="w-full h-[260px] rounded-2xl overflow-hidden border border-gray-200/90 shadow-md relative flex flex-col justify-between p-3 select-none"
                style={
                  !isDefaultWhite
                    ? isGradient
                      ? {}
                      : {
                          backgroundImage: `url('${selectedBg}')`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                    : { backgroundColor: "#ffffff" }
                }
              >
                {isGradient && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedBg}`} />
                )}

                {/* Ambient Overlay to simulate dark contrast filter */}
                {!isDefaultWhite && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity"
                    style={{
                      backgroundColor: `rgba(15, 23, 42, ${overlayOpacity / 100})`,
                    }}
                  />
                )}

                {/* Simulated Channel Header */}
                <div className="relative z-10 flex items-center justify-between px-2 py-1 rounded-lg bg-white/80 backdrop-blur-md border border-white/40 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-gray-900">
                      #{channelName.replace(/^#\s*/, "")}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[9.5px] font-bold text-indigo-700">Preview</span>
                </div>

                {/* Simulated Chat Messages Feed */}
                <div className="relative z-10 space-y-2 my-auto">
                  {/* Message 1 (Incoming) */}
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0 shadow-2xs">
                      A
                    </div>
                    <div className="rounded-xl px-2.5 py-1.5 bg-white/90 backdrop-blur-md shadow-xs border border-white/50 text-[11px] text-gray-800 max-w-[85%] font-medium">
                      <div className="flex items-center gap-1 text-[9.5px] text-gray-400 font-bold mb-0.5">
                        <span>Alex Chen</span>
                        <span>•</span>
                        <span>10:42 AM</span>
                      </div>
                      Hey team, the new workflow templates look awesome! 🚀
                    </div>
                  </div>

                  {/* Message 2 (Outgoing) */}
                  <div className="flex items-start gap-2 justify-end">
                    <div className="rounded-xl px-2.5 py-1.5 bg-indigo-600/90 text-white backdrop-blur-md shadow-xs border border-white/20 text-[11px] max-w-[85%] font-medium">
                      Love this photographic background! High contrast and readable.
                    </div>
                  </div>
                </div>

                {/* Simulated Message Composer */}
                <div className="relative z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-sm text-[10.5px] text-gray-400 font-medium">
                  <span>Type a message...</span>
                </div>
              </div>

              {/* Overlay Opacity Slider (if photographic background) */}
              {!isDefaultWhite && !isGradient && (
                <div className="mt-3 bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Sliders size={12} className="text-indigo-600" />
                      Contrast Overlay
                    </span>
                    <span className="text-gray-500 font-mono text-[10px]">
                      {overlayOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 font-medium mt-1">
                    <span>Brighter photo</span>
                    <span>Higher text contrast</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-gray-200/80 space-y-2">
              <button
                onClick={handleApply}
                className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>Apply to #{channelName.replace(/^#\s*/, "")}</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 px-3 rounded-xl font-bold text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

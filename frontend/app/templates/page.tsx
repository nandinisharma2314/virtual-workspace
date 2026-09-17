"use client";

import React, { useState, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  RefreshCw,
  Search,
  Sparkles,
  ArrowRight,
  FolderKanban,
  Activity,
  Users,
  X,
  ChevronRight,
  Compass,
  Zap,
  Kanban,
  Building2,
  Code2,
  Palette,
  Rocket,
  Globe2,
  GraduationCap,
  Layout,
} from 'lucide-react';
import { channelTemplates, templateCategories, ChannelTemplate } from '@/lib/templateData';
import TemplateModal from "@/components/chat/TemplateModal";

export default function TemplatesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChannelTemplate | null>(null);

  const getCategoryIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'project-management': return <Kanban className={className} strokeWidth={2.2} />;
      case 'business': return <Building2 className={className} strokeWidth={2.2} />;
      case 'engineering': return <Code2 className={className} strokeWidth={2.2} />;
      case 'design': return <Palette className={className} strokeWidth={2.2} />;
      case 'marketing': return <Rocket className={className} strokeWidth={2.2} />;
      case 'remote-work': return <Globe2 className={className} strokeWidth={2.2} />;
      case 'education': return <GraduationCap className={className} strokeWidth={2.2} />;
      default: return <Building2 className={className} strokeWidth={2.2} />;
    }
  };

  // Calculate template count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    templateCategories.forEach(cat => {
      counts[cat.id] = channelTemplates.filter(t => t.category === cat.id).length;
    });
    return counts;
  }, []);

  const filteredTemplates = useMemo(() => {
    return channelTemplates.filter(t => {
      const matchesCategory = !activeCategory || t.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;
      return matchesCategory && (
        t.name.toLowerCase().includes(query) ||
        t.author.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        (t.tagline && t.tagline.toLowerCase().includes(query))
      );
    });
  }, [activeCategory, searchQuery]);

  const activeCategoryObj = templateCategories.find(c => c.id === activeCategory);

  const handleApplyTemplate = (template: ChannelTemplate) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_board_template', template.id);
      localStorage.setItem('active_board_title', template.templateConfig?.boardName || template.name);
      if (template.templateConfig?.columns) {
        localStorage.setItem(`template_${template.id}_columns`, JSON.stringify(template.templateConfig.columns));
      }
      if (template.templateConfig?.boardName) {
        localStorage.setItem(`template_${template.id}_title`, template.templateConfig.boardName);
      }
      if (template.templateConfig?.milestones) {
        localStorage.setItem(`template_${template.id}_milestones`, JSON.stringify(template.templateConfig.milestones));
      }
    }
    setIsModalOpen(false);
    router.push(`/boards?template=${template.id}`);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
      <Sidebar />
      
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Topbar />
        
        {/* WorkFlow Modern Light Workspace Layout */}
        <main className="flex-1 w-full h-full min-h-0 overflow-hidden flex bg-[#FAFBFC]">
          
          {/* ========================================================= */}
          {/* LEFT SUB-SIDEBAR (Clean WorkFlow Light Navigation) */}
          {/* ========================================================= */}
          <div className="w-[240px] sm:w-[250px] bg-white border-r border-gray-200/80 flex flex-col h-full shrink-0 select-none overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden justify-between p-3.5">
            <div className="space-y-4">
              
              {/* Primary Navigation */}
              <nav className="space-y-1">
                <button
                  onClick={() => router.push("/boards")}
                  className="w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors text-left font-semibold text-[13px]"
                >
                  <Layout size={18} className="text-gray-500" />
                  <span>Boards</span>
                </button>

                {/* Templates Active Pill (WorkFlow Purple Theme #EEE8FF with text-indigo-600) */}
                <button
                  onClick={() => setActiveCategory(null)}
                  className="w-full px-3 py-2 bg-[#EEE8FF] text-indigo-600 rounded-xl cursor-pointer flex items-center gap-3 font-extrabold text-[13px] shadow-2xs transition-colors text-left"
                >
                  <FolderKanban size={18} strokeWidth={2.4} />
                  <span>Templates</span>
                </button>

                <button
                  onClick={() => router.push("/workspaces")}
                  className="w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors text-left font-semibold text-[13px]"
                >
                  <Activity size={18} className="text-gray-500" />
                  <span>Home</span>
                </button>
              </nav>

              {/* Categories Navigation Section */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between px-2.5 mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                    Categories
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {channelTemplates.length}
                  </span>
                </div>

                <nav className="space-y-0.5">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`w-full px-2.5 py-2 text-xs rounded-xl cursor-pointer transition-all flex items-center justify-between text-left font-semibold ${
                      activeCategory === null
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/80 shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${activeCategory === null ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Compass size={13} />
                      </div>
                      <span>All Templates</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      activeCategory === null ? 'bg-indigo-100 text-indigo-800' : 'text-gray-400'
                    }`}>
                      {channelTemplates.length}
                    </span>
                  </button>

                  {templateCategories.map(cat => {
                    const count = categoryCounts[cat.id] || 0;
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full px-2.5 py-2 text-xs rounded-xl cursor-pointer transition-all flex items-center justify-between text-left font-semibold group ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/80 shadow-2xs'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${cat.iconGradient} text-white flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105`}>
                            {getCategoryIcon(cat.icon, "w-3.5 h-3.5 text-white")}
                          </div>
                          <span className="truncate max-w-[130px]">{cat.name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-indigo-100 text-indigo-800' : 'text-gray-400 group-hover:text-gray-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Bottom info footer */}
            <div className="pt-3 border-t border-gray-100 px-2 flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-semibold text-gray-600 flex items-center gap-1.5">
                <Zap size={13} className="text-indigo-600" /> WorkFlow Pro
              </span>
              <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                Active
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* MAIN TEMPLATES FEED */}
          {/* ========================================================= */}
          <div className="flex-1 min-w-0 overflow-y-auto px-6 lg:px-8 py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="max-w-6xl mx-auto space-y-7">
              
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/70">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-1.5 shadow-2xs">
                    <Sparkles size={13} />
                    <span>Templates Library</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                    {searchQuery 
                      ? `Search results for "${searchQuery}"`
                      : activeCategoryObj 
                        ? `${activeCategoryObj.name} Templates` 
                        : "Explore Templates"}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Jumpstart your team workflow with pre-configured boards, starter tasks, and custom views.
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-72 md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200/90 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200/60 hidden sm:inline-block">
                      /
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Category Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    activeCategory === null
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200/80 shadow-2xs'
                  }`}
                >
                  All Templates ({channelTemplates.length})
                </button>
                {templateCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200/80 shadow-2xs'
                    }`}
                  >
                    <span>{getCategoryIcon(cat.icon, "w-3 h-3")}</span>
                    <span>{cat.name}</span>
                    <span className={`text-[10px] ${activeCategory === cat.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                      ({categoryCounts[cat.id] || 0})
                    </span>
                  </button>
                ))}
              </div>

              {/* ========================================================= */}
              {/* FEATURED CATEGORY SECTION WITH VIBRANT BACKGROUNDS & ICONS */}
              {/* ========================================================= */}
              {!activeCategory && !searchQuery && (
                <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-white via-white to-gray-50/80 border border-gray-200/80 shadow-xs overflow-hidden">
                  {/* Ambient background glows */}
                  <div className="absolute top-0 right-10 w-96 h-36 bg-gradient-to-l from-indigo-500/10 to-purple-500/0 blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-10 w-80 h-32 bg-gradient-to-r from-blue-500/10 to-teal-500/0 blur-3xl pointer-events-none" />

                  {/* Header Row */}
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-[11px] font-extrabold shadow-2xs">
                          <Sparkles size={11} className="text-indigo-600" />
                          <span>Curated Categories</span>
                        </span>
                      </div>
                      <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
                        Featured Categories
                      </h2>
                      <p className="text-xs text-gray-500">
                        Explore battle-tested boards and frameworks organized by team function
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-gray-200/80 shadow-2xs">
                        7 Specializations
                      </span>
                    </div>
                  </div>

                  {/* 7 Category Cards Grid */}
                  <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5">
                    {templateCategories.map(cat => (
                      <div
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`rounded-2xl border ${cat.borderColor} ${cat.hoverBorderColor} bg-gradient-to-b ${cat.cardBgGradient} p-3.5 sm:p-4 flex flex-col items-center text-center gap-2.5 cursor-pointer shadow-xs hover:shadow-lg ${cat.hoverShadowColor} hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
                      >
                        {/* Top-right soft radial gleam */}
                        <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-white/70 blur-xs pointer-events-none" />

                        {/* Icon Container with glowing multi-layer gradient */}
                        <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${cat.iconGradient} shadow-md ${cat.iconShadow} flex items-center justify-center text-white relative overflow-hidden group-hover:scale-110 group-hover:-rotate-2 transition-all duration-300`}>
                          {/* Glossy top-right bevel */}
                          <div className="absolute top-0 right-0 w-6 h-6 bg-white/30 rounded-bl-2xl pointer-events-none" />
                          {/* Inner radial gradient shine */}
                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
                          {getCategoryIcon(cat.icon, "w-6 h-6 text-white relative z-10 drop-shadow-xs")}
                        </div>

                        {/* Category Name */}
                        <span className={`text-xs font-extrabold text-gray-800 ${cat.hoverTextColor} transition-colors line-clamp-1`}>
                          {cat.name}
                        </span>

                        {/* Template Count Pill */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeStyle} transition-all`}>
                          {categoryCounts[cat.id] || 0} templates
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Templates Feed Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                      <RefreshCw size={15} />
                    </div>
                    <h2 className="text-base font-extrabold text-gray-900">
                      {searchQuery
                        ? `Matches for "${searchQuery}"`
                        : activeCategoryObj
                          ? `${activeCategoryObj.name} Templates`
                          : "New & Notable Templates"}
                    </h2>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
                    </span>
                  </div>

                  {(activeCategory || searchQuery) && (
                    <button
                      onClick={() => {
                        setActiveCategory(null);
                        setSearchQuery('');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors hover:underline flex items-center gap-1"
                    >
                      <span>Show all templates</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>

                {/* Templates Grid */}
                {filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredTemplates.map(template => {
                      const categoryInfo = templateCategories.find(c => c.id === template.category);
                      return (
                        <div
                          key={template.id}
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsModalOpen(true);
                          }}
                          className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden cursor-pointer hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col shadow-xs"
                        >
                          {/* Card Banner */}
                          <div className={`h-36 w-full relative overflow-hidden ${
                            template.bannerGradient 
                              ? `bg-gradient-to-br ${template.bannerGradient}` 
                              : 'bg-gradient-to-br from-indigo-600 to-purple-700'
                          }`}>
                            {template.bannerImage && (
                              <Image 
                                src={template.bannerImage} 
                                alt={template.name} 
                                fill 
                                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" 
                              />
                            )}
                            
                            {/* Gradient overlay for contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                            {/* Floating Category Pill bottom-left */}
                            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-gray-800 shadow-xs border border-white/60 flex items-center gap-1.5 text-xs font-bold">
                              <div className={`w-4 h-4 rounded-md bg-gradient-to-tr ${categoryInfo?.iconGradient || 'from-indigo-600 to-purple-600'} text-white flex items-center justify-center shadow-2xs`}>
                                {getCategoryIcon(categoryInfo?.icon || 'business', "w-2.5 h-2.5 text-white")}
                              </div>
                              <span>{categoryInfo?.name || 'Template'}</span>
                            </div>

                            {/* Badge top-right */}
                            {template.badge && (
                              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white border border-white/20 shadow-xs">
                                {template.badge}
                              </div>
                            )}
                          </div>

                          {/* Card Content */}
                          <div className="p-4 sm:p-5 flex flex-col flex-1">
                            {/* Author Row */}
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-[8px] font-black">
                                W
                              </div>
                              <span className="text-[11px] font-semibold text-gray-400">
                                {template.author}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="font-bold text-gray-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {template.name}
                            </h3>

                            {/* Tagline */}
                            <p className="text-xs text-gray-500 mt-1 mb-3 line-clamp-2 leading-relaxed flex-1">
                              {template.tagline || `Customizable board template by ${template.author}`}
                            </p>

                            {/* Feature Chips */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                                +{template.customTabs?.length || 1} Tabs
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100/80">
                                {template.starterTasks?.length || 4} Tasks
                              </span>
                              {template.templateConfig?.milestones && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/80">
                                  Milestones
                                </span>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                              <div className="flex items-center text-xs text-gray-400 font-medium">
                                <Users size={13} className="mr-1 text-gray-400" />
                                <span>{template.uses} uses</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTemplate(template);
                                    setIsModalOpen(true);
                                  }}
                                  className="text-xs font-bold text-gray-600 hover:text-gray-900 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  Preview
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyTemplate(template);
                                  }}
                                  className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-xl transition-all shadow-xs flex items-center gap-1 group-hover:shadow-indigo-500/20 active:scale-95"
                                >
                                  <span>Apply</span>
                                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty state */
                  <div className="w-full p-12 text-center bg-white rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                      <FolderKanban size={24} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No templates found</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                      {searchQuery
                        ? `No templates matched "${searchQuery}". Try a different keyword or browse all categories.`
                        : "There are currently no templates in this category."}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory(null);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
                    >
                      <RefreshCw size={13} />
                      <span>View all templates</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Interactive Template Preview & Apply Modal */}
      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        channelName="Boards"
        initialTemplateId={selectedTemplate?.id}
        onApply={handleApplyTemplate}
      />
    </div>
  );
}

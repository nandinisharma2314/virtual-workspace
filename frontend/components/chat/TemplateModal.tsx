import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Link2,
  List as ListIcon,
  RefreshCw,
  Search,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Home,
  FolderKanban,
  Users,
  CheckCircle2,
  Kanban,
  Building2,
  Code2,
  Palette,
  Rocket,
  Globe2,
  GraduationCap,
  Layout,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { channelTemplates, ChannelTemplate, templateCategories } from '../../lib/templateData';
import EmptyBoardState from '../boards/EmptyBoardState';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName?: string;
  initialTemplateId?: string;
  onApply?: (template: ChannelTemplate) => void;
}

export default function TemplateModal({
  isOpen,
  onClose,
  channelName = "#new-channel",
  initialTemplateId,
  onApply,
}: TemplateModalProps) {
  const router = useRouter();
  const [view, setView] = useState<'gallery' | 'detail'>(initialTemplateId ? 'detail' : 'gallery');
  const [activeSection, setActiveSection] = useState<'boards' | 'templates'>('templates');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(initialTemplateId || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && initialTemplateId) {
      setSelectedTemplateId(initialTemplateId);
      setView('detail');
    }
  }, [isOpen, initialTemplateId]);

  const selectedTemplate = channelTemplates.find(t => t.id === selectedTemplateId) || channelTemplates[0];

  const filteredTemplates = channelTemplates.filter(t => {
    const matchesCategory = selectedCategory ? t.category === selectedCategory : true;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    return (
      matchesCategory &&
      (t.name.toLowerCase().includes(query) ||
        t.author.toLowerCase().includes(query) ||
        (t.tabs &&
          t.tabs.some(
            tab =>
              tab.headline.toLowerCase().includes(query) ||
              tab.description.toLowerCase().includes(query)
          )) ||
        t.category.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView('gallery');
        setActiveSection('templates');
        setSelectedTemplateId(null);
      }, 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCategoryIcon = (iconName: string, className = "w-4 h-4") => {
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

  const getStepIcon = (iconType: string) => {
    switch (iconType) {
      case 'link': return <Link2 size={18} />;
      case 'list': return <ListIcon size={18} />;
      case 'refresh-cw': return <RefreshCw size={18} />;
      default: return <Link2 size={18} />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`bg-white text-gray-900 rounded-2xl shadow-2xl w-full flex overflow-hidden h-[88vh] relative border border-gray-200/90 animate-in zoom-in-95 duration-200 ${
          view === 'gallery' ? 'max-w-6xl' : 'max-w-5xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors z-30"
          title="Close dialog"
        >
          <X size={18} />
        </button>

        {/* 1. GALLERY VIEW */}
        {view === 'gallery' && (
          <div className="flex w-full h-full">
            {/* Modal Left Sub-sidebar */}
            <div className="w-[240px] sm:w-[250px] bg-gray-50/70 border-r border-gray-200/80 flex flex-col h-full shrink-0 select-none overflow-y-auto p-3.5 justify-between">
              <div className="space-y-4">
                <nav className="space-y-1">
                  <div
                    onClick={() => setActiveSection('boards')}
                    className={`px-3 py-2 rounded-xl cursor-pointer flex items-center gap-3 transition-colors text-xs font-semibold ${
                      activeSection === 'boards'
                        ? 'bg-[#EEE8FF] text-indigo-600 font-extrabold shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Layout size={16} />
                    <span>Your Boards</span>
                  </div>

                  <div
                    onClick={() => setActiveSection('templates')}
                    className={`px-3 py-2 rounded-xl cursor-pointer flex items-center gap-3 transition-colors text-xs font-semibold ${
                      activeSection === 'templates'
                        ? 'bg-[#EEE8FF] text-indigo-600 font-extrabold shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <FolderKanban size={16} />
                    <span>Templates Gallery</span>
                  </div>

                  <div
                    onClick={() => {
                      onClose();
                      router.push('/');
                    }}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl cursor-pointer flex items-center gap-3 text-xs font-semibold transition-colors"
                  >
                    <Home size={16} />
                    <span>Dashboard</span>
                  </div>
                </nav>

                {activeSection === 'templates' && (
                  <div className="pt-3 border-t border-gray-200/60">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-2.5 mb-2 flex items-center justify-between">
                      <span>Categories</span>
                      <span>{channelTemplates.length}</span>
                    </div>
                    <nav className="space-y-0.5">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full px-2.5 py-1.5 text-xs rounded-xl cursor-pointer transition-colors text-left flex items-center justify-between font-semibold ${
                          !selectedCategory
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/80'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <span>All Categories</span>
                        <span className="text-[10px] text-gray-400">{channelTemplates.length}</span>
                      </button>

                      {templateCategories.map(cat => {
                        const isCatActive = selectedCategory === cat.id;
                        const count = channelTemplates.filter(t => t.category === cat.id).length;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`w-full px-2.5 py-1.5 text-xs rounded-xl cursor-pointer transition-colors text-left flex items-center justify-between font-semibold ${
                              isCatActive
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/80'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <span className="truncate max-w-[130px]">{cat.name}</span>
                            <span className="text-[10px] text-gray-400">{count}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200/60 text-[11px] text-gray-400 px-2 flex items-center justify-between">
                <span className="font-semibold text-gray-600 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-indigo-600" /> Quick Add
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                  v2.0
                </span>
              </div>
            </div>

            {/* Modal Main Content */}
            <div className="flex-1 overflow-y-auto bg-[#FAFBFC] p-6 sm:p-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {activeSection === 'boards' ? (
                <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Your Current Boards</h2>
                  </div>
                  <div className="flex-1">
                    <EmptyBoardState
                      onCreateBoard={() => {
                        onClose();
                        router.push('/boards');
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Search and Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200/80">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {searchQuery
                          ? `Search results for "${searchQuery}"`
                          : selectedCategory
                            ? `${templateCategories.find(c => c.id === selectedCategory)?.name} Templates`
                            : "Explore Templates"}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Choose a template to preview its features and apply it to {channelName}.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-8 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category Pills */}
                  {!searchQuery && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                      {templateCategories.map(cat => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 group ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-400 shadow-xs'
                                : `bg-gradient-to-b ${cat.cardBgGradient} ${cat.borderColor} ${cat.hoverBorderColor} hover:shadow-xs`
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${cat.iconGradient} ${cat.iconShadow} shadow-xs flex items-center justify-center text-white relative overflow-hidden group-hover:scale-105 transition-transform`}>
                              <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-white/25 rounded-bl-lg pointer-events-none" />
                              {getCategoryIcon(cat.icon, "w-4 h-4 text-white")}
                            </div>
                            <span className={`text-[11px] font-extrabold text-gray-800 ${cat.hoverTextColor} text-center truncate w-full transition-colors`}>
                              {cat.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Templates List */}
                  {filteredTemplates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTemplates.map(template => {
                        const cat = templateCategories.find(c => c.id === template.category);
                        return (
                          <div
                            key={template.id}
                            className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden flex flex-col shadow-2xs hover:shadow-lg hover:border-indigo-300 transition-all group"
                          >
                            {/* Banner */}
                            <div className={`h-28 w-full relative overflow-hidden ${
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
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                              {/* Floating Category Pill */}
                              <div className="absolute bottom-2 left-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg text-gray-800 shadow-2xs border border-white/60 flex items-center gap-1 text-[10px] font-bold">
                                <span className="text-indigo-600">
                                  {getCategoryIcon(cat?.icon || 'business', "w-3 h-3")}
                                </span>
                                <span>{cat?.name || 'Template'}</span>
                              </div>

                              {template.badge && (
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white border border-white/20">
                                  {template.badge}
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="p-4 flex flex-col flex-1">
                              <h3
                                onClick={() => {
                                  setSelectedTemplateId(template.id);
                                  setView('detail');
                                }}
                                className="font-bold text-gray-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
                              >
                                {template.name}
                              </h3>
                              <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed flex-1">
                                {template.tagline || `by ${template.author}`}
                              </p>

                              {/* Card Footer */}
                              <div className="flex items-center justify-between text-xs text-gray-500 pt-2.5 mt-auto border-t border-gray-100">
                                <div className="flex items-center text-[11px] font-medium text-gray-400">
                                  <Users size={12} className="mr-1" />
                                  <span>{template.uses}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedTemplateId(template.id);
                                      setView('detail');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
                                  >
                                    Preview
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (onApply) onApply(template);
                                      onClose();
                                    }}
                                    className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Sparkles size={11} />
                                    <span>Apply</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500 space-y-2">
                      <Layout size={36} className="mx-auto text-gray-400 opacity-60" />
                      <p className="text-sm font-bold text-gray-800">No templates found</p>
                      <p className="text-xs text-gray-400">There are no templates matching your current filter.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. DETAIL VIEW */}
        {view === 'detail' && (
          <div className="flex flex-col w-full h-full bg-white text-gray-900">
            {/* Header Banner */}
            <div className="h-44 relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 flex flex-col justify-between shrink-0 shadow-xs">
              {/* Overlay pattern */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                }}
              />

              <div className="p-5 relative z-10 flex items-center justify-between">
                <button
                  onClick={() => setView('gallery')}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-1.5 transition-colors flex items-center gap-1.5 text-xs font-bold backdrop-blur-md"
                >
                  <ArrowLeft size={15} />
                  <span>Back to Gallery</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onApply) onApply(selectedTemplate);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl font-extrabold text-indigo-700 bg-white hover:bg-gray-50 shadow-md transition-all text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Sparkles size={13} className="text-indigo-600" />
                    <span>Apply Template (Full Board)</span>
                  </button>
                </div>
              </div>

              <div className="px-8 pb-5 relative z-10">
                <div className="flex items-center gap-2 mb-1 text-white/80 text-xs font-semibold">
                  <span className="bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-md capitalize">
                    {selectedTemplate.category}
                  </span>
                  <span>•</span>
                  <span>{selectedTemplate.uses} active teams</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {selectedTemplate.name}
                </h1>
              </div>
            </div>

            {/* Main Detail Area */}
            <div className="flex-1 overflow-y-auto bg-[#FAFBFC] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-6 sm:p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* 3 Steps / Overview Card */}
                <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-6 space-y-5">
                  <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Interactive Setup & Workflow
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {selectedTemplate.tagline}
                      </p>
                    </div>
                    {selectedTemplate.badge && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {selectedTemplate.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Video / Graphic Preview */}
                    <div className="w-full md:w-1/2 shrink-0">
                      <div className="rounded-xl overflow-hidden shadow-xs border border-gray-200 relative group cursor-pointer aspect-video bg-gray-50 flex items-center justify-center">
                        {selectedTemplate.videoPlaceholder ? (
                          <Image
                            src={selectedTemplate.videoPlaceholder}
                            alt="Video"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${selectedTemplate.bannerGradient || 'from-indigo-600 to-purple-600'} flex items-center justify-center p-6 text-white text-center`}>
                            <div>
                              <Layout size={36} className="mx-auto mb-2 opacity-80" />
                              <span className="font-bold text-sm block">{selectedTemplate.name}</span>
                              <span className="text-xs opacity-75">{selectedTemplate.defaultTab} View</span>
                            </div>
                          </div>
                        )}
                        {/* Play button */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Steps */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center gap-3">
                      {selectedTemplate.steps && selectedTemplate.steps.length > 0 ? (
                        selectedTemplate.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="flex gap-3.5 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all"
                          >
                            <div className="shrink-0 mt-0.5">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-2xs ${step.iconBgColor} ${step.iconColor}`}
                              >
                                {getStepIcon(step.iconType)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-xs mb-0.5">{step.title}</h4>
                              <p className="text-gray-500 text-xs mb-1.5 leading-relaxed">
                                {step.description}
                              </p>
                              <span className="inline-flex items-center text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                                {step.actionText} <ArrowRight size={11} className="ml-1" />
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-400 text-xs">
                          <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-500" />
                          <span>Includes default automated checklist and cards.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pre-configured features summary banner */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-600" />
                      Applying this template includes:
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      {selectedTemplate.customTabs && selectedTemplate.customTabs.length > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-white font-bold text-indigo-700 shadow-2xs border border-indigo-100/80">
                          Tabs: {selectedTemplate.customTabs.map(t => t.name).join(' & ')}
                        </span>
                      )}
                      {selectedTemplate.starterTasks && (
                        <span className="px-2.5 py-1 rounded-lg bg-white font-bold text-amber-700 shadow-2xs border border-amber-100/80">
                          {selectedTemplate.starterTasks.length} Pre-configured Tasks
                        </span>
                      )}
                      {selectedTemplate.badge && (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-200/60 font-bold text-indigo-900">
                          {selectedTemplate.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-indigo-700 font-semibold">
                    Configures <span className="font-bold underline">{selectedTemplate.defaultTab}</span> view
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      router.push('/boards');
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                  >
                    <Layout size={14} /> Open in Boards instead
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (onApply) onApply(selectedTemplate);
                        onClose();
                      }}
                      className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/20 transition-all text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Sparkles size={13} />
                      <span>Apply Template (Full Board)</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

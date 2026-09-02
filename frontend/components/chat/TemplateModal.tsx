import React, { useState, useEffect } from 'react';
import { X, Play, Link2, List as ListIcon, RefreshCw, Briefcase, PenTool, Book, Cpu, Megaphone, Layout, Globe, ArrowLeft, MoreHorizontal, ExternalLink, Home } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { channelTemplates, ChannelTemplate, templateCategories } from '../../lib/templateData';
import EmptyBoardState from '../boards/EmptyBoardState';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName?: string;
  onApply?: (template: ChannelTemplate) => void;
}

export default function TemplateModal({ isOpen, onClose, channelName = "#new-channel", onApply }: TemplateModalProps) {
  const router = useRouter();
  const [view, setView] = useState<'gallery' | 'detail'>('gallery');
  const [activeSection, setActiveSection] = useState<'boards' | 'templates'>('templates');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTemplate = channelTemplates.find(t => t.id === selectedTemplateId) || channelTemplates[0];
  const filteredTemplates = channelTemplates.filter(t => {
    const matchesCategory = selectedCategory ? t.category === selectedCategory : true;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;
    
    const matchesSearch = 
      t.name.toLowerCase().includes(query) || 
      t.author.toLowerCase().includes(query) || 
      (t.tabs && t.tabs.some(tab => tab.headline.toLowerCase().includes(query) || tab.description.toLowerCase().includes(query))) ||
      t.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
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

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'business': return <Briefcase size={28} />;
      case 'design': return <PenTool size={28} />;
      case 'education': return <Book size={28} />;
      case 'engineering': return <Cpu size={28} />;
      case 'marketing': return <Megaphone size={28} />;
      case 'project-management': return <Layout size={28} />;
      case 'remote-work': return <Globe size={28} />;
      default: return <Briefcase size={28} />;
    }
  };

  const getStepIcon = (iconType: string) => {
    switch (iconType) {
      case 'link': return <Link2 size={20} />;
      case 'list': return <ListIcon size={20} />;
      case 'refresh-cw': return <RefreshCw size={20} />;
      default: return <Link2 size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className={`bg-[#1D2125] text-[#B6C2CF] rounded-2xl shadow-2xl w-full flex overflow-hidden h-[85vh] relative animate-in zoom-in-95 duration-200 ${view === 'gallery' ? 'max-w-6xl' : 'max-w-5xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9FADBC] hover:text-[#B6C2CF] hover:bg-[#2C333A] rounded-full p-2 transition-colors z-20"
        >
          <X size={20} />
        </button>

        {view === 'gallery' && (
          <div className="flex w-full h-full">
            {/* Sidebar (Trello style) */}
            <div className="w-[260px] bg-[#22272B] border-r border-[#3A444C] flex flex-col h-full shrink-0">
              <div className="p-4">
                <nav className="space-y-1">
                  <div 
                    onClick={() => setActiveSection('boards')} 
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${activeSection === 'boards' ? 'bg-[#2C333A] text-[#579DFF] font-semibold' : 'text-[#9FADBC] hover:bg-[#2C333A] font-semibold text-sm'}`}
                  >
                    <Layout size={18} />
                    <span className={activeSection !== 'boards' ? 'font-semibold text-sm' : ''}>Boards</span>
                  </div>
                  <div 
                    onClick={() => setActiveSection('templates')} 
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${activeSection === 'templates' ? 'bg-[#2C333A] text-[#579DFF] font-semibold' : 'text-[#9FADBC] hover:bg-[#2C333A] font-semibold text-sm'}`}
                  >
                    <Layout size={18} />
                    <span className={activeSection !== 'templates' ? 'font-semibold text-sm' : ''}>Templates</span>
                  </div>
                  <div onClick={() => { onClose(); router.push('/'); }} className="px-3 py-2 text-[#9FADBC] hover:bg-[#2C333A] rounded-lg cursor-pointer flex items-center gap-3 font-semibold text-sm transition-colors">
                    <Home size={18} />
                    <span>Home</span>
                  </div>
                </nav>
              </div>
              
              {activeSection === 'templates' && (
                <div className="mt-4 px-4">
                  <div className="text-xs font-bold text-[#9FADBC] uppercase mb-2">Categories</div>
                  <nav className="space-y-0.5">
                    <div 
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${!selectedCategory ? 'bg-[#2C333A] text-[#579DFF] font-semibold' : 'text-[#B6C2CF] hover:bg-[#2C333A]'}`}
                    >
                      All Categories
                    </div>
                    {templateCategories.map(cat => (
                      <div 
                        key={cat.id} 
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${selectedCategory === cat.id ? 'bg-[#2C333A] text-[#579DFF] font-semibold' : 'text-[#B6C2CF] hover:bg-[#2C333A]'}`}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </nav>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-[#1D2125] p-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {activeSection === 'boards' ? (
                <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#DFE1E6]">Your Boards</h2>
                  </div>
                  <div className="flex-1 -mx-8 -my-8 mt-0">
                    <EmptyBoardState onCreateBoard={() => { onClose(); router.push('/boards'); }} />
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#DFE1E6]">
                      {searchQuery ? 'Search Templates' : 'Featured categories'}
                    </h2>
                    <div className="relative w-64 mr-8">
                      <input 
                        type="text" 
                        placeholder="Find template" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#22272B] border border-[#3A444C] rounded-sm px-3 py-1.5 text-sm text-[#DFE1E6] focus:outline-none focus:border-[#579DFF]" 
                      />
                    </div>
                  </div>

                  {!searchQuery && (
                    <div className="grid grid-cols-7 gap-4 mb-12">
                      {templateCategories.map(cat => (
                        <div key={cat.id} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => setSelectedCategory(cat.id)}>
                          <div className={`w-20 h-20 rounded-xl flex items-center justify-center ${cat.iconColor} group-hover:opacity-90 transition-opacity shadow-sm ${selectedCategory === cat.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1D2125]' : ''}`}>
                            {getCategoryIcon(cat.icon)}
                          </div>
                          <span className={`text-xs text-center font-medium group-hover:text-[#DFE1E6] ${selectedCategory === cat.id ? 'text-[#DFE1E6]' : 'text-[#B6C2CF]'}`}>{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-[#FFC400] text-gray-900 rounded p-1">
                      <RefreshCw size={16} />
                    </div>
                    <h2 className="text-xl font-bold text-[#DFE1E6]">
                      {searchQuery 
                        ? `Search results for "${searchQuery}"` 
                        : selectedCategory 
                          ? `${templateCategories.find(c => c.id === selectedCategory)?.name} templates` 
                          : "New and notable templates"}
                    </h2>
                  </div>

                  {filteredTemplates.length > 0 ? (
                    <div className="grid grid-cols-3 gap-6">
                      {filteredTemplates.map(template => (
                        <div 
                          key={template.id} 
                          className="bg-[#22272B] rounded-lg border border-[#3A444C] overflow-hidden cursor-pointer hover:border-[#579DFF] hover:shadow-lg transition-all group flex flex-col h-64"
                          onClick={() => {
                            setSelectedTemplateId(template.id);
                            setView('detail');
                          }}
                        >
                          <div className={`h-32 w-full relative ${template.bannerGradient ? `bg-gradient-to-br ${template.bannerGradient}` : ''}`}>
                            {template.bannerImage && (
                              <Image src={template.bannerImage} alt={template.name} fill className="object-cover" />
                            )}
                            <div className="absolute bottom-2 left-4 bg-white/20 backdrop-blur-md p-1.5 rounded text-white shadow-sm">
                              <Layout size={18} />
                            </div>
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-[#DFE1E6] text-base mb-1 group-hover:text-[#579DFF] transition-colors">{template.name}</h3>
                            <p className="text-xs text-[#9FADBC] mb-2 flex-1">by {template.author}</p>
                            <div className="flex items-center text-xs text-[#9FADBC]">
                              <Globe size={14} className="mr-1" />
                              <span>{template.uses}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-[#3A444C] rounded-xl text-[#9FADBC]">
                      <Layout size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium text-[#DFE1E6]">No templates found</p>
                      <p className="text-sm mt-1">There are no templates available in this category yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'detail' && (
          <div className="flex flex-col w-full h-full bg-white text-gray-900">
            {/* Header */}
            <div className="h-48 relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 flex flex-col justify-between shrink-0">
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
              <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-30">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute -right-20 -bottom-20 w-96 h-96 fill-yellow-400">
                  <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,89.1,-0.5C88.1,15.3,83.5,30.6,74.2,42.4C64.9,54.1,50.8,62.3,36.1,70.1C21.4,77.9,6.1,85.2,-9.5,86.6C-25.1,87.9,-40.9,83.4,-53.4,73.8C-65.9,64.2,-75,49.5,-80.6,33.5C-86.2,17.4,-88.3,0.1,-84.9,-16C-81.5,-32.1,-72.6,-46.9,-60.2,-55.8C-47.8,-64.8,-31.8,-67.9,-16.9,-71.4C-2,-74.9,11.8,-78.9,25.4,-79.8C39,-80.8,52.3,-78.6,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
              </div>

              <div className="p-6 relative z-10 flex items-center gap-4">
                <button 
                  onClick={() => setView('gallery')}
                  className="bg-white/20 hover:bg-white/30 text-white rounded p-2 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>

              <div className="px-12 pb-8 relative z-10">
                <h1 className="text-4xl font-bold text-white tracking-tight">{selectedTemplate.name}</h1>
              </div>
            </div>

            {/* Main Detail Area */}
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="max-w-5xl mx-auto p-12">
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 overflow-hidden -mt-16 relative z-20">
                  <div className="p-8 pb-6 border-b border-gray-100">
                    <h2 className="text-[22px] font-bold text-gray-900">Request to resolution in just 3 steps</h2>
                  </div>
                  
                  <div className="p-8 flex gap-10">
                    {/* Left: Video */}
                    <div className="w-1/2 shrink-0">
                      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 relative group cursor-pointer aspect-video bg-gray-100 flex items-center justify-center">
                        {selectedTemplate.videoPlaceholder ? (
                          <Image src={selectedTemplate.videoPlaceholder} alt="Video" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                            <span className="text-gray-400 font-medium">Video Overview</span>
                          </div>
                        )}
                        {/* Play button overlay */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-xl transform group-hover:scale-105 transition-transform">
                            <Play size={24} fill="currentColor" className="ml-1" />
                          </div>
                        </div>
                        {/* Fake video controls */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-3">
                          <RefreshCw size={14} className="text-white" />
                          <span className="text-white text-xs font-bold">1.2x</span>
                          <span className="text-white/80 text-xs font-medium">1 min 25 sec / 4 min 11 sec</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Steps */}
                    <div className="w-1/2 flex flex-col justify-center gap-4">
                      {selectedTemplate.steps ? (
                        selectedTemplate.steps.map((step, idx) => (
                          <div key={idx} className="flex gap-4 p-4 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer">
                            <div className="shrink-0 mt-1">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${step.iconBgColor} ${step.iconColor}`}>
                                {getStepIcon(step.iconType)}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm mb-1">{step.title}</h4>
                              <p className="text-gray-500 text-sm mb-3 leading-relaxed">{step.description}</p>
                              <button className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 shadow-sm rounded px-3 py-1.5 transition-all active:scale-95">
                                {step.actionText} <ExternalLink size={14} className="ml-1.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-gray-500">
                          <p>No interactive steps defined for this template.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button 
                    onClick={onClose}
                    className="px-6 py-2.5 rounded font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (onApply) onApply(selectedTemplate);
                      onClose();
                    }}
                    className="px-6 py-2.5 rounded font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md transition-colors"
                  >
                    Use this template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

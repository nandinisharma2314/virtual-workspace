"use client";

import React, { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Image from 'next/image';
import { RefreshCw, Briefcase, PenTool, Book, Cpu, Megaphone, Layout, Globe, Search } from 'lucide-react';
import { channelTemplates, templateCategories } from '@/lib/templateData';

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Topbar />
        
        {/* Trello Dark Mode Theme for Templates */}
        <main className="flex-1 w-full h-full min-h-0 overflow-hidden flex bg-[#1D2125]">
          
          {/* Templates Sidebar */}
          <div className="w-[260px] bg-[#22272B] border-r border-[#3A444C] flex flex-col h-full shrink-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="p-4">
              <nav className="space-y-1 text-[#9FADBC]">
                <div className="px-3 py-2 hover:bg-[#2C333A] rounded-lg cursor-pointer flex items-center gap-3 transition-colors">
                  <Layout size={18} />
                  <span className="font-semibold text-sm">Boards</span>
                </div>
                <div className="px-3 py-2 bg-[#2C333A] text-[#579DFF] rounded-lg cursor-pointer flex items-center gap-3 font-semibold text-sm">
                  <Layout size={18} />
                  <span>Templates</span>
                </div>
                <div className="px-3 py-2 hover:bg-[#2C333A] rounded-lg cursor-pointer flex items-center gap-3 font-semibold text-sm transition-colors">
                  <Layout size={18} />
                  <span>Home</span>
                </div>
              </nav>
            </div>
            
            <div className="mt-4 px-4 pb-4 border-b border-[#3A444C]">
              <div className="text-xs font-bold text-[#9FADBC] uppercase mb-2">Categories</div>
              <nav className="space-y-0.5">
                <div 
                  onClick={() => setActiveCategory(null)}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${activeCategory === null ? 'bg-[#2C333A] text-[#579DFF]' : 'text-[#B6C2CF] hover:bg-[#2C333A]'}`}
                >
                  Featured categories
                </div>
                {templateCategories.map(cat => (
                  <div 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${activeCategory === cat.id ? 'bg-[#2C333A] text-[#579DFF]' : 'text-[#B6C2CF] hover:bg-[#2C333A]'}`}
                  >
                    {cat.name}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-[#1D2125] p-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="max-w-5xl mx-auto">
              
              {!activeCategory && (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-[#DFE1E6]">Featured categories</h2>
                    <div className="relative w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9FADBC]" size={16} />
                      <input 
                        type="text" 
                        placeholder="Find template" 
                        className="w-full bg-[#22272B] border border-[#3A444C] rounded pl-10 pr-3 py-2 text-sm text-[#DFE1E6] focus:outline-none focus:border-[#579DFF] transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 md:grid-cols-7 gap-4 mb-16">
                    {templateCategories.map(cat => (
                      <div 
                        key={cat.id} 
                        onClick={() => setActiveCategory(cat.id)}
                        className="flex flex-col items-center gap-3 cursor-pointer group"
                      >
                        <div className={`w-full aspect-square rounded-xl flex items-center justify-center ${cat.iconColor} group-hover:opacity-90 transition-opacity shadow-sm relative overflow-hidden`}>
                          {/* Corner fold effect */}
                          <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-bl-xl"></div>
                          {getCategoryIcon(cat.icon)}
                        </div>
                        <span className="text-sm text-center font-semibold text-[#B6C2CF] group-hover:text-[#DFE1E6] transition-colors">{cat.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-[#FFC400] text-gray-900 rounded p-1.5 shadow-sm">
                      <RefreshCw size={18} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#DFE1E6]">New and notable templates</h2>
                  </div>
                </>
              )}

              {activeCategory && (
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-[#DFE1E6]">
                    {templateCategories.find(c => c.id === activeCategory)?.name} Templates
                  </h2>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channelTemplates
                  .filter(t => !activeCategory || t.category === activeCategory)
                  .map(template => (
                  <div 
                    key={template.id} 
                    className="bg-[#22272B] rounded-lg border border-[#3A444C] overflow-hidden cursor-pointer hover:border-[#579DFF] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all group flex flex-col h-[320px]"
                  >
                    <div className={`h-40 w-full relative ${template.bannerGradient ? `bg-gradient-to-br ${template.bannerGradient}` : 'bg-[#2C333A]'}`}>
                      {template.bannerImage && (
                        <Image src={template.bannerImage} alt={template.name} fill className="object-cover" />
                      )}
                      <div className="absolute bottom-3 left-4 bg-[#1D2125]/80 backdrop-blur-md p-2 rounded text-[#DFE1E6] shadow-sm border border-[#3A444C]">
                        <Layout size={20} />
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-[#DFE1E6] text-lg mb-1 group-hover:text-[#579DFF] transition-colors line-clamp-1">{template.name}</h3>
                      <p className="text-sm text-[#9FADBC] mb-4 flex-1">by {template.author}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center text-xs text-[#9FADBC] bg-[#2C333A] px-2 py-1 rounded">
                          <Globe size={14} className="mr-1.5" />
                          <span>{template.uses}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Layout, Plus, Users, Settings, Briefcase, Activity, Clock, Star } from 'lucide-react';
import Link from 'next/link';

interface Board {
  id: string;
  name: string;
  bgGradient: string;
  isStarred?: boolean;
}

const gradients = [
  "from-blue-600 to-blue-800",
  "from-emerald-500 to-teal-700",
  "from-orange-400 to-amber-600",
  "from-purple-500 to-indigo-700",
  "from-pink-500 to-rose-700",
];

export default function WorkspacesPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [showEmptyState, setShowEmptyState] = useState(true);

  const handleCreateBoard = () => {
    const name = window.prompt("Enter board name:", "New Project Board");
    if (name && name.trim() !== "") {
      const newBoard: Board = {
        id: Date.now().toString(),
        name: name.trim(),
        bgGradient: gradients[Math.floor(Math.random() * gradients.length)]
      };
      setBoards([newBoard, ...boards]);
      setShowEmptyState(false);
    }
  };

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBoards(boards.map(b => b.id === id ? { ...b, isStarred: !b.isStarred } : b));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Topbar />
        
        {/* Light Mode Theme for Workspace Dashboard */}
        <main className="flex-1 w-full h-full min-h-0 overflow-hidden flex bg-white">
          
          {/* Workspaces Sidebar */}
          <div className="w-[260px] bg-[#F4F5F7] border-r border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="p-4 border-b border-gray-200">
              <nav className="space-y-1 text-[#5E6C84]">
                <div className="px-3 py-2 bg-[#E4F0F6] text-[#0052CC] rounded-lg cursor-pointer flex items-center gap-3 transition-colors">
                  <Layout size={18} />
                  <span className="font-semibold text-sm">Boards</span>
                </div>
                <Link href="/templates" className="px-3 py-2 hover:bg-[#EBECF0] rounded-lg cursor-pointer flex items-center gap-3 transition-colors">
                  <Briefcase size={18} />
                  <span className="font-semibold text-sm">Templates</span>
                </Link>
                <div className="px-3 py-2 hover:bg-[#EBECF0] rounded-lg cursor-pointer flex items-center gap-3 font-semibold text-sm transition-colors">
                  <Activity size={18} />
                  <span>Home</span>
                </div>
              </nav>
            </div>
            
            <div className="mt-4 px-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#5E6C84] uppercase">Workspaces</span>
                <button onClick={handleCreateBoard} className="text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded p-1 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <nav className="space-y-0.5">
                <div className="px-3 py-2 text-sm text-[#172B4D] hover:bg-[#EBECF0] rounded-lg cursor-pointer transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      N
                    </div>
                    <span className="font-semibold group-hover:text-[#091E42]">Nandini's Workspace</span>
                  </div>
                </div>
                
                <div className="ml-9 mt-1 space-y-1">
                  <div className="px-3 py-1.5 text-xs text-[#5E6C84] hover:bg-[#EBECF0] rounded-md cursor-pointer transition-colors flex items-center gap-2">
                    <Layout size={14} /> Boards
                  </div>
                  <div className="px-3 py-1.5 text-xs text-[#5E6C84] hover:bg-[#EBECF0] rounded-md cursor-pointer transition-colors flex items-center gap-2">
                    <Users size={14} /> Members
                  </div>
                  <div className="px-3 py-1.5 text-xs text-[#5E6C84] hover:bg-[#EBECF0] rounded-md cursor-pointer transition-colors flex items-center gap-2">
                    <Settings size={14} /> Settings
                  </div>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-white p-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="max-w-4xl mx-auto flex gap-12">
              
              {/* Left Column */}
              <div className="flex-1 flex flex-col pt-8">
                {boards.length === 0 && showEmptyState ? (
                  <div className="w-full max-w-[500px] mx-auto text-center bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden">
                    {/* Illustration Area */}
                    <div className="bg-[#F4F5F7] h-[220px] w-full relative flex items-center justify-center">
                      <div className="relative w-56 h-40">
                        {/* Main Board Representation */}
                        <div className="absolute top-4 left-6 w-48 h-32 bg-[#E9D1FE] rounded-lg shadow-lg border border-[#D5A6FE] flex flex-col p-3 transform -rotate-2">
                          <div className="w-full h-3.5 bg-white/60 rounded-sm mb-3" />
                          <div className="flex gap-2.5 h-full">
                            <div className="flex-1 bg-white/70 rounded flex flex-col gap-1.5 p-1.5">
                              <div className="w-full h-4 bg-[#85B8FF]/60 rounded-sm"></div>
                              <div className="w-full h-4 bg-[#85B8FF]/60 rounded-sm"></div>
                            </div>
                            <div className="flex-1 bg-white/70 rounded flex flex-col gap-1.5 p-1.5">
                              <div className="w-full h-4 bg-[#F5CD47]/60 rounded-sm"></div>
                            </div>
                            <div className="flex-1 bg-white/70 rounded flex flex-col gap-1.5 p-1.5">
                              <div className="w-full h-4 bg-[#4BCE97]/60 rounded-sm"></div>
                              <div className="w-full h-4 bg-[#4BCE97]/60 rounded-sm"></div>
                              <div className="w-full h-4 bg-[#4BCE97]/60 rounded-sm"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Floating Element 1 (Plant) */}
                        <div className="absolute -right-2 top-10 w-16 h-20 bg-white rounded-lg shadow-xl border border-gray-100 flex items-center justify-center rotate-6">
                          <div className="relative">
                             <div className="w-10 h-8 bg-[#82E699] rounded-t-full rounded-bl-full"></div>
                             <div className="w-6 h-6 bg-[#E0E2E5] rounded-b-md mx-auto -mt-1"></div>
                          </div>
                        </div>

                        {/* Floating Element 2 (Card) */}
                        <div className="absolute -left-6 bottom-4 w-20 h-12 bg-white rounded-lg shadow-xl border border-gray-100 flex flex-col gap-1.5 p-2 -rotate-12">
                          <div className="w-3/4 h-2 bg-[#E774BB] rounded-full"></div>
                          <div className="w-1/2 h-2 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-10">
                      <h2 className="text-[22px] font-bold text-[#172B4D] mb-3 tracking-tight">
                        Organize anything
                      </h2>
                      <p className="text-[15px] text-[#5E6C84] mb-8 leading-relaxed">
                        Put everything in one place and start moving things forward with your first Trello board!
                      </p>
                      
                      <div className="flex flex-col items-center gap-4">
                        <button onClick={handleCreateBoard} className="bg-[#0052CC] hover:bg-[#0065FF] text-white text-[15px] font-bold px-8 py-3 rounded transition-colors shadow-sm w-auto">
                          Create a Workspace board
                        </button>
                        <button onClick={() => setShowEmptyState(false)} className="text-[13px] text-[#5E6C84] hover:text-[#172B4D] hover:underline transition-colors mt-2">
                          Got it! Dismiss this.
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    {/* Workspace Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                        N
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#172B4D]">Nandini's Workspace</h2>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-[#5E6C84] bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1 border border-gray-200">
                            <Briefcase size={12} /> Premium
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Boards Grid */}
                    <div className="mb-6">
                      <h3 className="text-base font-bold text-[#172B4D] mb-4 flex items-center gap-2">
                        <Users size={18} className="text-[#5E6C84]" /> Your Workspace boards
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {boards.map(board => (
                          <div 
                            key={board.id}
                            className={`h-24 rounded-lg bg-gradient-to-br ${board.bgGradient} p-3 cursor-pointer group relative shadow-sm hover:shadow-md transition-all hover:brightness-110 flex flex-col justify-between`}
                          >
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors rounded-lg pointer-events-none" />
                            <h4 className="font-bold text-white text-[15px] leading-tight relative z-10 w-[85%] truncate">
                              {board.name}
                            </h4>
                            <div className="flex justify-end relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => toggleStar(e, board.id)} className={`p-1 rounded hover:bg-white/20 transition-colors ${board.isStarred ? 'text-yellow-400 opacity-100' : 'text-white'}`}>
                                <Star size={16} fill={board.isStarred ? "currentColor" : "none"} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div 
                          onClick={handleCreateBoard}
                          className="h-24 rounded-lg bg-[#F4F5F7] hover:bg-[#EBECF0] border border-transparent hover:border-gray-300 flex items-center justify-center cursor-pointer transition-colors shadow-sm group"
                        >
                          <span className="text-sm font-semibold text-[#172B4D] group-hover:text-[#0052CC]">Create new board</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (Sidebar equivalent in dashboard) */}
              <div className="w-[300px] shrink-0 pt-8">
                <div className="flex items-center gap-2 mb-4 text-[#5E6C84]">
                  <Clock size={18} />
                  <h3 className="font-bold text-sm uppercase tracking-wide">Recently viewed</h3>
                </div>
                
                {boards.length > 0 ? (
                  <div className="space-y-2">
                    {boards.slice(0, 4).map(board => (
                      <div key={`recent-${board.id}`} className="flex items-center gap-3 p-2 rounded hover:bg-[#F4F5F7] cursor-pointer group transition-colors">
                        <div className={`w-10 h-8 rounded shrink-0 bg-gradient-to-br ${board.bgGradient}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#172B4D] truncate group-hover:text-[#0052CC] transition-colors">{board.name}</h4>
                          <p className="text-xs text-[#5E6C84]">Nandini's Workspace</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#F4F5F7] rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-sm text-[#5E6C84] italic mb-2">No recently viewed boards</p>
                  </div>
                )}

                <div className="mt-10">
                  <h3 className="font-bold text-sm uppercase tracking-wide text-[#5E6C84] mb-4">Links</h3>
                  <button onClick={handleCreateBoard} className="flex items-center gap-3 w-full bg-[#F4F5F7] hover:bg-[#EBECF0] text-[#172B4D] font-semibold text-sm p-3 rounded-lg transition-colors border border-transparent hover:border-gray-300">
                    <div className="w-6 h-6 rounded bg-[#E4F0F6] flex items-center justify-center text-[#0052CC]">
                      <Plus size={16} strokeWidth={3} />
                    </div>
                    Create new board
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

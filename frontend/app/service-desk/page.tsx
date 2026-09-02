"use client";

import React, { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Play, Link as LinkIcon, CheckSquare, RefreshCw, BarChart2, Inbox, List, AlertCircle, FileText, Settings, Users, Folder, HelpCircle, Layout } from 'lucide-react';

export default function ServiceDeskPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const userName = "Nandini Sharma"; // In real app, fetch from auth

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Topbar />
        
        <main className="flex-1 w-full h-full min-h-0 overflow-hidden flex bg-white">
          
          {/* Jira Service Management Sidebar */}
          <div className="w-[240px] bg-gray-50 border-r border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
                SUP
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 leading-tight">IT Support</div>
                <div className="text-xs text-gray-500">Service project</div>
              </div>
            </div>

            <div className="p-3">
              <nav className="space-y-0.5">
                <div className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors">
                  <BarChart2 size={16} className="text-gray-500" />
                  <span>Summary</span>
                </div>
                <div className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors">
                  <Inbox size={16} className="text-gray-500" />
                  <span>Queues</span>
                </div>
                <div className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors">
                  <List size={16} className="text-gray-500" />
                  <span>Multi-space work</span>
                </div>
                <div className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors">
                  <HelpCircle size={16} className="text-gray-500" />
                  <span>Service requests</span>
                </div>
                <div className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors">
                  <AlertCircle size={16} className="text-gray-500" />
                  <span>Incidents</span>
                </div>
                <div className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors">
                  <FileText size={16} className="text-gray-500" />
                  <span>Reports</span>
                </div>
              </nav>

              <div className="mt-4 mb-2 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Operations</div>
              <nav className="space-y-0.5">
                <div className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors">
                  <BookOpenIcon />
                  <span>Knowledge Base</span>
                </div>
                <div className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors">
                  <Users size={16} className="text-gray-500" />
                  <span>Customers</span>
                </div>
                <div className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors">
                  <Folder size={16} className="text-gray-500" />
                  <span>Channels</span>
                </div>
              </nav>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <nav className="space-y-0.5">
                  <div className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors">
                    <Settings size={16} className="text-gray-500" />
                    <span>Project settings</span>
                  </div>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-white relative">
            {/* Banner Area */}
            <div className="h-[220px] bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 relative overflow-hidden flex items-center justify-center shrink-0">
              {/* Decorative shapes */}
              <div className="absolute left-10 bottom-0 opacity-80 pointer-events-none">
                <svg width="250" height="200" viewBox="0 0 200 200" fill="none">
                  <path d="M50 150 L100 50 L150 150 Z" stroke="#F59E0B" strokeWidth="4" fill="transparent" />
                </svg>
              </div>
              <div className="absolute -right-10 -top-10 opacity-80 pointer-events-none">
                <svg width="300" height="300" viewBox="0 0 250 250" fill="none">
                  <circle cx="125" cy="125" r="90" stroke="#10B981" strokeWidth="4" fill="transparent" />
                  <rect x="70" y="70" width="40" height="40" fill="#E11D48" className="rotate-12 transform origin-center" />
                </svg>
              </div>

              <h1 className="text-4xl font-extrabold text-white z-10 tracking-tight pb-10">
                Welcome {userName}!
              </h1>
            </div>

            {/* Floating Content Box */}
            <div className="px-8 pb-12 -mt-20 relative z-10 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col lg:flex-row gap-10">
                
                {/* Left side: Video */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">
                    Request to resolution in just 3 steps
                  </h3>
                  
                  <div 
                    className="relative rounded-xl overflow-hidden bg-gray-50 border border-gray-200 aspect-[16/10] group cursor-pointer shadow-inner"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {/* Fake video thumbnail UI */}
                    <div className="absolute inset-0 p-4 opacity-70">
                      <div className="w-full h-8 bg-indigo-100 rounded mb-3"></div>
                      <div className="w-2/3 h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="w-full h-32 bg-gray-200 rounded mb-3"></div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                        <div className="w-40 h-10 bg-gray-200 rounded"></div>
                      </div>
                    </div>

                    {/* Video Controls Overlay */}
                    <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center group-hover:bg-black/30 transition-colors">
                      <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg mb-3 group-hover:scale-110 transition-transform">
                        <Play size={28} fill="currentColor" className="ml-1" />
                      </div>
                      <div className="bg-black/70 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-3">
                        <span>1.2x</span>
                        <span className="w-1 h-1 rounded-full bg-white/50"></span>
                        <span>1 min 11 sec / 3 min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Steps */}
                <div className="flex-[1.2] flex flex-col justify-center gap-5 lg:mt-8">
                  
                  {/* Step 1 */}
                  <div className="flex gap-5 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                    <div className="w-24 h-20 bg-fuchsia-50 rounded-xl border border-fuchsia-100 shrink-0 flex items-center justify-center shadow-sm relative overflow-hidden group-hover:bg-fuchsia-100 transition-colors">
                      <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-fuchsia-200 rounded-full opacity-50"></div>
                      <LinkIcon size={24} className="text-fuchsia-600 relative z-10" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 leading-tight mb-2">
                        Collect customer requests through your channels
                      </h4>
                      <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 font-semibold flex items-center gap-1.5 group-hover:text-indigo-600 transition-colors">
                        Try your portal
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      </a>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-5 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                    <div className="w-24 h-20 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0 flex items-center justify-center shadow-sm relative overflow-hidden group-hover:bg-emerald-100 transition-colors">
                      <div className="absolute right-0 top-0 w-10 h-full bg-emerald-200/40 transform skew-x-12"></div>
                      <CheckSquare size={24} className="text-emerald-600 relative z-10" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 leading-tight mb-3">
                        Prioritize and assign requests in your queues
                      </h4>
                      <button className="text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                        Go to queues
                      </button>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-5 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                    <div className="w-24 h-20 bg-amber-50 rounded-xl border border-amber-100 shrink-0 flex items-center justify-center shadow-sm relative overflow-hidden group-hover:bg-amber-100 transition-colors">
                      <div className="absolute bottom-0 left-0 w-full h-5 bg-amber-200/50"></div>
                      <RefreshCw size={24} className="text-amber-600 relative z-10" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 leading-tight mb-3">
                        Update customers and request status, all in one place
                      </h4>
                      <button className="text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                        Explore work
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Customization Section */}
              <div className="mt-12 max-w-4xl mx-auto">
                <h4 className="text-lg font-bold text-gray-900 mb-6">Customize how you serve your customers</h4>
                
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer group shadow-sm">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                        <Layout size={20} />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                          Modify your portal <Play size={12} className="text-gray-400" />
                        </h5>
                        <p className="text-sm text-gray-500">Personalize how your portal looks for customers when they raise requests.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5"><Play size={12} /> 2 min</span>
                      <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Customize portal</button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer group shadow-sm">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <Inbox size={20} />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                          Connect more request channels <Play size={12} className="text-gray-400" />
                        </h5>
                        <p className="text-sm text-gray-500">Get requests from Slack, Teams and your project's default email in one place.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5"><Play size={12}/> 5 min</span>
                      <div className="flex items-center gap-3">
                        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Email</button>
                        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Chat</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}

// Quick inline icon component for BookOpen since we missed importing it
function BookOpenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  );
}

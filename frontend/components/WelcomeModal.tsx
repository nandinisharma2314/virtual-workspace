import React, { useState } from 'react';
import { X, Play, Link as LinkIcon, CheckSquare, RefreshCw } from 'lucide-react';

interface WelcomeModalProps {
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ userName, isOpen, onClose }: WelcomeModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[850px] overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 bg-black/20 hover:bg-black/30 rounded-full p-2 transition-colors z-20"
        >
          <X size={20} />
        </button>

        {/* Banner Area */}
        <div className="h-[180px] bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 relative overflow-hidden flex items-center justify-center">
          {/* Decorative shapes */}
          <div className="absolute -left-10 top-0 opacity-80 pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <path d="M50 150 L100 50 L150 150 Z" stroke="#F59E0B" strokeWidth="4" fill="transparent" />
            </svg>
          </div>
          <div className="absolute -right-20 -top-10 opacity-80 pointer-events-none">
            <svg width="250" height="250" viewBox="0 0 250 250" fill="none">
              <circle cx="125" cy="125" r="80" stroke="#10B981" strokeWidth="4" fill="transparent" />
              <rect x="70" y="70" width="40" height="40" fill="#E11D48" className="rotate-12 transform origin-center" />
            </svg>
          </div>

          <h2 className="text-3xl font-extrabold text-white z-10 tracking-tight">
            Welcome {userName}!
          </h2>
        </div>

        {/* Content Box (overlapping banner slightly) */}
        <div className="px-8 pb-8 -mt-10 relative z-10">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row gap-6">
            
            {/* Left side: Video */}
            <div className="flex-1">
              <h3 className="text-[17px] font-bold text-gray-900 mb-4 tracking-tight">
                Request to resolution in just 3 steps
              </h3>
              
              <div 
                className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 aspect-[4/3] group cursor-pointer"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {/* Fake video thumbnail UI */}
                <div className="absolute inset-0 p-3 opacity-60">
                  <div className="w-full h-8 bg-indigo-100 rounded mb-2"></div>
                  <div className="w-3/4 h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="w-full h-24 bg-gray-200 rounded mb-2"></div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <div className="w-32 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center group-hover:bg-black/30 transition-colors">
                  <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg mb-2 group-hover:scale-110 transition-transform">
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </div>
                  <div className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                    <span>1.2x</span>
                    <span className="w-1 h-1 rounded-full bg-white/50"></span>
                    <span>1 min 11 sec</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Steps */}
            <div className="flex-[1.2] flex flex-col gap-4 mt-8 md:mt-0">
              
              {/* Step 1 */}
              <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="w-20 h-16 bg-fuchsia-100 rounded border border-fuchsia-200 shrink-0 flex items-center justify-center shadow-sm relative overflow-hidden">
                  <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-fuchsia-200 rounded-full"></div>
                  <LinkIcon size={20} className="text-fuchsia-600 relative z-10" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-tight mb-1">
                    Collect customer requests through your channels
                  </h4>
                  <a href="#" className="text-[13px] text-gray-500 hover:text-indigo-600 font-semibold flex items-center gap-1 group">
                    Try your portal
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="w-20 h-16 bg-emerald-100 rounded border border-emerald-200 shrink-0 flex items-center justify-center shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-8 h-full bg-emerald-200/50 transform skew-x-12"></div>
                  <CheckSquare size={20} className="text-emerald-600 relative z-10" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-tight mb-2">
                    Prioritize and assign requests in your queues
                  </h4>
                  <button className="text-[12px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors">
                    Go to queues
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="w-20 h-16 bg-amber-100 rounded border border-amber-200 shrink-0 flex items-center justify-center shadow-sm relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-4 bg-amber-200"></div>
                  <RefreshCw size={20} className="text-amber-600 relative z-10" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-tight mb-2">
                    Update customers and request status, all in one place
                  </h4>
                  <button className="text-[12px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors">
                    Explore work
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
             <h4 className="text-[15px] font-bold text-gray-900 mb-4">Customize how you serve your customers</h4>
             {/* We can leave the bottom section out or just a quick teaser */}
             <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-fuchsia-500"></div> Modify your portal</span>
               <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Connect channels</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

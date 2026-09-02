import React from 'react';
import { Plus, Sparkles, Layout } from 'lucide-react';

interface EmptyBoardStateProps {
  onCreateBoard: () => void;
}

export default function EmptyBoardState({ onCreateBoard }: EmptyBoardStateProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6 bg-transparent">
      {/* Outer wrapper for glowing effect */}
      <div className="relative group">
        {/* Animated gradient blur behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        
        {/* Actual Card */}
        <div className="relative max-w-[440px] text-center bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden transform transition-all duration-300">
          
          {/* Premium Illustration Area */}
          <div className="h-[210px] w-full relative flex items-center justify-center overflow-hidden bg-white">
            {/* Soft gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-fuchsia-50 to-pink-50 opacity-90"></div>
            
            {/* Decorative background circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-300/40 rounded-full mix-blend-multiply filter blur-2xl animate-pulse" style={{ animationDuration: '4s' }}></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full mix-blend-multiply filter blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
            <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-300/40 rounded-full mix-blend-multiply filter blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>

            {/* Abstract geometric illustration with glassmorphism */}
            <div className="relative w-56 h-40 z-10 transform group-hover:scale-105 transition-transform duration-700 ease-out">
              {/* Main floating board */}
              <div className="absolute top-6 left-6 w-44 h-28 bg-white/70 backdrop-blur-lg rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white flex flex-col p-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <div className="w-full h-1.5 bg-white/80 rounded-full ml-1"></div>
                </div>
                <div className="flex gap-2.5 h-full">
                  <div className="w-1/3 h-full bg-gradient-to-b from-indigo-400/20 to-indigo-400/5 rounded-lg border border-indigo-200/50" />
                  <div className="w-1/3 h-4/5 bg-gradient-to-b from-purple-400/20 to-purple-400/5 rounded-lg border border-purple-200/50" />
                  <div className="w-1/3 h-2/3 bg-gradient-to-b from-pink-400/20 to-pink-400/5 rounded-lg border border-pink-200/50" />
                </div>
              </div>
              
              {/* Floating element 1 */}
              <div className="absolute -right-2 bottom-6 w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white flex items-center justify-center rotate-12 group-hover:rotate-0 group-hover:-translate-y-2 transition-all duration-500 ease-out">
                <Sparkles className="text-amber-500" size={24} />
              </div>
              
              {/* Floating element 2 */}
              <div className="absolute -left-4 top-10 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-white flex items-center justify-center -rotate-12 group-hover:rotate-0 group-hover:-translate-y-2 transition-all duration-500 ease-out delay-75">
                <Layout className="text-indigo-500" size={20} />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-8 pb-10 pt-8 relative bg-white border-t border-white/50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <h2 className="text-[22px] font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 mb-3 tracking-tight bg-[length:200%_auto] animate-pulse" style={{ animationDuration: '4s' }}>
              Organize anything beautifully
            </h2>
            <p className="text-[14px] text-gray-500 mb-8 leading-relaxed font-medium">
              Put everything in one place, visualize your workflow, and start moving things forward with your first Workspace board.
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={onCreateBoard}
                className="group/btn relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-[14px] font-bold px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.25)] hover:shadow-[0_0_30px_rgba(79,70,229,0.45)] hover:-translate-y-0.5 overflow-hidden bg-[length:200%_auto] hover:bg-[right_center] w-[260px]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out rounded-xl"></div>
                <Plus size={18} className="relative z-10" />
                <span className="relative z-10">Create a Workspace board</span>
              </button>
              
              <button className="text-[13px] font-bold text-gray-400 hover:text-gray-700 transition-colors mt-2">
                Got it! Dismiss this.
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

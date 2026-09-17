"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle2, UserCheck, BookOpen, ExternalLink, Calendar, Users, Sparkles, Coffee } from 'lucide-react';
import { ChannelTemplate } from '@/lib/templateData';
import Avatar from '@/components/Avatar';

interface NewHireOnboardingTabProps {
  template: ChannelTemplate;
  onAddTask?: (task: any) => void;
  onSwitchTab?: (tab: string) => void;
}

export default function NewHireOnboardingTab({ template, onAddTask, onSwitchTab }: NewHireOnboardingTabProps) {
  const [milestones, setMilestones] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`template_${template.id}_milestones`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return template.templateConfig?.milestones || [];
  });

  const buddies = template.templateConfig?.buddies || [
    { name: "Sarah Jenkins", role: "Onboarding Mentor", email: "sarah.j@company.com", avatar: "sarah" },
    { name: "Marcus Vance", role: "Engineering Lead", email: "marcus.v@company.com", avatar: "marcus" },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`template_${template.id}_milestones`, JSON.stringify(milestones));
    }
  }, [milestones, template.id]);

  const toggleItem = (mIdx: number, itemId: string) => {
    setMilestones((prev: any[]) => prev.map((section, idx) => {
      if (idx === mIdx) {
        return {
          ...section,
          items: section.items.map((item: any) => item.id === itemId ? { ...item, done: !item.done } : item)
        };
      }
      return section;
    }));
  };

  const totalItems = milestones.reduce((acc: number, m: any) => acc + (m.items?.length || 0), 0);
  const completedItems = milestones.reduce((acc: number, m: any) => acc + (m.items?.filter((i: any) => i.done).length || 0), 0);
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={14} /> Onboarding Portal
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome to the Team!</h1>
            <p className="mt-2 text-white/90 text-sm max-w-xl leading-relaxed">
              Your first 30 days are designed for learning, connecting with teammates, and getting up to speed smoothly.
            </p>

            {/* Live Progress Bar */}
            <div className="mt-6 bg-black/20 backdrop-blur-md p-4 rounded-xl max-w-md border border-white/20">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span>Onboarding Progress</span>
                <span>{completedItems} of {totalItems} completed ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-300 h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team Buddies Section */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs">
          <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} className="text-emerald-600" /> Your Support Team & Buddies
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {buddies.map((buddy: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <Avatar person={buddy.avatar || "sarah"} size={42} />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 text-xs truncate">{buddy.name}</h4>
                  <p className="text-[11px] text-gray-500 truncate">{buddy.role}</p>
                  <button 
                    onClick={() => onSwitchTab && onSwitchTab('Messages')}
                    className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                  >
                    <Coffee size={10} /> Say Hello
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Checklists */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <UserCheck size={18} className="text-emerald-600" /> 30-Day Milestone Roadmaps
          </h3>

          {milestones.map((section: any, mIdx: number) => (
            <div key={mIdx} className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h4 className="font-extrabold text-sm text-gray-900">{section.period}</h4>
                <span className="text-xs font-bold text-gray-400">
                  {section.items.filter((i: any) => i.done).length} / {section.items.length} done
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {section.items.map((item: any) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                      item.done ? 'bg-emerald-50/40 border-emerald-100 text-gray-500' : 'bg-gray-50/60 border-transparent hover:border-gray-200 text-gray-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleItem(mIdx, item.id)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={`text-xs font-medium leading-relaxed ${item.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Resources */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs">
          <h3 className="text-base font-extrabold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" /> Essential Resources
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <a href="#" className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between">
              <span className="font-bold text-gray-800">Developer Environment Setup Guide</span>
              <ExternalLink size={14} className="text-gray-400" />
            </a>
            <a href="#" className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between">
              <span className="font-bold text-gray-800">Engineering Team Architecture Wiki</span>
              <ExternalLink size={14} className="text-gray-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

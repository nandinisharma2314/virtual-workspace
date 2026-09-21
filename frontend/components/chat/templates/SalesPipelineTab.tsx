"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, ArrowRight, ArrowLeft, Building2, User, TrendingUp, CheckCircle, X, Sparkles } from 'lucide-react';
import { ChannelTemplate } from '@/lib/templateConfig';

interface SalesPipelineTabProps {
  template: ChannelTemplate;
  subTab?: 'deal-hub' | 'pipeline';
  onAddTask?: (task: any) => void;
  onSwitchTab?: (tab: string) => void;
}

export default function SalesPipelineTab({ template, subTab = 'deal-hub', onAddTask, onSwitchTab }: SalesPipelineTabProps) {
  const [stages, setStages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`template_${template.id}_stages`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return template.templateConfig?.stages || [];
  });

  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [newDealCompany, setNewDealCompany] = useState('');
  const [newDealValue, setNewDealValue] = useState('');
  const [newDealOwner, setNewDealOwner] = useState('Sarah J.');
  const [newDealStageId, setNewDealStageId] = useState('lead');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`template_${template.id}_stages`, JSON.stringify(stages));
    }
  }, [stages, template.id]);

  const handleMoveDeal = (dealId: string, fromStageId: string, direction: 'prev' | 'next') => {
    const stageIndex = stages.findIndex((s: any) => s.id === fromStageId);
    const targetIndex = direction === 'next' ? stageIndex + 1 : stageIndex - 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    let movingDeal: any = null;

    setStages((prev: any[]) => prev.map((stage, idx) => {
      if (idx === stageIndex) {
        movingDeal = stage.deals.find((d: any) => d.id === dealId);
        return { ...stage, deals: stage.deals.filter((d: any) => d.id !== dealId) };
      }
      return stage;
    }).map((stage, idx) => {
      if (idx === targetIndex && movingDeal) {
        return { ...stage, deals: [...stage.deals, movingDeal] };
      }
      return stage;
    }));
  };

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealCompany.trim() || !newDealValue.trim()) return;

    const formattedValue = newDealValue.startsWith('$') ? newDealValue : `$${newDealValue}`;
    const newDeal = {
      id: `d-${Date.now()}`,
      company: newDealCompany.trim(),
      value: formattedValue,
      owner: newDealOwner,
      probability: newDealStageId === 'won' ? '100%' : (newDealStageId === 'negotiation' ? '85%' : '50%')
    };

    setStages((prev: any[]) => prev.map(s => {
      if (s.id === newDealStageId) {
        return { ...s, deals: [...s.deals, newDeal] };
      }
      return s;
    }));

    if (onAddTask) {
      onAddTask({
        id: `deal-task-${newDeal.id}`,
        title: `Sales follow-up: ${newDeal.company} (${newDeal.value})`,
        status: 'todo',
        priority: 'High',
        tag: 'Sales',
        date: 'This week'
      });
    }

    setNewDealCompany('');
    setNewDealValue('');
    setIsAddDealOpen(false);
  };

  const totalDeals = stages.reduce((acc: number, s: any) => acc + (s.deals?.length || 0), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFBFC]">
      {/* Top Pipeline Stats Header */}
      <div className="h-16 shrink-0 px-6 border-b border-gray-200/80 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
            <DollarSign size={20} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-gray-900">CRM Deal Pipeline</h2>
            <p className="text-[11px] text-gray-500">Track stages, deal size, and contract velocity</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-medium">Active Pipeline: </span>
              <span className="font-extrabold text-gray-900">{template.templateConfig?.stats?.totalValue || '$415,000'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Win Rate: </span>
              <span className="font-extrabold text-emerald-600">{template.templateConfig?.stats?.winRate || '74%'}</span>
            </div>
          </div>
          <button
            onClick={() => setIsAddDealOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-all flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Deal
          </button>
        </div>
      </div>

      {/* Pipeline Stage Columns */}
      <div className="flex-1 overflow-x-auto p-6 flex gap-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {stages.map((stage: any, stageIdx: number) => (
          <div
            key={stage.id}
            className="w-72 shrink-0 flex flex-col max-h-full bg-gray-100/70 rounded-2xl border border-gray-200/70 p-3 shadow-2xs"
          >
            {/* Stage Title */}
            <div className="flex items-center justify-between pb-2.5 px-1 border-b border-gray-200/60 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-gray-900 text-xs">{stage.name}</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-gray-600 rounded-md border border-gray-200">
                  {stage.deals?.length || 0}
                </span>
              </div>
            </div>

            {/* Deal Cards */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {stage.deals?.length > 0 ? (
                stage.deals.map((deal: any) => (
                  <div
                    key={deal.id}
                    className="bg-white rounded-xl border border-gray-200/80 p-3 shadow-2xs hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        <Building2 size={13} className="text-gray-400" /> {deal.company}
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {deal.value}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1"><User size={11} /> {deal.owner}</span>
                      
                      {/* Move Controls */}
                      <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                        {stageIdx > 0 && (
                          <button
                            onClick={() => handleMoveDeal(deal.id, stage.id, 'prev')}
                            className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Move to previous stage"
                          >
                            <ArrowLeft size={12} />
                          </button>
                        )}
                        {stageIdx < stages.length - 1 && (
                          <button
                            onClick={() => handleMoveDeal(deal.id, stage.id, 'next')}
                            className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Advance stage"
                          >
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400 text-xs italic">
                  No deals in this stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Deal Modal */}
      {isAddDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in zoom-in-95">
            <button
              onClick={() => setIsAddDealOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="text-emerald-600" size={20} /> Add New Deal
            </h3>
            <form onSubmit={handleAddDeal} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Company / Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Client"
                  value={newDealCompany}
                  onChange={(e) => setNewDealCompany(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Estimated Value</label>
                <input
                  type="text"
                  placeholder="e.g. $75,000"
                  value={newDealValue}
                  onChange={(e) => setNewDealValue(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Stage</label>
                  <select
                    value={newDealStageId}
                    onChange={(e) => setNewDealStageId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs"
                  >
                    {stages.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Owner</label>
                  <select
                    value={newDealOwner}
                    onChange={(e) => setNewDealOwner(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs"
                  >
                    <option value="Sarah J.">Sarah J.</option>
                    <option value="Marcus V.">Marcus V.</option>
                    <option value="David C.">David C.</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDealOpen(false)}
                  className="px-3 py-1.5 font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { Award, Plus, RotateCcw, ChevronUp, ChevronDown, Sparkles, Tag, Check } from 'lucide-react';
import { ChannelTemplate } from '@/lib/templateData';

interface TierListTabProps {
  template: ChannelTemplate;
  onAddTask?: (task: any) => void;
  onSwitchTab?: (tab: string) => void;
}

export default function TierListTab({ template, onAddTask, onSwitchTab }: TierListTabProps) {
  const tiers = template.templateConfig?.tiers || [
    { id: "S", label: "S Tier", color: "bg-rose-500", text: "text-white", bgRow: "bg-rose-50/50 border-rose-200" },
    { id: "A", label: "A Tier", color: "bg-orange-500", text: "text-white", bgRow: "bg-orange-50/50 border-orange-200" },
    { id: "B", label: "B Tier", color: "bg-amber-400", text: "text-gray-900", bgRow: "bg-amber-50/50 border-amber-200" },
    { id: "C", label: "C Tier", color: "bg-emerald-500", text: "text-white", bgRow: "bg-emerald-50/50 border-emerald-200" },
    { id: "D", label: "D Tier", color: "bg-blue-500", text: "text-white", bgRow: "bg-blue-50/50 border-blue-200" },
  ];

  const [items, setItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`template_${template.id}_items`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return template.templateConfig?.items || [];
  });

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Tool');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`template_${template.id}_items`, JSON.stringify(items));
    }
  }, [items, template.id]);

  const moveTier = (itemId: string, direction: 'up' | 'down') => {
    const tierOrder = ['S', 'A', 'B', 'C', 'D'];
    setItems((prev: any[]) => prev.map(item => {
      if (item.id === itemId) {
        const currentIdx = tierOrder.indexOf(item.tier);
        const newIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
        if (newIdx >= 0 && newIdx < tierOrder.length) {
          return { ...item, tier: tierOrder[newIdx] };
        }
      }
      return item;
    }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory.trim() || 'Custom',
      tier: 'B' // default tier
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setIsAdding(false);
  };

  const handleReset = () => {
    setItems(template.templateConfig?.items || []);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Award className="text-amber-500" size={24} /> Interactive Tier List Maker
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Rank items from S Tier to D Tier or add your own custom cards</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Item
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 font-bold text-xs shadow-2xs hover:bg-gray-50 transition-all flex items-center gap-1"
              title="Reset to defaults"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>

        {/* Add Item Panel */}
        {isAdding && (
          <form onSubmit={handleAddItem} className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm flex flex-wrap gap-3 items-center animate-in fade-in zoom-in-95">
            <input
              type="text"
              placeholder="Item name (e.g. GraphQL, Tailwind)..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
              className="flex-1 min-w-[200px] text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Category (e.g. Tech, Tool)..."
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-36 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Card
              </button>
            </div>
          </form>
        )}

        {/* Tier Rows */}
        <div className="space-y-2 rounded-2xl overflow-hidden border border-gray-200/90 shadow-sm bg-white p-2">
          {tiers.map((tier: any) => {
            const tierItems = items.filter((item: any) => item.tier === tier.id);
            return (
              <div
                key={tier.id}
                className="flex items-stretch min-h-[84px] rounded-xl overflow-hidden border border-gray-100 bg-gray-50/70"
              >
                {/* Tier Label Box */}
                <div className={`w-24 sm:w-28 shrink-0 flex items-center justify-center font-black text-xl tracking-wider ${tier.color} ${tier.text} shadow-xs`}>
                  {tier.label}
                </div>

                {/* Items in Tier */}
                <div className="flex-1 p-3 flex flex-wrap items-center gap-2.5">
                  {tierItems.length > 0 ? (
                    tierItems.map((item: any) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-200/80 px-3 py-2 shadow-2xs hover:shadow-md transition-all flex items-center gap-2.5 group"
                      >
                        <div>
                          <div className="text-xs font-bold text-gray-900">{item.name}</div>
                          <div className="text-[10px] text-gray-400 font-medium">{item.category}</div>
                        </div>

                        {/* Rank Controls */}
                        <div className="flex flex-col opacity-20 group-hover:opacity-100 transition-opacity">
                          {tier.id !== 'S' && (
                            <button
                              onClick={() => moveTier(item.id, 'up')}
                              className="p-0.5 hover:text-indigo-600 transition-colors"
                              title="Rank up"
                            >
                              <ChevronUp size={13} />
                            </button>
                          )}
                          {tier.id !== 'D' && (
                            <button
                              onClick={() => moveTier(item.id, 'down')}
                              className="p-0.5 hover:text-indigo-600 transition-colors"
                              title="Rank down"
                            >
                              <ChevronDown size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 font-medium italic pl-2">Drop or rank items here</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

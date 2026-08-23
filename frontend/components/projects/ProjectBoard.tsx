"use client";

import { useState } from "react";
import { initialProjectColumns, ProjectColumn } from "@/lib/projectData";
import Avatar from "@/components/Avatar";
import {
  Plus,
  MoreVertical,
  Calendar,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  Zap,
  Filter,
  ArrowUpDown
} from "lucide-react";

export default function ProjectBoard() {
  const [columns] = useState<ProjectColumn[]>(initialProjectColumns);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFC] overflow-hidden select-none w-full">
      {/* Board Toolbar */}
      <div className="h-12 border-b border-gray-100 px-5 bg-white flex items-center justify-between shrink-0">
        <button className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-[11.5px] font-bold text-indigo-600 shadow-sm hover:bg-indigo-50 transition-colors">
          <Plus size={14} strokeWidth={2.5} />
          Add Task
          <ChevronDown size={14} className="ml-1" />
        </button>
        <div className="flex items-center gap-4 text-gray-500">
          <button className="flex items-center gap-1.5 text-[11.5px] font-bold hover:text-gray-800 transition-colors">
            <Zap size={14} /> Automation
          </button>
          <button className="flex items-center gap-1.5 text-[11.5px] font-bold hover:text-gray-800 transition-colors">
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-1.5 text-[11.5px] font-bold hover:text-gray-800 transition-colors">
            <ArrowUpDown size={14} /> Sort
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3.5 sm:p-5 grid grid-cols-4 gap-4 overflow-hidden">
        {columns.map((col) => (
        <div
          key={col.id}
          className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-[#F4F6F8]/60 p-2.5 sm:p-3 shadow-2xs overflow-hidden h-full min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Column Header */}
          <div className="flex items-center justify-between shrink-0 mb-2 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${col.dotClass}`} />
              <h3 className="text-[13.5px] font-black text-gray-900 truncate">
                {col.title}
              </h3>
              <span className="text-[12px] font-bold text-gray-400 ml-0.5">
                {col.count}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <button className="p-1 hover:text-gray-700 rounded-lg hover:bg-gray-200/50 transition-colors" title="Add card to column">
                <Plus size={15} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Column Cards Container - Zero-Scroll High Density */}
          <div className="flex-1 min-h-0 space-y-2 overflow-hidden flex flex-col justify-around my-1">
            {col.cards.map((card) => {
              return (
                <div
                  key={card.id}
                  className="group relative rounded-xl border border-gray-200/90 bg-white p-2.5 shadow-2xs hover:shadow-sm hover:border-gray-300 transition-all shrink-0 flex flex-col justify-between gap-2 cursor-pointer"
                >
                  {/* Card Title Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5 min-w-0 flex-1">
                      {card.completed && (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      )}
                      <h4 className="text-[12.5px] font-bold text-[#111827] leading-snug line-clamp-2">
                        {card.title}
                      </h4>
                    </div>
                    <button className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 shrink-0">
                      <MoreVertical size={14} />
                    </button>
                  </div>

                  {/* Tag if present */}
                  {card.tag && (
                    <div className="flex items-center">
                      <span
                        className={`${card.tag.bg} ${card.tag.text} px-2 py-0.5 rounded-md text-[10.5px] font-extrabold tracking-wide`}
                      >
                        {card.tag.label}
                      </span>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-0.5 text-gray-400 text-[11px] font-semibold">
                    {card.completed ? (
                      // Done column format: date left, avatar right
                      <>
                        <div className="flex items-center gap-1">
                          <Calendar size={13} strokeWidth={2.2} />
                          <span>{card.date}</span>
                        </div>
                        <Avatar person={card.assignee.person} size={22} />
                      </>
                    ) : (
                      // Other columns format: avatar & name left, date & comments right
                      <>
                        <div className="flex items-center gap-1.5 text-gray-700 font-bold truncate pr-1">
                          <Avatar person={card.assignee.person} size={20} />
                          <span className="truncate">{card.assignee.name}</span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0 text-gray-400 font-semibold">
                          <div className="flex items-center gap-1">
                            <Calendar size={13} strokeWidth={2.2} />
                            <span>{card.date}</span>
                          </div>
                          {card.commentsCount ? (
                            <div className="flex items-center gap-1">
                              <MessageSquare size={13} strokeWidth={2.2} />
                              <span>{card.commentsCount}</span>
                            </div>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Task Button at Bottom */}
          <div className="shrink-0 pt-1">
            <button className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[12px] font-bold text-gray-500 hover:text-gray-900 hover:bg-white/80 transition-all text-left">
              <Plus size={15} strokeWidth={2.4} className="text-gray-400" />
              <span>Add task</span>
            </button>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

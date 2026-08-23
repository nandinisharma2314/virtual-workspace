"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function GlobalTimeSelectorContent() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const rangeParam = searchParams.get('range') || 'Weekly';
  const selectedView = ["Daily", "Weekly", "Monthly"].includes(rangeParam) ? rangeParam : "Weekly";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const views = ["Daily", "Weekly", "Monthly"];

  const handleSelect = (view: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('range', view);
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const displayText = selectedView === "Daily" ? "Today" : selectedView === "Weekly" ? "This Week" : "This Month";
  
  const getLabel = (view: string) => {
    if (view === "Daily") return "Today";
    if (view === "Weekly") return "This Week";
    if (view === "Monthly") return "This Month";
    return view;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors shrink-0"
      >
        {displayText}
        <ChevronDown size={13} className="text-gray-400" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+4px)] w-32 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
          <div className="p-1">
            {views.map((view) => (
              <button
                key={view}
                onClick={() => handleSelect(view)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                  selectedView === view 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {getLabel(view)}
                {selectedView === view && <Check size={12} className="text-indigo-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GlobalTimeSelector() {
  return (
    <Suspense fallback={<button className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-2xs">This Week <ChevronDown size={13} className="text-gray-400" /></button>}>
      <GlobalTimeSelectorContent />
    </Suspense>
  );
}

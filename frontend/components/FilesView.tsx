"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Grid,
  List as ListIcon,
  MoreVertical,
  Square,
  FileText,
  ArrowUpRight,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom Dropdown Component
function Dropdown({ 
  label, 
  options, 
  value, 
  onChange, 
  icon: Icon,
  align = "left"
}: { 
  label: string, 
  options: { label: string, value: string }[], 
  value: string, 
  onChange: (v: string) => void,
  icon?: any,
  align?: "left" | "right"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200/80 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
      >
        {Icon && <Icon size={14} className="text-gray-400" />}
        {selectedLabel ? <span className="text-gray-900">{selectedLabel}</span> : label}
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full mt-2 ${align === "right" ? "right-0" : "left-0"} min-w-[160px] bg-white border border-gray-200 shadow-lg rounded-xl z-50 py-1.5 overflow-hidden`}
          >
            <button 
              onClick={() => { onChange(''); setIsOpen(false) }} 
              className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between hover:bg-gray-50 transition-colors ${value === '' ? 'font-bold text-purple-600' : 'text-gray-600'}`}
            >
              None
              {value === '' && <Check size={14} className="text-purple-600" />}
            </button>
            <div className="h-px w-full bg-gray-100 my-1"></div>
            {options.map(o => (
              <button 
                key={o.value} 
                onClick={() => { onChange(o.value); setIsOpen(false) }} 
                className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between hover:bg-gray-50 transition-colors ${value === o.value ? 'font-bold text-purple-600 bg-purple-50/50' : 'text-gray-600'}`}
              >
                {o.label}
                {value === o.value && <Check size={14} className="text-purple-600" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FilesView() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterModified, setFilterModified] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const files = [
    {
      id: 1,
      name: "Dashboard_UI_v2.fig",
      type: "Figma",
      category: "Figma",
      size: "4.2 MB",
      sizeValue: 4.2,
      date: "Modified 2h ago",
      timestamp: 1,
      thumbnail: "bg-[#F4E8FF]",
      icon: null,
      Preview: () => (
        <div className="flex flex-col items-center gap-2">
           <div className="w-28 h-20 bg-white rounded-md shadow-sm border border-gray-100 flex p-1.5 gap-1.5">
             <div className="w-1/3 bg-purple-200 rounded-sm"></div>
             <div className="w-2/3 flex flex-col gap-1.5">
               <div className="h-1/2 bg-blue-200 rounded-sm"></div>
               <div className="h-1/2 bg-blue-200 rounded-sm"></div>
             </div>
           </div>
        </div>
      )
    },
    {
      id: 2,
      name: "Q2 Roadmap.pdf",
      type: "PDF • 12 pages",
      category: "PDF",
      size: "2.4 MB",
      sizeValue: 2.4,
      date: "Modified Yesterday",
      timestamp: 2,
      thumbnail: "bg-[#FDE2E4]",
      icon: (
        <div className="flex flex-col items-center text-[#4B5563]">
          <FileText size={48} strokeWidth={1} />
          <span className="font-bold text-[10px] tracking-widest mt-1">PDF</span>
        </div>
      ),
      Preview: null
    },
    {
      id: 3,
      name: "Design Guidelines.doc",
      type: "Document",
      category: "Document",
      size: "1.8 MB",
      sizeValue: 1.8,
      date: "Modified Aug 28",
      timestamp: 3,
      thumbnail: "bg-[#E0E7FF]",
      icon: (
        <div className="flex flex-col items-center text-[#4B5563]">
          <FileText size={48} strokeWidth={1} />
          <span className="font-bold text-[10px] tracking-widest mt-1">DOC</span>
        </div>
      ),
      Preview: null
    },
    {
      id: 4,
      name: "API_Documentation.pdf",
      type: "PDF • 35 pages",
      category: "PDF",
      size: "3.2 MB",
      sizeValue: 3.2,
      date: "Modified Aug 25",
      timestamp: 4,
      thumbnail: "bg-[#F3F4F6]",
      icon: (
        <div className="flex flex-col items-center text-[#4B5563]">
          <FileText size={48} strokeWidth={1} />
          <span className="font-bold text-[10px] tracking-widest mt-1">PDF</span>
        </div>
      ),
      Preview: null
    },
    {
      id: 5,
      name: "Brand_Assets.zip",
      type: "Archive",
      category: "Archive",
      size: "12.6 MB",
      sizeValue: 12.6,
      date: "Modified Aug 20",
      timestamp: 5,
      thumbnail: "bg-[#D1FAE5]",
      icon: (
        <div className="flex flex-col items-center text-[#4B5563]">
          <FileText size={48} strokeWidth={1} />
          <span className="font-bold text-[10px] tracking-widest mt-1">ZIP</span>
        </div>
      ),
      Preview: null
    }
  ];

  const typeOptions = [
    { label: "Figma", value: "Figma" },
    { label: "PDF", value: "PDF" },
    { label: "Document", value: "Document" },
    { label: "Archive", value: "Archive" }
  ];

  const modifiedOptions = [
    { label: "Today", value: "ago" },
    { label: "Yesterday", value: "Yesterday" },
    { label: "August", value: "Aug" }
  ];

  const sortOptions = [
    { label: "Recent", value: "recent" },
    { label: "Name (A-Z)", value: "name" },
    { label: "Size (Largest)", value: "size-desc" },
    { label: "Size (Smallest)", value: "size-asc" }
  ];

  const filteredAndSortedFiles = useMemo(() => {
    let result = [...files];

    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(file => file.name.toLowerCase().includes(q));
    }

    // Type Filter
    if (filterType) {
      result = result.filter(file => file.category === filterType);
    }

    // Modified Filter
    if (filterModified) {
      result = result.filter(file => file.date.includes(filterModified));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "recent") return a.timestamp - b.timestamp;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size-desc") return b.sizeValue - a.sizeValue;
      if (sortBy === "size-asc") return a.sizeValue - b.sizeValue;
      return 0;
    });

    return result;
  }, [files, searchQuery, filterType, filterModified, sortBy]);

  return (
    <div className="flex w-full h-full min-h-0 flex-col bg-[#FAFAFA] overflow-y-auto">
      <div className="p-8 max-w-[1400px] w-full">
        {/* Header */}
        <div className="flex items-baseline gap-3 mb-8">
          <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">File Manager</h1>
          <div className="text-[13px] text-gray-400 font-semibold flex items-center gap-2">
            Project Alpha <span className="text-gray-300 font-normal">/</span> Marketing <span className="text-gray-300 font-normal">/</span> <span className="font-bold text-gray-900">Social Media</span>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-[18px] font-extrabold text-gray-900">Social Media</h2>
          <span className="text-[12px] text-gray-400 font-semibold">{filteredAndSortedFiles.length} items</span>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1 relative z-20">
            {/* Search */}
            <div className="relative group">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200/80 rounded-xl text-[13px] font-medium w-[280px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm placeholder:text-gray-400 transition-all"
              />
            </div>
            
            {/* Filters */}
            <Dropdown 
              label="Type" 
              options={typeOptions} 
              value={filterType} 
              onChange={setFilterType}
              icon={Filter}
            />
            <Dropdown 
              label="Modified" 
              options={modifiedOptions} 
              value={filterModified} 
              onChange={setFilterModified}
              icon={Filter}
            />
          </div>
          
          <div className="flex items-center gap-4 relative z-20">
             <Dropdown 
              label="Sort: Recent" 
              options={sortOptions} 
              value={sortBy} 
              onChange={setSortBy}
              align="right"
             />
             <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200/80 rounded-xl shadow-sm">
               <button 
                 onClick={() => setViewMode("grid")}
                 className={`p-1.5 rounded-lg shadow-sm transition-colors ${viewMode === "grid" ? "bg-purple-100 text-purple-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
               >
                 <Grid size={16} />
               </button>
               <button 
                 onClick={() => setViewMode("list")}
                 className={`p-1.5 rounded-lg shadow-sm transition-colors ${viewMode === "list" ? "bg-purple-100 text-purple-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
               >
                 <ListIcon size={16} />
               </button>
             </div>
          </div>
        </div>

        {/* File Grid */}
        <motion.div 
          layout
          className={`mb-12 ${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6" : "flex flex-col gap-3"}`}
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedFiles.length > 0 ? filteredAndSortedFiles.map((file) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.25, type: "spring", bounce: 0.3 }}
                key={file.id} 
                className={`bg-white rounded-[18px] border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer ${viewMode === "list" ? "flex items-center h-20" : ""}`}
              >
                {/* Top half / Left side: Colored background with preview */}
                <div className={`${viewMode === "grid" ? "relative h-44 w-full" : "h-full w-24 shrink-0"} flex items-center justify-center ${file.thumbnail}`}>
                  {viewMode === "grid" && (
                    <>
                      <div className="absolute top-3.5 left-3.5 text-white hover:text-white drop-shadow-md">
                        <Square size={18} strokeWidth={2.5} />
                      </div>
                      <div className="absolute top-3.5 right-3.5 text-white hover:text-white drop-shadow-md">
                        <MoreVertical size={18} strokeWidth={2.5} />
                      </div>
                    </>
                  )}
                  {viewMode === "list" ? (file.icon ? <div className="scale-50">{file.icon}</div> : <div className="scale-[0.35]"><file.Preview /></div>) : (file.Preview ? <file.Preview /> : file.icon)}
                </div>
                
                {/* Bottom half / Right side: File info */}
                <div className={`${viewMode === "grid" ? "p-4" : "p-4 flex-1 flex items-center justify-between"}`}>
                  <div className={viewMode === "list" ? "flex items-center gap-12 flex-1" : ""}>
                    <div className={viewMode === "list" ? "w-1/3 min-w-[200px]" : ""}>
                      <h3 className="text-[14px] font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-purple-700 transition-colors">{file.name}</h3>
                      {viewMode === "grid" && (
                        <div className="text-[12px] font-semibold text-gray-400 mb-5">
                          {file.size} <span className="mx-1.5">•</span> {file.type}
                        </div>
                      )}
                    </div>
                    {viewMode === "list" && (
                       <>
                         <div className="text-[12px] font-semibold text-gray-400 w-1/4">
                           {file.type}
                         </div>
                         <div className="text-[12px] font-semibold text-gray-400 w-1/6">
                           {file.size}
                         </div>
                       </>
                    )}
                  </div>

                  <div className={`flex items-center ${viewMode === "grid" ? "justify-between" : "gap-4"} text-[11px] font-semibold text-gray-400`}>
                    <span>{file.date}</span>
                    <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                       <MoreVertical size={16} className="text-gray-400 hover:text-gray-700 transition-colors" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400"
              >
                <FileText size={48} className="mb-4 text-gray-300" strokeWidth={1} />
                <p className="text-[14px] font-semibold">No files match your filters</p>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("");
                    setFilterModified("");
                  }}
                  className="mt-4 text-purple-600 hover:text-purple-700 text-[13px] font-bold"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Recent Activity & Storage */}
        <div className="flex flex-col xl:flex-row gap-8 relative z-10">
          <div className="flex-1">
            <h3 className="text-[11px] font-bold text-gray-400 tracking-[0.1em] uppercase mb-4">Recent Activity</h3>
            
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white border border-gray-200/80 rounded-[18px] p-4 flex items-center gap-5 shadow-sm transition-all"
            >
               <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                 <ArrowUpRight size={20} className="text-purple-600" strokeWidth={2.5} />
               </div>
               
               <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                 <div className="flex items-center gap-2 truncate">
                   <span className="text-[13px] font-medium text-gray-500">You uploaded</span>
                   <span className="text-[13px] font-bold text-gray-900 truncate">Brand_Assets.zip</span>
                   <span className="text-[12px] font-semibold text-gray-400 ml-2 shrink-0">12.6 MB</span>
                 </div>
                 
                 <div className="text-[11px] font-semibold text-gray-400 whitespace-nowrap">
                   20 Aug 2026 <span className="mx-1.5">•</span> 4:32 PM
                 </div>
               </div>
            </motion.div>
            
            <div className="mt-4 pl-2">
                <p className="text-[11px] font-semibold text-gray-400">Tip: Select files to see bulk actions</p>
            </div>
          </div>
          
          <div className="w-full xl:w-[320px] shrink-0 xl:mt-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-gray-200/80 rounded-[18px] p-6 shadow-sm transition-transform cursor-default"
            >
              <div className="text-[13px] font-bold text-gray-900 mb-2">Storage</div>
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-[22px] font-extrabold text-gray-900 tracking-tight">45.2 GB</span>
                <span className="text-[12px] font-semibold text-gray-400">/ 100 GB</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "45.2%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-purple-600 rounded-full"
                ></motion.div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}

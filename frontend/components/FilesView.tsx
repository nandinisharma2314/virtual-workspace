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
  Check,
  Upload,
  Trash2,
  Download,
  Loader2,
  HardDrive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/apis";

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

// Helper to determine file category, extension label, and thumbnail color
function getCategoryAndExt(name: string, mimeOrExt?: string) {
  const nameExt = name?.includes('.') ? name.split('.').pop()?.toLowerCase() || '' : '';
  const typeLower = (mimeOrExt || '').toLowerCase();

  if (typeLower === 'pdf' || nameExt === 'pdf' || typeLower.includes('pdf')) {
    return { category: 'PDF', ext: 'PDF', thumbnail: 'bg-[#FDE2E4]' };
  }
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(nameExt) || typeLower.includes('zip') || typeLower.includes('archive') || typeLower.includes('compressed')) {
    return { category: 'Archive', ext: nameExt ? nameExt.toUpperCase() : 'ZIP', thumbnail: 'bg-[#D1FAE5]' };
  }
  if (nameExt === 'fig' || typeLower === 'figma' || typeLower.includes('fig')) {
    return { category: 'Figma', ext: 'FIG', thumbnail: 'bg-[#F4E8FF]' };
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(nameExt) || typeLower.startsWith('image/')) {
    const ext = (nameExt || typeLower.split('/')[1] || 'IMG').toUpperCase();
    return { category: 'Image', ext: ext.length > 4 ? ext.substring(0, 3) : ext, thumbnail: 'bg-[#FEF3C7]' };
  }
  if (['mp3', 'wav', 'm4a', 'ogg', 'flac'].includes(nameExt) || typeLower.startsWith('audio/')) {
    return { category: 'Audio', ext: (nameExt || 'AUD').toUpperCase(), thumbnail: 'bg-[#FCE7F3]' };
  }
  if (['doc', 'docx', 'txt', 'rtf', 'odt', 'md'].includes(nameExt) || typeLower.includes('word') || typeLower.includes('document') || typeLower.includes('text')) {
    return { category: 'Document', ext: (nameExt || 'DOC').toUpperCase(), thumbnail: 'bg-[#E0E7FF]' };
  }
  return { 
    category: nameExt ? nameExt.toUpperCase() : "Document", 
    ext: (nameExt ? nameExt.substring(0, 3).toUpperCase() : "DOC"), 
    thumbnail: 'bg-[#F3F4F6]' 
  };
}

export default function FilesView() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterModified, setFilterModified] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const [files, setFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) return;
      const res = await fetch(`${API_URL}/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mappedFiles = data.map((f: any) => {
          const { category, ext, thumbnail } = getCategoryAndExt(f.name, f.type);
          let sizeStr = "1.2 MB";
          let sizeValue = 1.2;
          
          if (f.size) {
            if (typeof f.size === 'string') {
              sizeStr = f.size.includes('MB') || f.size.includes('KB') ? f.size : parseFloat(f.size) + " MB";
              sizeValue = parseFloat(f.size) || 1.2;
            } else if (typeof f.size === 'number') {
              if (f.size < 1024 * 1024) {
                sizeStr = (f.size / 1024).toFixed(1) + " KB";
              } else {
                sizeStr = (f.size / 1024 / 1024).toFixed(1) + " MB";
              }
              sizeValue = f.size / 1024 / 1024;
            }
          }
          
          return {
            id: f.id,
            name: f.name,
            type: category,
            category: category,
            storageKey: f.storageKey,
            size: sizeStr,
            sizeValue: sizeValue,
            date: new Date(f.createdAt).toLocaleDateString(),
            timestamp: new Date(f.createdAt).getTime(),
            thumbnail: thumbnail,
            url: f.url || '',
            icon: (
              <div className="flex flex-col items-center text-[#4B5563]">
                <FileText size={44} strokeWidth={1.2} />
                <span className="font-bold text-[10px] tracking-widest mt-1 uppercase">{ext}</span>
              </div>
            ),
          };
        });
        // Sort descending initially
        mappedFiles.sort((a: any, b: any) => b.timestamp - a.timestamp);
        setFiles(mappedFiles);
      }
    } catch (err) {
      console.error("Failed to fetch files", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Upload handler for Cloudflare R2
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) {
        alert("Authentication required. Please log in.");
        setIsUploading(false);
        return;
      }

      // 1. Get presigned upload URL from backend (pointing to Cloudflare R2)
      const urlRes = await fetch(
        `${API_URL}/files/upload-url?filename=${encodeURIComponent(selectedFile.name)}&contentType=${encodeURIComponent(selectedFile.type || 'application/octet-stream')}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!urlRes.ok) {
        throw new Error("Failed to obtain Cloudflare R2 upload URL from server");
      }

      const { uploadUrl, storageKey } = await urlRes.json();

      // 2. Upload file directly to Cloudflare R2
      try {
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: selectedFile,
          headers: { 'Content-Type': selectedFile.type || 'application/octet-stream' }
        });
        if (!uploadRes.ok) {
          console.warn("Direct upload to Cloudflare R2 received non-200 response:", uploadRes.status);
        }
      } catch (uploadErr) {
        console.warn("Cloudflare R2 direct PUT upload encountered network issue or CORS fallback:", uploadErr);
      }

      // 3. Register file metadata in backend
      const createRes = await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type || 'application/octet-stream',
          storageKey: storageKey,
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Failed to save file metadata: ${errText}`);
      }

      await fetchFiles();
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Open or download file using signed URL from Cloudflare R2
  const handleFileClick = async (file: any) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (file.id && token) {
        const res = await fetch(`${API_URL}/files/${file.id}/download-url`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const { downloadUrl } = await res.json();
          if (downloadUrl) {
            window.open(downloadUrl, '_blank');
            return;
          }
        }
      }

      // Direct URL fallback
      if (file.url && file.url !== '#' && file.url !== '') {
        if (file.url.startsWith('data:')) {
          const res = await fetch(file.url);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        } else {
          window.open(file.url, '_blank');
        }
        return;
      }

      alert("No direct download link is available for this file yet.");
    } catch (err) {
      console.error("Failed to download file:", err);
      alert("Failed to download file.");
    }
  };

  // Delete file
  const handleDeleteFile = async (e: React.MouseEvent, fileId: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const res = await fetch(`${API_URL}/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
      } else {
        alert("Failed to delete file.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting file.");
    }
  };

  const typeOptions = [
    { label: "Figma", value: "Figma" },
    { label: "PDF", value: "PDF" },
    { label: "Image", value: "Image" },
    { label: "Audio", value: "Audio" },
    { label: "Document", value: "Document" },
    { label: "Archive", value: "Archive" }
  ];

  const modifiedOptions = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This Month", value: "month" }
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

    // Modified Date Filter
    if (filterModified) {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      result = result.filter(file => {
        const diff = now - file.timestamp;
        if (filterModified === 'today') {
          return diff <= oneDay;
        }
        if (filterModified === 'yesterday') {
          return diff > oneDay && diff <= 2 * oneDay;
        }
        if (filterModified === 'month') {
          const fileDate = new Date(file.timestamp);
          const nowDate = new Date();
          return fileDate.getMonth() === nowDate.getMonth() && fileDate.getFullYear() === nowDate.getFullYear();
        }
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "recent") return b.timestamp - a.timestamp; // Newest first
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size-desc") return b.sizeValue - a.sizeValue;
      if (sortBy === "size-asc") return a.sizeValue - b.sizeValue;
      return 0;
    });

    return result;
  }, [files, searchQuery, filterType, filterModified, sortBy]);

  // Dynamic storage stats
  const totalStorageMB = useMemo(() => {
    return files.reduce((acc, f) => acc + (f.sizeValue || 0), 0);
  }, [files]);
  const totalStorageGB = (totalStorageMB / 1024).toFixed(2);
  const storagePercent = Math.min(100, Math.max(0.5, (totalStorageMB / 1024 / 10) * 100)).toFixed(1);
  const mostRecentFile = files[0];

  return (
    <div className="flex w-full h-full min-h-0 flex-col bg-[#FAFAFA] overflow-y-auto">
      <div className="p-8 max-w-[1400px] w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">File Manager</h1>
              <div className="text-[13px] text-gray-400 font-semibold flex items-center gap-2">
                Project Alpha <span className="text-gray-300 font-normal">/</span> Marketing <span className="text-gray-300 font-normal">/</span> <span className="font-bold text-gray-900">Cloudflare R2 Storage</span>
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUploadFile} 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-[13px] font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading to R2...</span>
                </>
              ) : (
                <>
                  <Upload size={16} strokeWidth={2.3} />
                  <span>Upload File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-[18px] font-extrabold text-gray-900">Files</h2>
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
                 title="Grid View"
               >
                 <Grid size={16} />
               </button>
               <button 
                 onClick={() => setViewMode("list")}
                 className={`p-1.5 rounded-lg shadow-sm transition-colors ${viewMode === "list" ? "bg-purple-100 text-purple-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
                 title="List View"
               >
                 <ListIcon size={16} />
               </button>
             </div>
          </div>
        </div>

        {/* File Grid */}
        {/* File Grid / List */}
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
                onClick={() => handleFileClick(file)}
                className={`bg-white rounded-[18px] border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer ${viewMode === "list" ? "flex items-center h-20" : ""}`}
              >
                {/* Top half / Left side: Colored background with preview */}
                <div className={`${viewMode === "grid" ? "relative h-44 w-full" : "h-full w-24 shrink-0"} flex items-center justify-center ${file.thumbnail}`}>
                  {viewMode === "grid" && (
                    <>
                      <div className="absolute top-3.5 left-3.5 text-gray-500/80 hover:text-gray-700 drop-shadow-sm">
                        <Square size={18} strokeWidth={2} />
                      </div>
                      <button 
                        onClick={(e) => handleDeleteFile(e, file.id)}
                        title="Delete file"
                        className="absolute top-3.5 right-3.5 p-1 rounded-lg bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </>
                  )}
                  {file.icon}
                </div>
                
                {/* Bottom half / Right side: File info */}
                <div className={`${viewMode === "grid" ? "p-4" : "p-4 flex-1 flex items-center justify-between"}`}>
                  <div className={viewMode === "list" ? "flex items-center gap-12 flex-1" : ""}>
                    <div className={viewMode === "list" ? "w-1/3 min-w-[200px]" : ""}>
                      <h3 className="text-[14px] font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-purple-700 transition-colors" title={file.name}>
                        {file.name}
                      </h3>
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
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleFileClick(file); }}
                        title="Download file"
                        className="p-1.5 hover:bg-purple-50 text-gray-400 hover:text-purple-700 rounded-md transition-colors"
                      >
                        <Download size={15} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteFile(e, file.id)}
                        title="Delete file"
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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
                  className="mt-4 text-purple-600 hover:text-purple-700 text-[13px] font-bold cursor-pointer"
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
            
            {mostRecentFile ? (
              <motion.div 
                whileHover={{ y: -2 }}
                onClick={() => handleFileClick(mostRecentFile)}
                className="bg-white border border-gray-200/80 rounded-[18px] p-4 flex items-center gap-5 shadow-sm transition-all cursor-pointer hover:border-purple-200"
              >
                 <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                   <ArrowUpRight size={20} className="text-purple-600" strokeWidth={2.5} />
                 </div>
                 
                 <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                   <div className="flex items-center gap-2 truncate">
                     <span className="text-[13px] font-medium text-gray-500">Latest file:</span>
                     <span className="text-[13px] font-bold text-gray-900 truncate">{mostRecentFile.name}</span>
                     <span className="text-[12px] font-semibold text-gray-400 ml-2 shrink-0">{mostRecentFile.size}</span>
                   </div>
                   
                   <div className="text-[11px] font-semibold text-gray-400 whitespace-nowrap">
                     {mostRecentFile.date}
                   </div>
                 </div>
               </motion.div>
             ) : (
               <div className="bg-white border border-gray-200/80 rounded-[18px] p-6 text-center text-[13px] font-semibold text-gray-400 shadow-sm">
                 No recent activity yet. Upload your first file above.
               </div>
             )}
             
             <div className="mt-4 pl-2">
                 <p className="text-[11px] font-semibold text-gray-400">Tip: Select files to see bulk actions</p>
                 <p className="text-[11px] font-semibold text-gray-400">Stored securely in Cloudflare R2 Object Storage</p>
             </div>
           </div>
           
           <div className="w-full xl:w-[320px] shrink-0 xl:mt-0">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-gray-200/80 rounded-[18px] p-6 shadow-sm transition-transform cursor-default"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-bold text-gray-900">Cloudflare R2 Storage</div>
                <HardDrive size={16} className="text-purple-600" />
              </div>
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-[22px] font-extrabold text-gray-900 tracking-tight">
                  {totalStorageMB > 1024 ? `${totalStorageGB} GB` : `${totalStorageMB.toFixed(1)} MB`}
                </span>
                <span className="text-[12px] font-semibold text-gray-400">/ 10 GB (free tier)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${storagePercent}%` }}
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

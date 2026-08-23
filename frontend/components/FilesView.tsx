"use client";

import { useState } from "react";
import {
  Folder,
  Image as ImageIcon,
  Video,
  FileText,
  Search,
  Plus,
  Filter,
  Grid,
  List as ListIcon,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  UploadCloud,
  FileBox
} from "lucide-react";

// Mock Data
const folderTree = [
  {
    id: 1,
    name: "Project Alpha",
    isOpen: true,
    children: [
      { id: 11, name: "Design Assets", type: "folder", isOpen: false, children: [] },
      { id: 12, name: "Marketing", type: "folder", isOpen: true, children: [
        { id: 121, name: "Social Media", type: "folder" },
        { id: 122, name: "Campaigns", type: "folder" },
      ] },
      { id: 13, name: "Development", type: "folder", isOpen: false, children: [] },
    ],
  },
  {
    id: 2,
    name: "Internal Docs",
    isOpen: false,
    children: [
      { id: 21, name: "HR", type: "folder" },
      { id: 22, name: "Finance", type: "folder" },
    ],
  },
  {
    id: 3,
    name: "Client Deliverables",
    isOpen: false,
    children: [],
  },
];

const initialMediaFiles = [
  { id: 101, name: "hero-banner-v2.jpg", type: "image", size: "3.2 MB", resolution: "1920x1080", date: "Today, 10:45 AM", thumbnail: "bg-indigo-200" },
  { id: 102, name: "product-demo-final.mp4", type: "video", size: "45.1 MB", duration: "02:15", date: "Yesterday", thumbnail: "bg-slate-800" },
  { id: 103, name: "app-icon-set.png", type: "image", size: "1.1 MB", resolution: "1024x1024", date: "May 12", thumbnail: "bg-fuchsia-200" },
  { id: 104, name: "brand-guidelines.pdf", type: "pdf", size: "8.4 MB", pages: 24, date: "May 10", thumbnail: "bg-rose-100" },
  { id: 105, name: "social-promo-1.jpg", type: "image", size: "2.1 MB", resolution: "1080x1080", date: "May 08", thumbnail: "bg-emerald-200" },
  { id: 106, name: "background-pattern.svg", type: "vector", size: "450 KB", resolution: "Vector", date: "May 05", thumbnail: "bg-amber-100" },
  { id: 107, name: "interview-clip.mp4", type: "video", size: "128 MB", duration: "12:30", date: "Apr 28", thumbnail: "bg-slate-700" },
  { id: 108, name: "3d-render-mockup.png", type: "image", size: "14.5 MB", resolution: "4K", date: "Apr 25", thumbnail: "bg-purple-300" },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "image": return <ImageIcon size={24} className="text-white drop-shadow-md" />;
    case "video": return <Video size={24} className="text-white drop-shadow-md" />;
    case "vector": return <ImageIcon size={24} className="text-white drop-shadow-md" />;
    case "pdf": return <FileText size={24} className="text-gray-700 drop-shadow-md" />;
    default: return <FileBox size={24} className="text-white drop-shadow-md" />;
  }
};

export default function FilesView() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [files, setFiles] = useState(initialMediaFiles);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  const handleUpload = () => {
    const newFile = {
      id: Date.now(),
      name: `uploaded-file-${files.length + 1}.png`,
      type: "image",
      size: "2.4 MB",
      resolution: "1920x1080",
      date: "Just now",
      thumbnail: "bg-indigo-100"
    };
    setFiles([newFile, ...files]);
  };

  const handleDelete = (id: number) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType ? f.type === filterType : true;
    return matchesSearch && matchesType;
  });
  // Recursive Tree Item Component
  const TreeItem = ({ item, depth = 0 }: { item: any; depth?: number }) => {
    const [isOpen, setIsOpen] = useState(item.isOpen || false);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div className="w-full">
        <div 
          className="flex w-full items-center gap-2 rounded-lg py-1.5 px-2 hover:bg-gray-100 transition-colors cursor-pointer group"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => hasChildren && setIsOpen(!isOpen)}
        >
          <div className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400 group-hover:text-gray-600">
            {hasChildren ? (
              isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : (
              <span className="w-4" /> // Spacing for items without children
            )}
          </div>
          <Folder size={16} className={isOpen ? "text-indigo-500" : "text-gray-400"} fill="currentColor" fillOpacity={isOpen ? 0.2 : 0} />
          <span className="text-[13px] font-medium text-gray-700 truncate select-none">
            {item.name}
          </span>
        </div>
        {isOpen && hasChildren && (
          <div className="w-full">
            {item.children.map((child: any) => (
              <TreeItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex w-full h-full min-h-0 flex-col bg-white overflow-hidden">
      {/* Topbar equivalent for Files */}
      <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-200/80 bg-white px-6 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-[17px] font-black tracking-tight text-gray-900">
            File Manager
          </h1>
          <div className="h-4 w-[1px] bg-gray-300"></div>
          <div className="flex items-center text-[13px] font-medium text-gray-500">
            <span className="hover:text-gray-900 cursor-pointer">Project Alpha</span>
            <ChevronRight size={14} className="mx-1" />
            <span className="hover:text-gray-900 cursor-pointer">Marketing</span>
            <ChevronRight size={14} className="mx-1" />
            <span className="font-bold text-gray-900">Social Media</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200/80">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Grid size={15} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <ListIcon size={15} />
            </button>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="h-8 w-56 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-[12.5px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button onClick={handleUpload} className="flex h-8 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-[12.5px] font-bold text-white transition-all hover:bg-indigo-700 shadow-sm">
            <UploadCloud size={15} />
            <span>Upload</span>
          </button>
        </div>
      </header>

      {/* Workspace Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        
        {/* Left Sidebar - Directory Tree */}
        <aside className="w-[240px] shrink-0 border-r border-gray-200/80 bg-gray-50/50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200/80 shrink-0">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white py-2 text-[13px] font-bold text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
              <Plus size={16} />
              New Folder
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2 px-2">
              Directories
            </div>
            {folderTree.map((node) => (
              <TreeItem key={node.id} item={node} />
            ))}
            
            <div className="mt-8 text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-2 px-2">
              Storage
            </div>
            <div className="px-2">
              <div className="mb-1 flex items-center justify-between text-[12px] font-bold text-gray-700">
                <span>45.2 GB used</span>
                <span>100 GB</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500 w-[45%]"></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Files Area */}
        <main className="flex-1 overflow-y-auto bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[16px] font-black text-gray-900">Assets ({filteredFiles.length})</h2>
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-[13px] font-bold text-gray-600 hover:text-indigo-600 transition-colors">
                <Filter size={14} />
                {filterType ? `Filter: ${filterType}` : "Filter by type"}
              </button>
              <div className="absolute right-0 mt-2 w-32 rounded-lg border border-gray-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                {['image', 'video', 'pdf', 'vector'].map(type => (
                  <button 
                    key={type}
                    onClick={() => setFilterType(filterType === type ? null : type)}
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === type ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredFiles.map((file) => (
                <div key={file.id} className="group flex flex-col rounded-xl border border-gray-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer">
                  {/* Thumbnail Area */}
                  <div className={`relative aspect-video w-full flex items-center justify-center ${file.thumbnail}`}>
                    {getFileIcon(file.type)}
                    
                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                      <button className="h-8 w-8 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                        <Download size={14} strokeWidth={2.5} />
                      </button>
                      <button className="h-8 w-8 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                        <Share2 size={14} strokeWidth={2.5} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="h-8 w-8 rounded-full bg-white text-rose-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                    
                    {/* Badge */}
                    {file.type === "video" && (
                      <div className="absolute bottom-2 right-2 rounded bg-gray-900/80 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                        {file.duration}
                      </div>
                    )}
                  </div>
                  
                  {/* Info Area */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-[13px] font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={file.name}>
                        {file.name}
                      </h3>
                      <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                      <span>{file.size}</span>
                      <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                      <span>{file.resolution || `${file.pages} pages`}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200/80 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-5 py-2.5 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                <div className="col-span-6">Name</div>
                <div className="col-span-2">Date Added</div>
                <div className="col-span-2">Format / Info</div>
                <div className="col-span-2 text-right">Size</div>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="grid grid-cols-12 gap-4 items-center px-5 py-3 hover:bg-gray-50 transition-colors group cursor-pointer">
                    <div className="col-span-6 flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${file.thumbnail}`}>
                        <div className="scale-75 origin-center">{getFileIcon(file.type)}</div>
                      </div>
                      <span className="text-[13px] font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {file.name}
                      </span>
                    </div>
                    <div className="col-span-2 text-[12.5px] font-medium text-gray-500">
                      {file.date}
                    </div>
                    <div className="col-span-2 text-[12.5px] font-medium text-gray-500">
                      {file.resolution || `${file.pages} pages`}
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-3 text-[12.5px] font-medium text-gray-500">
                      <span>{file.size}</span>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <button className="p-1 hover:text-indigo-600"><Download size={15} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="p-1 hover:text-rose-600"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

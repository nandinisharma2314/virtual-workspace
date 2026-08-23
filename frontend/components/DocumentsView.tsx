"use client";

import { useState } from "react";
import {
  FileText,
  Folder,
  Search,
  Plus,
  MoreVertical,
  UploadCloud,
  FileImage,
  FileSpreadsheet,
  Star,
  Clock,
  Filter,
  Users
} from "lucide-react";

const recentFiles = [
  { id: 1, name: "Q3 Marketing Plan.pdf", type: "pdf", date: "2 hrs ago", size: "2.4 MB", icon: FileText, color: "text-rose-500", bg: "bg-rose-50" },
  { id: 2, name: "Dashboard Redesign.fig", type: "design", date: "4 hrs ago", size: "14.1 MB", icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" },
  { id: 3, name: "Financial Projections.xlsx", type: "sheet", date: "Yesterday", size: "1.2 MB", icon: FileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: 4, name: "API Documentation.md", type: "doc", date: "May 12", size: "45 KB", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
];

const folders = [
  { id: 1, name: "Design Assets", files: 124, size: "1.2 GB", color: "text-amber-500", bg: "bg-amber-100" },
  { id: 2, name: "Marketing", files: 45, size: "340 MB", color: "text-rose-500", bg: "bg-rose-100" },
  { id: 3, name: "Engineering", files: 210, size: "890 MB", color: "text-blue-500", bg: "bg-blue-100" },
  { id: 4, name: "Finance", files: 12, size: "45 MB", color: "text-emerald-500", bg: "bg-emerald-100" },
];

const allFiles = [
  { id: 101, name: "Brand Guidelines.pdf", owner: "Avi Sharma", date: "May 14, 2024", size: "4.2 MB", starred: true },
  { id: 102, name: "Q2 Earnings Report.xlsx", owner: "Neha Sharma", date: "May 10, 2024", size: "1.8 MB", starred: false },
  { id: 103, name: "Onboarding Template.docx", owner: "Priya Singh", date: "May 08, 2024", size: "890 KB", starred: true },
  { id: 104, name: "Hero Banner v2.png", owner: "Rohit Verma", date: "May 05, 2024", size: "3.1 MB", starred: false },
  { id: 105, name: "Client Feedback - Acme.pdf", owner: "Avi Sharma", date: "Apr 28, 2024", size: "1.1 MB", starred: false },
];

const sharedFiles = [
  { id: 201, name: "Team Retreat Ideas.docx", owner: "Priya Singh", date: "Today", size: "125 KB", icon: FileText, sharedBy: "PS" },
  { id: 202, name: "Budget Q3 Final.xlsx", owner: "Neha Sharma", date: "Yesterday", size: "3.4 MB", icon: FileSpreadsheet, sharedBy: "NS" },
  { id: 203, name: "New Logo Options.fig", owner: "Rohit Verma", date: "May 10", size: "22.5 MB", icon: FileImage, sharedBy: "RV" },
];

export default function DocumentsView() {
  const [activeTab, setActiveTab] = useState("My Files");

  const renderMyFiles = () => (
    <>
      {/* Quick Access */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-extrabold text-gray-900 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            Quick Access
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentFiles.map((file) => (
            <div key={file.id} className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${file.bg}`}>
                  <file.icon size={20} className={file.color} />
                </div>
                <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-gray-700">
                  <MoreVertical size={16} />
                </button>
              </div>
              <div>
                <h3 className="text-[13.5px] font-bold text-gray-900 truncate mb-1" title={file.name}>
                  {file.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-semibold text-gray-500">
                  <span>{file.size}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                  <span>{file.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Folders */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-extrabold text-gray-900 flex items-center gap-2">
            <Folder size={16} className="text-gray-400" />
            Folders
          </h2>
          <button className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700">
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs transition-all hover:border-gray-300 hover:bg-gray-50 cursor-pointer group">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${folder.bg}`}>
                <Folder size={24} className={folder.color} fill="currentColor" fillOpacity={0.2} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[14px] font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                  {folder.name}
                </h3>
                <div className="text-[12px] font-medium text-gray-500 mt-0.5">
                  {folder.files} files • {folder.size}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* File List */}
      <section className="pb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-extrabold text-gray-900">All Files</h2>
        </div>
        
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
          <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50/80 px-6 py-3 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider">
            <div className="col-span-6 md:col-span-5">Name</div>
            <div className="col-span-3 hidden md:block">Owner</div>
            <div className="col-span-3">Date Modified</div>
            <div className="col-span-2 md:col-span-1 text-right">Size</div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {allFiles.map((file) => (
              <div key={file.id} className="grid grid-cols-12 gap-4 items-center px-6 py-3.5 hover:bg-gray-50 transition-colors group cursor-pointer">
                <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                    <FileText size={16} />
                  </div>
                  <span className="text-[13.5px] font-bold text-gray-900 truncate">
                    {file.name}
                  </span>
                  {file.starred && <Star size={14} className="text-amber-400" fill="currentColor" />}
                </div>
                <div className="col-span-3 hidden md:flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-700">
                    {file.owner.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-[13px] font-medium text-gray-600 truncate">{file.owner}</span>
                </div>
                <div className="col-span-3 text-[13px] font-medium text-gray-500">
                  {file.date}
                </div>
                <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-3 text-[13px] font-medium text-gray-500">
                  <span>{file.size}</span>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={16} className="text-gray-400 hover:text-gray-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Drag & Drop Zone */}
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 py-12 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/50">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-[15px] font-bold text-gray-900 mb-1">
            Drag & drop files here
          </h3>
          <p className="text-[13px] font-medium text-gray-500 mb-4 max-w-sm">
            Upload your documents, images, and project files directly to the selected folder.
          </p>
          <button className="rounded-xl bg-white border border-gray-200 px-5 py-2 text-[13px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            Browse Files
          </button>
        </div>
      </section>
    </>
  );

  const renderShared = () => (
    <section className="pb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold text-gray-900 flex items-center gap-2">
          <Users size={16} className="text-gray-400" />
          Shared with me
        </h2>
      </div>
      
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
        <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50/80 px-6 py-3 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider">
          <div className="col-span-6 md:col-span-5">Name</div>
          <div className="col-span-3 hidden md:block">Shared By</div>
          <div className="col-span-3">Shared Date</div>
          <div className="col-span-2 md:col-span-1 text-right">Size</div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {sharedFiles.map((file) => (
            <div key={file.id} className="grid grid-cols-12 gap-4 items-center px-6 py-3.5 hover:bg-gray-50 transition-colors group cursor-pointer">
              <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                  <file.icon size={16} />
                </div>
                <span className="text-[13.5px] font-bold text-gray-900 truncate">
                  {file.name}
                </span>
              </div>
              <div className="col-span-3 hidden md:flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700">
                  {file.sharedBy}
                </div>
                <span className="text-[13px] font-medium text-gray-600 truncate">{file.owner}</span>
              </div>
              <div className="col-span-3 text-[13px] font-medium text-gray-500">
                {file.date}
              </div>
              <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-3 text-[13px] font-medium text-gray-500">
                <span>{file.size}</span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16} className="text-gray-400 hover:text-gray-700" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderFavorites = () => (
    <section className="pb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold text-gray-900 flex items-center gap-2">
          <Star size={16} className="text-amber-400" fill="currentColor" />
          Favorites
        </h2>
      </div>
      
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
        <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50/80 px-6 py-3 text-[12px] font-extrabold text-gray-500 uppercase tracking-wider">
          <div className="col-span-6 md:col-span-5">Name</div>
          <div className="col-span-3 hidden md:block">Owner</div>
          <div className="col-span-3">Date Modified</div>
          <div className="col-span-2 md:col-span-1 text-right">Size</div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {allFiles.filter(f => f.starred).map((file) => (
            <div key={file.id} className="grid grid-cols-12 gap-4 items-center px-6 py-3.5 hover:bg-gray-50 transition-colors group cursor-pointer">
              <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                  <FileText size={16} />
                </div>
                <span className="text-[13.5px] font-bold text-gray-900 truncate">
                  {file.name}
                </span>
                <Star size={14} className="text-amber-400" fill="currentColor" />
              </div>
              <div className="col-span-3 hidden md:flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-700">
                  {file.owner.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-[13px] font-medium text-gray-600 truncate">{file.owner}</span>
              </div>
              <div className="col-span-3 text-[13px] font-medium text-gray-500">
                {file.date}
              </div>
              <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-3 text-[13px] font-medium text-gray-500">
                <span>{file.size}</span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16} className="text-gray-400 hover:text-gray-700" />
                </button>
              </div>
            </div>
          ))}
          {allFiles.filter(f => f.starred).length === 0 && (
            <div className="p-8 text-center text-gray-500 text-[13px]">
              No favorite documents found.
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div className="flex w-full h-full min-h-0 flex-col bg-transparent overflow-hidden">
      {/* Topbar equivalent for Documents */}
      <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-200/80 bg-white px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[17px] font-black tracking-tight text-gray-900">
            Documents
          </h1>
          <div className="h-4 w-[1px] bg-gray-300"></div>
          <div className="flex space-x-1">
            <button 
              onClick={() => setActiveTab("My Files")}
              className={`px-3 py-1.5 text-[13px] font-bold rounded-lg transition-colors ${activeTab === "My Files" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
            >
              My Files
            </button>
            <button 
              onClick={() => setActiveTab("Shared")}
              className={`px-3 py-1.5 text-[13px] font-bold rounded-lg transition-colors ${activeTab === "Shared" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Shared
            </button>
            <button 
              onClick={() => setActiveTab("Favorites")}
              className={`px-3 py-1.5 text-[13px] font-bold rounded-lg transition-colors ${activeTab === "Favorites" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Favorites
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search documents..."
              className="h-9 w-64 rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-4 text-[13px] font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button className="flex h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-bold text-gray-700 transition-all hover:bg-gray-50 shadow-sm">
            <Filter size={15} />
            <span>Filter</span>
          </button>
          <button className="flex h-9 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-[13px] font-bold text-white transition-all hover:bg-indigo-700 shadow-sm">
            <Plus size={16} strokeWidth={2.5} />
            <span>Upload</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#FAFBFC]">
        <div className="p-6 mx-auto max-w-7xl space-y-8">
          {activeTab === "My Files" && renderMyFiles()}
          {activeTab === "Shared" && renderShared()}
          {activeTab === "Favorites" && renderFavorites()}
        </div>
      </main>
    </div>
  );
}

"use client";

import Avatar from "@/components/Avatar";
import { Search, Filter, Upload, Folder, FileImage, FileText, File as FileIcon, Archive, MoreHorizontal } from "lucide-react";

const filesData = [
  { id: 1, name: "Wireframes", type: "folder", uploader: { name: "Priya S.", person: "priya" }, size: "-", updated: "May 25, 2025" },
  { id: 2, name: "Designs", type: "folder", uploader: { name: "Neha S.", person: "neha" }, size: "-", updated: "May 28, 2025" },
  { id: 3, name: "Documentation", type: "folder", uploader: { name: "Priya S.", person: "priya" }, size: "-", updated: "May 26, 2025" },
  { id: 4, name: "Assets", type: "folder", uploader: { name: "Vikram J.", person: "vikram" }, size: "-", updated: "May 22, 2025" },
  { id: 5, name: "Website_Wireframes.fig", type: "figma", uploader: { name: "Priya S.", person: "priya" }, size: "4.2 MB", updated: "May 25, 2025" },
  { id: 6, name: "Style_Guide.pdf", type: "pdf", uploader: { name: "Neha S.", person: "neha" }, size: "2.8 MB", updated: "May 24, 2025" },
  { id: 7, name: "Requirements.docx", type: "docx", uploader: { name: "Arjun P.", person: "arjun" }, size: "1.6 MB", updated: "May 20, 2025" },
  { id: 8, name: "Homepage_Design.png", type: "image", uploader: { name: "Neha S.", person: "neha" }, size: "3.1 MB", updated: "May 28, 2025" },
  { id: 9, name: "Logo_Assets.zip", type: "zip", uploader: { name: "Vikram J.", person: "vikram" }, size: "8.7 MB", updated: "May 22, 2025" },
];

export default function ProjectFiles() {
  const getIcon = (type: string) => {
    switch(type) {
      case 'folder': return <Folder className="text-amber-400 fill-amber-400" size={18} />;
      case 'image': return <FileImage className="text-blue-500" size={18} />;
      case 'pdf': return <FileText className="text-rose-500" size={18} />;
      case 'docx': return <FileText className="text-blue-600" size={18} />;
      case 'zip': return <Archive className="text-gray-500" size={18} />;
      case 'figma': return <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 shrink-0" />;
      default: return <FileIcon className="text-gray-400" size={18} />;
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFC] select-none w-full">
      {/* Files Toolbar */}
      <div className="h-12 border-b border-gray-100 px-5 bg-white flex items-center justify-between shrink-0">
        <div className="relative flex items-center w-64">
          <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" strokeWidth={2.2} />
          <input
            type="text"
            placeholder="Search files..."
            className="h-8 w-full rounded-xl border border-gray-200/80 bg-white pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 shadow-2xs transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-[11.5px] font-bold text-gray-600 hover:text-gray-900 transition-colors">
            <Filter size={13} className="text-gray-500" strokeWidth={2.3} />
            Filter
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-[11.5px] font-bold shadow-sm transition-all">
            <Upload size={14} strokeWidth={2.3} />
            <span>Upload</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-5 overflow-y-auto">

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 px-5 text-[12.5px] font-bold text-gray-500 w-1/2">Name</th>
              <th className="py-3 px-5 text-[12.5px] font-bold text-gray-500">Uploaded by</th>
              <th className="py-3 px-5 text-[12.5px] font-bold text-gray-500">Size</th>
              <th className="py-3 px-5 text-[12.5px] font-bold text-gray-500">Updated</th>
              <th className="py-3 px-5 text-[12.5px] font-bold text-gray-500 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filesData.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                <td className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    {getIcon(item.type)}
                    <span className="text-[13px] font-bold text-gray-900">{item.name}</span>
                  </div>
                </td>
                <td className="py-3 px-5">
                  <div className="flex items-center gap-2">
                    <Avatar person={item.uploader.person} size={22} />
                    <span className="text-[12.5px] font-semibold text-gray-700">{item.uploader.name}</span>
                  </div>
                </td>
                <td className="py-3 px-5">
                  <span className="text-[12.5px] font-semibold text-gray-500">{item.size}</span>
                </td>
                <td className="py-3 px-5">
                  <span className="text-[12.5px] font-semibold text-gray-600">{item.updated}</span>
                </td>
                <td className="py-3 px-5 text-right">
                  <button className="text-gray-400 hover:text-gray-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

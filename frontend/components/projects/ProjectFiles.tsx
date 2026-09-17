"use client";

import { useState, useEffect } from "react";
import { useState, useEffect, useRef } from "react";
import Avatar from "@/components/Avatar";
import { Search, Filter, Upload, Folder, FileImage, FileText, File as FileIcon, Archive, MoreHorizontal } from "lucide-react";
import { Search, Filter, Upload, Folder, FileImage, FileText, File as FileIcon, Archive, MoreHorizontal, Loader2 } from "lucide-react";

const initialFilesData = [
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
export default function ProjectFiles({ projectId }: { projectId?: number }) {
  const [filesData, setFilesData] = useState<any[]>(initialFilesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) return;
        const res = await fetch("http://localhost:3001/files", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mappedFiles = data.map((f: any) => {
            const ext = f.type?.toLowerCase() || f.name.split('.').pop()?.toLowerCase();
            let sizeStr = "1.2 MB";
            
            if (f.size) {
              if (typeof f.size === 'string') {
                sizeStr = f.size.includes('MB') || f.size.includes('KB') ? f.size : parseFloat(f.size) + " MB";
              } else if (typeof f.size === 'number') {
  const fetchFiles = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) return;
      const url = projectId 
        ? `http://localhost:3001/files?projectId=${projectId}` 
        : "http://localhost:3001/files";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mappedFiles = data.map((f: any) => {
          const nameExt = f.name?.includes('.') ? f.name.split('.').pop()?.toLowerCase() || '' : '';
          const typeLower = (f.type || '').toLowerCase();
          const ext = nameExt || typeLower;

          let sizeStr = "1.2 MB";
          if (f.size) {
            if (typeof f.size === 'string') {
              sizeStr = f.size.includes('MB') || f.size.includes('KB') ? f.size : parseFloat(f.size) + " MB";
            } else if (typeof f.size === 'number') {
              if (f.size < 1024 * 1024) {
                sizeStr = (f.size / 1024).toFixed(1) + " KB";
              } else {
                sizeStr = (f.size / 1024 / 1024).toFixed(1) + " MB";
              }
            }
          }

            return {
              id: f.id,
              name: f.name,
              type: ext || 'document',
              uploader: { name: "You", person: "you" }, // Ideally fetched from uploader details
              size: sizeStr,
              updated: new Date(f.createdAt).toLocaleDateString(),
              url: f.url || '#'
            };
          });
          mappedFiles.sort((a: any, b: any) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
          return {
            id: f.id,
            name: f.name,
            type: ext || 'document',
            uploader: { name: "You", person: "you" },
            size: sizeStr,
            updated: new Date(f.createdAt).toLocaleDateString(),
            url: f.url || ''
          };
        });
        if (mappedFiles.length > 0) {
          setFilesData(mappedFiles);
        }
      } catch (err) {
        console.error("Failed to fetch project files:", err);
      }
    };
    } catch (err) {
      console.error("Failed to fetch project files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);
  }, [projectId]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) {
        alert("Please log in to upload files.");
        setIsUploading(false);
        return;
      }

      // 1. Get Cloudflare R2 presigned URL
      const urlRes = await fetch(
        `http://localhost:3001/files/upload-url?filename=${encodeURIComponent(selectedFile.name)}&contentType=${encodeURIComponent(selectedFile.type || 'application/octet-stream')}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!urlRes.ok) throw new Error("Failed to get R2 upload URL");
      const { uploadUrl, storageKey } = await urlRes.json();

      // 2. Direct upload to Cloudflare R2
      try {
        await fetch(uploadUrl, {
          method: 'PUT',
          body: selectedFile,
          headers: { 'Content-Type': selectedFile.type || 'application/octet-stream' }
        });
      } catch (err) {
        console.warn("Direct R2 upload encountered network/CORS fallback:", err);
      }

      // 3. Save metadata with projectId
      const createRes = await fetch('http://localhost:3001/files', {
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
          projectId: projectId || undefined
        }),
      });
      if (!createRes.ok) throw new Error("Failed to save file metadata");

      await fetchFiles();
    } catch (err: any) {
      console.error("Project file upload failed:", err);
      alert(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRowClick = async (item: any) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (item.id && token) {
        const res = await fetch(`http://localhost:3001/files/${item.id}/download-url`, {
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

      if (item.url && item.url !== '#' && item.url !== '') {
        window.open(item.url, '_blank');
        return;
      }
      alert("No document link is associated with this demo item.");
    } catch (err) {
      console.error("Failed to open file:", err);
      alert("Failed to open file.");
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'folder': return <Folder className="text-amber-400 fill-amber-400" size={18} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'image': return <FileImage className="text-blue-500" size={18} />;
      case 'pdf': return <FileText className="text-rose-500" size={18} />;
      case 'docx':
      case 'doc':
      case 'txt': return <FileText className="text-blue-600" size={18} />;
      case 'zip':
      case 'rar': return <Archive className="text-gray-500" size={18} />;
      case 'figma':
      case 'fig': return <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 shrink-0" />;
      default: return <FileIcon className="text-gray-400" size={18} />;
    const t = type.toLowerCase();
    if (t === 'folder') return <Folder className="text-amber-400 fill-amber-400" size={18} />;
    if (t.includes('jpg') || t.includes('jpeg') || t.includes('png') || t.includes('gif') || t.includes('webp') || t.includes('image')) {
      return <FileImage className="text-blue-500" size={18} />;
    }
    if (t.includes('pdf')) return <FileText className="text-rose-500" size={18} />;
    if (t.includes('docx') || t.includes('doc') || t.includes('txt') || t.includes('word')) {
      return <FileText className="text-blue-600" size={18} />;
    }
    if (t.includes('zip') || t.includes('rar') || t.includes('archive') || t.includes('tar')) {
      return <Archive className="text-gray-500" size={18} />;
    }
    if (t.includes('figma') || t.includes('fig')) {
      return <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 shrink-0" />;
    }
    return <FileIcon className="text-gray-400" size={18} />;
  };

  const filteredFiles = filesData.filter(f => 
    !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFC] select-none w-full">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUploadFile} 
        className="hidden" 
      />

      {/* Files Toolbar */}
      <div className="h-12 border-b border-gray-100 px-5 bg-white flex items-center justify-between shrink-0">
        <div className="relative flex items-center w-64">
          <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" strokeWidth={2.2} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-1.5 text-[11.5px] font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={14} strokeWidth={2.3} />
                <span>Upload</span>
              </>
            )}
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
            {filesData.length > 0 ? filesData.map((item) => (
              <tr 
                key={item.id} 
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (item.url && item.url !== '#') {
                    if (item.url.startsWith('data:')) {
                      fetch(item.url)
                        .then(res => res.blob())
                        .then(blob => {
                          const url = URL.createObjectURL(blob);
                          window.open(url, '_blank');
                        });
                    } else {
                      window.open(item.url, '_blank');
                    }
                  } else {
                    alert("This is a demo file and does not have an associated document.");
                  }
                }}
              >
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
            )) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400 text-[13px]">
                  No files uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
            </thead>
            <tbody>
              {filteredFiles.length > 0 ? filteredFiles.map((item) => (
                <tr 
                  key={item.id} 
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  onClick={() => handleRowClick(item)}
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      {getIcon(item.type)}
                      <span className="text-[13px] font-bold text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <Avatar person={item.uploader?.person || "you"} size={22} />
                      <span className="text-[12.5px] font-semibold text-gray-700">{item.uploader?.name || "You"}</span>
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
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-[13px]">
                    No files found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}

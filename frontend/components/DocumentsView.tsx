"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Save,
  Check,
  Clock,
  Eye,
  Edit3,
  Copy,
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Sparkles,
  ChevronRight,
  FolderOpen
} from "lucide-react";
import { API_URL, getAuthHeaders, getActiveWorkspaceId } from "@/lib/apis";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { toast, confirmDialog } from "@/lib/toast";

interface DocumentItem {
  id: number;
  title: string;
  content: string | null;
  projectId?: number | null;
  authorId?: number | null;
  workspaceId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsView() {
  const { currentWorkspace, can } = useWorkspace();
  const canManage = Boolean(currentWorkspace?.isOwner) || can("documents:manage");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isPreview, setIsPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeWsId = currentWorkspace?.id || getActiveWorkspaceId();
      const headers = getAuthHeaders(activeWsId ? { "x-workspace-id": String(activeWsId) } : {});
      const url = activeWsId ? `${API_URL}/documents?workspaceId=${activeWsId}` : `${API_URL}/documents`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data: DocumentItem[] = await res.json();
        setDocuments(data);
        if (data.length > 0) {
          // If no doc is selected or current selected is not in new list, pick first
          setSelectedDoc(prev => {
            if (prev) {
              const found = data.find(d => d.id === prev.id);
              if (found) return found;
            }
            return data[0];
          });
        } else {
          setSelectedDoc(null);
        }
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchDocuments();
    const handleWsChanged = () => fetchDocuments();
    window.addEventListener("workspaceChanged", handleWsChanged);
    return () => window.removeEventListener("workspaceChanged", handleWsChanged);
  }, [fetchDocuments]);

  useEffect(() => {
    if (selectedDoc) {
      setTitle(selectedDoc.title || "");
      setContent(selectedDoc.content || "");
      setSaveStatus("saved");
    } else {
      setTitle("");
      setContent("");
      setSaveStatus("saved");
    }
  }, [selectedDoc?.id]);

  const handleCreateDocument = async () => {
    try {
      const activeWsId = currentWorkspace?.id || getActiveWorkspaceId();
      const headers = getAuthHeaders({ "Content-Type": "application/json" });

      const newDocPayload = {
        title: "Untitled Document",
        content: "# Untitled Document\n\nStart writing your document here...",
        workspaceId: activeWsId ? Number(activeWsId) : undefined,
      };

      const res = await fetch(`${API_URL}/documents`, {
        method: "POST",
        headers,
        body: JSON.stringify(newDocPayload),
      });

      if (res.ok) {
        const created: DocumentItem = await res.json();
        setDocuments(prev => [created, ...prev]);
        setSelectedDoc(created);
        toast.success("New document created");
      }
    } catch (err) {
      console.error("Failed to create document:", err);
      toast.error("Failed to create document");
    }
  };

  const handleSave = async (customTitle?: string, customContent?: string) => {
    if (!selectedDoc) return;
    const finalTitle = customTitle !== undefined ? customTitle : title;
    const finalContent = customContent !== undefined ? customContent : content;

    setIsSaving(true);
    setSaveStatus("saving");
    try {
      const headers = getAuthHeaders({ "Content-Type": "application/json" });
      const res = await fetch(`${API_URL}/documents/${selectedDoc.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          title: finalTitle.trim() || "Untitled Document",
          content: finalContent,
        }),
      });

      if (res.ok) {
        const updated: DocumentItem = await res.json();
        setDocuments(prev => prev.map(d => (d.id === updated.id ? updated : d)));
        setSelectedDoc(updated);
        setSaveStatus("saved");
      }
    } catch (err) {
      console.error("Failed to save document:", err);
      setSaveStatus("unsaved");
      toast.error("Error saving document");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(val, content);
    }, 1200);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(title, val);
    }, 1500);
  };

  const handleDeleteDocument = () => {
    if (!selectedDoc) return;
    confirmDialog({
      title: "Delete Document",
      message: `Are you sure you want to permanently delete "${selectedDoc.title}"?`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const headers = getAuthHeaders();
          const res = await fetch(`${API_URL}/documents/${selectedDoc.id}`, {
            method: "DELETE",
            headers,
          });

          if (res.ok) {
            setDocuments(prev => prev.filter(d => d.id !== selectedDoc.id));
            setSelectedDoc(prev => {
              const remaining = documents.filter(d => d.id !== selectedDoc.id);
              return remaining.length > 0 ? remaining[0] : null;
            });
            toast.info("Document deleted");
          }
        } catch (err) {
          console.error("Failed to delete document:", err);
          toast.error("Failed to delete document");
        }
      },
    });
  };

  const handleInsertFormatting = (prefix: string, suffix: string = "") => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previous = textarea.value;
    const selected = previous.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const next = previous.substring(0, start) + replacement + previous.substring(end);
    setContent(next);
    setSaveStatus("unsaved");
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 50);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Markdown copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.content && doc.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="flex w-full h-full min-h-0 overflow-hidden bg-white">
      {/* Left Sidebar: Document List */}
      <div className="w-[280px] shrink-0 border-r border-gray-200/80 bg-[#FAFBFC] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FileText size={16} />
              </div>
              <h2 className="text-[14px] font-black tracking-tight text-gray-900">Documents</h2>
            </div>
            {canManage && (
              <button
                onClick={handleCreateDocument}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold shadow-2xs transition-all cursor-pointer"
                title="New Document"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>New</span>
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200/80 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Document items list */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-gray-400">Loading documents...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-6 text-center">
              <FolderOpen size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-semibold text-gray-500">No documents found</p>
              <p className="text-[11px] text-gray-400 mt-1">Click "+ New" to start writing.</p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              const dateStr = doc.updatedAt
                ? new Date(doc.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Recently";
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all border flex items-start justify-between cursor-pointer ${
                    isSelected
                      ? "bg-white border-indigo-200 text-indigo-900 shadow-xs ring-1 ring-indigo-500/10"
                      : "border-transparent text-gray-700 hover:bg-gray-100/60"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <FileText size={14} className={isSelected ? "text-indigo-600 shrink-0" : "text-gray-400 shrink-0"} />
                      <span className="text-[13px] font-bold truncate block">{doc.title || "Untitled Document"}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5 line-clamp-1">
                      {doc.content ? doc.content.replace(/^#+\s*/g, '').slice(0, 45) : "Empty document"}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 shrink-0 mt-0.5">{dateStr}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content: Document Editor */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-white">
        {selectedDoc ? (
          <>
            {/* Top Toolbar */}
            <div className="px-6 py-3 border-b border-gray-100 shrink-0 flex items-center justify-between bg-white">
              {/* Document status info */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Clock size={13} className="text-gray-400" />
                  <span>
                    Updated {selectedDoc.updatedAt ? new Date(selectedDoc.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                  </span>
                </span>
                <span className="text-gray-200">•</span>
                <span className="text-xs font-semibold text-gray-500">
                  {wordCount} words, {charCount} chars
                </span>
                <span className="text-gray-200">•</span>
                <span className="text-xs font-semibold">
                  {canManage ? (
                    <>
                      {saveStatus === "saving" && <span className="text-amber-500 flex items-center gap-1">Saving...</span>}
                      {saveStatus === "saved" && <span className="text-emerald-600 flex items-center gap-1"><Check size={12} /> Saved</span>}
                      {saveStatus === "unsaved" && <span className="text-gray-400">Unsaved changes</span>}
                    </>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Read-Only
                    </span>
                  )}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                    isPreview
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Toggle Preview / Edit"
                >
                  {isPreview ? <Edit3 size={13} /> : <Eye size={13} />}
                  <span>{isPreview ? "Edit Mode" : "Preview"}</span>
                </button>

                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer"
                  title="Copy Raw Markdown"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                {canManage && (
                  <>
                    <button
                      onClick={() => handleSave()}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      <Save size={13} />
                      <span>{isSaving ? "Saving..." : "Save"}</span>
                    </button>

                    <button
                      onClick={handleDeleteDocument}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Markdown Formatting Bar (when not previewing) */}
            {canManage && !isPreview && (
              <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-1 bg-gray-50/50 shrink-0">
                <button
                  onClick={() => handleInsertFormatting("**", "**")}
                  className="p-1.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
                  title="Bold"
                >
                  <Bold size={14} />
                </button>
                <button
                  onClick={() => handleInsertFormatting("*", "*")}
                  className="p-1.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
                  title="Italic"
                >
                  <Italic size={14} />
                </button>
                <button
                  onClick={() => handleInsertFormatting("`", "`")}
                  className="p-1.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
                  title="Inline Code"
                >
                  <Code size={14} />
                </button>
                <div className="h-4 w-[1px] bg-gray-200 mx-1" />
                <button
                  onClick={() => handleInsertFormatting("# ")}
                  className="p-1.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
                  title="Heading 1"
                >
                  <Heading1 size={14} />
                </button>
                <button
                  onClick={() => handleInsertFormatting("## ")}
                  className="p-1.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
                  title="Heading 2"
                >
                  <Heading2 size={14} />
                </button>
                <div className="h-4 w-[1px] bg-gray-200 mx-1" />
                <button
                  onClick={() => handleInsertFormatting("- ")}
                  className="p-1.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
                  title="Bullet List"
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => handleInsertFormatting("1. ")}
                  className="p-1.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered size={14} />
                </button>
                <button
                  onClick={() => handleInsertFormatting("> ")}
                  className="p-1.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
                  title="Blockquote"
                >
                  <Quote size={14} />
                </button>
              </div>
            )}

            {/* Document Body Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
              {/* Document Title Input */}
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                readOnly={!canManage}
                placeholder="Untitled Document"
                className={`w-full text-3xl font-black text-gray-900 border-none outline-none tracking-tight mb-6 bg-transparent placeholder-gray-300 ${!canManage ? 'cursor-default' : ''}`}
              />

              {/* Editor or Preview */}
              {isPreview ? (
                <div className="prose prose-indigo max-w-none text-gray-800 leading-relaxed space-y-4">
                  {content.split("\n").map((line, idx) => {
                    if (line.startsWith("# ")) {
                      return <h1 key={idx} className="text-2xl font-black text-gray-900 mt-6 mb-3">{line.replace(/^#\s*/, "")}</h1>;
                    }
                    if (line.startsWith("## ")) {
                      return <h2 key={idx} className="text-xl font-bold text-gray-900 mt-5 mb-2">{line.replace(/^##\s*/, "")}</h2>;
                    }
                    if (line.startsWith("### ")) {
                      return <h3 key={idx} className="text-lg font-bold text-gray-900 mt-4 mb-2">{line.replace(/^###\s*/, "")}</h3>;
                    }
                    if (line.startsWith("- ") || line.startsWith("* ")) {
                      return (
                        <li key={idx} className="ml-4 list-disc text-gray-700">
                          {line.replace(/^[-*]\s*/, "")}
                        </li>
                      );
                    }
                    if (line.startsWith("> ")) {
                      return (
                        <blockquote key={idx} className="border-l-4 border-indigo-400 pl-4 py-1 italic text-gray-600 bg-gray-50 rounded-r">
                          {line.replace(/^>\s*/, "")}
                        </blockquote>
                      );
                    }
                    if (line.trim() === "") {
                      return <div key={idx} className="h-3" />;
                    }
                    return <p key={idx} className="text-gray-700 leading-relaxed">{line}</p>;
                  })}
                </div>
              ) : (
                <textarea
                  ref={editorRef}
                  value={content}
                  onChange={handleContentChange}
                  readOnly={!canManage}
                  placeholder="Write your document content here in Markdown format..."
                  rows={25}
                  className={`w-full font-mono text-[14px] leading-relaxed text-gray-800 border-none outline-none resize-none bg-transparent placeholder-gray-300 ${!canManage ? 'cursor-default' : ''}`}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">No Document Selected</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Create product specs, RFCs, architectural decisions, and notes for your workspace team.
            </p>
            {canManage && (
              <button
                onClick={handleCreateDocument}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                Create Document
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

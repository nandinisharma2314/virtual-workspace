"use client";

import Avatar from "@/components/Avatar";
import { API_URL } from "@/lib/apis";
import {
  X,
  Pencil,
  UserPlus,
  Users,
  Search,
  Bell,
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  FileText,
  FolderArchive,
  FileCode,
  BellOff,
  Link,
  LogOut,
  PenTool,
  FileArchive,
  File,
  MoreVertical,
  Lock,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Check,
  Clock,
  FolderKanban,
} from "lucide-react";
import { BOARD_BACKGROUNDS } from "./templates/MyTasksBoard";
import { channelTemplates } from "@/lib/templateData";
import { useRouter } from "next/navigation";

import { useEffect, useState, useRef } from "react";

type Props = {
  onClose?: () => void;
  channelId?: string;
  onUpdate?: () => void; // Optional callback if parent wants to refresh
};

export default function ChatInfoPanel({ onClose, channelId = "c-general", onUpdate }: Props) {
  const router = useRouter();
  const [info, setInfo] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addMemberError, setAddMemberError] = useState("");
  const [addMemberSuccess, setAddMemberSuccess] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [pendingFeedback, setPendingFeedback] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const [activeMemberMenu, setActiveMemberMenu] = useState<number | null>(null);
  const [memberActionLoading, setMemberActionLoading] = useState<number | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [viewAllMembers, setViewAllMembers] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Chat Wallpaper & Template state
  const [panelBg, setPanelBg] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`chat_bg_${channelId}`) || "";
    }
    return "";
  });
  const [panelTemplateId, setPanelTemplateId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`channel_template_${channelId}`) || null;
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBg = localStorage.getItem(`chat_bg_${channelId}`);
      const savedTemplate = localStorage.getItem(`channel_template_${channelId}`);
      setPanelBg(savedBg || (info?.bgGradient !== "white" ? info?.bgGradient : "") || "");
      setPanelTemplateId(savedTemplate || null);
    }
  }, [channelId, info?.bgGradient]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.channelId === channelId) {
        setPanelBg(e.detail.bg || "");
        setPanelTemplateId(e.detail.templateId || null);
      }
    };
    window.addEventListener("chat-wallpaper-updated" as any, handleUpdate);
    return () => window.removeEventListener("chat-wallpaper-updated" as any, handleUpdate);
  }, [channelId]);

  const handleQuickSelectBg = async (bgUrl: string) => {
    setPanelBg(bgUrl);
    const matchingTemplate = channelTemplates.find((t) => t.templateConfig?.bgImage === bgUrl);
    const templateId = matchingTemplate?.id;
    if (typeof window !== "undefined") {
      localStorage.setItem(`chat_bg_${channelId}`, bgUrl);
      if (templateId) {
        localStorage.setItem(`channel_template_${channelId}`, templateId);
        setPanelTemplateId(templateId);
      }
    }
    window.dispatchEvent(
      new CustomEvent("chat-wallpaper-updated", {
        detail: { channelId, bg: bgUrl, templateId },
      })
    );

    if (!channelId.startsWith("dm-")) {
      try {
        const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
        if (token) {
          await fetch(`${API_URL}/chat/info/${channelId}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: info?.name || channelId,
              description: info?.description || "",
              bgGradient: bgUrl,
            }),
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleResetBg = async () => {
    setPanelBg("");
    setPanelTemplateId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`chat_bg_${channelId}`);
      localStorage.removeItem(`channel_template_${channelId}`);
    }
    window.dispatchEvent(
      new CustomEvent("chat-wallpaper-updated", {
        detail: { channelId, bg: "", templateId: null },
      })
    );

    if (!channelId.startsWith("dm-")) {
      try {
        const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
        if (token) {
          await fetch(`${API_URL}/chat/info/${channelId}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: info?.name || channelId,
              description: info?.description || "",
              bgGradient: "white",
            }),
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const currentUserId = currentUser?.id || currentUser?.sub;
  const isCreator = info?.creatorId ? (info.creatorId === currentUserId) : (currentUser?.role === 'Admin');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const fetchInfo = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) return;
      
      // Fetch channel info
      const res = await fetch(`${API_URL}/chat/info/${channelId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInfo(data);
        setEditName(data.name);
        setEditDesc(data.description);
      }

      // Fetch current user
      if (!currentUser) {
        const userRes = await fetch(`${API_URL}/auth/me?_t=${Date.now()}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData);
        }
      }

      // Fetch workspace users for member picker
      fetch(`${API_URL}/chat/direct-message-users`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setAllUsers(data);
        })
        .catch(console.error);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [channelId]);

  const handleAddMember = async (targetEmail?: string) => {
    const emailToUse = (targetEmail || memberEmail).trim();
    if (!emailToUse) return;
    setIsAdding(true);
    setAddMemberError("");
    setAddMemberSuccess("");
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const res = await fetch(`${API_URL}/chat/members/${channelId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: emailToUse })
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setMemberEmail("");
        setAddMemberSuccess(data.message || "Invitation sent successfully!");
        setTimeout(() => setAddMemberSuccess(""), 4000);
        fetchInfo();
        if (onUpdate) onUpdate();
        window.dispatchEvent(new CustomEvent("refresh-chat-channels"));
      } else {
        setAddMemberError(data.message || "Failed to invite member");
      }
    } catch (e) {
      setAddMemberError("An error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this channel?`)) {
      return;
    }
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return;
    setMemberActionLoading(memberId);
    try {
      const res = await fetch(`${API_URL}/chat/channels/${channelId}/members/${memberId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setActiveMemberMenu(null);
        await fetchInfo();
        if (onUpdate) onUpdate();
        window.dispatchEvent(new CustomEvent("refresh-chat-channels"));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to remove member");
      }
    } catch (e) {
      console.error(e);
      alert("Error removing member");
    } finally {
      setMemberActionLoading(null);
    }
  };

  const handleRevokeInvitation = async (targetUserId: number) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/chat/channels/${channelId}/invitations/${targetUserId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchInfo();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResendInvitation = async (email: string) => {
    setResendingEmail(email);
    setPendingFeedback(null);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const res = await fetch(`${API_URL}/chat/members/${channelId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setPendingFeedback(data.message || `Invitation sent to ${email}`);
        setTimeout(() => setPendingFeedback(null), 4000);
        await fetchInfo();
      } else {
        setPendingFeedback(data.message || "Failed to resend invitation");
        setTimeout(() => setPendingFeedback(null), 4000);
      }
    } catch (e) {
      setPendingFeedback("Failed to resend invitation");
      setTimeout(() => setPendingFeedback(null), 4000);
    } finally {
      setResendingEmail(null);
    }
  };

  const handleSaveInfo = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) return;
      const res = await fetch(`${API_URL}/chat/info/${channelId}`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: editName, description: editDesc })
      });
      if (res.ok) {
        const updated = await res.json();
        setInfo(updated);
        setIsEditing(false);
        if (onUpdate) onUpdate(); // Trigger re-render of ChatFeed if passed
      }
    } catch(e) {
      console.error("Failed to save", e);
    }
  };

  const renderFileIcon = (type: string) => {
    if (type === "pdf") {
      return (
        <div className="h-7 w-7 rounded-lg bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
          PDF
        </div>
      );
    }
    if (type === "doc") {
      return (
        <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
          Doc
        </div>
      );
    }
    if (type === "figma") {
      return (
        <div className="h-7 w-7 rounded-lg bg-gray-900 text-white flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
          Fig
        </div>
      );
    }
    return (
      <div className="h-7 w-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shadow-2xs shrink-0">
        ZIP
      </div>
    );
  };

  return (
    <div className="w-[310px] lg:w-[335px] xl:w-[350px] shrink-0 bg-white flex flex-col h-full overflow-hidden border-l border-gray-200/80 text-[#111827] select-none">
      {/* Header Bar */}
      <div className="h-12 shrink-0 border-b border-gray-200/80 px-4 flex items-center justify-between bg-white z-10">
        <h2 className="text-[14px] font-bold text-gray-900">
          Channel info
        </h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          title="Close panel"
        >
          <X size={17} strokeWidth={2.2} />
        </button>
      </div>

      {/* High-density zero-scroll content container */}
      <div className="flex-1 min-h-0 px-4 py-3 flex flex-col justify-between overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-2">
        
        {/* Channel Header Info */}
        {isEditing ? (
          <div className="shrink-0 flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 shadow-2xs">
            <input 
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-[13px] font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              placeholder="Channel Name"
            />
            <textarea 
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-[11.5px] font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none h-16"
              placeholder="Channel Description"
            />
            <div className="flex justify-end gap-1.5 mt-1">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditName(info?.name || "");
                  setEditDesc(info?.description || "");
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveInfo}
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="shrink-0 flex items-start gap-3">
            <div className={`w-11 h-11 rounded-2xl ${info?.bgGradient ? `bg-gradient-to-br ${info.bgGradient}` : 'bg-gray-100'} ${info?.bgGradient ? 'text-white' : 'text-gray-700'} font-black text-2xl flex items-center justify-center shrink-0 shadow-2xs`}>
              {channelId !== 'c-general' && !channelId.startsWith('dm-') ? <Lock size={20} /> : "#"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-extrabold text-gray-900 truncate">
                  {info?.name || "# general"}
                </span>
                {isCreator && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100 transition-colors"
                    title="Edit Channel Details"
                  >
                    <Pencil size={13} strokeWidth={2.2} />
                  </button>
                )}
              </div>
              <p className="text-[11.5px] font-medium text-gray-400 mt-0.5 leading-snug break-words pr-2">
                {info?.description || "Company wide announcements and general discussion"}
              </p>
              {channelId !== 'c-general' && !channelId.startsWith('dm-') && (
                <div className="inline-flex items-center gap-1 mt-1 text-[10.5px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  <Lock size={10} strokeWidth={2.5} />
                  <span>Private Channel</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Toolbar Row */}
        <div className="shrink-0 flex items-center justify-between px-2 pt-1 pb-1 border-b border-gray-100">
          {isCreator && (
            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={() => setIsAddingMember(!isAddingMember)}
                className={`h-9 w-9 rounded-full border flex items-center justify-center shadow-2xs transition-all ${
                  isAddingMember
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "border-gray-200/90 bg-white hover:bg-gray-50 text-gray-600"
                }`}
                title="Add people to channel"
              >
                <UserPlus size={15} strokeWidth={2} />
              </button>
              <span className="text-[11px] font-semibold text-gray-500">Add</span>
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={() => setViewAllMembers(!viewAllMembers)}
              className={`h-9 w-9 rounded-full border flex items-center justify-center shadow-2xs transition-all ${
                viewAllMembers 
                  ? "bg-blue-50 border-blue-200 text-blue-600" 
                  : "border-gray-200/90 bg-white hover:bg-gray-50 text-gray-600"
              }`}
            >
              <Users size={15} strokeWidth={2} />
            </button>
            <span className="text-[11px] font-semibold text-gray-500">Members</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className={`h-9 w-9 rounded-full border flex items-center justify-center shadow-2xs transition-all ${
                showSearch 
                  ? "bg-blue-50 border-blue-200 text-blue-600" 
                  : "border-gray-200/90 bg-white hover:bg-gray-50 text-gray-600"
              }`}
            >
              <Search size={15} strokeWidth={2} />
            </button>
            <span className="text-[11px] font-semibold text-gray-500">Search</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`h-9 w-9 rounded-full border flex items-center justify-center shadow-2xs transition-all ${
                isMuted 
                  ? "bg-red-50 border-red-200 text-red-500" 
                  : "border-gray-200/90 bg-white hover:bg-gray-50 text-gray-600"
              }`}
            >
              {isMuted ? <BellOff size={15} strokeWidth={2} /> : <Bell size={15} strokeWidth={2} />}
            </button>
            <span className={`text-[11px] font-semibold ${isMuted ? 'text-red-500' : 'text-gray-500'}`}>
              {isMuted ? 'Muted' : 'Mute'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 relative">
            <button 
              onClick={() => setShowMore(!showMore)}
              className={`h-9 w-9 rounded-full border flex items-center justify-center shadow-2xs transition-all ${
                showMore 
                  ? "bg-gray-100 border-gray-300 text-gray-900" 
                  : "border-gray-200/90 bg-white hover:bg-gray-50 text-gray-600"
              }`}
            >
              <MoreHorizontal size={15} strokeWidth={2} />
            </button>
            <span className="text-[11px] font-semibold text-gray-500">More</span>
            
            {/* More Dropdown */}
            {showMore && (
              <div className="absolute top-12 right-0 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden">
                <button 
                  onClick={handleCopyLink}
                  className="w-full px-3 py-2 text-[12px] font-semibold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Link size={14} className={linkCopied ? "text-green-500" : "text-gray-400"} />
                  {linkCopied ? "Copied!" : "Copy link"}
                </button>
                <div className="h-px bg-gray-100 w-full my-0.5" />
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to leave this channel?")) {
                      alert("You have left the channel. (Simulation)");
                      setShowMore(false);
                    }
                  }}
                  className="w-full px-3 py-2 text-[12px] font-semibold text-red-600 flex items-center gap-2 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} className="text-red-500" />
                  Leave channel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Wallpaper & Template Card */}
        <div className="shrink-0 bg-gray-50/80 border border-gray-200/80 rounded-2xl p-3 flex flex-col gap-2.5 shadow-2xs my-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[12px] font-black text-gray-900">
              <Sparkles size={13} className="text-indigo-600" />
              <span>Chat Wallpaper & Templates</span>
            </div>
            {panelBg && panelBg !== "white" && panelBg !== "default" && (
              <button
                onClick={handleResetBg}
                className="text-[10.5px] font-bold text-gray-400 hover:text-rose-600 transition-colors"
                title="Reset to white"
              >
                Reset
              </button>
            )}
          </div>

          {/* Active Preview Thumbnail & Name */}
          <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-white border border-gray-200/70 shadow-2xs">
            <div
              className={`w-11 h-8 rounded-lg overflow-hidden shrink-0 border border-black/10 relative ${
                panelBg && !panelBg.startsWith("from-") && !panelBg.startsWith("bg-") && panelBg !== "white" && panelBg !== "default"
                  ? "bg-cover bg-center"
                  : panelBg && (panelBg.startsWith("from-") || panelBg.startsWith("bg-"))
                  ? `bg-gradient-to-br ${panelBg}`
                  : "bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-400"
              }`}
              style={
                panelBg && !panelBg.startsWith("from-") && !panelBg.startsWith("bg-") && panelBg !== "white" && panelBg !== "default"
                  ? { backgroundImage: `url('${panelBg}')` }
                  : {}
              }
            >
              {(!panelBg || panelBg === "white" || panelBg === "default") && "White"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-extrabold text-gray-900 truncate">
                {BOARD_BACKGROUNDS.find((b) => b.image === panelBg)?.name ||
                  (panelTemplateId && channelTemplates.find((t) => t.id === panelTemplateId)?.name) ||
                  (panelBg?.startsWith("from-") ? "Gradient Theme" : "Clean Light (Default)")}
              </div>
              <div className="text-[10px] text-gray-400 truncate font-medium">
                {BOARD_BACKGROUNDS.find((b) => b.image === panelBg)?.desc || "Clean white background"}
              </div>
            </div>
          </div>

          {/* Quick-select Photographic Template Backgrounds (horizontal strip) */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
              <span>Quick Wallpapers</span>
              <span className="text-gray-400 font-normal">7 templates</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {BOARD_BACKGROUNDS.map((bg) => {
                const isSelected = panelBg === bg.image;
                return (
                  <button
                    key={bg.id}
                    onClick={() => handleQuickSelectBg(bg.image)}
                    title={bg.name}
                    className={`h-9 w-12 rounded-lg bg-cover bg-center shrink-0 border relative transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? "ring-2 ring-indigo-600 border-transparent scale-105 shadow-sm"
                        : "border-black/10 hover:border-black/30 hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundImage: `url('${bg.image}')` }}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center text-white">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Customizer Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-chat-wallpaper-modal"))}
            className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-indigo-700 hover:text-indigo-800 text-[11.5px] font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Sparkles size={12} className="text-indigo-600" />
            <span>Customize Wallpaper &amp; Templates</span>
          </button>
        </div>

        {/* Add Member Section - Only visible to channel creator */}
        {isAddingMember && isCreator && (
          <div className="shrink-0 bg-blue-50/60 p-3 border-b border-gray-200/80 rounded-xl flex flex-col gap-2.5 my-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-gray-900 flex items-center gap-1.5">
                <UserPlus size={14} className="text-blue-600" />
                <span>Add people to #{info?.name?.replace(/^#\s*/, '') || channelId}</span>
              </label>
              <button 
                onClick={() => setIsAddingMember(false)}
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Email input field */}
            <div className="flex gap-1.5">
              <input 
                type="email"
                value={memberEmail}
                onChange={e => setMemberEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddMember(); }}
                placeholder="Enter colleague's email..."
                className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                onClick={() => handleAddMember()}
                disabled={isAdding || !memberEmail.trim()}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[12px] font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
              >
                {isAdding ? "Adding..." : "Add"}
              </button>
            </div>

            {addMemberError && (
              <p className="text-[11px] text-red-500 font-medium">{addMemberError}</p>
            )}

            {addMemberSuccess && (
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>{addMemberSuccess}</span>
              </p>
            )}

            {/* Quick Add Suggestions from workspace users */}
            {(() => {
              const currentMemberIds = new Set(info?.members?.map((m: any) => m.id) || []);
              const currentMemberEmails = new Set(info?.members?.map((m: any) => m.email?.toLowerCase()) || []);
              const pendingMemberIds = new Set(info?.pendingMembers?.map((m: any) => m.id) || []);
              const nonMembers = allUsers.filter(u => 
                !currentMemberIds.has(u.id) && 
                !currentMemberEmails.has(u.email?.toLowerCase()) &&
                !pendingMemberIds.has(u.id)
              );

              if (nonMembers.length === 0) return null;

              return (
                <div className="mt-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Quick Invite Teammates:
                  </span>
                  <div className="max-h-28 overflow-y-auto divide-y divide-gray-100 bg-white rounded-lg border border-gray-200">
                    {nonMembers.slice(0, 5).map(u => (
                      <div key={u.id} className="flex items-center justify-between p-1.5 px-2 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar person={u.name.split(' ')[0].toLowerCase()} name={u.name} avatar={u.avatar} size={20} />
                          <div className="truncate">
                            <p className="text-[11.5px] font-bold text-gray-800 truncate leading-tight">{u.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddMember(u.email)}
                          disabled={isAdding}
                          className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-extrabold transition-colors shrink-0 ml-1"
                        >
                          + Invite
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Members Section */}
        <div className="shrink-0 flex flex-col gap-1.5">
          {showSearch && (
            <div className="pb-1">
              <input 
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          )}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-bold text-gray-900">
              Members ({info?.members?.length || 0})
            </span>
            <button 
              onClick={() => {
                setViewAllMembers(!viewAllMembers);
                if (showSearch) setShowSearch(false);
              }}
              className="text-[11.5px] font-bold text-[#2563EB] hover:underline"
            >
              {viewAllMembers || showSearch ? "Show less" : "View all"}
            </button>
          </div>
          
          {info?.members?.length > 0 ? (
            viewAllMembers || showSearch ? (
              <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                {info.members
                  .filter((m: any) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .sort((a: any, b: any) => {
                    const currentUserId = currentUser?.id || currentUser?.sub;
                    const isA = currentUserId && (a.id === currentUserId || (currentUser?.email && a.email?.toLowerCase() === currentUser.email.toLowerCase()));
                    const isB = currentUserId && (b.id === currentUserId || (currentUser?.email && b.email?.toLowerCase() === currentUser.email.toLowerCase()));
                    if (isA) return -1;
                    if (isB) return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((m: any, i: number) => {
                    const currentUserId = currentUser?.id || currentUser?.sub;
                    const isYou = !!(
                      (currentUserId && m.id === currentUserId) ||
                      (currentUser?.email && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase())
                    );
                    // Strict Personal Channel Privacy: ONLY the channel creator can remove members! Not even an admin.
                    const canManage = isCreator;
                    return (
                      <div key={i} className="flex items-center justify-between group py-1 relative">
                        <div className="flex items-center gap-3">
                          <Avatar person={m.avatarPerson} name={m.name} avatar={m.avatar} size={32} ring />
                          <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-gray-900 leading-tight">
                              {m.name} {isYou && <span className="text-gray-500 font-normal">(You)</span>}
                            </span>
                            <span className="text-[11px] text-gray-500 leading-tight mt-0.5">
                              {m.role === 'Admin' ? 'Admin' : 'Member'}
                            </span>
                          </div>
                        </div>
                        {canManage && !isYou && (
                          <div className="relative">
                            <button 
                              onClick={() => setActiveMemberMenu(activeMemberMenu === m.id ? null : m.id)}
                              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                              title="Member actions"
                            >
                              <MoreVertical size={16} strokeWidth={2.2} />
                            </button>
                            {activeMemberMenu === m.id && (
                              <div className="absolute right-0 top-7 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-40 overflow-hidden">
                                <button
                                  onClick={() => handleRemoveMember(m.id, m.name)}
                                  disabled={memberActionLoading === m.id}
                                  className="w-full px-3 py-2 text-[12px] font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                  <Trash2 size={13} className="text-rose-500 shrink-0" />
                                  <span>Remove from channel</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                {info.members.filter((m: any) => m.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div className="text-[11.5px] text-gray-500 text-center py-2">No members found.</div>
                )}
              </div>
            ) : (
              <div className="flex items-center -space-x-1.5 overflow-hidden">
                {[...info.members]
                  .sort((a: any, b: any) => {
                    const currentUserId = currentUser?.id || currentUser?.sub;
                    const isA = currentUserId && (a.id === currentUserId || (currentUser?.email && a.email?.toLowerCase() === currentUser.email.toLowerCase()));
                    const isB = currentUserId && (b.id === currentUserId || (currentUser?.email && b.email?.toLowerCase() === currentUser.email.toLowerCase()));
                    if (isA) return -1;
                    if (isB) return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .slice(0, 6)
                  .map((m: any, i: number) => (
                    <Avatar key={i} person={m.avatarPerson} name={m.name} avatar={m.avatar} size={26} ring />
                  ))}
                {info.members.length > 6 && (
                  <span className="flex h-[26px] items-center justify-center rounded-full bg-blue-50 text-blue-600 font-black px-2 text-[11px] ring-2 ring-white shadow-2xs cursor-pointer" onClick={() => setViewAllMembers(true)}>
                    +{info.members.length - 6}
                  </span>
                )}
              </div>
            )
          ) : (
            <div className="text-[12px] text-gray-500 italic py-1">No members added yet.</div>
          )}

          {/* Pending Invitations section: ONLY for Channel Creator */}
          {isCreator && info?.pendingMembers && info.pendingMembers.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                  <Clock size={12} className="text-amber-600" />
                  Pending Invitations ({info.pendingMembers.length})
                </span>
              </div>

              {pendingFeedback && (
                <div className="my-1.5 p-1.5 px-2 bg-emerald-50 border border-emerald-200/80 rounded-md text-[10.5px] font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                  <span>{pendingFeedback}</span>
                </div>
              )}

              <div className="space-y-1 max-h-28 overflow-y-auto">
                {info.pendingMembers.map((pm: any) => (
                  <div key={pm.id} className="flex items-center justify-between p-1.5 px-2 bg-amber-50/60 rounded-lg border border-amber-200/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar person={pm.avatarPerson} name={pm.name} avatar={pm.avatar} size={22} ring />
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-gray-800 truncate leading-tight">{pm.name}</p>
                        <p className="text-[9.5px] text-amber-700 font-medium truncate">{pm.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleResendInvitation(pm.email)}
                        disabled={resendingEmail === pm.email}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-1.5 py-0.5 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                        title="Resend invitation email"
                      >
                        {resendingEmail === pm.email ? (
                          <>
                            <span className="w-2 h-2 rounded-full border border-blue-600 border-t-transparent animate-spin inline-block"></span>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw size={10} strokeWidth={2.5} />
                            <span>Resend</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRevokeInvitation(pm.id)}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-1.5 py-0.5 rounded transition-colors"
                        title="Revoke invitation"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>



        <div className="h-px bg-gray-100 w-full shrink-0" />

        {/* Boards Section */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-bold text-gray-900">
              Boards
            </span>
            <button 
              onClick={() => router.push('/boards')}
              className="text-[11.5px] font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>
          <ul className="space-y-1">
            {channelTemplates.slice(0, 3).map((template, idx) => {
              // Extract gradient from the template category or fallback to a default
              let gradient = "from-indigo-500 to-purple-600";
              if (template.category === "design") gradient = "from-purple-600 to-pink-500";
              else if (template.category === "engineering") gradient = "from-indigo-600 to-violet-500";
              else if (template.category === "business") gradient = "from-blue-600 to-cyan-500";
              else if (template.category === "marketing") gradient = "from-rose-500 to-orange-500";
              else if (template.category === "project-management") gradient = "from-amber-500 to-orange-500";
              
              // Apply bannerGradient if available
              if (template.bannerGradient) gradient = template.bannerGradient;
              
              return (
                <li 
                  key={template.id}
                  className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-50/80 transition-colors cursor-pointer" 
                  onClick={() => router.push(`/boards?template=${template.id}`)}
                >
                  <div className={`h-5 w-5 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                    <FolderKanban size={10} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1 flex items-baseline justify-between gap-1">
                    <span className="text-[12px] font-bold text-gray-800 truncate">
                      {template.name}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] font-semibold text-gray-400 shrink-0 border border-gray-200 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="h-px bg-gray-100 w-full shrink-0 my-3" />

        {/* Tasks Section */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-bold text-gray-900">
              Tasks
            </span>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("switch-chat-tab", { detail: { tab: "Tasks" } }))}
              className="text-[11.5px] font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>
          <ul className="space-y-1">
            {info?.tasks?.length > 0 ? info.tasks.map((t: any, i: number) => (
              <li key={i} className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-50/80 transition-colors">
                <input
                  type="checkbox"
                  checked={t.status === 'done'}
                  onChange={async () => {
                    const newStatus = t.status === 'done' ? 'todo' : 'done';
                    setInfo((prev: any) => ({
                      ...prev,
                      tasks: prev.tasks.map((task: any, idx: number) =>
                        idx === i ? { ...task, status: newStatus } : task
                      )
                    }));
                    try {
                      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                      await fetch(`${API_URL}/tasks/${t.id}`, {
                        method: "PATCH",
                        headers: {
                          "Authorization": `Bearer ${token}`,
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ status: newStatus })
                      });
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="h-3.5 w-3.5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <div className="min-w-0 flex-1 flex items-baseline justify-between gap-1">
                  <span className={`text-[12px] font-bold truncate ${t.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {t.title}
                  </span>
                  <span className={`text-[10.5px] font-extrabold ${t.color} shrink-0`}>
                    {t.priority} <span className="text-gray-400 font-medium">• {t.date}</span>
                  </span>
                </div>
              </li>
            )) : (
              <div className="text-[12px] text-gray-500 text-center py-2">No tasks for this channel</div>
            )}
          </ul>
        </div>

        <div className="h-px bg-gray-100 w-full shrink-0 my-3" />

        {/* Files Section */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-bold text-gray-900">
              Shared Files
            </span>
            <button 
              onClick={() => router.push('/files')}
              className="text-[11.5px] font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>
          <ul className="space-y-1">
            {info?.files && info.files.length > 0 ? (
              info.files.map((file: any, i: number) => (
                <li key={i} className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => router.push('/files')}>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
                    <FileText size={14} />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col">
                    <span className="text-[12px] font-bold text-gray-800 truncate">
                      {file.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium truncate">
                      <span>{file.size ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : 'File'}</span>
                      {file.createdAt && (
                        <>
                          <span>•</span>
                          <span>{new Date(file.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <div className="text-[12px] text-gray-400 py-1">No files shared yet</div>
            )}
          </ul>
        </div>



        {/* AI Summary (Beta) Section */}
        <div className="shrink-0 bg-[#F6F5FF] border border-indigo-100/90 rounded-2xl p-3 shadow-2xs relative overflow-hidden mt-auto">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-[#2563EB] shrink-0" strokeWidth={2.5} />
              <span className="text-[13px] font-bold text-gray-900">
                AI Summary
              </span>
            </div>
            <span className="bg-purple-100/90 text-purple-700 font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wide">
              Beta
            </span>
          </div>
          <p className="text-[11.5px] text-gray-700 font-medium my-1.5 leading-snug">
            3 new messages, 2 tasks pending, and 1 file shared in this channel today.
          </p>
          <div className="pt-0.5">
            <button className="text-[11.5px] font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1">
              <span>View details</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

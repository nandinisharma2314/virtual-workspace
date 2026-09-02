"use client";

import Avatar from "@/components/Avatar";
import { channelTasks, channelPinnedFiles, channelSharedFiles } from "@/lib/chatData";
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
  MoreVertical,
} from "lucide-react";

import { useEffect, useState } from "react";

type Props = {
  onClose?: () => void;
  channelId?: string;
  onUpdate?: () => void; // Optional callback if parent wants to refresh
};

export default function ChatInfoPanel({ onClose, channelId = "c-general", onUpdate }: Props) {
  const [info, setInfo] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addMemberError, setAddMemberError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [viewAllMembers, setViewAllMembers] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
      const res = await fetch(`http://localhost:3001/chat/info/${channelId}`, {
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
        const userRes = await fetch(`http://localhost:3001/auth/me?_t=${Date.now()}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [channelId]);

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    setIsAdding(true);
    setAddMemberError("");
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const res = await fetch(`http://localhost:3001/chat/members/${channelId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: memberEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setMemberEmail("");
        setIsAddingMember(false);
        fetchInfo();
      } else {
        setAddMemberError(data.message || "Failed to add member");
      }
    } catch (e) {
      setAddMemberError("An error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveInfo = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) return;
      const res = await fetch(`http://localhost:3001/chat/info/${channelId}`, {
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
            <div className="w-11 h-11 rounded-2xl bg-gray-100 text-gray-700 font-black text-2xl flex items-center justify-center shrink-0 shadow-2xs">
              #
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-extrabold text-gray-900 truncate">
                  {info?.name || "# general"}
                </span>
                {currentUser?.role === 'Admin' && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100 transition-colors"
                  >
                    <Pencil size={13} strokeWidth={2.2} />
                  </button>
                )}
              </div>
              <p className="text-[11.5px] font-medium text-gray-400 mt-0.5 leading-snug break-words pr-2">
                {info?.description || "Company wide announcements and general discussion"}
              </p>
            </div>
          </div>
        )}

        {/* Action Toolbar Row */}
        <div className="shrink-0 flex items-center justify-between px-2 pt-1 pb-1 border-b border-gray-100">
          {currentUser?.role === 'Admin' && (
            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="h-9 w-9 rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 shadow-2xs transition-all"
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

        {/* Add Member Section */}
        {isAddingMember && (
          <div className="shrink-0 bg-blue-50/50 p-3 border-b border-gray-100 flex flex-col gap-2">
            <label className="text-[12px] font-bold text-gray-900">Add people</label>
            <div className="flex gap-2">
              <input 
                type="email"
                value={memberEmail}
                onChange={e => setMemberEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                onClick={handleAddMember}
                disabled={isAdding || !memberEmail.trim()}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[12px] font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isAdding ? "Adding..." : "Add"}
              </button>
            </div>
            {addMemberError && (
              <p className="text-[11px] text-red-500 font-medium">{addMemberError}</p>
            )}
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
                    const currentName = currentUser?.name?.trim().toLowerCase();
                    const aName = a.name.trim().toLowerCase();
                    const bName = b.name.trim().toLowerCase();
                    if (currentName && aName === currentName) return -1;
                    if (currentName && bName === currentName) return 1;
                    return aName.localeCompare(bName);
                  })
                  .map((m: any, i: number) => {
                    const isYou = !!(currentUser?.name && m.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase());
                    return (
                      <div key={i} className="flex items-center justify-between group py-1">
                        <div className="flex items-center gap-3">
                          <Avatar person={m.avatarPerson} name={m.name} avatar={m.avatar} size={32} ring />
                          <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-gray-900 leading-tight">
                              {m.name} {isYou && <span className="text-gray-500 font-normal">(You)</span>}
                            </span>
                            <span className="text-[11px] text-gray-500 leading-tight mt-0.5">
                              {m.role === 'Admin' ? 'Meeting host' : 'Participant'}
                            </span>
                            <span className="text-[10px] text-gray-400 leading-tight">
                              they / them
                            </span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical size={16} strokeWidth={2.2} />
                        </button>
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
                    const currentName = currentUser?.name?.trim().toLowerCase();
                    const aName = a.name.trim().toLowerCase();
                    const bName = b.name.trim().toLowerCase();
                    if (currentName && aName === currentName) return -1;
                    if (currentName && bName === currentName) return 1;
                    return aName.localeCompare(bName);
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
        </div>

        <div className="h-px bg-gray-100 w-full shrink-0" />

        {/* Tasks Section */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-bold text-gray-900">
              Tasks
            </span>
            <button className="text-[11.5px] font-bold text-[#2563EB] hover:underline">
              View all
            </button>
          </div>
          <ul className="space-y-1">
            {info?.tasks?.length > 0 ? info.tasks.map((t: any, i: number) => (
              <li key={i} className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-50/80 transition-colors">
                <input
                  type="checkbox"
                  defaultChecked={t.status === 'done'}
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
              <div className="text-[12px] text-gray-500 text-center py-2">No tasks available</div>
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

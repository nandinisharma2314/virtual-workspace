"use client";

import { InboxItem } from "@/lib/inboxData";
import Avatar from "@/components/Avatar";
import {
  Mail,
  Clock,
  Trash2,
  MoreHorizontal,
  X,
  Sparkles,
  Check,
  Info,
  Smile,
  Folder,
  AlertCircle,
  Heart,
  CornerUpLeft,
  PlusSquare,
  Video,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  item: InboxItem | null;
  onClose?: () => void;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function InboxDetail({ item, onClose, onMarkRead, onDelete }: Props) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
    setShowMoreMenu(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`http://localhost:3000/inbox?item=${item?.id}`);
    showToast("Link copied to clipboard!");
  };

  const handleMoveToProject = () => {
    showToast("Moved to Website Redesign project");
  };

  const handleReportSpam = () => {
    showToast("Reported as spam");
    setTimeout(() => {
      if (item) onDelete?.(item.id);
    }, 1500);
  };

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      fetch("http://localhost:3001/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setCurrentUser(data);
      })
      .catch(() => {});
    }
  }, []);

  if (!item) {
    return (
      <div className="w-[360px] lg:w-[420px] xl:w-[450px] shrink-0 bg-white flex flex-col items-center justify-center h-full border-l border-gray-200/80 text-center p-6 text-gray-400 select-none">
        <Mail size={38} className="mb-2 text-gray-300" strokeWidth={1.4} />
        <p className="text-sm font-bold text-gray-700">No message selected</p>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Select an item from the inbox list to view details, actions, and AI insights.
        </p>
      </div>
    );
  }

  // Format message to highlight @mentions dynamically
  const renderFormattedMessage = (msg: string) => {
    const nameToMatch = currentUser?.name || "Avi Sharma";
    const regex = new RegExp(`(@You|@${nameToMatch}|@Arjun Patel|@Rohit Verma|@Priya Singh)`, "g");
    const parts = msg.split(regex);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span
            key={i}
            className="bg-blue-50/90 text-blue-600 font-semibold px-1.5 py-0.5 rounded-md mx-0.5 inline-block"
          >
            {part}
          </span>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  const channelName = item.channel.name.replace(/^#\s*/, "");

  return (
    <div className="w-[370px] lg:w-[420px] xl:w-[450px] shrink-0 bg-white flex flex-col h-full overflow-hidden border-l border-gray-200/80 text-[#111827] select-none">
      {/* Top Header Actions Bar - Seamless white without border-bottom */}
      <div className="h-13 shrink-0 pt-4 px-6 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-4 text-gray-500 relative">
          <button
            onClick={() => onMarkRead?.(item.id)}
            className={`p-1 transition-colors ${!item.unread ? "text-indigo-600 bg-indigo-50 rounded" : "hover:text-gray-900"}`}
            title={item.unread ? "Mark as read" : "Mark as unread"}
          >
            <Mail size={17} strokeWidth={2.1} />
          </button>
          <button
            onClick={() => setIsSnoozed(true)}
            className="p-1 hover:text-amber-600 transition-colors"
            title="Snooze"
          >
            <Clock size={17} strokeWidth={2.1} />
          </button>
          <button
            onClick={() => onDelete?.(item.id)}
            className="p-1 hover:text-rose-600 transition-colors"
            title="Delete"
          >
            <Trash2 size={17} strokeWidth={2.1} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`p-1 transition-colors rounded ${showMoreMenu ? "bg-gray-100 text-gray-900" : "hover:text-gray-900"}`}
              title="More options"
            >
              <MoreHorizontal size={17} strokeWidth={2.1} />
            </button>
            {showMoreMenu && (
              <div className="absolute top-8 left-0 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 text-[12px] font-medium text-gray-700">
                <button onClick={handleCopyLink} className="w-full text-left px-3 py-1.5 hover:bg-gray-50">Copy link</button>
                <button onClick={handleMoveToProject} className="w-full text-left px-3 py-1.5 hover:bg-gray-50">Move to project</button>
                <button onClick={handleReportSpam} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-rose-600">Report spam</button>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
          title="Close detail panel"
        >
          <X size={18} strokeWidth={2.2} />
        </button>
      </div>
      
      {toastMessage && (
        <div className="absolute top-16 right-6 bg-gray-900 text-white text-[12px] font-medium px-4 py-2 rounded-lg shadow-xl z-50 animate-fadeIn flex items-center gap-2">
          <Check size={14} className="text-emerald-400" strokeWidth={3} />
          {toastMessage}
        </div>
      )}

      {isSnoozed && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-2 flex items-center justify-between text-[12px] font-medium text-amber-800">
          <span>This notification has been snoozed.</span>
          <button onClick={() => setIsSnoozed(false)} className="font-bold underline hover:text-amber-900">Undo</button>
        </div>
      )}

      {/* High-density content area without scrollbars */}
      <div className={`flex-1 min-h-0 px-6 pt-3 pb-5 flex flex-col justify-between overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isSnoozed ? 'opacity-40 pointer-events-none' : ''}`}>
        
        {/* Top block: Title, Tag, Sender & Message */}
        <div className="shrink-0">
          <div className="mb-2">
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-[8px] text-[12px] font-semibold inline-block">
              {item.tag === "Mention" ? "Mention" : item.tag}
            </span>
          </div>
          <h2 className="text-[20px] font-bold text-[#111827] tracking-tight leading-snug">
            {item.title}
          </h2>
          <p className="text-[12.5px] mt-1 text-gray-500 font-normal">
            In <span className="font-semibold text-gray-800">#{channelName}</span>
          </p>

          {/* Sender and indented message block */}
          <div className="flex items-start gap-3.5 mt-4">
            <div className="shrink-0 pt-0.5">
              <Avatar person={item.avatarPerson || "rohit"} size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2.5 mb-1">
                <span className="text-[13.5px] font-bold text-gray-900">
                  {item.senderName}
                </span>
                <span className="text-[12px] font-normal text-gray-400">
                  {item.time === "Yesterday" ? "Yesterday, 4:15 PM" : item.time === "Jul 26" ? "Jul 26, 2:30 PM" : `10:24 AM`}
                </span>
              </div>
              <p className="text-[13px] sm:text-[13.5px] leading-relaxed text-gray-800 font-normal mb-2.5">
                {renderFormattedMessage(item.fullMessage)}
              </p>
              <div>
                <button className="h-8 w-9 rounded-xl border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-500 flex items-center justify-center shadow-2xs transition-all">
                  <Smile size={16} strokeWidth={2} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100/90 my-3.5 w-full shrink-0" />

        {/* Channel Section */}
        <div className="shrink-0">
          <h3 className="text-[13px] font-bold text-gray-900 mb-2.5">
            Channel
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-gray-400 font-light text-[22px] leading-none">#</span>
              <div className="min-w-0">
                <span className="block text-[13.5px] font-bold text-gray-900 leading-tight">
                  {channelName}
                </span>
                <span className="block text-[11.5px] font-normal text-gray-400 mt-0.5">
                  {item.channel.project}
                </span>
              </div>
            </div>
            <button 
              onClick={() => router.push('/chat')}
              className="rounded-xl border border-gray-200/90 bg-white hover:bg-gray-50 px-4 py-2 text-[12px] font-semibold text-gray-700 shadow-2xs transition-all shrink-0"
            >
              View in Chat
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-100/90 my-3.5 w-full shrink-0" />

        {/* About this message Section */}
        <div className="shrink-0">
          <h3 className="text-[13px] font-bold text-gray-900 mb-3">
            About this message
          </h3>
          <div className="space-y-3 px-0.5">
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2.5 text-gray-500 font-normal">
                <Sparkles size={15} className="text-gray-400 shrink-0" strokeWidth={2} />
                <span>Mentioned you</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Avatar name={currentUser?.name || "User"} avatar={currentUser?.avatar} size={20} />
                <span>{currentUser?.name || "User"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2.5 text-gray-500 font-normal">
                <Clock size={15} className="text-gray-400 shrink-0" strokeWidth={2} />
                <span>Sent</span>
              </div>
              <span className="font-normal text-gray-700">
                {item.dateGroup === "Today"
                  ? `Today at ${item.time === "Yesterday" ? "10:24 AM" : item.time}`
                  : item.dateGroup === "Yesterday"
                  ? "Yesterday at 4:15 PM"
                  : "Jul 26 at 2:30 PM"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2.5 text-gray-500 font-normal">
                <Folder size={15} className="text-gray-400 shrink-0" strokeWidth={2} />
                <span>Project</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${item.project.dotColor}`} />
                <span>{item.project.name}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2.5 text-gray-500 font-normal">
                <AlertCircle size={15} className="text-gray-400 shrink-0" strokeWidth={2} />
                <span>Priority</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <Heart fill="currentColor" className="text-rose-500 shrink-0" size={14} />
                <span>{item.priority.label}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100/90 my-3.5 w-full shrink-0" />

        {/* Actions Section */}
        <div className="shrink-0">
          <h3 className="text-[13px] font-bold text-gray-900 mb-2.5">
            Actions
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => router.push('/chat')}
              className="flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white px-3.5 py-2 text-[12.5px] font-semibold shadow-xs transition-all"
            >
              <CornerUpLeft size={14} strokeWidth={2.4} />
              <span>Reply in Chat</span>
            </button>
            <button
              onClick={() => {
                onMarkRead?.(item.id);
                showToast(item.unread ? "Message marked as read" : "Message marked as unread");
              }}
              className="flex items-center gap-2 rounded-xl border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-800 px-3.5 py-2 text-[12.5px] font-semibold shadow-2xs transition-all"
            >
              <Check size={14} className={item.unread ? "text-gray-600" : "text-emerald-500"} strokeWidth={2.4} />
              <span>{item.unread ? "Mark as Read" : "Mark as Unread"}</span>
            </button>
            <button 
              onClick={() => showToast("New task created and assigned")}
              className="flex items-center gap-2 rounded-xl border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-800 px-3.5 py-2 text-[12.5px] font-semibold shadow-2xs transition-all"
            >
              <PlusSquare size={14} className="text-gray-600" strokeWidth={2.1} />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* AI Suggested Action Section */}
        {item.aiSuggestedAction && (
          <div className="shrink-0 bg-[#F6F5FF] border border-indigo-100/80 rounded-2xl p-4 sm:p-4.5 shadow-2xs relative overflow-hidden mt-auto">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-[#2563EB] shrink-0" strokeWidth={2.4} />
              <span className="text-[13.5px] font-bold text-gray-900">
                {item.aiSuggestedAction.title}
              </span>
            </div>
            <p className="text-[12.5px] text-gray-700 font-normal my-2">
              {item.aiSuggestedAction.reason}
            </p>
            <div className="pt-0.5">
              <button 
                onClick={() => {
                  if (item.aiSuggestedAction?.actionUrl) {
                    window.open(item.aiSuggestedAction.actionUrl, '_blank');
                  } else {
                    showToast(`AI Action: ${item.aiSuggestedAction!.buttonLabel} executed`);
                  }
                }}
                className={
                  item.aiSuggestedAction.actionUrl
                    ? "bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-[12.5px] px-4 py-2 rounded-xl shadow-2xs transition-all inline-flex items-center gap-2"
                    : "bg-white hover:bg-gray-50/80 text-[#2563EB] border border-blue-200/80 font-semibold text-[12.5px] px-4 py-2 rounded-xl shadow-2xs transition-all inline-flex items-center gap-2"
                }
              >
                {item.aiSuggestedAction.actionUrl && <Video size={16} strokeWidth={2.4} />}
                <span>{item.aiSuggestedAction.buttonLabel}</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[11.5px] font-normal text-gray-500">
              <span>AI confidence: {item.aiSuggestedAction.confidence}</span>
              <Info size={13} className="text-gray-400" strokeWidth={2} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

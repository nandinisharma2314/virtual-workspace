"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChatSidebar from "./chat/ChatSidebar";
import ChatFeed from "./chat/ChatFeed";
import ChatInfoPanel from "./chat/ChatInfoPanel";

export default function ChatView() {
  const searchParams = useSearchParams();
  const channelParam = searchParams ? searchParams.get("channel") : null;
  const acceptChannelParam = searchParams ? searchParams.get("acceptChannel") : null;
  const declineChannelParam = searchParams ? searchParams.get("declineChannel") : null;

  const [selectedChannelId, setSelectedChannelId] = useState<string>(channelParam || acceptChannelParam || "c-general");
  const [selectedDMId, setSelectedDMId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams ? searchParams.get("token") : null;
    if (urlToken) {
      document.cookie = `token=${urlToken}; path=/; max-age=86400; SameSite=Lax`;
    }
    const token = urlToken || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return;

    if (acceptChannelParam) {
      fetch(`http://localhost:3001/chat/invitations/${acceptChannelParam}/accept`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setSelectedChannelId(acceptChannelParam);
          setSelectedDMId(null);
          setInviteFeedback(data.message || "Invitation accepted! Welcome to the channel.");
          setTimeout(() => setInviteFeedback(null), 5000);
          window.dispatchEvent(new CustomEvent("refresh-chat-channels"));
          window.history.replaceState({}, '', `/chat?channel=${acceptChannelParam}`);
        })
        .catch(console.error);
    } else if (declineChannelParam) {
      fetch(`http://localhost:3001/chat/invitations/${declineChannelParam}/decline`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setInviteFeedback(data.message || "Invitation declined.");
          setTimeout(() => setInviteFeedback(null), 5000);
          window.dispatchEvent(new CustomEvent("refresh-chat-channels"));
          window.history.replaceState({}, '', '/chat');
        })
        .catch(console.error);
    } else if (channelParam) {
      setSelectedChannelId(channelParam);
      setSelectedDMId(null);
    }
  }, [acceptChannelParam, declineChannelParam, channelParam]);

  return (
    <div className="flex w-full h-full min-h-0 overflow-hidden bg-white relative">
      {inviteFeedback && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-2xl text-[12.5px] font-bold flex items-center gap-2 border border-white/15 animate-in fade-in slide-in-from-top-2">
          <span className="text-blue-400">✨</span>
          <span>{inviteFeedback}</span>
        </div>
      )}

      <ChatSidebar
        selectedChannelId={selectedChannelId}
        onSelectChannel={(id) => {
          setSelectedChannelId(id);
          setSelectedDMId(null);
        }}
        selectedDMId={selectedDMId}
        onSelectDM={(id) => {
          setSelectedDMId(id);
          if (id) setSelectedChannelId("");
        }}
      />

      <ChatFeed 
        key={`chat-feed-${selectedChannelId || selectedDMId || "c-general"}-${refreshTrigger}`}
        channelId={selectedChannelId || selectedDMId || "c-general"} 
        refreshTrigger={refreshTrigger}
      />

      <ChatInfoPanel 
        channelId={selectedChannelId || selectedDMId || "c-general"} 
        onUpdate={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
}

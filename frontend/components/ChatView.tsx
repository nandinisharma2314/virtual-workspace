"use client";

import { useState } from "react";
import ChatSidebar from "./chat/ChatSidebar";
import ChatFeed from "./chat/ChatFeed";
import ChatInfoPanel from "./chat/ChatInfoPanel";

export default function ChatView() {
  const [selectedChannelId, setSelectedChannelId] = useState<string>("c-general");
  const [selectedDMId, setSelectedDMId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="flex w-full h-full min-h-0 overflow-hidden bg-white">
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
        key={`chat-feed-${refreshTrigger}`}
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

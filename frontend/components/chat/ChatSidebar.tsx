"use client";

import { chatChannels, chatTeams } from "@/lib/chatData";
import Avatar from "@/components/Avatar";
import { Plus, SquarePen, Hash } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  selectedChannelId: string;
  onSelectChannel: (id: string) => void;
  selectedDMId: string | null;
  onSelectDM: (id: string | null) => void;
};

export default function ChatSidebar({
  selectedChannelId,
  onSelectChannel,
  selectedDMId,
  onSelectDM,
}: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return;

    fetch("http://localhost:3001/chat/direct-message-users", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch(console.error);

    fetch("http://localhost:3001/auth/me", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCurrentUser(data))
      .catch(console.error);
  }, []);

  const handleCreateChannel = async () => {
    const name = window.prompt("Enter channel name:");
    if (!name) return;
    const description = window.prompt("Enter channel description:") || "";
    
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3001/chat/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });
      if (res.ok) {
        const newChannel = await res.json();
        // Just selecting it will re-render ChatFeed which fetches info
        chatChannels.push({ id: newChannel.id, name: newChannel.name });
        onSelectChannel(newChannel.id);
        onSelectDM(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-[215px] sm:w-[230px] lg:w-[240px] shrink-0 border-r border-gray-200/80 bg-white flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="h-12 shrink-0 border-b border-gray-200/80 px-4 flex items-center justify-between">
        <h2 className="text-[17px] font-black tracking-tight text-gray-900">
          Chat
        </h2>
        {currentUser?.role === 'Admin' && (
          <button className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-50 transition-colors" title="New Message">
            <SquarePen size={16} strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* High-density Zero-Scroll Navigation Content */}
      <div className="flex-1 min-h-0 px-2.5 py-2 flex flex-col justify-between overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Channels Section */}
        <div className="shrink-0">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[12px] font-black uppercase tracking-wider text-gray-400">
              Channels
            </span>
            {currentUser?.role === 'Admin' && (
              <button 
                onClick={handleCreateChannel}
                className="text-gray-400 hover:text-gray-700 p-0.5 rounded transition-colors"
              >
                <Plus size={15} strokeWidth={2.2} />
              </button>
            )}
          </div>
          <div className="space-y-[1px]">
            {chatChannels.map((c) => {
              const isActive = selectedChannelId === c.id && !selectedDMId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectChannel(c.id);
                    onSelectDM(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1 text-[12.5px] font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50/90 text-[#2563EB] font-extrabold shadow-2xs"
                      : "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Hash
                      size={15}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive ? "text-[#2563EB] shrink-0" : "text-gray-400 shrink-0"}
                    />
                    <span className="truncate">{c.name}</span>
                  </span>
                  {c.unreadCount ? (
                    <span className="text-[11px] bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-extrabold">
                      {c.unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="px-2.5 pt-0.5">
            <button className="text-[12px] font-bold text-[#2563EB] hover:underline transition-all">
              Show more
            </button>
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="shrink-0 pt-1.5 border-t border-gray-100 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[12px] font-black uppercase tracking-wider text-gray-400">
              Direct Messages
            </span>
            {currentUser?.role === 'Admin' && (
              <button className="text-gray-400 hover:text-gray-700 p-0.5 rounded transition-colors">
                <Plus size={15} strokeWidth={2.2} />
              </button>
            )}
          </div>
          <div className="space-y-[1px]">
            {users.map((u) => {
              const dmId = `dm-${u.id}`;
              const isActive = selectedDMId === dmId;
              const person = u.avatar || u.name.split(' ')[0].toLowerCase();
              return (
                <button
                  key={dmId}
                  onClick={() => {
                    onSelectDM(dmId);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2 py-1 text-[12.5px] font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50/90 text-[#2563EB] font-extrabold shadow-2xs"
                      : "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="relative shrink-0">
                      <Avatar person={person} name={u.name} size={22} />
                      <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'} ring-1 ring-white`} />
                    </span>
                    <span className="truncate flex items-center gap-1.5">
                      <span className="truncate">{u.name}</span>
                      {u.role === 'Admin' && (
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1 py-0.5 rounded uppercase tracking-wider shrink-0">Admin</span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Teams Section */}
        <div className="shrink-0 pt-1.5 border-t border-gray-100">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[12px] font-black uppercase tracking-wider text-gray-400">
              Teams
            </span>
            {currentUser?.role === 'Admin' && (
              <button className="text-gray-400 hover:text-gray-700 p-0.5 rounded transition-colors">
                <Plus size={15} strokeWidth={2.2} />
              </button>
            )}
          </div>
          <div className="space-y-[1px] pb-0.5">
            {chatTeams.map((team) => {
              return (
                <button
                  key={team.id}
                  className="flex w-full items-center justify-between rounded-xl px-2 py-1 text-[12.5px] font-semibold text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all"
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span className={`h-5 w-5 rounded-md ${team.badgeBg} text-white flex items-center justify-center text-[9px] font-black shrink-0 shadow-2xs`}>
                      {team.badgeText}
                    </span>
                    <span className="truncate">{team.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

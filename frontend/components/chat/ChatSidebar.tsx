"use client";

import { chatChannels, chatTeams } from "@/lib/chatData";
import Avatar from "@/components/Avatar";
import { Plus, SquarePen, Hash, Lock, Check, X, Mail } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import CreateChannelModal from "./CreateChannelModal";

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
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [channelsList, setChannelsList] = useState<any[]>([]);
  const [channelsLoaded, setChannelsLoaded] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3001/chat/channels", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setChannelsList(data);
        }
      }
      setChannelsLoaded(true);
    } catch (err) {
      console.error(err);
      setChannelsLoaded(true);
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3001/chat/invitations", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPendingInvitations(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Listen for global open-create-channel event or URL param
  useEffect(() => {
    const handleOpenModal = () => setIsCreateModalOpen(true);
    const handleRefresh = () => {
      fetchChannels();
      fetchInvitations();
    };

    window.addEventListener("open-create-channel", handleOpenModal);
    window.addEventListener("refresh-chat-channels", handleRefresh);

    return () => {
      window.removeEventListener("open-create-channel", handleOpenModal);
      window.removeEventListener("refresh-chat-channels", handleRefresh);
    };
  }, [fetchChannels, fetchInvitations]);

  useEffect(() => {
    if (searchParams?.get("create") === "true") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return;

    fetchChannels();
    fetchInvitations();

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

    // Poll invitations every 15 seconds
    const timer = setInterval(() => {
      fetchInvitations();
    }, 15000);

    return () => clearInterval(timer);
  }, [fetchChannels, fetchInvitations]);

  const handleChannelCreated = (newChannel: any) => {
    setChannelsList(prev => [newChannel, ...prev.filter(c => c.id !== newChannel.id)]);
    onSelectChannel(newChannel.id);
    onSelectDM(null);
  };

  const handleAcceptInvite = async (channelId: string) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return;
    setActionLoading(channelId);
    try {
      const res = await fetch(`http://localhost:3001/chat/invitations/${channelId}/accept`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingInvitations(prev => prev.filter(inv => inv.channelId !== channelId));
        await fetchChannels();
        onSelectChannel(channelId);
        onSelectDM(null);
        window.dispatchEvent(new CustomEvent("refresh-chat-channels"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineInvite = async (channelId: string) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return;
    setActionLoading(channelId);
    try {
      const res = await fetch(`http://localhost:3001/chat/invitations/${channelId}/decline`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingInvitations(prev => prev.filter(inv => inv.channelId !== channelId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const displayedChannels = channelsLoaded ? channelsList : chatChannels;

  return (
    <div className="w-[215px] sm:w-[230px] lg:w-[240px] shrink-0 border-r border-gray-200/80 bg-white flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="h-12 shrink-0 border-b border-gray-200/80 px-4 flex items-center justify-between">
        <h2 className="text-[17px] font-black tracking-tight text-gray-900">
          Chat
        </h2>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1 text-[11.5px] font-bold text-blue-600 bg-blue-50/80 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors border border-blue-200/60 shadow-2xs"
            title="Create New Channel"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Channel</span>
          </button>
          {currentUser?.role === 'Admin' && (
            <button className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-50 transition-colors" title="New Message">
              <SquarePen size={16} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>

      {/* High-density Zero-Scroll Navigation Content */}
      <div className="flex-1 min-h-0 px-2.5 py-2 flex flex-col justify-between overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Channels Section */}
        <div className="shrink-0">
          {/* Pending Invitations Banner if any */}
          {pendingInvitations.length > 0 && (
            <div className="mb-2 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-xl p-2.5 border border-indigo-200/70 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                  <Mail size={12} className="text-indigo-600" />
                  Invitations ({pendingInvitations.length})
                </span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto [scrollbar-width:none]">
                {pendingInvitations.map((inv) => (
                  <div key={inv.channelId} className="bg-white/90 backdrop-blur-xs rounded-lg p-2 border border-indigo-100 shadow-2xs">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[12px] font-extrabold text-gray-900 truncate">
                        {inv.channelName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium shrink-0">
                        {inv.inviterName.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-gray-500 mb-2 leading-tight truncate">
                      Invited to join private channel
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAcceptInvite(inv.channelId)}
                        disabled={actionLoading === inv.channelId}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md py-1 text-[11px] font-extrabold flex items-center justify-center gap-1 transition-colors shadow-2xs disabled:opacity-50"
                        title="Accept Invitation"
                      >
                        <Check size={12} strokeWidth={3} />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleDeclineInvite(inv.channelId)}
                        disabled={actionLoading === inv.channelId}
                        className="px-2 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-600 rounded-md py-1 text-[11px] font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Decline Invitation"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[12px] font-black uppercase tracking-wider text-gray-400">
              Channels
            </span>
            {/* Anyone can create a channel per requirements */}
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors"
              title="Create Channel"
            >
              <Plus size={15} strokeWidth={2.4} />
            </button>
          </div>
          <div className="space-y-[1px] max-h-52 overflow-y-auto [scrollbar-width:none]">
            {displayedChannels.map((c) => {
              const isActive = selectedChannelId === c.id && !selectedDMId;
              const isPrivate = c.id !== "c-general";
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
                    {isPrivate ? (
                      <Lock
                        size={13}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={isActive ? "text-[#2563EB] shrink-0" : "text-gray-400 shrink-0"}
                      />
                    ) : (
                      <Hash
                        size={15}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={isActive ? "text-[#2563EB] shrink-0" : "text-gray-400 shrink-0"}
                      />
                    )}
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
              const person = u.name.split(' ')[0].toLowerCase();
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
                      <Avatar person={person} name={u.name} avatar={u.avatar} size={22} />
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

      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onChannelCreated={handleChannelCreated}
      />
    </div>
  );
}

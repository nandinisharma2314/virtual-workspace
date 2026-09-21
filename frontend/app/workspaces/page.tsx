"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import {
  Layout,
  Plus,
  Users,
  Settings,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Reply,
  X,
  Sparkles,
  Send,
  Hash,
  Activity,
  CheckCircle2,
  FolderKanban,
  MoreHorizontal,
  Check,
  Zap,
  Eye,
  List,
  Compass,
  CornerDownRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import CreateBoardModal, { CustomBoard } from "@/components/boards/CreateBoardModal";
import { API_URL } from "@/lib/apis";
import { toast } from "@/lib/toast";

interface ChannelItem {
  id: string;
  name: string;
  description: string | null;
  creatorId?: number;
  bgGradient?: string;
  isTemplate?: boolean;
  createdAt?: string;
  membersCount?: number;
  latestMessage?: {
    text: string;
    senderName: string;
    time: string;
    date: string;
  } | null;
}

interface CoverTheme {
  bannerGradient: string;
  overlayGradient: string;
  thumbGradient: string;
  accentText: string;
  accentDot: string;
}

const coverThemes: Record<string, CoverTheme> = {
  "c-onboarding": {
    bannerGradient: "from-[#1e1b4b] via-[#312e81] to-[#4338ca]",
    overlayGradient: "from-[#0f172a]/90 via-[#1e1b4b]/80 to-[#312e81]/70",
    thumbGradient: "from-indigo-600 via-indigo-700 to-purple-800",
    accentText: "text-indigo-600",
    accentDot: "bg-indigo-500",
  },
  "c-marketing": {
    bannerGradient: "from-[#3b0764] via-[#581c87] to-[#701a75]",
    overlayGradient: "from-[#18022b]/90 via-[#3b0764]/80 to-[#701a75]/70",
    thumbGradient: "from-purple-600 via-pink-600 to-rose-600",
    accentText: "text-purple-600",
    accentDot: "bg-purple-500",
  },
  "c-development": {
    bannerGradient: "from-[#0f172a] via-[#1e293b] to-[#0369a1]",
    overlayGradient: "from-[#020617]/90 via-[#0f172a]/80 to-[#0284c7]/70",
    thumbGradient: "from-slate-700 via-cyan-700 to-blue-600",
    accentText: "text-cyan-600",
    accentDot: "bg-cyan-500",
  },
  "c-product-design": {
    bannerGradient: "from-[#2e1065] via-[#4c1d95] to-[#0284c7]",
    overlayGradient: "from-[#170538]/90 via-[#2e1065]/80 to-[#0369a1]/70",
    thumbGradient: "from-violet-600 via-purple-600 to-sky-600",
    accentText: "text-violet-600",
    accentDot: "bg-violet-500",
  },
  "c-announcements": {
    bannerGradient: "from-[#451a03] via-[#78350f] to-[#9a3412]",
    overlayGradient: "from-[#240e02]/90 via-[#451a03]/80 to-[#b45309]/70",
    thumbGradient: "from-amber-600 via-orange-600 to-rose-600",
    accentText: "text-amber-600",
    accentDot: "bg-amber-500",
  },
  "c-general": {
    bannerGradient: "from-[#064e3b] via-[#065f46] to-[#0d9488]",
    overlayGradient: "from-[#022c22]/90 via-[#064e3b]/80 to-[#0f766e]/70",
    thumbGradient: "from-emerald-600 via-teal-600 to-cyan-600",
    accentText: "text-emerald-600",
    accentDot: "bg-emerald-500",
  },
};

const defaultCoverTheme: CoverTheme = {
  bannerGradient: "from-[#1e1b4b] via-[#3730a3] to-[#4f46e5]",
  overlayGradient: "from-[#0f172a]/90 via-[#1e1b4b]/80 to-[#4338ca]/70",
  thumbGradient: "from-indigo-600 via-purple-600 to-indigo-800",
  accentText: "text-indigo-600",
  accentDot: "bg-indigo-500",
};

const getCoverTheme = (id: string): CoverTheme => {
  return coverThemes[id] || defaultCoverTheme;
};

// Illustrated SVG matching Trello's exact Up Next Banner illustration
function UpNextIllustration() {
  return (
    <div className="w-[110px] h-[120px] shrink-0 bg-white border border-indigo-150/70 rounded-xl shadow-xs p-2.5 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Speech Bubble with dots */}
      <div className="flex items-center gap-1 bg-cyan-400 text-white rounded-lg px-2 py-1 w-max shadow-2xs">
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
      </div>

      {/* Paper Airplane */}
      <div className="absolute top-2.5 right-2 text-indigo-500 transform -rotate-12">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" className="opacity-90">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </div>

      {/* Checklist / Task Card */}
      <div className="flex items-center gap-2 mt-2">
        <div className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <Check size={11} strokeWidth={3} />
        </div>
        <div className="space-y-1 flex-1">
          <div className="h-1.5 bg-rose-300 rounded-full w-4/5" />
          <div className="h-1.5 bg-indigo-200 rounded-full w-3/5" />
        </div>
      </div>

      {/* Bottom mini clock badge */}
      <div className="flex items-center gap-1.5 pt-1">
        <div className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center">
          <Clock size={10} strokeWidth={2.5} />
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full w-8" />
      </div>
    </div>
  );
}

interface UserProfile {
  id?: number;
  sub?: number;
  name?: string;
  role?: string;
  email?: string;
}

export default function WorkspacesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedUpNextBanner, setDismissedUpNextBanner] = useState(false);
  const [dismissedCards, setDismissedCards] = useState<Record<string, boolean>>({});
  const [isWorkspaceAccordionOpen, setIsWorkspaceAccordionOpen] = useState(true);

  // Inline quick reply state
  const [openReplyChannelId, setOpenReplyChannelId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccessMsg, setReplySuccessMsg] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [isSubmittingChannel, setIsSubmittingChannel] = useState(false);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteChannelId, setInviteChannelId] = useState("");
  const [inviteMessage, setInviteMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Create Board modal state
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [customBoards, setCustomBoards] = useState<CustomBoard[]>([]);

  const loadCustomBoards = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("custom_workspace_boards");
      if (stored) {
        try {
          setCustomBoards(JSON.parse(stored));
        } catch {}
      }
    }
  };

  const handleBoardCreated = (board: CustomBoard) => {
    setCustomBoards((prev) => [board, ...prev]);
  };

  const fetchUserDataAndChannels = async () => {
    const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch current user
      const userRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const user = await userRes.json();
        setCurrentUser(user);
      }

      // 2. Fetch role-based channels
      const channelsRes = await fetch(`${API_URL}/chat/channels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (channelsRes.ok) {
        const data = await channelsRes.json();
        if (Array.isArray(data)) {
          setChannels(data);
          if (data.length > 0 && !inviteChannelId) {
            setInviteChannelId(data[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching workspaces data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDataAndChannels();
    loadCustomBoards();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const userInitials = getInitials(currentUser?.name);
  const workspaceName = currentUser?.name ? `${currentUser.name.split(' ')[0]}'s Workspace` : "Workspace";

  // Send quick reply via socket or fallback
  const handleSendQuickReply = async (channelId: string) => {
    if (!replyText.trim() || sendingReply) return;

    const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
    if (!token || !currentUser) {
      router.push(`/chat?channel=${channelId}`);
      return;
    }

    setSendingReply(true);

    try {
      const socket: Socket = io(API_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socket.emit("send_message", {
        text: replyText.trim(),
        userId: currentUser.id || currentUser.sub,
        channelId: channelId,
      });

      const newMsg = {
        text: replyText.trim(),
        senderName: currentUser.name || "You",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toLocaleDateString(),
      };

      setChannels((prev) =>
        prev.map((ch) => (ch.id === channelId ? { ...ch, latestMessage: newMsg } : ch))
      );

      setReplySuccessMsg(channelId);
      setReplyText("");
      setTimeout(() => {
        setReplySuccessMsg(null);
        setOpenReplyChannelId(null);
      }, 1500);

      socket.disconnect();
    } catch (e) {
      console.error("Quick reply error:", e);
      router.push(`/chat?channel=${channelId}`);
    } finally {
      setSendingReply(false);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
    if (!token) return;

    setIsSubmittingChannel(true);
    try {
      const res = await fetch(`${API_URL}/chat/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newChannelName.trim(),
          description: newChannelDesc.trim(),
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setChannels((prev) => [created, ...prev]);
        setIsCreateModalOpen(false);
        setNewChannelName("");
        setNewChannelDesc("");
      }
    } catch (err) {
      console.error("Failed to create channel:", err);
    } finally {
      setIsSubmittingChannel(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteChannelId) return;

    const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/chat/members/${inviteChannelId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setInviteMessage({ text: data.message || "Invitation sent successfully!", success: true });
        setInviteEmail("");
        setTimeout(() => setInviteMessage(null), 4000);
      } else {
        setInviteMessage({ text: data.message || "Failed to invite user.", success: false });
      }
    } catch (err) {
      setInviteMessage({ text: "Error sending invite.", success: false });
    }
  };

  const activeChannels = channels.filter((c) => !dismissedCards[c.id]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
      {/* Primary WorkFlow Sidebar */}
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Topbar />

        {/* Clean Workspaces Main Frame */}
        <main className="flex-1 w-full h-full min-h-0 overflow-hidden flex bg-[#FAFBFC]">
          
          {/* ========================================================= */}
          {/* 1. LEFT SUB-SIDEBAR (Trello Method in WorkFlow Light UI)  */}
          {/* ========================================================= */}
          <div className="w-[245px] sm:w-[255px] bg-white border-r border-gray-200/80 flex flex-col h-full shrink-0 select-none overflow-y-auto custom-scrollbar p-3.5">
            <div className="space-y-4">
              
              {/* Primary Navigation items */}
              <nav className="space-y-1">
                <button
                  onClick={() => router.push("/boards")}
                  className="w-full px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors text-left font-semibold text-[13px]"
                >
                  <Layout size={18} className="text-gray-500" />
                  <span>Boards</span>
                </button>

                <button
                  onClick={() => router.push("/templates")}
                  className="w-full px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors text-left font-semibold text-[13px]"
                >
                  <FolderKanban size={18} className="text-gray-500" />
                  <span>Templates</span>
                </button>

                {/* Home Active Item (WorkFlow Soft Purple Pill Theme #EEE8FF with text-indigo-600) */}
                <button
                  onClick={() => router.push("/workspaces")}
                  className="w-full px-3 py-2 bg-[#EEE8FF] text-indigo-600 rounded-xl cursor-pointer flex items-center gap-3 font-extrabold text-[13px] shadow-2xs transition-colors"
                >
                  <Activity size={18} strokeWidth={2.4} />
                  <span>Home</span>
                </button>
              </nav>

              {/* Workspaces Section */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                    Workspaces
                  </span>
                </div>

                {/* Workspace Header Item */}
                <div className="space-y-1">
                  <button
                    onClick={() => setIsWorkspaceAccordionOpen((prev) => !prev)}
                    className="w-full px-2.5 py-2 text-sm text-gray-900 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Square Workspace Icon with lettermark */}
                      <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-[11px] shadow-xs">
                        {workspaceName[0]?.toUpperCase() || 'W'}
                      </div>
                      <span className="font-bold text-gray-900 text-xs">{workspaceName}</span>
                    </div>
                    {isWorkspaceAccordionOpen ? (
                      <ChevronUp size={14} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={14} className="text-gray-400" />
                    )}
                  </button>

                  {/* Sub-items (Indented) */}
                  <AnimatePresence>
                    {isWorkspaceAccordionOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-3 pl-3 border-l border-gray-200/80 space-y-0.5 text-xs text-gray-600 mt-1 overflow-hidden"
                      >
                        <div className="w-full flex items-center justify-between group">
                          <button
                            onClick={() => router.push("/boards")}
                            className="flex-1 px-2.5 py-1.5 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition-colors flex items-center gap-2.5 font-medium text-left"
                          >
                            <Layout size={14} className="text-gray-400" />
                            <span>Boards</span>
                          </button>
                          <button
                            onClick={() => setIsCreateBoardModalOpen(true)}
                            className="p-1 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Create board"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            if (currentUser?.role === "Admin") {
                              setIsInviteModalOpen(true);
                            } else {
                              toast.info("Members can view their assigned channels. Contact an Admin to invite teammates.");
                            }
                          }}
                          className="w-full px-2.5 py-1.5 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition-colors flex items-center justify-between font-medium group"
                        >
                          <span className="flex items-center gap-2.5">
                            <Users size={14} className="text-gray-400" />
                            <span>Members</span>
                          </span>
                          <Plus
                            size={14}
                            className="text-gray-400 group-hover:text-indigo-600 transition-colors"
                          />
                        </button>

                        <button
                          onClick={() => router.push("/settings")}
                          className="w-full px-2.5 py-1.5 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition-colors flex items-center gap-2.5 font-medium"
                        >
                          <Settings size={14} className="text-gray-400" />
                          <span>Settings</span>
                        </button>

                        <button
                          onClick={() => router.push("/projects")}
                          className="w-full px-2.5 py-1.5 hover:bg-gray-50 hover:text-gray-900 rounded-lg cursor-pointer transition-colors flex items-center justify-between font-medium"
                        >
                          <span className="flex items-center gap-2.5">
                            <Compass size={14} className="text-indigo-600" />
                            <span>Linked projects</span>
                          </span>
                          <ExternalLink size={12} className="text-gray-400" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. CENTER FEED: "UP NEXT" (Trello Method in WorkFlow UI)  */}
          {/* ========================================================= */}
          <div className="flex-1 min-w-0 overflow-y-auto px-6 sm:px-8 py-6 custom-scrollbar flex justify-center">
            <div className="w-full max-w-[620px] space-y-5">
              
              {/* Up Next Header */}
              <div className="flex items-center gap-2 pb-1">
                <Clock size={16} className="text-gray-600" />
                <h2 className="text-sm font-extrabold tracking-tight text-gray-900">
                  Up next
                </h2>
              </div>

              {/* Trello-Style "Up next" Banner */}
              {!dismissedUpNextBanner && (
                <div className="w-full bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-xs relative transition-all">
                  {/* Left Illustrated Graphic matching Trello */}
                  <UpNextIllustration />

                  {/* Right Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-sm font-extrabold text-gray-900 mb-1">
                      Up next
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      Keep track of upcoming due dates, mentions, and tasks across your channels.
                    </p>
                    <button
                      onClick={() => setDismissedUpNextBanner(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer hover:underline"
                    >
                      Got it! Dismiss this.
                    </button>
                  </div>

                  <button
                    onClick={() => setDismissedUpNextBanner(true)}
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors absolute top-3 right-3 cursor-pointer"
                    title="Dismiss banner"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="w-full p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-xs shadow-xs">
                  Loading channel overview...
                </div>
              )}

              {/* Empty State */}
              {!loading && activeChannels.length === 0 && (
                <div className="w-full p-10 text-center bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Hash size={24} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No active channel notifications</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                    You are all caught up on your channel activity and due dates.
                  </p>
                  {currentUser?.role === "Admin" && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Plus size={14} /> Create a channel
                    </button>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TRELLO-STYLE FEED CARDS (Light WorkFlow Theme)            */}
              {/* ========================================================= */}
              {!loading &&
                activeChannels.map((channel) => {
                  const theme = getCoverTheme(channel.id);
                  const isReplying = openReplyChannelId === channel.id;
                  const isSuccess = replySuccessMsg === channel.id;

                  return (
                    <div
                      key={channel.id}
                      className="w-full rounded-2xl overflow-hidden border border-gray-200/90 bg-white shadow-xs hover:shadow-md hover:border-indigo-200/90 transition-all group"
                    >
                      {/* 1. Scenic Graphic Cover Header */}
                      <div className="relative overflow-hidden cursor-pointer" onClick={() => router.push(`/chat?channel=${channel.id}`)}>
                        {/* Background Cover with Nebula / Geometric Star Texture */}
                        <div className={`h-[105px] w-full bg-gradient-to-r ${theme.bannerGradient} relative p-4 flex flex-col justify-between overflow-hidden select-none`}>
                          
                          {/* Ambient stars/nebula glow spots */}
                          <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />
                          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/40 pointer-events-none" />

                          {/* Top Row: "Introducing: #{channel.name}" + Icons + Avatar */}
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex flex-col gap-1 min-w-0">
                              <h3 className="text-white text-[15px] font-extrabold tracking-tight truncate drop-shadow-sm">
                                Introducing: #{channel.name}
                              </h3>

                              <div className="flex items-center gap-2 text-white/70">
                                <Eye size={13} />
                                <List size={13} />
                              </div>
                            </div>

                            {/* Top-Right Avatar Pill */}
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-[11px] flex items-center justify-center border border-white/30 shadow-xs">
                              {userInitials}
                            </div>
                          </div>

                          {/* Frosted Bottom Subtitle Bar */}
                          <div className="relative z-10 -mx-4 -mb-4 px-4 py-1.5 bg-black/40 backdrop-blur-xs border-t border-white/10 flex items-center justify-between text-[11px] text-white/90">
                            <span className="truncate font-medium">
                              <strong className="text-white">{workspaceName}</strong> |{" "}
                              <span className="text-indigo-200">#{channel.name}</span>:{" "}
                              {channel.description || "Announcements / Questions"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Card Body: Activity & Latest Message */}
                      <div className="p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* User Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                              {channel.latestMessage?.senderName
                                ? getInitials(channel.latestMessage.senderName)
                                : userInitials}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span className="font-extrabold text-gray-900">
                                  {channel.latestMessage?.senderName
                                    ? channel.latestMessage.senderName
                                    : "You added yourself"}
                                </span>
                              </div>
                              
                              <span className="text-gray-400 text-[11px] block mt-0.5">
                                {channel.latestMessage?.time || "3 hours ago"}
                              </span>

                              {channel.latestMessage?.text && (
                                <p className="text-xs text-gray-700 font-medium mt-2 bg-gray-50 border border-gray-100 p-2.5 rounded-xl line-clamp-2">
                                  &ldquo;{channel.latestMessage.text}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Three dots menu */}
                          <button
                            onClick={() => router.push(`/chat?channel=${channel.id}`)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
                            title="Channel options"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>

                        {/* Inline Quick Reply Drawer */}
                        {isReplying && (
                          <div className="mt-3 bg-gray-50 border border-indigo-200/80 rounded-xl p-2.5 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold px-1">
                              <span className="flex items-center gap-1 text-indigo-600">
                                <CornerDownRight size={12} />
                                Replying in #{channel.name}
                              </span>
                              <button
                                onClick={() => {
                                  setOpenReplyChannelId(null);
                                  setReplyText("");
                                }}
                                className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Type a quick reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSendQuickReply(channel.id);
                                }}
                                autoFocus
                                className="flex-1 bg-white border border-gray-200 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-all"
                              />
                              <button
                                onClick={() => handleSendQuickReply(channel.id)}
                                disabled={sendingReply || !replyText.trim()}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                              >
                                <Send size={12} />
                                <span>{sendingReply ? "..." : "Send"}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {isSuccess && (
                          <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            <span>Reply sent!</span>
                          </div>
                        )}
                      </div>

                      {/* 3. Trello-Style Split Bottom Actions ([ ↩ Reply ] | [ ✕ Dismiss ]) */}
                      <div className="grid grid-cols-2 border-t border-gray-100 bg-gray-50/50 divide-x divide-gray-100">
                        <button
                          onClick={() => {
                            if (openReplyChannelId === channel.id) {
                              setOpenReplyChannelId(null);
                            } else {
                              setOpenReplyChannelId(channel.id);
                              setReplyText("");
                            }
                          }}
                          className="py-2.5 px-4 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Reply size={14} className="text-gray-500" />
                          <span>Reply</span>
                        </button>

                        <button
                          onClick={() =>
                            setDismissedCards((prev) => ({ ...prev, [channel.id]: true }))
                          }
                          className="py-2.5 px-4 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <X size={14} className="text-gray-500" />
                          <span>Dismiss</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. RIGHT SIDEBAR (Trello Method in WorkFlow Light UI)     */}
          {/* ========================================================= */}
          <div className="w-[280px] lg:w-[305px] shrink-0 p-5 border-l border-gray-200/80 bg-white overflow-y-auto custom-scrollbar space-y-6">
            
            {/* Recently Viewed Header */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-gray-500">
                <Clock size={15} />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  Recently viewed
                </h3>
              </div>

              {/* Trello-Style Thumbnail Cards List */}
              <div className="space-y-1.5">
                {/* Custom Created Boards */}
                {customBoards.map((b) => (
                  <div
                    key={`board-${b.id}`}
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("active_board_id", b.id);
                        localStorage.setItem("active_board_title", b.title);
                        localStorage.setItem("active_board_bg", b.bgGradient);
                        if (b.templateId) {
                          localStorage.setItem("active_board_template", b.templateId);
                          router.push(`/boards?template=${b.templateId}`);
                        } else {
                          localStorage.removeItem("active_board_template");
                          router.push(`/boards?id=${b.id}`);
                        }
                      }
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-7 rounded-md bg-gradient-to-r ${b.bgGradient} shrink-0 shadow-2xs flex items-center justify-center text-white text-[10px] font-black border border-black/10 transition-transform group-hover:scale-105`}
                      >
                        <Layout size={12} strokeWidth={2.5} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition-colors truncate">
                          {b.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 truncate">{workspaceName}</p>
                      </div>
                    </div>

                    <span className="text-[9px] uppercase font-black tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                      BOARD
                    </span>
                  </div>
                ))}

                {/* Channels */}
                {channels.map((ch) => {
                  const theme = getCoverTheme(ch.id);
                  return (
                    <div
                      key={`recent-${ch.id}`}
                      onClick={() => {
                        if (ch.isTemplate) {
                          if (typeof window !== "undefined") {
                            localStorage.setItem("active_board_template", "my-tasks");
                          }
                          router.push("/boards?template=my-tasks");
                        } else {
                          router.push(`/chat?channel=${ch.id}`);
                        }
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all border border-transparent hover:border-gray-100"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Visual Thumbnail Cover matching Trello */}
                        <div
                          className={`w-9 h-7 rounded-md bg-gradient-to-r ${theme.thumbGradient} shrink-0 shadow-2xs flex items-center justify-center text-white text-[10px] font-black border border-black/10 transition-transform group-hover:scale-105`}
                        >
                          #
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-600 transition-colors truncate">
                            {ch.name}
                          </h4>
                          <p className="text-[11px] text-gray-400 truncate">
                            {ch.isTemplate ? "WorkFlow Templates" : workspaceName}
                          </p>
                        </div>
                      </div>

                      {/* TEMPLATE Pill Badge */}
                      {ch.isTemplate && (
                        <span className="text-[9px] uppercase font-black tracking-wider text-gray-700 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-md shrink-0">
                          TEMPLATE
                        </span>
                      )}
                    </div>
                  );
                })}

                {channels.length === 0 && customBoards.length === 0 && !loading && (
                  <p className="text-xs text-gray-400 italic p-2">No items to display.</p>
                )}
              </div>
            </div>

            {/* Links Section (Trello style) */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3">
                Links
              </h3>

              <button
                onClick={() => setIsCreateBoardModalOpen(true)}
                className="w-full p-3 bg-gray-50 hover:bg-indigo-50/60 text-gray-700 hover:text-indigo-700 rounded-xl border border-gray-200 hover:border-indigo-200 flex items-center gap-3 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-lg bg-white group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                  <Plus size={14} strokeWidth={2.5} />
                </div>
                <span>Create new board</span>
              </button>

              {currentUser?.role === "Admin" && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full p-3 bg-gray-50 hover:bg-purple-50/60 text-gray-700 hover:text-purple-700 rounded-xl border border-gray-200 hover:border-purple-200 flex items-center gap-3 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-white group-hover:bg-purple-600 text-purple-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                    <Hash size={14} strokeWidth={2.5} />
                  </div>
                  <span>Create new channel</span>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL: CREATE CHANNEL (ADMIN ONLY - LIGHT WORKFLOW STYLE) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Hash size={18} className="text-indigo-600" />
                  Create New Channel
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. project-apollo, announcements"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="What is this channel about?"
                    value={newChannelDesc}
                    onChange={(e) => setNewChannelDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingChannel || !newChannelName.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    {isSubmittingChannel ? "Creating..." : "Create Channel"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL: INVITE MEMBER (ADMIN ONLY - LIGHT WORKFLOW STYLE) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Users size={18} className="text-indigo-600" />
                  Add Member to Channel
                </h3>
                <button
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setInviteMessage(null);
                  }}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {inviteMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    inviteMessage.success
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>{inviteMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Select Channel
                  </label>
                  <select
                    value={inviteChannelId}
                    onChange={(e) => setInviteChannelId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  >
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        #{ch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    User Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                    required
                  />
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  When you add a team member to a channel, it will instantly become visible in their channel overview and chat sidebar.
                </p>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={!inviteEmail.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={() => setIsCreateBoardModalOpen(false)}
        onBoardCreated={handleBoardCreated}
        defaultWorkspace={workspaceName}
      />
    </div>
  );
}

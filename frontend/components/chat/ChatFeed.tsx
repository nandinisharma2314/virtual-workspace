"use client";

import React, { useState, useEffect, useRef } from "react";
import { chatMessages, ChatMessage } from "@/lib/chatData";
import Avatar from "@/components/Avatar";
import { io, Socket } from "socket.io-client";
import {
  Star,
  MoreVertical,
  Video,
  ChevronDown,
  Pin,
  X,
  Plus,
  Smile,
  AtSign,
  Image,
  Mic,
  Paperclip,
  Sparkles,
  Send,
  Copy,
  Check,
  Pen,
  Trash2,
  MessageSquare,
  Play,
  Square,
  BookOpen,
  Info,
  Link as LinkIcon,
  Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import EmojiPicker from 'emoji-picker-react';

// Mock Audio Player Component
const MockAudioPlayer = ({ duration = 8, filename = "", url = "" }: { duration?: number, filename?: string, url?: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Extract duration from filename if possible, e.g. "Voice message (12s).m4a"
  const parsedDuration = parseInt(filename.match(/\((\d+)s\)/)?.[1] || `${duration}`);

  useEffect(() => {
    if (url) {
      const audio = new Audio(url);
      audioRef.current = audio;

      const onTimeUpdate = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      const onEnded = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('ended', onEnded);
        audio.pause();
      };
    }
  }, [url]);

  useEffect(() => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      } else {
        // Fallback for mock if no URL exists
        const interval = setInterval(() => {
          setProgress(p => {
            if (p >= 100) {
              setIsPlaying(false);
              return 0;
            }
            return p + (100 / (parsedDuration * 10)); // updates 10 times a second
          });
        }, 100);
        return () => clearInterval(interval);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, parsedDuration]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));

    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
    setProgress(percent * 100);
  };

  const displayTime = audioRef.current && audioRef.current.duration
    ? (progress / 100) * audioRef.current.duration
    : (progress / 100) * parsedDuration;

  return (
    <div className="mt-2 inline-flex items-center gap-3 border border-gray-200/90 rounded-3xl p-1.5 px-3 bg-white shadow-2xs w-64 hover:border-gray-300 transition-all cursor-default" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="h-8 w-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-blue-700 transition-colors"
      >
        {isPlaying ? <Square size={12} fill="currentColor" /> : <Play size={13} fill="currentColor" className="ml-0.5" />}
      </button>
      <div className="flex-1 cursor-pointer py-2" onClick={handleSeek}>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden pointer-events-none">
          <div className="h-full bg-[#2563EB] transition-all duration-100" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <span className="text-[11px] font-bold text-gray-500 font-mono shrink-0">
        0:{Math.floor(displayTime).toString().padStart(2, '0')} / 0:{parsedDuration.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default function ChatFeed({ channelId = "c-general", refreshTrigger = 0 }: { channelId?: string, refreshTrigger?: number }) {
  const [activeTab, setActiveTab] = useState("Messages");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessage | null>(null);
  const [activeThreadMessage, setActiveThreadMessage] = useState<ChatMessage | null>(null);
  const [inlineEditMessageId, setInlineEditMessageId] = useState<string | null>(null);
  const [inlineEditText, setInlineEditText] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Toolbar states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{ name: string, size: string, url?: string } | null>(null);

  // Task Modal states
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<any>(null);

  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      try { setCurrentUser(JSON.parse(atob(token.split('.')[1]))); } catch (e) { }
    }
  }, []);

  useEffect(() => {
    // 1. Fetch initial messages for channel
    const fetchMessages = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) return;

        const res = await fetch(`http://localhost:3001/chat/messages/${channelId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.length > 0 ? data : chatMessages.filter(m => m.channelId === channelId || (!m.channelId && channelId === "c-general")));
        }

        const infoRes = await fetch(`http://localhost:3001/chat/info/${channelId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (infoRes.ok) {
          const infoData = await infoRes.json();
          setInfo(infoData);
        }
      } catch (e) {
        setMessages(chatMessages);
      }
    };
    fetchMessages();

    // 2. Setup Socket
    socketRef.current = io("http://localhost:3001");

    // Join channel room
    socketRef.current.emit("join_channel", { channelId });

    socketRef.current.on("chat_message", (message: ChatMessage) => {
      // Only append if the message matches our current channel (safeguard)
      if (message.channelId === channelId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socketRef.current.on("message_edited", (data: { messageId: number, text: string, isEdited: boolean }) => {
      setMessages(prev => prev.map(m => m.id === data.messageId.toString() ? { ...m, text: data.text, isEdited: data.isEdited } : m));
    });

    socketRef.current.on("message_deleted", (data: { messageId: number }) => {
      setMessages(prev => prev.filter(m => m.id !== data.messageId.toString()));
    });

    socketRef.current.on("reaction_updated", (data: { messageId: number, reactions: Record<string, number[]> }) => {
      setMessages(prev => prev.map(m => m.id === data.messageId.toString() ? { ...m, reactions: data.reactions } : m));
    });

    return () => {
      socketRef.current?.disconnect();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [channelId, refreshTrigger]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const tabs = ["Messages", "Files", "Tasks", "Wiki"];

  const handleSendMessage = () => {
    if ((!inputText.trim() && !pendingAttachment) || !currentUser) return;

    socketRef.current?.emit("send_message", {
      text: inputText,
      userId: currentUser.sub,
      channelId: channelId,
      attachment: pendingAttachment
    });

    setInputText("");
    setPendingAttachment(null);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPendingAttachment({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB'
      });
    }
    // reset input
    if (e.target) e.target.value = '';
  };

  const [isAiLoading, setIsAiLoading] = useState(false);
  const handleAIAssist = () => {
    if (isAiLoading) return;

    if (!inputText.trim()) {
      setInputText("Could you please provide an update on the project status?");
      return;
    }

    setIsAiLoading(true);
    const originalText = inputText;
    setInputText("✨ AI is thinking...");

    setTimeout(() => {
      // Mock AI formatting
      const rewritten = originalText.charAt(0).toUpperCase() + originalText.slice(1);
      setInputText(`Here is a more professional tone: "${rewritten}". Let me know if you need anything else.`);
      setIsAiLoading(false);
    }, 1000);
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64data = reader.result as string;
            setPendingAttachment({
              name: `Voice message (${recordingTime}s).m4a`,
              size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
              url: base64data
            });
            setRecordingTime(0);
            stream.getTracks().forEach(track => track.stop()); // release mic
          };
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } catch (e) {
        alert("Microphone access denied or not available. Please allow microphone permissions.");
      }
    }
  };

  const handleDownloadAttachment = (attachment: { name: string, size: string, url?: string }) => {
    // Generate a dummy blob since actual file bytes aren't persisted in this mockup
    const blob = new Blob([`Mock file content for: ${attachment.name}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = attachment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEditInit = (m: ChatMessage) => {
    setInlineEditMessageId(m.id);
    setInlineEditText(m.text);
  };

  const handleDelete = (m: ChatMessage) => {
    if (!currentUser) return;
    if (window.confirm("Are you sure you want to delete this message?")) {
      if (m.id.startsWith("m-")) {
        setMessages(prev => prev.filter(msg => msg.id !== m.id));
      } else {
        socketRef.current?.emit("delete_message", {
          messageId: parseInt(m.id),
          userId: currentUser.sub,
          channelId: channelId
        });
      }
    }
  };

  const handleReaction = (m: ChatMessage, emoji: string) => {
    if (!currentUser) return;
    if (m.id.startsWith("m-")) {
      setMessages(prev => prev.map(msg => {
        if (msg.id === m.id) {
          const reactions = msg.reactions ? { ...msg.reactions } : {};
          let alreadyHasSameEmoji = false;

          for (const key of Object.keys(reactions)) {
            const idx = reactions[key].indexOf(currentUser.sub);
            if (idx > -1) {
              if (key === emoji) alreadyHasSameEmoji = true;
              reactions[key] = reactions[key].filter(id => id !== currentUser.sub);
              if (reactions[key].length === 0) delete reactions[key];
            }
          }

          if (!alreadyHasSameEmoji) {
            if (!reactions[emoji]) reactions[emoji] = [];
            reactions[emoji] = [...reactions[emoji], currentUser.sub];
          }
          return { ...msg, reactions };
        }
        return msg;
      }));
    } else {
      socketRef.current?.emit("add_reaction", {
        messageId: parseInt(m.id),
        userId: currentUser.sub,
        emoji,
        channelId: channelId
      });
    }
  };

  const handleCopyCode = (lines?: string[]) => {
    if (!lines) return;
    navigator.clipboard?.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMessageText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const parts = line.split(/(@team|@Avi Sharma|@Rohit Verma|@Neha Sharma)/g);
      return (
        <React.Fragment key={idx}>
          {parts.map((part, pIdx) => {
            if (part.startsWith("@")) {
              return (
                <span
                  key={pIdx}
                  className="bg-blue-50 text-[#2563EB] font-bold px-1 py-0.5 rounded-md mx-0.5"
                >
                  {part}
                </span>
              );
            }
            return <React.Fragment key={pIdx}>{part}</React.Fragment>;
          })}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex-1 min-w-0 flex h-full overflow-hidden">
      <div className="flex-1 min-w-0 border-r border-gray-200/80 bg-white flex flex-col h-full overflow-hidden select-none">
        {/* Top Header Bar */}
        <div className="shrink-0 border-b border-gray-200/80 px-5 flex flex-col justify-between bg-white z-10 pt-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-black tracking-tight text-gray-900">{info?.name || "# general"}</span>
                <button className="text-gray-400 hover:text-amber-500 transition-colors ml-1">
                  <Star size={16} strokeWidth={2} />
                </button>
              </div>
              <span className="text-[11.5px] font-medium text-gray-400 truncate mt-0.5">
                {info?.description || "Company wide announcements and general discussion"}
              </span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center -space-x-1.5 overflow-hidden">
                {info?.members?.slice(0, 4).map((m: any, i: number) => (
                  <Avatar key={i} person={m.avatarPerson} name={m.name} size={26} ring />
                ))}
                {info?.members?.length > 4 && (
                  <span className="flex h-[26px] items-center justify-center rounded-full bg-gray-100 px-2 text-[11px] font-black text-gray-700 ring-2 ring-white shadow-2xs">
                    +{info.members.length - 4}
                  </span>
                )}
              </div>

              <button
                onClick={() => router.push('/meetings')}
                className="flex items-center gap-1.5 rounded-full bg-[#5E43FF] px-4 py-1.5 text-[12px] font-bold text-white hover:bg-indigo-600 transition-colors shadow-sm"
              >
                <Video size={14} strokeWidth={2.5} />
                <span>Join call</span>
              </button>

              <button className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Tabs row */}
          <div className="flex items-center gap-6 mt-2 -mb-px">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-[13px] font-bold border-b-2 transition-all ${isActive
                      ? "border-[#2563EB] text-[#2563EB]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                >
                  {tab}
                </button>
              );
            })}
            <button className="pb-2 text-gray-400 hover:text-gray-700 transition-colors">
              <Plus size={16} strokeWidth={2.3} />
            </button>
          </div>
        </div>

        {activeTab === "Messages" && (
          <>
            {/* High-density Conversation Messages Feed without scrollbars */}
            <div className="flex-1 min-h-0 px-5 py-3 bg-white flex flex-col justify-between overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">


              {/* Pinned Banner */}
              {pinnedMessage && (
                <div className="shrink-0 bg-[#FAFBFC] border border-gray-200/80 rounded-xl p-2.5 px-3.5 flex items-center justify-between shadow-2xs mb-2">
                  <div className="flex items-center gap-2.5 min-w-0 pr-3">
                    <Pin size={15} className="text-gray-600 shrink-0 rotate-45" strokeWidth={2.3} />
                    <div className="min-w-0">
                      <span className="text-[12px] font-bold text-gray-900 block truncate">
                        Pinned by {pinnedMessage.senderName}
                      </span>
                      <span className="text-[11.5px] text-gray-500 block truncate mt-0.5">
                        {pinnedMessage.text}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="text-[12px] font-bold text-[#2563EB] hover:underline px-2 py-0.5">
                      View
                    </button>
                    <button
                      onClick={() => setPinnedMessage(null)}
                      className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Messages Container */}
              <div className="flex-1 min-h-0 flex flex-col justify-start space-y-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-4">

                {/* Channel Empty/Welcome State */}
                <div className="flex flex-col gap-3 pb-8 pt-6 px-1 max-w-4xl">
                  <h1 className="text-[24px] lg:text-[26px] font-extrabold text-gray-900 flex items-center gap-2 mb-1">
                    👋 Welcome to your first channel {info?.name || "# new-channel"}!
                  </h1>
                  <p className="text-gray-600 text-[13.5px] font-medium mb-5">
                    Channels in WorkFlow keep work focused around a specific topic. You can keep all your information related projects attached to the channel so everyone can access.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-[#FDF1F5] rounded-2xl p-5 border border-pink-100/50 cursor-pointer hover:shadow-md hover:border-pink-200 transition-all flex flex-col">
                      <h3 className="font-extrabold text-gray-900 text-[14px] mb-1">Invite your external partners</h3>
                      <p className="text-[12.5px] font-medium text-gray-600 mb-6">Add clients or customers</p>

                      <div className="mt-auto self-center flex items-center justify-center p-2 relative h-16 w-24">
                        <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white z-10 flex items-center justify-center text-[10px] shadow-sm">🧑‍t;</div>
                        <div className="absolute bottom-0 left-4 w-9 h-9 rounded-full bg-blue-500 border-2 border-white z-20 flex items-center justify-center text-[12px] shadow-sm">👨🏽</div>
                        <div className="absolute top-2 right-0 w-10 h-10 rounded-full bg-pink-500 border-2 border-white z-30 flex items-center justify-center text-[14px] shadow-sm">👩🏼</div>
                      </div>
                    </div>

                    <div className="flex-1 bg-[#FFF8E6] rounded-2xl p-5 border border-amber-100/50 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all flex flex-col">
                      <h3 className="font-extrabold text-gray-900 text-[14px] mb-1">Start from a template</h3>
                      <p className="text-[12.5px] font-medium text-gray-600 mb-6">Browse channel templates</p>

                      <div className="mt-auto self-center bg-white rounded-xl shadow-sm border border-amber-200/50 p-2.5 w-3/4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[8px] font-bold">✓</div>
                          <div className="h-2 w-12 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-4 w-4 rounded-sm bg-gray-100"></div>
                          <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-sm bg-gray-100"></div>
                          <div className="h-2 w-10 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 bg-[#EAF2FF] rounded-2xl p-5 border border-blue-100/50 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all flex flex-col">
                      <h3 className="font-extrabold text-gray-900 text-[14px] mb-1">Connect your apps</h3>
                      <p className="text-[12.5px] font-medium text-gray-600 mb-6">Bring your work into WorkFlow</p>

                      <div className="mt-auto self-center relative w-full h-16 flex items-center justify-center">
                        <div className="w-[90%] h-14 bg-white rounded-xl shadow-sm border border-blue-200/50 flex overflow-hidden">
                          <div className="w-6 bg-blue-600 shrink-0"></div>
                          <div className="flex-1 p-2 flex flex-col gap-1.5 justify-center px-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                              <div className="h-1.5 w-8 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded bg-blue-400"></div>
                              <div className="h-1.5 w-12 bg-gray-200 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center my-2 mt-6">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="px-3 text-[11px] font-extrabold text-gray-400 bg-white border border-gray-200 rounded-full py-0.5 mx-2 shadow-2xs">Today</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                </div>

                {messages.filter(m => !m.parentId).map((m) => (
                  <div
                    key={m.id}
                    className="group flex items-start gap-3 rounded-xl px-2 py-1 -mx-2 hover:bg-gray-50/60 transition-colors shrink-0 relative"
                  >
                    <div className="absolute -top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-lg shadow-sm flex items-center p-0.5 z-10">
                      <div className="group/reaction relative flex items-center">
                        <div className="absolute right-full mr-1 bg-white border border-gray-200 rounded-lg shadow-sm items-center p-0.5 hidden group-hover/reaction:flex gap-0.5">
                          {['👍', '❤️', '😂', '😮', '😢'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(m, emoji)}
                              className="hover:bg-gray-100 p-1 rounded-md text-[14px] transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            onClick={() => setActiveReactionMessageId(m.id)}
                            className="hover:bg-gray-100 p-1.5 rounded-md text-gray-500 transition-colors"
                            title="More emojis"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="Add reaction"
                        >
                          <Smile size={14} />
                        </button>
                        {activeReactionMessageId === m.id && (
                          <div className="absolute top-10 right-0 z-50">
                            <div className="fixed inset-0" onClick={() => setActiveReactionMessageId(null)}></div>
                            <div className="relative shadow-xl rounded-xl overflow-hidden">
                              <EmojiPicker
                                onEmojiClick={(e) => {
                                  handleReaction(m, e.emoji);
                                  setActiveReactionMessageId(null);
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setActiveThreadMessage(m)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title="Reply in thread"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button
                        onClick={() => setPinnedMessage(m)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title="Pin message"
                      >
                        <Pin size={14} />
                      </button>
                      {currentUser && m.senderName.toLowerCase().includes(currentUser.name?.toLowerCase().split(' ')[0]) && (
                        <>
                          <button
                            onClick={() => handleEditInit(m)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                            title="Edit message"
                          >
                            <Pen size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                            title="Delete message"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="shrink-0 pt-0.5">
                      <Avatar person={m.senderPerson} name={m.senderName} size={32} />
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      {/* Sender Header */}
                      <div className="flex items-baseline gap-2.5 mb-0.5">
                        <span className="text-[13.5px] font-bold text-gray-900">
                          {m.senderName}
                        </span>
                        <span className="text-[11.5px] font-normal text-gray-400">
                          {m.timestamp}
                        </span>
                        {m.isEdited && (
                          <span className="text-[10px] font-medium text-gray-400 ml-1">(edited)</span>
                        )}
                      </div>

                      {/* Message text */}
                      {inlineEditMessageId === m.id ? (
                        <div className="mt-1 mb-2">
                          <textarea
                            value={inlineEditText}
                            onChange={(e) => setInlineEditText(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none overflow-hidden bg-white shadow-sm"
                            rows={Math.max(1, inlineEditText.split('\n').length)}
                            autoFocus
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => {
                                setInlineEditMessageId(null);
                                setInlineEditText("");
                              }}
                              className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors bg-gray-50 border border-gray-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                if (inlineEditText.trim() && inlineEditText !== m.text) {
                                  // Optimistically update the UI for instant feedback
                                  setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, text: inlineEditText.trim(), isEdited: true } : msg));

                                  if (!m.id.startsWith("m-")) {
                                    socketRef.current?.emit("edit_message", {
                                      messageId: parseInt(m.id),
                                      text: inlineEditText.trim(),
                                      userId: currentUser.sub,
                                      channelId: channelId
                                    });
                                  }
                                }
                                setInlineEditMessageId(null);
                              }}
                              className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              Save changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[13px] text-gray-800 leading-normal font-normal">
                          {renderMessageText(m.text)}
                        </div>
                      )}

                      {/* Attachment Card if present */}
                      {m.attachment && (
                        m.attachment.name.endsWith('.m4a') ? (
                          <MockAudioPlayer filename={m.attachment.name} url={m.attachment.url} />
                        ) : (
                          <div
                            onClick={() => handleDownloadAttachment(m.attachment!)}
                            className="mt-2 inline-flex items-center gap-3 border border-gray-200/90 rounded-2xl p-2 px-3 bg-white shadow-2xs hover:border-gray-300 transition-all cursor-pointer group"
                            title="Click to download"
                          >
                            <div className="h-9 w-9 rounded-xl text-white font-black text-[12px] flex items-center justify-center shrink-0 shadow-xs bg-gray-900">
                              Fig
                            </div>
                            <div className="min-w-0 pr-2">
                              <span className="block text-[12.5px] font-extrabold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {m.attachment.name}
                              </span>
                              <span className="block text-[11px] font-medium text-gray-400 mt-0.5">
                                {m.attachment.size}
                              </span>
                            </div>
                          </div>
                        )
                      )}

                      {/* Code Block if present */}
                      {m.codeBlock && (
                        <div className="mt-2 border border-gray-200/90 rounded-2xl p-2.5 px-3 bg-gray-50/90 font-mono text-[11.5px] text-gray-800 relative max-w-xl shadow-2xs">
                          <button
                            onClick={() => handleCopyCode(m.codeBlock?.lines)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg border border-gray-200/80 bg-white text-gray-500 hover:text-gray-900 transition-all shadow-2xs"
                            title="Copy code"
                          >
                            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            {m.codeBlock.lines.map((line, lIdx) => (
                              <div key={lIdx} className="flex gap-3 leading-relaxed">
                                <span className="text-gray-400 select-none w-4 text-right">{lIdx + 1}</span>
                                <span className="text-gray-800 whitespace-pre">{line}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Thread Reply Banner if present */}
                      {(() => {
                        const replies = messages.filter(msg => msg.parentId === m.id);
                        if (replies.length === 0) return null;
                        const lastReplyTime = replies[replies.length - 1].timestamp;
                        return (
                          <div
                            onClick={() => setActiveThreadMessage(m)}
                            className="mt-2 inline-flex items-center gap-2.5 py-1 px-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[12px] font-semibold cursor-pointer hover:bg-blue-50 transition-all"
                          >
                            <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                              {Array.from(new Set(replies.map(r => r.senderPerson))).slice(0, 3).map((person, i) => (
                                <Avatar key={i} person={person} size={18} ring />
                              ))}
                            </div>
                            <span className="text-[#2563EB] font-bold">
                              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                            </span>
                            <span className="text-gray-400 font-medium text-[11.5px]">
                              Last reply at {lastReplyTime}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Reactions Row */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {m.reactions && Object.entries(m.reactions).map(([emoji, userIds]) => {
                          const hasReacted = currentUser && userIds.includes(currentUser.sub);
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(m, emoji)}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-2 py-0.5 text-[11.5px] font-bold shadow-2xs transition-all ${hasReacted
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : 'border-gray-200/90 bg-white hover:bg-gray-50/90 text-gray-700'
                                }`}
                            >
                              <span>{emoji}</span>
                              <span className="font-extrabold">{userIds.length}</span>
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handleReaction(m, '❤️')}
                          className="h-6 w-7 rounded-xl border border-gray-200/90 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-2xs transition-all"
                          title="Add reaction"
                        >
                          <Smile size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bottom Chat Input Bar */}
            <div className="shrink-0 px-5 pb-4 pt-2 bg-white">
              <div className="border border-gray-200/90 rounded-2xl p-2.5 px-3 bg-white shadow-2xs flex flex-col justify-between gap-2.5">

                {/* Pending Attachment UI */}
                {pendingAttachment && (
                  <div className="flex items-center gap-3 border border-gray-200/90 rounded-xl p-2 px-3 bg-gray-50 shadow-2xs mb-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 font-black text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                      FILE
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="block text-[12px] font-extrabold text-gray-900 truncate">
                        {pendingAttachment.name}
                      </span>
                      <span className="block text-[10px] font-medium text-gray-400 mt-0.5">
                        {pendingAttachment.size}
                      </span>
                    </div>
                    <button
                      onClick={() => setPendingAttachment(null)}
                      className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="relative">
                  {isRecording ? (
                    <div className="w-full flex items-center justify-between bg-red-50 text-red-600 rounded-lg py-1 px-3 border border-red-200 shadow-inner my-0.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
                        <span className="font-bold text-sm tracking-tight">Recording audio...</span>
                      </div>
                      <span className="font-mono font-bold text-sm">
                        {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Message #general"
                      className="w-full bg-transparent text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none font-normal py-1"
                    />
                  )}

                  {/* Emoji Picker Popover */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-3 right-0 shadow-2xl rounded-2xl overflow-hidden z-50">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setInputText(prev => prev + emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                        width={320}
                        height={400}
                      />
                    </div>
                  )}
                </div>

                {/* Input Toolbar */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-gray-400">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
                      title="Add file"
                    >
                      <Plus size={16} strokeWidth={2.4} />
                    </button>
                    <button
                      onClick={() => setInputText(prev => prev + "**bold** *italic* `code`")}
                      className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors font-serif font-bold text-xs"
                      title="Formatting"
                    >
                      Aa
                    </button>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-1.5 rounded-lg transition-colors ${showEmojiPicker ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50 hover:text-gray-700'}`}
                      title="Emoji"
                    >
                      <Smile size={16} strokeWidth={2.1} />
                    </button>
                    <button
                      onClick={() => {
                        setInputText(prev => prev + (prev && !prev.endsWith(' ') ? ' @' : '@'));
                        (document.querySelector('input[type="text"]') as HTMLInputElement)?.focus();
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
                      title="Mention someone"
                    >
                      <AtSign size={16} strokeWidth={2.1} />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
                      title="Attach image"
                    >
                      <Image size={16} strokeWidth={2.1} />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
                      title="Attach file"
                    >
                      <Paperclip size={16} strokeWidth={2.1} />
                    </button>
                    <button
                      onClick={handleVoiceRecord}
                      className={`p-1.5 rounded-lg transition-colors ${isRecording ? 'bg-red-100 text-red-600' : 'hover:bg-gray-50 hover:text-gray-700'}`}
                      title={isRecording ? "Stop recording" : "Record voice"}
                    >
                      <Mic size={16} strokeWidth={isRecording ? 2.6 : 2.1} className={isRecording ? "animate-pulse" : ""} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAIAssist}
                      disabled={isAiLoading}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-indigo-600 border border-purple-200/60 font-bold text-xs shadow-2xs transition-all ${isAiLoading ? 'bg-purple-100 opacity-70 cursor-not-allowed' : 'bg-purple-50 hover:bg-purple-100'}`}
                    >
                      <Sparkles size={13} strokeWidth={2.4} className={isAiLoading ? "animate-pulse" : ""} />
                      <span>{isAiLoading ? "Processing..." : "AI Assist"}</span>
                    </button>
                    <button onClick={handleSendMessage} className="flex items-center justify-center h-8 w-11 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs transition-all">
                      <Send size={14} strokeWidth={2.3} className="mr-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "Files" && (
          <div className="flex-1 min-h-0 px-6 py-6 bg-[#FAFBFC] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[18px] font-black tracking-tight text-gray-900">Shared Files in this Channel</h2>
                <button className="text-[13px] font-bold text-gray-500 hover:text-gray-800 transition-colors">
                  View all
                </button>
              </div>

              {messages.filter(m => m.attachment).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-gray-200/80 rounded-3xl bg-white shadow-2xs">
                  <div className="h-14 w-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Paperclip size={24} className="text-gray-400" />
                  </div>
                  <span className="text-gray-800 font-extrabold text-[15px]">No files yet</span>
                  <span className="text-gray-400 font-medium text-[13px] mt-1">Attachments you send will appear here.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {messages.filter(m => m.attachment).map(m => {
                    const file = m.attachment!;
                    const isAudio = file.name.endsWith('.m4a');
                    return (
                      <div
                        key={m.id}
                        className="bg-white border border-gray-200/80 rounded-2xl p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group flex flex-col shadow-2xs"
                        onClick={() => handleDownloadAttachment({ name: file.name, size: file.size, url: file.url })}
                      >
                        <div className={`h-12 w-12 rounded-xl text-white font-black text-[15px] flex items-center justify-center shrink-0 mb-4 shadow-sm ${isAudio ? 'bg-red-500' : 'bg-gray-900'}`}>
                          {isAudio ? <Mic size={22} /> : 'Fig'}
                        </div>
                        <span className="text-[13.5px] font-extrabold text-gray-900 truncate group-hover:text-[#2563EB] transition-colors">
                          {file.name}
                        </span>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 mt-4">
                          <span className="text-[11px] font-bold text-gray-400">{file.size}</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Avatar person={m.senderPerson} size={16} />
                            <span className="text-[11px] font-bold text-gray-500 truncate max-w-[70px]">{m.senderName.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Tasks" && (
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[20px] font-black text-gray-900">Channel Tasks</h2>

              </div>
              {info?.tasks?.length > 0 ? (
                <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {info.tasks.map((t: any, i: number) => (
                      <div key={i} className="flex items-center p-4 hover:bg-gray-50/80 transition-colors group overflow-hidden">
                        <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ease-out ${t.status === 'done' ? 'w-5 mr-4 opacity-100 translate-x-0' : 'w-0 mr-0 opacity-0 -translate-x-5 group-hover:w-5 group-hover:mr-4 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                          <input
                            type="checkbox"
                            defaultChecked={t.status === 'done'}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                        <div className="min-w-0 flex-1 pl-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[15px] font-bold truncate ${t.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {t.title}
                            </span>
                            {t.priority && (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${t.priority === 'High' ? 'bg-red-50 text-red-600' : t.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {t.priority}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[12px] font-medium text-gray-500">
                            {t.date && <span>Due: {t.date}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {currentUser?.role === 'Admin' && (
                            <>
                              <button
                                onClick={() => {
                                  setTaskToEdit(t);
                                  setEditTaskTitle(t.title);
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Pen size={14} strokeWidth={2.2} />
                              </button>
                              <button
                                onClick={() => setTaskToDelete(t)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} strokeWidth={2.2} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200/80 rounded-2xl shadow-2xs">
                  <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <Check size={28} className="text-[#2563EB]" />
                  </div>
                  <h3 className="text-gray-900 font-black text-[16px]">No pending tasks</h3>
                  <p className="text-gray-400 text-[13px] font-medium mt-1">You're all caught up! Enjoy your day.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Wiki" && (
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center shadow-xs border border-indigo-200/50">
                    <BookOpen size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-[20px] font-black text-gray-900 leading-tight">Channel Wiki</h2>
                    <p className="text-[13px] text-gray-500 font-medium">Shared knowledge and guidelines for this channel</p>
                  </div>
                </div>
                <button className="bg-white border border-gray-200/80 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-[13px] font-bold shadow-2xs transition-colors flex items-center gap-2">
                  <Pen size={14} strokeWidth={2.5} />
                  Edit Page
                </button>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden p-8 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                
                {/* Wiki Header */}
                <div className="border-b border-gray-100 pb-6 mb-6">
                  <h1 className="text-[32px] font-black text-gray-900 mb-3 tracking-tight">{info?.name || "Channel"} Guidelines</h1>
                  <div className="flex items-center gap-4 text-[12.5px] font-bold text-gray-400">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> Last updated today at 10:42 AM</span>
                    <span className="flex items-center gap-1.5"><Avatar person="jessica" size={18} /> by Jessica</span>
                  </div>
                </div>

                {/* Wiki Content */}
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p className="text-[14.5px] leading-relaxed mb-6 font-medium text-gray-600">
                    Welcome to the channel! This wiki serves as the central hub for all important resources, guidelines, and documentation related to our work here. Please review these guidelines before posting to ensure we maintain a productive and organized workspace for everyone.
                  </p>

                  <h3 className="text-[18px] font-black text-gray-900 mb-4 flex items-center gap-2 mt-8">
                    <Check size={20} className="text-emerald-500 bg-emerald-50 p-0.5 rounded-md" strokeWidth={3} /> 
                    Ground Rules
                  </h3>
                  
                  <div className="space-y-3 mb-8 text-[14px] font-medium text-gray-700 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-2xs font-bold text-gray-400 text-[11px]">1</div>
                      <span className="pt-0.5">Always use threads for extended discussions to keep the main channel clean.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-2xs font-bold text-gray-400 text-[11px]">2</div>
                      <span className="pt-0.5">Check pinned messages before asking questions - your answer might already be there!</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-2xs font-bold text-gray-400 text-[11px]">3</div>
                      <span className="pt-0.5">Use formatting blocks (code, bold, italic) to make your messages readable.</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-5 mb-4">
                    <h4 className="text-[14px] font-black text-blue-900 mb-1 flex items-center gap-2">
                      <Info size={16} className="text-blue-600" /> Important Links
                    </h4>
                    <p className="text-[12.5px] text-blue-700/80 mb-3 font-medium">Quick access to commonly used external resources.</p>
                    <div className="flex flex-col gap-2.5">
                      <a href="#" className="bg-white border border-blue-100/60 p-2.5 rounded-lg text-blue-600 hover:text-blue-700 hover:border-blue-200 hover:shadow-2xs text-[13.5px] font-bold flex items-center gap-2 transition-all">
                        <LinkIcon size={14} /> Project Roadmap (Q3)
                      </a>
                      <a href="#" className="bg-white border border-blue-100/60 p-2.5 rounded-lg text-blue-600 hover:text-blue-700 hover:border-blue-200 hover:shadow-2xs text-[13.5px] font-bold flex items-center gap-2 transition-all">
                        <LinkIcon size={14} /> Design System Documentation
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "Messages" && activeTab !== "Files" && activeTab !== "Tasks" && activeTab !== "Wiki" && (
          <div className="flex-1 flex items-center justify-center bg-[#FAFBFC]">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-[#2563EB]" />
              </div>
              <h3 className="text-gray-900 font-black text-[16px]">Coming Soon</h3>
              <p className="text-gray-400 text-[13px] font-medium mt-1">The {activeTab} section is under development.</p>
            </div>
          </div>
        )}
      </div>

      {activeThreadMessage && activeTab === "Messages" && (
        <div className="w-[300px] lg:w-[350px] shrink-0 border-l border-gray-200/80 bg-gray-50 flex flex-col h-full overflow-hidden select-none">
          <div className="h-12 shrink-0 border-b border-gray-200/80 px-4 flex items-center justify-between bg-white z-10">
            <h2 className="text-[15px] font-black tracking-tight text-gray-900">
              Thread
            </h2>
            <button
              onClick={() => setActiveThreadMessage(null)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="pb-4 border-b border-gray-200/80">
              <div className="flex items-start gap-3">
                <Avatar person={activeThreadMessage.senderPerson} name={activeThreadMessage.senderName} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-[13px] font-bold text-gray-900">{activeThreadMessage.senderName}</span>
                    <span className="text-[11px] text-gray-400">{activeThreadMessage.timestamp}</span>
                  </div>
                  <div className="text-[13px] text-gray-800">{activeThreadMessage.text}</div>
                  {activeThreadMessage.attachment && (
                    activeThreadMessage.attachment.name.endsWith('.m4a') ? (
                      <MockAudioPlayer filename={activeThreadMessage.attachment.name} url={activeThreadMessage.attachment.url} />
                    ) : (
                      <div
                        onClick={() => handleDownloadAttachment(activeThreadMessage.attachment!)}
                        className="mt-2 inline-flex items-center gap-2 border border-gray-200/90 rounded-xl p-1.5 px-2.5 bg-white shadow-2xs hover:border-gray-300 transition-all cursor-pointer group"
                        title="Click to download"
                      >
                        <div className="h-7 w-7 rounded-lg text-white font-black text-[10px] flex items-center justify-center shrink-0 bg-gray-900">
                          Fig
                        </div>
                        <div className="min-w-0 pr-1">
                          <span className="block text-[11.5px] font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {activeThreadMessage.attachment.name}
                          </span>
                          <span className="block text-[10px] font-medium text-gray-400">
                            {activeThreadMessage.attachment.size}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {messages.filter(m => m.parentId === activeThreadMessage.id).map(m => (
                <div key={m.id} className="flex items-start gap-3">
                  <Avatar person={m.senderPerson} name={m.senderName} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[12px] font-bold text-gray-900">{m.senderName}</span>
                      <span className="text-[10px] text-gray-400">{m.timestamp}</span>
                    </div>
                    <div className="text-[12px] text-gray-800">{m.text}</div>
                    {m.attachment && (
                      m.attachment.name.endsWith('.m4a') ? (
                        <MockAudioPlayer filename={m.attachment.name} url={m.attachment.url} />
                      ) : (
                        <div
                          onClick={() => handleDownloadAttachment(m.attachment!)}
                          className="mt-2 inline-flex items-center gap-2 border border-gray-200/90 rounded-xl p-1.5 px-2.5 bg-white shadow-2xs hover:border-gray-300 transition-all cursor-pointer group"
                          title="Click to download"
                        >
                          <div className="h-7 w-7 rounded-lg text-white font-black text-[10px] flex items-center justify-center shrink-0 bg-gray-900">
                            Fig
                          </div>
                          <div className="min-w-0 pr-1">
                            <span className="block text-[11.5px] font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {m.attachment.name}
                            </span>
                            <span className="block text-[10px] font-medium text-gray-400">
                              {m.attachment.size}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 p-3 bg-white border-t border-gray-200/80">
            <div className="border border-gray-200/90 rounded-xl p-2 bg-white shadow-2xs">
              <input
                type="text"
                placeholder="Reply in thread..."
                className="w-full bg-transparent text-[12px] text-gray-800 placeholder:text-gray-400 focus:outline-none mb-2"
                id={`thread-input-${activeThreadMessage.id}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && currentUser) {
                    const val = e.currentTarget.value;
                    if (!val.trim() && !pendingAttachment) return;
                    socketRef.current?.emit("send_message", {
                      text: val,
                      userId: currentUser.sub,
                      channelId: channelId,
                      parentId: parseInt(activeThreadMessage.id),
                      attachment: pendingAttachment
                    });
                    e.currentTarget.value = "";
                    setPendingAttachment(null);
                  }
                }}
              />
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <div className="flex items-center text-gray-400">
                  <button onClick={() => fileInputRef.current?.click()} className="p-1 rounded hover:bg-gray-50 hover:text-gray-700 transition-colors" title="Attach file">
                    <Plus size={14} strokeWidth={2.4} />
                  </button>
                  <button onClick={() => {
                    const input = document.getElementById(`thread-input-${activeThreadMessage.id}`) as HTMLInputElement;
                    if (input) input.value += "**bold** *italic* `code`";
                  }} className="p-1 rounded hover:bg-gray-50 hover:text-gray-700 transition-colors font-serif font-bold text-[10px]" title="Formatting">
                    Aa
                  </button>
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1 rounded hover:bg-gray-50 hover:text-gray-700 transition-colors" title="Emoji">
                    <Smile size={14} strokeWidth={2.1} />
                  </button>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      const input = document.getElementById(`thread-input-${activeThreadMessage.id}`) as HTMLInputElement;
                      const val = input ? input.value : "";
                      if (!val.trim() && !pendingAttachment) return;
                      socketRef.current?.emit("send_message", {
                        text: val,
                        userId: currentUser.sub,
                        channelId: channelId,
                        parentId: parseInt(activeThreadMessage.id),
                        attachment: pendingAttachment
                      });
                      if (input) input.value = "";
                      setPendingAttachment(null);
                    }}
                    className="flex items-center justify-center h-6 w-8 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs transition-all"
                  >
                    <Send size={12} strokeWidth={2.3} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {taskToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-black text-gray-900">Edit Task</h3>
              <button onClick={() => setTaskToEdit(null)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-5">
              <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Task Title</label>
              <input
                type="text"
                value={editTaskTitle}
                onChange={(e) => setEditTaskTitle(e.target.value)}
                autoFocus
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-2xs"
                placeholder="Enter task title"
              />
            </div>
            <div className="px-5 py-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setTaskToEdit(null)}
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!editTaskTitle.trim() || editTaskTitle === taskToEdit.title}
                onClick={async () => {
                  if (editTaskTitle && editTaskTitle.trim() !== "" && editTaskTitle !== taskToEdit.title) {
                    try {
                      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                      const res = await fetch(`http://localhost:3001/tasks/${taskToEdit.id}`, {
                        method: "PATCH",
                        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                        body: JSON.stringify({ title: editTaskTitle.trim() })
                      });
                      if (res.ok) {
                        setInfo((prev: any) => ({ ...prev, tasks: prev.tasks.map((task: any) => task.id === taskToEdit.id ? { ...task, title: editTaskTitle.trim() } : task) }));
                        setTaskToEdit(null);
                      }
                    } catch (e) { console.error(e); }
                  }
                }}
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Delete Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-black text-red-600 flex items-center gap-2">
                <Trash2 size={18} strokeWidth={2.5} />
                Delete Task
              </h3>
              <button onClick={() => setTaskToDelete(null)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-[14px] text-gray-700">
                Are you sure you want to delete <span className="font-bold">"{taskToDelete.title}"</span>?
              </p>
              <p className="text-[12px] text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="px-5 py-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                    const res = await fetch(`http://localhost:3001/tasks/${taskToDelete.id}`, {
                      method: "DELETE",
                      headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (res.ok) {
                      setInfo((prev: any) => ({ ...prev, tasks: prev.tasks.filter((task: any) => task.id !== taskToDelete.id) }));
                      setTaskToDelete(null);
                    }
                  } catch (e) { console.error(e); }
                }}
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

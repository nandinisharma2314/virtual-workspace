"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/lib/chatData";
import { API_URL } from "@/lib/apis";
import Avatar from "@/components/Avatar";
import { io, Socket } from "socket.io-client";
import InviteModal from "./InviteModal";
import VideoCall from "./VideoCall";
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
  Clock,
  PhoneCall,
  Layout,
  CheckSquare,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import EmojiPicker from 'emoji-picker-react';
import ChatWallpaperModal from "./ChatWallpaperModal";
import { BOARD_BACKGROUNDS } from "./templates/MyTasksBoard";
import { channelTemplates } from "@/lib/templateData";
import TemplateTabRenderer from "./templates/TemplateTabRenderer";

// Audio Player Component
const AudioPlayer = ({ duration = 8, filename = "", url = "" }: { duration?: number, filename?: string, url?: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

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
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessage | null>(null);
  const [activeThreadMessage, setActiveThreadMessage] = useState<ChatMessage | null>(null);
  const [inlineEditMessageId, setInlineEditMessageId] = useState<string | null>(null);
  const [inlineEditText, setInlineEditText] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Wallpaper & Template states
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [chatBg, setChatBg] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`chat_bg_${channelId}`) || "";
    }
    return "";
  });
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`channel_template_${channelId}`) || null;
    }
    return null;
  });

  // Video Call states
  const [isInCall, setIsInCall] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [incomingCallOffer, setIncomingCallOffer] = useState<any>(null);
  const isAdmin = currentUser?.role === "Admin";

  // Toolbar states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{ name: string, size: string, url?: string, file?: File } | null>(null);

  // Task Modal states
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      if (e.detail?.tab) setActiveTab(e.detail.tab);
    };
    window.addEventListener("switch-chat-tab" as any, handleSwitchTab);
    return () => window.removeEventListener("switch-chat-tab" as any, handleSwitchTab);
  }, []);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || isCreatingTask) return;
    setIsCreatingTask(true);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          priority: newTaskPriority.toLowerCase(),
          channelId: channelId,
          status: 'todo'
        })
      });
      if (res.ok) {
        const created = await res.json();
        const formatted = {
          id: created.id,
          title: created.title,
          status: created.status || 'todo',
          priority: newTaskPriority,
          color: newTaskPriority === 'High' ? 'text-rose-600' : newTaskPriority === 'Medium' ? 'text-amber-500' : 'text-emerald-500',
          date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        };
        setInfo((prev: any) => ({
          ...prev,
          tasks: [...(prev?.tasks || []), formatted]
        }));
        setNewTaskTitle("");
        setIsAddTaskOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreatingTask(false);
    }
  };

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
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    // 1. Fetch initial messages for channel
    const fetchMessages = async () => {
      try {
        if (!token) return;

        const res = await fetch(`${API_URL}/chat/messages/${channelId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(Array.isArray(data) ? data : []);
        }

        const infoRes = await fetch(`${API_URL}/chat/info/${channelId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (infoRes.ok) {
          const infoData = await infoRes.json();
          setInfo(infoData);
        }
      } catch (e) {
        setMessages([]);
      }
    };
    fetchMessages();

    // 2. Setup Socket
    socketRef.current = io(API_URL, {
      auth: { token }
    });

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

    socketRef.current.on("webrtc_offer", (payload: any) => {
      // We only care if the offer is specifically for us, but if we are not in a call, we shouldn't get offers.
      // The banner is now triggered by invite_video_call
    });

    socketRef.current.on("invite_video_call", (payload: any) => {
      if (currentUser && payload.senderId !== currentUser.sub) {
        // If it has a targetId and it's not us, ignore
        if (payload.targetId && payload.targetId !== currentUser.sub) return;
        
        // Show banner
        setIncomingCallOffer(payload);
      }
    });

    return () => {
      socketRef.current?.disconnect();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [channelId, refreshTrigger, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleOpenModal = () => setIsWallpaperModalOpen(true);
    const handleUpdate = (e: any) => {
      if (e.detail?.channelId === channelId) {
        setChatBg(e.detail.bg || "");
        setActiveTemplateId(e.detail.templateId || null);
      }
    };
    window.addEventListener("open-chat-wallpaper-modal", handleOpenModal);
    window.addEventListener("chat-wallpaper-updated" as any, handleUpdate);
    return () => {
      window.removeEventListener("open-chat-wallpaper-modal", handleOpenModal);
      window.removeEventListener("chat-wallpaper-updated" as any, handleUpdate);
    };
  }, [channelId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBg = localStorage.getItem(`chat_bg_${channelId}`);
      const savedTemplate = localStorage.getItem(`channel_template_${channelId}`);
      if (savedBg !== null) {
        setChatBg(savedBg);
      } else if (info?.bgGradient && info.bgGradient !== "from-indigo-600 via-indigo-700 to-purple-800" && info.bgGradient !== "white") {
        setChatBg(info.bgGradient);
      } else {
        setChatBg("");
      }
      setActiveTemplateId(savedTemplate || null);
    }
  }, [channelId, info?.bgGradient]);

  const handleSelectWallpaper = async (bgUrlOrGradient: string, templateId?: string) => {
    setChatBg(bgUrlOrGradient);
    if (typeof window !== "undefined") {
      localStorage.setItem(`chat_bg_${channelId}`, bgUrlOrGradient);
      if (templateId) {
        localStorage.setItem(`channel_template_${channelId}`, templateId);
        setActiveTemplateId(templateId);
      } else {
        localStorage.removeItem(`channel_template_${channelId}`);
        setActiveTemplateId(null);
      }
    }
    window.dispatchEvent(
      new CustomEvent("chat-wallpaper-updated", {
        detail: { channelId, bg: bgUrlOrGradient, templateId },
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
              bgGradient: bgUrlOrGradient,
            }),
          });
        }
      } catch (err) {
        console.error("Failed to sync channel wallpaper to backend", err);
      }
    }
  };

  const handleResetDefaultWallpaper = async () => {
    setChatBg("");
    setActiveTemplateId(null);
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
      } catch (err) {
        console.error("Failed to reset channel wallpaper in backend", err);
      }
    }
  };

  const isPhotoBg = Boolean(
    chatBg &&
    !chatBg.startsWith("from-") &&
    !chatBg.startsWith("bg-") &&
    chatBg !== "default" &&
    chatBg !== "white"
  );
  const isGradBg = Boolean(chatBg && (chatBg.startsWith("from-") || chatBg.startsWith("bg-")));
  const hasCustomBg = Boolean(isPhotoBg || isGradBg);

  const matchingTemplate = channelTemplates.find(
    (t) => t.id === activeTemplateId || t.templateConfig?.bgImage === chatBg
  );
  const matchingPhotoName = BOARD_BACKGROUNDS.find((b) => b.image === chatBg)?.name;

  const baseTabs = ["Messages", "Tasks", "Files", "Wiki"];
  const templateTabs = matchingTemplate?.customTabs?.map((t) => t.name) || [];
  const tabs = [...baseTabs, ...templateTabs.filter((t) => !baseTabs.includes(t))];

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !pendingAttachment) || !currentUser) return;

    let attachmentToSent = pendingAttachment as any;

    if (pendingAttachment && pendingAttachment.file) {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        
        // 1. Get signed URL
        const res = await fetch(`${API_URL}/files/upload-url?filename=${encodeURIComponent(pendingAttachment.file.name)}&contentType=${encodeURIComponent(pendingAttachment.file.type)}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl, storageKey } = await res.json();
        
        // 2. Upload to Cloudflare R2
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: pendingAttachment.file,
          headers: { 'Content-Type': pendingAttachment.file.type }
        });
        if (!uploadRes.ok) {
          throw new Error("Failed to upload file to Cloudflare R2.");
        }
        
        // 3. Save metadata to backend
        const fileRes = await fetch(`${API_URL}/files`, {
          method: 'POST',
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            name: pendingAttachment.file.name,
            size: pendingAttachment.file.size,
            type: pendingAttachment.file.type,
            storageKey: storageKey
          })
        });
        if (!fileRes.ok) {
          const errText = await fileRes.text();
          console.error("Backend error saving file metadata:", errText);
          throw new Error("Failed to save file metadata: " + errText);
        }
        
        const fileRecord = await fileRes.json();
        
        // 4. Update attachment for chat message
        attachmentToSent = {
          fileId: fileRecord.id,
          name: fileRecord.name,
          size: (fileRecord.size / 1024 / 1024).toFixed(2) + ' MB',
          type: fileRecord.type
        };
      } catch (err) {
        console.error("Upload failed", err);
        return; // Don't send message if upload fails
      }
    }

    socketRef.current?.emit("send_message", {
      text: inputText,
      userId: currentUser.sub,
      channelId: channelId,
      attachment: attachmentToSent ? { ...attachmentToSent, file: undefined } : null
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
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        file: file,
        url: URL.createObjectURL(file)
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

  const handleDownloadAttachment = async (attachment: any) => {
    if (!attachment.fileId) {
      if (attachment.url) {
        const a = document.createElement("a");
        a.href = attachment.url;
        a.download = attachment.name;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      return;
    }

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const res = await fetch(`${API_URL}/files/${attachment.fileId}/download-url`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to get download URL");
      
      const { downloadUrl } = await res.json();
      
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = attachment.name;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download file.");
    }
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
                  className={`font-bold px-1 py-0.5 rounded-md mx-0.5 ${
                    hasCustomBg
                      ? "bg-blue-500/30 text-blue-200 border border-blue-400/30"
                      : "bg-blue-50 text-[#2563EB]"
                  }`}
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
    <div className="flex-1 min-w-0 flex h-full overflow-hidden relative">

      <div className="flex-1 min-w-0 border-r border-gray-200/80 bg-white flex flex-col h-full overflow-hidden select-none">
        {/* Top Header Bar */}
        <div className="shrink-0 border-b border-gray-200/80 px-5 flex flex-col justify-between bg-white z-10 pt-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-black tracking-tight text-gray-900">{info?.name || "# general"}</span>
                <button className="text-gray-400 hover:text-amber-500 transition-colors">
                  <Star size={16} strokeWidth={2} />
                </button>
                {matchingTemplate && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10.5px] font-bold flex items-center gap-1 shadow-2xs">
                    <Sparkles size={11} className="text-indigo-500" />
                    <span>{matchingTemplate.name}</span>
                  </span>
                )}
              </div>
              <span className="text-[11.5px] font-medium text-gray-400 truncate mt-0.5">
                {info?.description || "Company wide announcements and general discussion"}
              </span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center -space-x-1.5 overflow-hidden">
                {info?.members?.slice(0, 4).map((m: any, i: number) => (
                  <Avatar key={i} person={m.avatarPerson} name={m.name} avatar={m.avatar} size={26} ring />
                ))}
                {info?.members?.length > 4 && (
                  <span className="flex h-[26px] items-center justify-center rounded-full bg-gray-100 px-2 text-[11px] font-black text-gray-700 ring-2 ring-white shadow-2xs">
                    +{info.members.length - 4}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Wallpaper & Templates Button */}
                <button
                  onClick={() => setIsWallpaperModalOpen(true)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-all shadow-2xs cursor-pointer ${
                    hasCustomBg
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                      : "border-gray-200/90 bg-white hover:bg-gray-50 text-gray-700 hover:text-indigo-600"
                  }`}
                  title="Change chat background wallpaper & templates"
                >
                  <Sparkles size={13} className={hasCustomBg ? "text-indigo-600" : "text-gray-500"} />
                  <span>{matchingPhotoName ? matchingPhotoName.split(' ')[0] : hasCustomBg ? "Wallpaper" : "Templates"}</span>
                </button>

                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-create-channel'))}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-700 hover:text-blue-600 px-3 py-1.5 text-[12px] font-bold transition-all shadow-2xs"
                  title="Create New Channel"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>New Channel</span>
                </button>

                <button
                  onClick={() => {
                    setIsInCall(true);
                    setIsInitiator(true);
                    setIncomingCallOffer(null);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-[#5E43FF] px-4 py-1.5 text-[12px] font-bold text-white hover:bg-indigo-600 transition-colors shadow-sm"
                >
                  <Video size={14} strokeWidth={2.5} />
                  <span>Join call</span>
                </button>
                
                {/* Ring Channel Button */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsInCall(true);
                      setIsInitiator(true);
                      setIncomingCallOffer(null);
                      socketRef.current?.emit('invite_video_call', {
                        channelId,
                        senderId: currentUser?.sub,
                        senderName: currentUser?.name
                      });
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-200"
                    title="Ring entire channel"
                  >
                    <PhoneCall size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>

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
                  className={`pb-2 text-[13px] font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "border-[#0C66E4] text-[#0C66E4]"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab === "Messages" ? (
                    <MessageSquare size={13} className={isActive ? "text-[#0C66E4]" : "text-gray-400"} />
                  ) : tab === "Tasks" ? (
                    <CheckSquare size={13} className={isActive ? "text-[#0C66E4]" : "text-gray-400"} />
                  ) : tab === "Files" ? (
                    <FileText size={13} className={isActive ? "text-[#0C66E4]" : "text-gray-400"} />
                  ) : tab === "Wiki" ? (
                    <BookOpen size={13} className={isActive ? "text-[#0C66E4]" : "text-gray-400"} />
                  ) : (
                    <Layout size={13} className={isActive ? "text-[#0C66E4]" : "text-gray-400"} />
                  )}
                  <span>{tab === "Messages" ? "Chat" : tab}</span>
                  {matchingTemplate && !["Messages", "Tasks", "Files", "Wiki"].includes(tab) && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-extrabold">
                      Template
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "Messages" && (
          <div
            className={`flex-1 min-h-0 flex flex-col justify-between overflow-hidden relative transition-colors duration-300 ${
              !hasCustomBg ? "bg-white" : isGradBg ? `bg-gradient-to-br ${chatBg}` : ""
            }`}
            style={
              isPhotoBg
                ? {
                    backgroundImage: `url('${chatBg}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                  }
                : {}
            }
          >
            {/* Ambient Dark Overlay for contrast when wallpaper is active */}
            {hasCustomBg && (
              <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[0.4px] pointer-events-none z-0" />
            )}

            {/* Pinned Banner */}
            {pinnedMessage && (
              <div className={`shrink-0 mx-5 mt-3 border rounded-xl p-2.5 px-3.5 flex items-center justify-between shadow-2xs relative z-10 ${
                hasCustomBg
                  ? "bg-slate-900/80 border-white/20 backdrop-blur-md text-white"
                  : "bg-[#FAFBFC] border-gray-200/80"
              }`}>
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  <Pin size={15} className={`shrink-0 rotate-45 ${hasCustomBg ? "text-white/80" : "text-gray-600"}`} strokeWidth={2.3} />
                  <div className="min-w-0">
                    <span className={`text-[12px] font-bold block truncate ${hasCustomBg ? "text-white" : "text-gray-900"}`}>
                      {pinnedMessage.attachment ? pinnedMessage.attachment.name : pinnedMessage.text}
                    </span>
                    <span className={`text-[11.5px] block truncate mt-0.5 ${hasCustomBg ? "text-white/70" : "text-gray-500"}`}>
                      Pinned by {pinnedMessage.senderName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      const el = document.getElementById(`message-${pinnedMessage.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add(hasCustomBg ? 'bg-white/20' : 'bg-blue-50', 'transition-colors', 'duration-500');
                        setTimeout(() => el.classList.remove(hasCustomBg ? 'bg-white/20' : 'bg-blue-50'), 2000);
                      }
                    }}
                    className="text-[12px] font-bold text-[#2563EB] hover:underline px-2 py-0.5"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setPinnedMessage(null)}
                    className={`p-1 rounded transition-colors ${hasCustomBg ? "text-white/60 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 min-h-0 px-5 pt-3 pb-2 flex flex-col justify-start space-y-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10">

              {/* Channel Empty/Welcome State */}
              <div className="flex flex-col gap-3 pb-8 pt-6 px-1 max-w-4xl">
                <h1 className={`text-[24px] lg:text-[26px] font-extrabold flex items-center gap-2 mb-1 ${
                  hasCustomBg ? "text-white drop-shadow-md" : "text-gray-900"
                }`}>
                  👋 Welcome to your first channel {info?.name || "# new-channel"}!
                </h1>
                <p className={`text-[13.5px] font-medium mb-5 ${
                  hasCustomBg ? "text-white/90 drop-shadow-xs font-semibold" : "text-gray-600"
                }`}>
                  Channels in WorkFlow keep work focused around a specific topic. You can keep all your information related projects attached to the channel so everyone can access.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div onClick={() => setIsInviteModalOpen(true)} className={`flex-1 rounded-2xl p-5 border cursor-pointer hover:shadow-md transition-all flex flex-col ${
                    hasCustomBg 
                      ? "bg-slate-900/60 backdrop-blur-md border-white/15 text-white shadow-xl hover:bg-slate-900/75 hover:border-white/25" 
                      : "bg-[#FDF1F5] border-pink-100/50 hover:border-pink-200"
                  }`}>
                    <h3 className={`font-extrabold text-[14px] mb-1 ${hasCustomBg ? "text-white" : "text-gray-900"}`}>Invite your external partners</h3>
                    <p className={`text-[12.5px] font-medium mb-6 ${hasCustomBg ? "text-white/75" : "text-gray-600"}`}>Add clients or customers</p>

                    <div className="mt-auto self-center flex items-center justify-center p-2 relative h-16 w-24">
                      <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white z-10 flex items-center justify-center text-[10px] shadow-sm">🧑‍💼</div>
                      <div className="absolute bottom-0 left-4 w-9 h-9 rounded-full bg-blue-500 border-2 border-white z-20 flex items-center justify-center text-[12px] shadow-sm">👨🏽</div>
                      <div className="absolute top-2 right-0 w-10 h-10 rounded-full bg-pink-500 border-2 border-white z-30 flex items-center justify-center text-[14px] shadow-sm">👩🏼</div>
                    </div>
                  </div>

                  <div onClick={() => setIsWallpaperModalOpen(true)} className={`flex-1 rounded-2xl p-5 border cursor-pointer hover:shadow-md transition-all flex flex-col ${
                    hasCustomBg 
                      ? "bg-slate-900/60 backdrop-blur-md border-white/15 text-white shadow-xl hover:bg-slate-900/75 hover:border-white/25" 
                      : "bg-[#FFF8E6] border-amber-100/50 hover:border-amber-200"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-extrabold text-[14px] ${hasCustomBg ? "text-white" : "text-gray-900"}`}>Browse templates</h3>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">New</span>
                    </div>
                    <p className={`text-[12.5px] font-medium mb-6 ${hasCustomBg ? "text-white/75" : "text-gray-600"}`}>Explore templates &amp; photographic backgrounds</p>

                    <div className={`mt-auto self-center rounded-xl shadow-sm border p-2.5 w-3/4 ${
                      hasCustomBg ? "bg-slate-800/80 border-white/15" : "bg-white border-amber-200/50"
                    }`}>
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

                  <div className={`flex-1 rounded-2xl p-5 border cursor-pointer hover:shadow-md transition-all flex flex-col ${
                    hasCustomBg 
                      ? "bg-slate-900/60 backdrop-blur-md border-white/15 text-white shadow-xl hover:bg-slate-900/75 hover:border-white/25" 
                      : "bg-[#EAF2FF] border-blue-100/50 hover:border-blue-200"
                  }`}>
                    <h3 className={`font-extrabold text-[14px] mb-1 ${hasCustomBg ? "text-white" : "text-gray-900"}`}>Connect your apps</h3>
                    <p className={`text-[12.5px] font-medium mb-6 ${hasCustomBg ? "text-white/75" : "text-gray-600"}`}>Bring your work into WorkFlow</p>

                    <div className="mt-auto self-center flex items-center justify-center h-16 w-full px-4">
                      <div className="flex -space-x-3 overflow-visible py-2 px-1 hover:-space-x-1 transition-all duration-300">
                        <div className="w-10 h-10 rounded-xl bg-[#0052CC] ring-2 ring-white shadow-sm flex items-center justify-center z-10 hover:z-50 hover:-translate-y-1 transition-all cursor-pointer" title="Jira">
                          <span className="font-black text-white text-[16px]">J</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#F24E1E] ring-2 ring-white shadow-sm flex items-center justify-center z-20 hover:z-50 hover:-translate-y-1 transition-all cursor-pointer" title="Figma">
                          <span className="font-black text-white text-[16px]">F</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gray-900 ring-2 ring-white shadow-sm flex items-center justify-center z-30 hover:z-50 hover:-translate-y-1 transition-all cursor-pointer" title="GitHub">
                          <span className="font-black text-white text-[13px]">GH</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#00C4CC] ring-2 ring-white shadow-sm flex items-center justify-center z-40 hover:z-50 hover:-translate-y-1 transition-all cursor-pointer" title="Canva">
                          <span className="font-black text-white text-[16px]">C</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#2D8CFF] ring-2 ring-white shadow-sm flex items-center justify-center z-50 hover:z-50 hover:-translate-y-1 transition-all cursor-pointer" title="Zoom">
                          <span className="font-black text-white text-[16px]">Z</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center my-2 mt-6">
                  <div className={`h-px flex-1 ${hasCustomBg ? "bg-white/20" : "bg-gray-200"}`}></div>
                  <span className={`px-3 text-[11px] font-extrabold rounded-full py-0.5 mx-2 shadow-2xs ${
                    hasCustomBg 
                      ? "bg-black/50 text-white/90 border border-white/20 backdrop-blur-md" 
                      : "text-gray-400 bg-white border border-gray-200"
                  }`}>Today</span>
                  <div className={`h-px flex-1 ${hasCustomBg ? "bg-white/20" : "bg-gray-200"}`}></div>
                </div>
              </div>

              {messages.filter(m => !m.parentId).map((m) => (
                <div
                  key={m.id}
                  id={`message-${m.id}`}
                  className={`group flex items-start gap-3 transition-all shrink-0 relative ${
                    hasCustomBg
                      ? "rounded-xl px-2.5 py-1.5 -mx-1 hover:bg-white/10 transition-colors"
                      : "rounded-xl px-2 py-1 -mx-2 hover:bg-gray-50/60 transition-colors"
                  }`}
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
                              onEmojiClick={(emojiData) => {
                                handleReaction(m, emojiData.emoji);
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
                    <Avatar person={m.senderPerson} name={m.senderName} avatar={m.senderAvatar} size={32} />
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    {/* Sender Header */}
                    <div className="flex items-baseline gap-2.5 mb-0.5">
                      <span className={`text-[13.5px] font-bold ${
                        hasCustomBg ? "text-white drop-shadow-sm" : "text-gray-900"
                      }`}>
                        {m.senderName}
                      </span>
                      <span className={`text-[11.5px] font-normal ${
                        hasCustomBg ? "text-white/70" : "text-gray-400"
                      }`}>
                        {m.timestamp}
                      </span>
                      {m.isEdited && (
                        <span className={`text-[10px] font-medium ml-1 ${
                          hasCustomBg ? "text-white/60" : "text-gray-400"
                        }`}>(edited)</span>
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
                      <div className={`text-[13px] leading-normal font-normal ${
                        hasCustomBg ? "text-white/95 drop-shadow-xs" : "text-gray-800"
                      }`}>
                        {renderMessageText(m.text)}
                      </div>
                    )}

                    {/* Attachment Card if present */}
                    {m.attachment && (
                      m.attachment.name.endsWith('.m4a') ? (
                        <AudioPlayer filename={m.attachment.name} url={m.attachment.url} />
                      ) : (
                        <div
                          onClick={() => handleDownloadAttachment(m.attachment!)}
                          className={`mt-2 inline-flex items-center gap-3 border rounded-2xl p-2 px-3 shadow-2xs transition-all cursor-pointer group ${
                            hasCustomBg
                              ? "bg-slate-900/80 border-white/20 text-white backdrop-blur-md hover:bg-slate-900"
                              : "border-gray-200/90 bg-white hover:border-gray-300"
                          }`}
                          title="Click to download"
                        >
                          <div className="h-9 w-9 rounded-xl text-white font-black text-[12px] flex items-center justify-center shrink-0 shadow-xs bg-gray-900">
                            Fig
                          </div>
                          <div className="min-w-0 pr-2">
                            <span className={`block text-[12.5px] font-extrabold truncate group-hover:text-blue-400 transition-colors ${
                              hasCustomBg ? "text-white" : "text-gray-900 group-hover:text-blue-600"
                            }`}>
                              {m.attachment.name}
                            </span>
                            <span className={`block text-[11px] font-medium mt-0.5 ${
                              hasCustomBg ? "text-white/60" : "text-gray-400"
                            }`}>
                              {m.attachment.size}
                            </span>
                          </div>
                        </div>
                      )
                    )}

                    {/* Code Block if present */}
                    {m.codeBlock && (
                      <div className={`mt-2 border rounded-2xl p-2.5 px-3 font-mono text-[11.5px] relative max-w-xl shadow-2xs ${
                        hasCustomBg
                          ? "bg-slate-900/85 border-white/20 text-gray-100 backdrop-blur-md"
                          : "border-gray-200/90 bg-gray-50/90 text-gray-800"
                      }`}>
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
                              <span className={hasCustomBg ? "text-gray-200 whitespace-pre" : "text-gray-800 whitespace-pre"}>{line}</span>
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
                          className={`mt-2 inline-flex items-center gap-2.5 py-1 px-2.5 rounded-xl text-[12px] font-semibold cursor-pointer transition-all ${
                            hasCustomBg
                              ? "bg-white/15 border border-white/25 text-white hover:bg-white/25 backdrop-blur-md"
                              : "bg-blue-50/60 border border-blue-100 text-[#2563EB] hover:bg-blue-50"
                          }`}
                        >
                          <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                            {Array.from(new Set(replies.map(r => r.senderPerson))).slice(0, 3).map((person, i) => (
                              <Avatar key={i} person={person} size={18} ring />
                            ))}
                          </div>
                          <span className={hasCustomBg ? "text-white font-bold" : "text-[#2563EB] font-bold"}>
                            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                          </span>
                          <span className={`font-medium text-[11.5px] ${hasCustomBg ? "text-white/60" : "text-gray-400"}`}>
                            Last reply at {lastReplyTime}
                          </span>
                        </div>
                      );
                    })()}


                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Chat Input Bar */}
            <div className={`shrink-0 px-5 pb-4 pt-2 transition-colors relative z-10 ${hasCustomBg ? "bg-transparent" : "bg-white"}`}>
              <div className={`rounded-2xl p-2.5 px-3 flex flex-col justify-between gap-2.5 transition-all ${
                hasCustomBg
                  ? "bg-slate-900/80 backdrop-blur-md border border-white/20 shadow-xl"
                  : "border border-gray-200/90 bg-white shadow-2xs"
              }`}>

                {/* Pending Attachment UI */}
                {pendingAttachment && (
                  <div className={`flex items-center gap-3 border rounded-xl p-2 px-3 shadow-2xs mb-2 ${
                    hasCustomBg ? "bg-slate-800/90 border-white/20 text-white" : "border-gray-200/90 bg-gray-50"
                  }`}>
                    <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 font-black text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                      FILE
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <span className={`block text-[12px] font-extrabold truncate ${hasCustomBg ? "text-white" : "text-gray-900"}`}>
                        {pendingAttachment.name}
                      </span>
                      <span className={`block text-[10px] font-medium mt-0.5 ${hasCustomBg ? "text-white/60" : "text-gray-400"}`}>
                        {pendingAttachment.size}
                      </span>
                    </div>
                    <button
                      onClick={() => setPendingAttachment(null)}
                      className={`p-1 rounded transition-colors ${hasCustomBg ? "text-white/60 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-700 hover:bg-gray-200"}`}
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
                      placeholder={`Message ${info?.name || "#general"}`}
                      className={`w-full bg-transparent text-[13px] focus:outline-none font-normal py-1 ${
                        hasCustomBg
                          ? "text-white placeholder:text-white/50"
                          : "text-gray-800 placeholder:text-gray-400"
                      }`}
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
                <div className={`flex items-center justify-between pt-1 border-t ${
                  hasCustomBg ? "border-white/15" : "border-gray-100"
                }`}>
                  <div className={`flex items-center gap-1 ${
                    hasCustomBg ? "text-white/70" : "text-gray-400"
                  }`}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-1.5 rounded-lg transition-colors ${
                        hasCustomBg ? "hover:bg-white/10 hover:text-white" : "hover:bg-gray-50 hover:text-gray-700"
                      }`}
                      title="Add file"
                    >
                      <Plus size={16} strokeWidth={2.4} />
                    </button>
                    <button
                      onClick={() => setInputText(prev => prev + "**bold** *italic* `code`")}
                      className={`p-1.5 rounded-lg transition-colors font-serif font-bold text-xs ${
                        hasCustomBg ? "hover:bg-white/10 hover:text-white" : "hover:bg-gray-50 hover:text-gray-700"
                      }`}
                      title="Formatting"
                    >
                      Aa
                    </button>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        showEmojiPicker
                          ? (hasCustomBg ? "bg-white/20 text-white" : "bg-gray-100 text-gray-900")
                          : (hasCustomBg ? "hover:bg-white/10 hover:text-white" : "hover:bg-gray-50 hover:text-gray-700")
                      }`}
                      title="Emoji"
                    >
                      <Smile size={16} strokeWidth={2.1} />
                    </button>
                    <button
                      onClick={() => {
                        setInputText(prev => prev + (prev && !prev.endsWith(' ') ? ' @' : '@'));
                        (document.querySelector('input[type="text"]') as HTMLInputElement)?.focus();
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        hasCustomBg ? "hover:bg-white/10 hover:text-white" : "hover:bg-gray-50 hover:text-gray-700"
                      }`}
                      title="Mention someone"
                    >
                      <AtSign size={16} strokeWidth={2.1} />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-1.5 rounded-lg transition-colors ${
                        hasCustomBg ? "hover:bg-white/10 hover:text-white" : "hover:bg-gray-50 hover:text-gray-700"
                      }`}
                      title="Attach image"
                    >
                      <Image size={16} strokeWidth={2.1} />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-1.5 rounded-lg transition-colors ${
                        hasCustomBg ? "hover:bg-white/10 hover:text-white" : "hover:bg-gray-50 hover:text-gray-700"
                      }`}
                      title="Attach file"
                    >
                      <Paperclip size={16} strokeWidth={2.1} />
                    </button>
                    <button
                      onClick={handleVoiceRecord}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isRecording
                          ? "bg-red-100 text-red-600"
                          : (hasCustomBg ? "hover:bg-white/10 hover:text-white" : "hover:bg-gray-50 hover:text-gray-700")
                      }`}
                      title={isRecording ? "Stop recording" : "Record voice"}
                    >
                      <Mic size={16} strokeWidth={isRecording ? 2.6 : 2.1} className={isRecording ? "animate-pulse" : ""} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAIAssist}
                      disabled={isAiLoading}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs shadow-2xs transition-all ${
                        hasCustomBg
                          ? (isAiLoading ? 'bg-purple-900/40 text-purple-200 opacity-70 border border-purple-400/30' : 'bg-purple-500/25 text-purple-200 hover:bg-purple-500/35 border border-purple-400/30')
                          : (isAiLoading ? 'bg-purple-100 text-indigo-600 opacity-70 border border-purple-200/60' : 'bg-purple-50 text-indigo-600 hover:bg-purple-100 border border-purple-200/60')
                      }`}
                    >
                      <Sparkles size={13} strokeWidth={2.4} className={isAiLoading ? "animate-pulse text-purple-300" : (hasCustomBg ? "text-purple-300" : "text-purple-500")} />
                      <span>{isAiLoading ? "Processing..." : "AI Assist"}</span>
                    </button>
                    <button onClick={handleSendMessage} className="flex items-center justify-center h-8 w-11 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs transition-all">
                      <Send size={14} strokeWidth={2.3} className="mr-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                <div>
                  <h2 className="text-[20px] font-black text-gray-900 flex items-center gap-2">
                    Channel Tasks
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Shared tasks and action items for this channel
                  </p>
                </div>
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Add Task</span>
                </button>
              </div>
              {info?.tasks?.length > 0 ? (
                <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {info.tasks.map((t: any, i: number) => (
                      <div key={i} className="flex items-center p-4 hover:bg-gray-50/80 transition-colors group overflow-hidden">
                        <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ease-out ${t.status === 'done' ? 'w-5 mr-4 opacity-100 translate-x-0' : 'w-0 mr-0 opacity-0 -translate-x-5 group-hover:w-5 group-hover:mr-4 group-hover:opacity-100 group-hover:translate-x-0'}`}>
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
                  <h3 className="text-gray-900 font-black text-[16px]">No tasks for this channel</h3>
                  <p className="text-gray-400 text-[13px] font-medium mt-1">Shared tasks and action items created for this channel will appear here.</p>
                  <button
                    onClick={() => setIsAddTaskOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    Add Channel Task
                  </button>
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
          matchingTemplate ? (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <TemplateTabRenderer
                template={matchingTemplate}
                activeTab={activeTab}
                onSwitchTab={(tab) => setActiveTab(tab)}
                onBackToDashboard={() => setActiveTab("Messages")}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#FAFBFC]">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles size={28} className="text-[#2563EB]" />
                </div>
                <h3 className="text-gray-900 font-black text-[16px]">Coming Soon</h3>
                <p className="text-gray-400 text-[13px] font-medium mt-1">The {activeTab} section is under development.</p>
              </div>
            </div>
          )
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
                      <AudioPlayer filename={activeThreadMessage.attachment.name} url={activeThreadMessage.attachment.url} />
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
                        <AudioPlayer filename={m.attachment.name} url={m.attachment.url} />
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
                      const res = await fetch(`${API_URL}/tasks/${taskToEdit.id}`, {
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
                    const res = await fetch(`${API_URL}/tasks/${taskToDelete.id}`, {
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

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-black text-gray-900">Add Channel Task</h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Prepare presentation slides"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  autoFocus
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && newTaskTitle.trim() && !isCreatingTask) {
                      e.preventDefault();
                      handleCreateTask();
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p)}
                      className={`py-1.5 rounded-lg text-[12px] font-bold transition-all border ${
                        newTaskPriority === p
                          ? p === 'High'
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : p === 'Medium'
                            ? 'bg-amber-50 border-amber-300 text-amber-700'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!newTaskTitle.trim() || isCreatingTask}
                onClick={handleCreateTask}
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors flex items-center gap-1.5"
              >
                {isCreatingTask ? "Adding..." : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}
      

      <InviteModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        inviterName={currentUser?.name || "A teammate"}
        channelName={info?.name || "WorkFlow"}
        onInvite={(email) => {
          if (currentUser) {
            socketRef.current?.emit("send_message", {
              text: `✉️ **${currentUser.name}** invited **${email}** to join WorkFlow Connect for this channel.`,
              userId: currentUser.sub,
              channelId: channelId,
            });
            setActiveTab("Messages");
          }
        }}
      />

      {/* Chat Wallpaper & Template Modal */}
      <ChatWallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        channelId={channelId}
        channelName={info?.name || "general"}
        currentBg={chatBg}
        currentTemplateId={activeTemplateId}
        onSelectWallpaper={handleSelectWallpaper}
        onResetDefault={handleResetDefaultWallpaper}
      />

      {/* Incoming Call Banner */}
      {incomingCallOffer && !isInCall && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 border border-gray-700">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/30">
            <PhoneCall size={20} />
          </div>
          <div>
            <h4 className="text-[14px] font-bold">Incoming Video Call</h4>
            <p className="text-[12px] text-gray-400">
              {incomingCallOffer.senderName ? `${incomingCallOffer.senderName} is inviting you to a call` : `Someone is calling in ${info?.name || "this channel"}`}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => {
                setIsInCall(true);
                setIsInitiator(false);
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-xl text-[13px] font-bold transition-colors shadow-sm"
            >
              Accept
            </button>
            <button
              onClick={() => setIncomingCallOffer(null)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-1.5 rounded-xl text-[13px] font-bold transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Video Call Overlay */}
      {isInCall && (
        <VideoCall
          socket={socketRef.current}
          channelId={channelId}
          currentUser={currentUser}
          isInitiator={isInitiator}
          channelMembers={info?.members || []}
          onClose={() => {
            setIsInCall(false);
            setIsInitiator(false);
            setIncomingCallOffer(null);
          }}
        />
      )}
    </div>
  );
}


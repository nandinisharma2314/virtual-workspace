const fs = require('fs');

const content = `
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import VideoCall from "./chat/VideoCall";

import {
  Video,
  Calendar,
  Clock,
  MoreHorizontal,
  Users,
  Search,
  Plus,
  Play,
  Settings,
  Mic,
  MicOff,
  VideoOff,
  Link as LinkIcon,
  X,
  ChevronRight,
  Filter
} from "lucide-react";

const fallbackUpcomingMeetings = [
  {
    id: 1,
    title: "Weekly Design Sync",
    time: "10:00 AM - 11:00 AM",
    date: "Today",
    attendees: [
      { initials: "AS", color: "bg-rose-500" },
      { initials: "RV", color: "bg-indigo-500" },
      { initials: "PS", color: "bg-amber-500" },
    ],
    isNow: true,
  },
  {
    id: 2,
    title: "Product Roadmap Review",
    time: "1:00 PM - 2:30 PM",
    date: "Today",
    attendees: [
      { initials: "NS", color: "bg-emerald-500" },
      { initials: "AP", color: "bg-sky-500" },
      { initials: "VJ", color: "bg-purple-600" },
      { initials: "RS", color: "bg-indigo-600" },
    ],
    isNow: false,
  },
  {
    id: 3,
    title: "Client Pitch: Project Orion",
    time: "3:30 PM - 4:30 PM",
    date: "Tomorrow",
    attendees: [
      { initials: "JD", color: "bg-cyan-500" },
      { initials: "MK", color: "bg-pink-500" }
    ],
    isNow: false,
  }
];

const recordedMeetings = [
  {
    id: 101,
    title: "Q3 Planning Session",
    date: "Yesterday",
    duration: "1h 15m",
    thumbnail: "bg-[url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2029&auto=format&fit=crop')]",
  },
  {
    id: 102,
    title: "Engineering All-Hands",
    date: "May 15",
    duration: "55m",
    thumbnail: "bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')]",
  },
  {
    id: 103,
    title: "Marketing Campaign Kickoff",
    date: "May 12",
    duration: "42m",
    thumbnail: "bg-[url('https://images.unsplash.com/photo-1557682260-96773eb01377?q=80&w=2029&auto=format&fit=crop')]",
  },
  {
    id: 104,
    title: "Design System Updates",
    date: "May 10",
    duration: "30m",
    thumbnail: "bg-[url('https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=2029&auto=format&fit=crop')]",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 } 
  }
};

export default function MeetingsView() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>(fallbackUpcomingMeetings);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [newMeetingForm, setNewMeetingForm] = useState({ title: "", description: "", date: "", startTime: "", endTime: "" });
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchMeetings = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return;
    
    fetch("http://localhost:3001/meetings", {
      headers: { "Authorization": \`Bearer \${token}\` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => {
      if (data && data.length > 0) {
        const now = new Date();
        const parsed = data.map((m: any, idx: number) => {
          const start = new Date(m.startTime);
          const end = new Date(m.endTime);
          const isNow = start <= now && end >= now;
          
          const formatTime = (date: Date) => {
            let h = date.getHours();
            const min = date.getMinutes().toString().padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            return \`\${h}:\${min} \${ampm}\`;
          };

          const colors = [
            [{ initials: "NS", color: "bg-emerald-500" }, { initials: "AP", color: "bg-sky-500" }],
            [{ initials: "AS", color: "bg-rose-500" }, { initials: "RV", color: "bg-indigo-500" }],
            [{ initials: "JD", color: "bg-amber-500" }, { initials: "MK", color: "bg-purple-600" }]
          ];

          return {
            id: m.id,
            title: m.title,
            time: \`\${formatTime(start)} - \${formatTime(end)}\`,
            date: start.toDateString() === now.toDateString() ? "Today" : start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            attendees: colors[idx % colors.length],
            isNow
          };
        });
        setUpcomingMeetings(parsed);
      }
    })
    .catch(() => {});
  };

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      fetch("http://localhost:3001/auth/me", {
        headers: { "Authorization": \`Bearer \${token}\` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setCurrentUser(data);
      })
      .catch(() => {});

      fetchMeetings();
    }

    socketRef.current = io("http://localhost:3001", {
      auth: { token }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return;

    try {
      const startDateTime = new Date(\`\${newMeetingForm.date}T\${newMeetingForm.startTime}:00\`).toISOString();
      const endDateTime = new Date(\`\${newMeetingForm.date}T\${newMeetingForm.endTime}:00\`).toISOString();

      const res = await fetch("http://localhost:3001/meetings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${token}\` 
        },
        body: JSON.stringify({
          title: newMeetingForm.title,
          description: newMeetingForm.description,
          startTime: startDateTime,
          endTime: endDateTime
        })
      });
      if (res.ok) {
        setShowNewMeetingModal(false);
        setNewMeetingForm({ title: "", description: "", date: "", startTime: "", endTime: "" });
        fetchMeetings();
      }
    } catch(err) {}
  };

  const copyLink = (id: number) => {
    navigator.clipboard.writeText(\`http://localhost:3000/meetings/join/\${id}\`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUpcoming = upcomingMeetings.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredRecorded = recordedMeetings.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const activeMeeting = upcomingMeetings.find(m => m.isNow) || upcomingMeetings[0];

  return (
    <div className="flex w-full h-full min-h-0 flex-col bg-[#0A0A0B] overflow-hidden relative selection:bg-indigo-500/30">
      
      {/* Dark Mode Topbar Override for seamless integration */}
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.05] bg-[#0A0A0B]/80 backdrop-blur-xl px-8 z-10">
        <div className="flex items-center gap-6">
          <h1 className="text-[20px] font-bold tracking-tight text-white flex items-center gap-2">
            Meetings <span className="text-white/20 font-normal">/</span> <span className="text-white/60 text-sm font-medium">Dashboard</span>
          </h1>
          <div className="h-5 w-[1px] bg-white/10"></div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            {activeMeeting?.isNow ? "1 active call" : "All systems normal"}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="h-10 w-72 rounded-full border border-white/10 bg-white/[0.03] pl-10 pr-4 text-[14px] text-white outline-none transition-all placeholder:text-white/30 focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>
          {currentUser?.role === "Admin" && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewMeetingModal(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 text-[13px] font-bold text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Schedule</span>
            </motion.button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Background glow effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>

        <div className="p-8 mx-auto max-w-[1400px] space-y-10 relative z-10">
          
          {/* Active / Next Meeting Hero */}
          <section>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-[32px] bg-[#111114] border border-white/5 shadow-2xl"
            >
              {/* Cinematic Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-[#111114]/90 to-purple-900/30"></div>
              
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]"></div>
              
              {activeMeeting && (
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 p-10 lg:p-14">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={\`flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-black uppercase tracking-widest border \${activeMeeting.isNow ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"}\`}>
                        {activeMeeting.isNow && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>}
                        {activeMeeting.isNow ? "Live Now" : "Up Next"}
                      </div>
                      <span className="text-[14px] font-medium text-white/50">
                        {activeMeeting.time}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60 tracking-tight mb-4">
                        {activeMeeting.title}
                      </h3>
                      <p className="text-[16px] text-white/60 font-medium max-w-2xl leading-relaxed">
                        Discussing Q3 goals and marketing roadmap with stakeholders. Please make sure to review the Figma documents and Q2 analytics report prior to joining the session.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6 pt-4">
                      <div className="flex items-center">
                        <div className="flex -space-x-3">
                          {activeMeeting.attendees.map((a: { initials: string; color: string }, i: number) => (
                            <div
                              key={i}
                              className={\`flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#111114] text-[11px] font-bold text-white shadow-lg \${a.color}\`}
                            >
                              {a.initials}
                            </div>
                          ))}
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#111114] bg-white/10 backdrop-blur-md text-[11px] font-bold text-white shadow-lg">
                            +2
                          </div>
                        </div>
                      </div>
                      <div className="h-10 w-[1px] bg-white/10"></div>
                      <div className="flex flex-col">
                        <span className="text-[12px] text-white/40 font-medium">Host</span>
                        <span className="text-[14px] text-white/90 font-bold">Nandini S.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex shrink-0 w-full lg:w-auto flex-col items-center gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsInCall(true)}
                      className={\`group flex h-14 w-full items-center justify-center gap-3 rounded-2xl px-10 text-[15px] font-bold text-white transition-all overflow-hidden relative \${activeMeeting.isNow ? "bg-[#4F46E5] shadow-[0_0_30px_rgba(79,70,229,0.4)]" : "bg-white/10 hover:bg-white/15"}\`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                      <Video size={20} strokeWidth={2.5} />
                      <span>Join Meeting</span>
                    </motion.button>
                    
                    <div className="flex items-center justify-between gap-3 w-full">
                      <button className="group flex h-12 flex-1 items-center justify-center rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 hover:border-white/10">
                        <MicOff size={18} className="text-white/50 group-hover:text-white transition-colors" />
                      </button>
                      <button className="group flex h-12 flex-1 items-center justify-center rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 hover:border-white/10">
                        <VideoOff size={18} className="text-white/50 group-hover:text-white transition-colors" />
                      </button>
                      <button className="group flex h-12 flex-1 items-center justify-center rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 hover:border-white/10">
                        <Settings size={18} className="text-white/50 group-hover:text-white transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </section>

          {/* Schedule */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-white tracking-tight">Today's Schedule</h2>
              <button 
                onClick={() => router.push('/calendar')}
                className="flex items-center gap-1 text-[14px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View Calendar <ChevronRight size={16} />
              </button>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredUpcoming.map((meeting) => (
                <motion.div
                  variants={itemVariants}
                  key={meeting.id}
                  className={\`group relative flex flex-col justify-between overflow-hidden rounded-[24px] border p-6 transition-all duration-300 \${
                    meeting.isNow
                      ? "border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_30px_rgba(79,70,229,0.15)]"
                      : "border-white/5 bg-[#111114]/60 backdrop-blur-md hover:border-white/15 hover:bg-[#151519]/80 hover:-translate-y-1 hover:shadow-2xl"
                  }\`}
                >
                  {/* Subtle top gradient line for visual interest */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div>
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-2 rounded-full bg-white/5 px-2.5 py-1 text-[12px] font-semibold text-white/60">
                        <Clock size={13} className={meeting.isNow ? "text-indigo-400" : "text-white/40"} />
                        <span className={meeting.isNow ? "text-indigo-400" : ""}>{meeting.time}</span>
                      </div>
                      <button className="text-white/30 hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                    <h3 className={\`text-[16px] font-bold mb-2 leading-snug \${meeting.isNow ? "text-white" : "text-white/90"}\`}>
                      {meeting.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-white/40">
                      <Calendar size={14} />
                      <span>{meeting.date}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {meeting.attendees.map((a: { initials: string; color: string }, i: number) => (
                        <div
                          key={i}
                          className={\`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#111114] text-[10px] font-bold text-white \${a.color}\`}
                        >
                          {a.initials}
                        </div>
                      ))}
                    </div>
                    {meeting.isNow ? (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsInCall(true)}
                        className="rounded-xl bg-indigo-500 px-4 py-2 text-[13px] font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex items-center gap-2"
                      >
                        <Video size={14} />
                        Join
                      </motion.button>
                    ) : (
                      <button 
                        onClick={() => copyLink(meeting.id)}
                        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors active:scale-95"
                      >
                        <LinkIcon size={13} />
                        {copiedId === meeting.id ? "Copied" : "Copy"}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Recorded Meetings */}
          <section className="pb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-white tracking-tight">Recent Recordings</h2>
              <button className="flex items-center gap-1 text-[14px] font-medium text-white/50 hover:text-white transition-colors">
                <Filter size={14} /> Filter
              </button>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {filteredRecorded.map((recording) => (
                <motion.div variants={itemVariants} key={recording.id} className="group cursor-pointer">
                  <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-[#111114] border border-white/5">
                    {/* Thumbnail Image */}
                    <div className={\`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 \${recording.thumbnail}\`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 border border-white/30 text-white shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-300 backdrop-blur-md">
                        <Play size={24} className="ml-1" fill="currentColor" />
                      </div>
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10">
                      {recording.duration}
                    </div>
                  </div>
                  <h4 className="text-[15px] font-bold text-white/90 group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">
                    {recording.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[13px] font-medium text-white/40">
                    <span>{recording.date}</span>
                    <span className="h-1 w-1 rounded-full bg-white/20"></span>
                    <span className="flex items-center gap-1">
                      <Users size={13} />
                      Team
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

        </div>
      </main>

      <AnimatePresence>
        {showNewMeetingModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-md rounded-[28px] bg-[#111114] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
            >
              {/* Modal glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 blur-sm"></div>
              
              <div className="flex items-center justify-between border-b border-white/5 px-8 py-5 bg-white/[0.02]">
                <h3 className="text-[18px] font-bold text-white">Schedule Meeting</h3>
                <button 
                  onClick={() => setShowNewMeetingModal(false)}
                  className="rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <form onSubmit={handleCreateMeeting} className="p-8 space-y-5">
                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-white/70">Meeting Title</label>
                  <input
                    type="text"
                    required
                    value={newMeetingForm.title}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, title: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] text-white outline-none transition-all focus:border-indigo-500/50 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/50"
                    placeholder="e.g. Design Review Sync"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-white/70">Description</label>
                  <textarea
                    rows={2}
                    value={newMeetingForm.description}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, description: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] text-white outline-none transition-all focus:border-indigo-500/50 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/50 resize-none custom-scrollbar"
                    placeholder="Brief agenda..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-[13px] font-semibold text-white/70">Date</label>
                    <input
                      type="date"
                      required
                      value={newMeetingForm.date}
                      onChange={(e) => setNewMeetingForm({ ...newMeetingForm, date: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] text-white outline-none transition-all focus:border-indigo-500/50 focus:bg-white/10 [color-scheme:dark]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-[13px] font-semibold text-white/70">Start</label>
                      <input
                        type="time"
                        required
                        value={newMeetingForm.startTime}
                        onChange={(e) => setNewMeetingForm({ ...newMeetingForm, startTime: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-[14px] text-white outline-none transition-all focus:border-indigo-500/50 focus:bg-white/10 [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] font-semibold text-white/70">End</label>
                      <input
                        type="time"
                        required
                        value={newMeetingForm.endTime}
                        onChange={(e) => setNewMeetingForm({ ...newMeetingForm, endTime: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-[14px] text-white outline-none transition-all focus:border-indigo-500/50 focus:bg-white/10 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewMeetingModal(false)}
                    className="rounded-xl px-5 py-2.5 text-[14px] font-bold text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all"
                  >
                    Create Meeting
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isInCall && socketRef.current && currentUser && (
        <VideoCall 
          socket={socketRef.current}
          channelId="global-meetings-room"
          currentUser={currentUser}
          onClose={() => setIsInCall(false)}
          isInitiator={true}
        />
      )}
    </div>
  );
}
`;

fs.writeFileSync('/home/nandini/Downloads/workflow-dashboard/frontend/components/MeetingsView.tsx', content);

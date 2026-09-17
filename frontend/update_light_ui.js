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
      { initials: "AS", color: "bg-rose-400" },
      { initials: "RV", color: "bg-indigo-400" },
      { initials: "PS", color: "bg-amber-400" },
    ],
    isNow: true,
  },
  {
    id: 2,
    title: "Product Roadmap Review",
    time: "1:00 PM - 2:30 PM",
    date: "Today",
    attendees: [
      { initials: "NS", color: "bg-emerald-400" },
      { initials: "AP", color: "bg-sky-400" },
      { initials: "VJ", color: "bg-purple-500" },
      { initials: "RS", color: "bg-indigo-500" },
    ],
    isNow: false,
  },
  {
    id: 3,
    title: "Client Pitch: Project Orion",
    time: "3:30 PM - 4:30 PM",
    date: "Tomorrow",
    attendees: [
      { initials: "JD", color: "bg-cyan-400" },
      { initials: "MK", color: "bg-pink-400" }
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
    thumbnail: "bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600",
  },
  {
    id: 102,
    title: "Engineering All-Hands",
    date: "May 15",
    duration: "55m",
    thumbnail: "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500",
  },
  {
    id: 103,
    title: "Marketing Campaign Kickoff",
    date: "May 12",
    duration: "42m",
    thumbnail: "bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400",
  },
  {
    id: 104,
    title: "Design System Updates",
    date: "May 10",
    duration: "30m",
    thumbnail: "bg-gradient-to-br from-fuchsia-400 via-pink-500 to-rose-500",
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
            [{ initials: "NS", color: "bg-emerald-400" }, { initials: "AP", color: "bg-sky-400" }],
            [{ initials: "AS", color: "bg-rose-400" }, { initials: "RV", color: "bg-indigo-400" }],
            [{ initials: "JD", color: "bg-amber-400" }, { initials: "MK", color: "bg-purple-500" }]
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
    <div className="flex w-full h-full min-h-0 flex-col bg-[#FAFBFC] overflow-hidden relative selection:bg-indigo-500/20">
      
      {/* Topbar */}
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-200/80 bg-white/80 backdrop-blur-xl px-8 z-10">
        <div className="flex items-center gap-6">
          <h1 className="text-[20px] font-bold tracking-tight text-gray-900 flex items-center gap-2">
            Meetings <span className="text-gray-300 font-normal">/</span> <span className="text-gray-500 text-sm font-medium">Dashboard</span>
          </h1>
          <div className="h-5 w-[1px] bg-gray-200"></div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-600 border border-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            {activeMeeting?.isNow ? "1 active call" : "No active calls"}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="h-10 w-72 rounded-full border border-gray-200 bg-gray-50/80 pl-10 pr-4 text-[14px] text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            />
          </div>
          {currentUser?.role === "Admin" && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewMeetingModal(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-[13px] font-bold text-white transition-all shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Schedule</span>
            </motion.button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Soft Background blur effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-rose-400/10 blur-[100px] pointer-events-none"></div>

        <div className="p-8 mx-auto max-w-[1400px] space-y-10 relative z-10">
          
          {/* Active / Next Meeting Hero */}
          <section>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-[32px] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              {/* Soft fluid gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-80"></div>
              
              {activeMeeting && (
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 p-10 lg:p-14">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={\`flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-black uppercase tracking-widest border \${activeMeeting.isNow ? "bg-rose-50 text-rose-500 border-rose-200 shadow-sm" : "bg-indigo-50 text-indigo-600 border-indigo-200"}\`}>
                        {activeMeeting.isNow && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>}
                        {activeMeeting.isNow ? "Live Now" : "Up Next"}
                      </div>
                      <span className="text-[14px] font-semibold text-gray-500">
                        {activeMeeting.time}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4 drop-shadow-sm">
                        {activeMeeting.title}
                      </h3>
                      <p className="text-[16px] text-gray-600 font-medium max-w-2xl leading-relaxed">
                        Discussing Q3 goals and marketing roadmap with stakeholders. Please make sure to review the Figma documents and Q2 analytics report prior to joining the session.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6 pt-4">
                      <div className="flex items-center">
                        <div className="flex -space-x-3">
                          {activeMeeting.attendees.map((a: { initials: string; color: string }, i: number) => (
                            <div
                              key={i}
                              className={\`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow-md \${a.color}\`}
                            >
                              {a.initials}
                            </div>
                          ))}
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[11px] font-bold text-gray-600 shadow-md">
                            +2
                          </div>
                        </div>
                      </div>
                      <div className="h-10 w-[1px] bg-gray-200"></div>
                      <div className="flex flex-col">
                        <span className="text-[12px] text-gray-400 font-medium">Host</span>
                        <span className="text-[14px] text-gray-900 font-bold">Nandini S.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex shrink-0 w-full lg:w-auto flex-col items-center gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsInCall(true)}
                      className={\`group flex h-14 w-full items-center justify-center gap-3 rounded-2xl px-10 text-[15px] font-bold text-white transition-all overflow-hidden relative \${activeMeeting.isNow ? "bg-[#4F46E5] shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:bg-indigo-700" : "bg-gray-800 hover:bg-gray-900 shadow-md"}\`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                      <Video size={20} strokeWidth={2.5} />
                      <span>Join Meeting</span>
                    </motion.button>
                    
                    <div className="flex items-center justify-between gap-3 w-full">
                      <button className="group flex h-12 flex-1 items-center justify-center rounded-2xl bg-white border border-gray-200 transition-all hover:bg-gray-50 shadow-sm hover:shadow">
                        <MicOff size={18} className="text-gray-500 group-hover:text-gray-900 transition-colors" />
                      </button>
                      <button className="group flex h-12 flex-1 items-center justify-center rounded-2xl bg-white border border-gray-200 transition-all hover:bg-gray-50 shadow-sm hover:shadow">
                        <VideoOff size={18} className="text-gray-500 group-hover:text-gray-900 transition-colors" />
                      </button>
                      <button className="group flex h-12 flex-1 items-center justify-center rounded-2xl bg-white border border-gray-200 transition-all hover:bg-gray-50 shadow-sm hover:shadow">
                        <Settings size={18} className="text-gray-500 group-hover:text-gray-900 transition-colors" />
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
              <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Today's Schedule</h2>
              <button 
                onClick={() => router.push('/calendar')}
                className="flex items-center gap-1 text-[14px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
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
                      ? "border-indigo-200 bg-indigo-50/50 shadow-[0_8px_30px_rgba(79,70,229,0.08)]"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
                  }\`}
                >
                  <div>
                    <div className="mb-4 flex items-start justify-between">
                      <div className={\`flex items-center gap-2 rounded-full px-2.5 py-1 text-[12px] font-semibold \${meeting.isNow ? "bg-indigo-100 text-indigo-700" : "bg-gray-50 text-gray-500 border border-gray-100"}\`}>
                        <Clock size={13} className={meeting.isNow ? "text-indigo-600" : "text-gray-400"} />
                        <span>{meeting.time}</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                    <h3 className={\`text-[16px] font-bold mb-2 leading-snug \${meeting.isNow ? "text-indigo-950" : "text-gray-900"}\`}>
                      {meeting.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{meeting.date}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {meeting.attendees.map((a: { initials: string; color: string }, i: number) => (
                        <div
                          key={i}
                          className={\`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm \${a.color}\`}
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
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-[13px] font-bold text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 hover:bg-indigo-700"
                      >
                        <Video size={14} />
                        Join
                      </motion.button>
                    ) : (
                      <button 
                        onClick={() => copyLink(meeting.id)}
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors active:scale-95 shadow-sm"
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
              <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Recent Recordings</h2>
              <button className="flex items-center gap-1 text-[14px] font-semibold text-gray-500 hover:text-gray-700 transition-colors">
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
                  <div className={\`relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-[20px] shadow-sm transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] \${recording.thumbnail}\`}>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100 bg-white/10">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-indigo-600 shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300">
                        <Play size={24} className="ml-1" fill="currentColor" />
                      </div>
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-sm">
                      {recording.duration}
                    </div>
                  </div>
                  <h4 className="text-[15px] font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                    {recording.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-500">
                    <span>{recording.date}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
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
            className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-md rounded-[28px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden relative"
            >
              
              <div className="flex items-center justify-between border-b border-gray-100 px-8 py-5 bg-gray-50/50">
                <h3 className="text-[18px] font-bold text-gray-900">Schedule Meeting</h3>
                <button 
                  onClick={() => setShowNewMeetingModal(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <form onSubmit={handleCreateMeeting} className="p-8 space-y-5">
                <div>
                  <label className="mb-2 block text-[13px] font-bold text-gray-700">Meeting Title</label>
                  <input
                    type="text"
                    required
                    value={newMeetingForm.title}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, title: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                    placeholder="e.g. Design Review Sync"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-bold text-gray-700">Description</label>
                  <textarea
                    rows={2}
                    value={newMeetingForm.description}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, description: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm resize-none custom-scrollbar"
                    placeholder="Brief agenda..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-[13px] font-bold text-gray-700">Date</label>
                    <input
                      type="date"
                      required
                      value={newMeetingForm.date}
                      onChange={(e) => setNewMeetingForm({ ...newMeetingForm, date: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-[13px] font-bold text-gray-700">Start</label>
                      <input
                        type="time"
                        required
                        value={newMeetingForm.startTime}
                        onChange={(e) => setNewMeetingForm({ ...newMeetingForm, startTime: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-[14px] text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] font-bold text-gray-700">End</label>
                      <input
                        type="time"
                        required
                        value={newMeetingForm.endTime}
                        onChange={(e) => setNewMeetingForm({ ...newMeetingForm, endTime: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-[14px] text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewMeetingModal(false)}
                    className="rounded-xl px-5 py-2.5 text-[14px] font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-6 py-2.5 text-[14px] font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
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

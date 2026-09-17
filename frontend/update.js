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
  X
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
  }
];

const recordedMeetings = [
  {
    id: 101,
    title: "Q3 Planning Session",
    date: "Yesterday",
    duration: "1h 15m",
    thumbnail: "bg-gradient-to-br from-blue-500 to-indigo-600",
  },
  {
    id: 102,
    title: "Engineering All-Hands",
    date: "May 15",
    duration: "55m",
    thumbnail: "bg-gradient-to-br from-emerald-400 to-teal-500",
  },
  {
    id: 103,
    title: "Marketing Campaign Kickoff",
    date: "May 12",
    duration: "42m",
    thumbnail: "bg-gradient-to-br from-amber-400 to-orange-500",
  },
  {
    id: 104,
    title: "Design System Updates",
    date: "May 10",
    duration: "30m",
    thumbnail: "bg-gradient-to-br from-fuchsia-500 to-pink-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
    <div className="flex w-full h-full min-h-0 flex-col bg-transparent overflow-hidden relative">
      {/* Topbar */}
      <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-200/80 bg-white px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[17px] font-black tracking-tight text-gray-900">
            Meetings
          </h1>
          <div className="h-4 w-[1px] bg-gray-300"></div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-bold text-emerald-600 border border-emerald-100">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            {activeMeeting?.isNow ? "1 active call" : "No active calls"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="h-9 w-64 rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-4 text-[13px] font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {currentUser?.role === "Admin" && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewMeetingModal(true)}
              className="flex h-9 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-[13px] font-bold text-white transition-all hover:bg-gray-800 shadow-sm"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New Meeting</span>
            </motion.button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 mx-auto max-w-7xl space-y-8">
          
          {/* Active / Next Meeting Hero */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-extrabold text-gray-900">Up Next</h2>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative overflow-hidden rounded-2xl bg-gray-900 shadow-xl"
            >
              {/* Background abstract shapes */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl mix-blend-screen"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl mix-blend-screen"></div>
              
              {activeMeeting && (
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-8 md:p-10">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={\`rounded-md px-2 py-0.5 text-[11px] font-black uppercase tracking-wider border \${activeMeeting.isNow ? "bg-rose-500/20 text-rose-400 border-rose-500/20" : "bg-indigo-500/20 text-indigo-400 border-indigo-500/20"}\`}>
                        {activeMeeting.isNow ? "Starting Now" : "Upcoming"}
                      </span>
                      <span className="text-[13px] font-semibold text-gray-400">
                        {activeMeeting.time}
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">
                      {activeMeeting.title}
                    </h3>
                    <p className="text-[14px] text-gray-400 font-medium max-w-xl">
                      Reviewing the new dashboard components and finalizing the design system for Q3. Please review the Figma file before joining.
                    </p>
                    
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex -space-x-2">
                        {activeMeeting.attendees.map((a: { initials: string; color: string }, i: number) => (
                          <div
                            key={i}
                            className={\`flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-900 text-[10px] font-bold text-white \${a.color}\`}
                          >
                            {a.initials}
                          </div>
                        ))}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-900 bg-gray-800 text-[10px] font-bold text-gray-300">
                          +2
                        </div>
                      </div>
                      <span className="text-[13px] font-semibold text-gray-400">
                        {activeMeeting.attendees.length + 2} attending
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex shrink-0 flex-col items-center gap-3">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsInCall(true)}
                      className={\`flex h-14 w-full md:w-auto items-center justify-center gap-3 rounded-xl px-8 text-[15px] font-black text-white shadow-lg transition-all \${activeMeeting.isNow ? "bg-[#2563EB] shadow-blue-600/30 hover:bg-blue-700" : "bg-gray-700 shadow-gray-900/30 hover:bg-gray-600"}\`}
                    >
                      <Video size={20} strokeWidth={2.5} />
                      <span>Join Meet</span>
                    </motion.button>
                    <div className="flex items-center justify-center gap-2 w-full">
                      <button className="flex h-10 flex-1 items-center justify-center rounded-xl bg-gray-800 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">
                        <MicOff size={16} />
                      </button>
                      <button className="flex h-10 flex-1 items-center justify-center rounded-xl bg-gray-800 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">
                        <VideoOff size={16} />
                      </button>
                      <button className="flex h-10 flex-1 items-center justify-center rounded-xl bg-gray-800 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">
                        <Settings size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </section>

          {/* Schedule */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-extrabold text-gray-900">Today's Schedule</h2>
              <button 
                onClick={() => router.push('/calendar')}
                className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700"
              >
                View Calendar
              </button>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredUpcoming.map((meeting) => (
                <motion.div
                  variants={itemVariants}
                  key={meeting.id}
                  className={\`flex flex-col justify-between rounded-xl border p-5 transition-all \${
                    meeting.isNow
                      ? "border-indigo-200 bg-indigo-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-1"
                  }\`}
                >
                  <div>
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500">
                        <Clock size={14} className={meeting.isNow ? "text-indigo-500" : ""} />
                        <span className={meeting.isNow ? "text-indigo-600" : ""}>{meeting.time}</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <h3 className={\`text-[15px] font-black mb-1 \${meeting.isNow ? "text-indigo-900" : "text-gray-900"}\`}>
                      {meeting.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500">
                      <Calendar size={13} />
                      <span>{meeting.date}</span>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {meeting.attendees.map((a: { initials: string; color: string }, i: number) => (
                        <div
                          key={i}
                          className={\`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white \${a.color}\`}
                        >
                          {a.initials}
                        </div>
                      ))}
                    </div>
                    {meeting.isNow ? (
                      <button 
                        onClick={() => setIsInCall(true)}
                        className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                      >
                        <Video size={14} />
                        Join Meet
                      </button>
                    ) : (
                      <button 
                        onClick={() => copyLink(meeting.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-colors active:scale-95"
                      >
                        <LinkIcon size={12} />
                        {copiedId === meeting.id ? "Copied!" : "Copy Link"}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Recorded Meetings */}
          <section className="pb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-extrabold text-gray-900">Recent Recordings</h2>
              <button className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700">
                View All Recordings
              </button>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {filteredRecorded.map((recording) => (
                <motion.div variants={itemVariants} key={recording.id} className="group cursor-pointer">
                  <div className={\`relative mb-3 aspect-video w-full overflow-hidden rounded-xl \${recording.thumbnail} transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-lg\`}>
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 opacity-0 backdrop-blur-[2px] transition-all group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                        <Play size={20} className="ml-1" fill="currentColor" />
                      </div>
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 rounded-md bg-gray-900/80 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
                      {recording.duration}
                    </div>
                  </div>
                  <h4 className="text-[14px] font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {recording.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-2 text-[12px] font-semibold text-gray-500">
                    <span>{recording.date}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
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
            className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-black text-gray-900">Schedule Meeting</h3>
                <button 
                  onClick={() => setShowNewMeetingModal(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateMeeting} className="p-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    value={newMeetingForm.title}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, title: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Weekly Sync"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Description</label>
                  <textarea
                    rows={2}
                    value={newMeetingForm.description}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, description: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Agenda..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Date</label>
                    <input
                      type="date"
                      required
                      value={newMeetingForm.date}
                      onChange={(e) => setNewMeetingForm({ ...newMeetingForm, date: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-bold text-gray-700">Start</label>
                      <input
                        type="time"
                        required
                        value={newMeetingForm.startTime}
                        onChange={(e) => setNewMeetingForm({ ...newMeetingForm, startTime: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-2 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-bold text-gray-700">End</label>
                      <input
                        type="time"
                        required
                        value={newMeetingForm.endTime}
                        onChange={(e) => setNewMeetingForm({ ...newMeetingForm, endTime: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-2 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewMeetingModal(false)}
                    className="rounded-xl px-5 py-2.5 text-[14px] font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                  >
                    Schedule
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

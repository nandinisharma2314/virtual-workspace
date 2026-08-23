"use client";

import { Sparkles, Paperclip, Clock, FileText, Send, X, Bot, User } from "lucide-react";
import { aiSuggestions } from "@/lib/data";
import { useState, useRef, useEffect } from "react";

const icons = [Paperclip, Clock, FileText];

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AIAssistantCard() {
  const [view, setView] = useState<"idle" | "chat">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (view === "chat") scrollToBottom();
  }, [messages, view, isTyping]);

  const handleAsk = (text?: string) => {
    const query = text || input;
    if (!query.trim()) return;

    if (view === "idle") setView("chat");
    
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setInput("");
    setIsTyping(true);

    // Simulate real-time dynamic AI response
    setTimeout(() => {
      let reply = "";
      const q = query.toLowerCase();
      
      if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
        reply = "Hello there! How can I assist you with your dashboard today?";
      } else if (q.includes("summarize") || q.includes("summary")) {
        reply = "Here's a quick summary: Your team has completed 12 tasks this week, and you have 3 upcoming meetings.";
      } else if (q.includes("schedule") || q.includes("meeting")) {
        reply = "I'll draft a calendar invite for you right now. Who should I add to the guest list?";
      } else if (q.includes("draft") || q.includes("document")) {
        reply = "I've drafted a project update in your Documents tab. You can review it there.";
      } else if (q.includes("task") || q.includes("todo")) {
        reply = "You currently have a few tasks in your 'To Do' list. Would you like me to prioritize them for you?";
      } else if (q.includes("progress") || q.includes("status")) {
        reply = "Your overall project progress is looking good. You're on track to meet your sprint goals.";
      } else if (q.includes("thank")) {
        reply = "You're very welcome! Let me know if you need anything else.";
      } else if (q.includes("bye")) {
        reply = "Goodbye! Have a productive day!";
      } else {
        const words = query.split(" ");
        if (words.length >= 4) {
          reply = `That's interesting. You mentioned "${words.slice(-3).join(" ")}". I can definitely help manage that aspect of your workflow!`;
        } else {
          const randomResponses = [
            "I've noted that. Is there anything specific about it you'd like to dive into?",
            "I'm here to help. Could you provide a bit more detail?",
            "Understood. I will update your workspace analytics accordingly.",
            "That makes sense. I can optimize your dashboard for that.",
            "I'm analyzing your request... I can definitely assist with that."
          ];
          reply = randomResponses[Math.floor(Math.random() * randomResponses.length)];
        }
      }

      setMessages(prev => [...prev, { role: "ai", content: reply }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800); // Random realistic typing delay
  };

  if (view === "chat") {
    return (
      <div className="w-full h-full flex-1 flex flex-col rounded-xl border border-purple-200/60 bg-gradient-to-br from-[#F8F5FF] via-[#FAF6FF] to-[#F3EEFF] shadow-2xs overflow-hidden min-h-0 relative">
        <div className="flex items-center justify-between p-2.5 border-b border-purple-100/50 bg-white/40 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#8B5CF6]" />
            <span className="text-[12px] font-bold text-gray-900">AI Assistant</span>
          </div>
          <button onClick={() => setView("idle")} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={14} />
          </button>
        </div>
        
        {/* Scrollbar visually hidden but scrolling remains functional */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {messages.length === 0 && !isTyping && (
             <div className="text-center text-xs text-gray-500 mt-4">How can I help you today?</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 text-[11px] leading-relaxed ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`h-5 w-5 shrink-0 rounded-full flex items-center justify-center ${m.role === "user" ? "bg-indigo-100 text-indigo-600" : "bg-purple-600 text-white"}`}>
                {m.role === "user" ? <User size={10} /> : <Bot size={10} />}
              </div>
              <div className={`rounded-xl px-2.5 py-1.5 max-w-[80%] break-words ${m.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white border border-purple-100 text-gray-700 shadow-xs rounded-tl-sm"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 text-[11px]">
              <div className="h-5 w-5 shrink-0 rounded-full bg-purple-600 text-white flex items-center justify-center">
                <Bot size={10} />
              </div>
              <div className="rounded-xl px-3 py-2.5 bg-white border border-purple-100 shadow-xs rounded-tl-sm flex gap-1 items-center">
                <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-2 bg-white/60 border-t border-purple-100/50 shrink-0">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask AI anything..."
              className="w-full bg-white border border-gray-200 rounded-full pl-3 pr-8 py-1.5 text-[11px] focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300 transition-all shadow-xs"
            />
            <button 
              onClick={() => handleAsk()}
              disabled={!input.trim()}
              className="absolute right-1 p-1 text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors bg-white rounded-full"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between rounded-xl border border-purple-200/60 bg-gradient-to-br from-[#F8F5FF] via-[#FAF6FF] to-[#F3EEFF] p-3 sm:p-3.5 shadow-2xs overflow-hidden min-h-0">
      {/* Top Header & Subtitle Block */}
      <div className="flex items-start gap-2.5 sm:gap-3 shrink-0">
        <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-[#EDE5FF] border border-purple-200/50 shadow-2xs mt-0.5">
          <Sparkles size={18} className="text-[#8B5CF6]" strokeWidth={2.3} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-tight truncate">
            AI Assistant
          </h3>
          <p className="text-[10.5px] sm:text-[11px] text-gray-500 font-medium leading-tight mt-0.5 sm:line-clamp-2 truncate sm:overflow-visible">
            Get instant answers, summaries and help for your projects.
          </p>
        </div>
      </div>

      {/* Dedicated Left-Aligned "Ask AI" Button */}
      <div className="my-1 sm:my-1.5 shrink-0">
        <button 
          onClick={() => handleAsk("Hello! How can you help me today?")}
          className="rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] px-3.5 py-1 sm:py-1.5 text-[11.5px] font-extrabold text-white shadow-sm shadow-purple-500/25 hover:opacity-95 transition-all"
        >
          Ask AI
        </button>
      </div>

      {/* 3 White Suggestion Boxes - zero scroll overflow hidden */}
      <ul className="flex-1 min-h-0 space-y-1 sm:space-y-1.5 overflow-hidden flex flex-col justify-between">
        {aiSuggestions.map((s, i) => {
          const Icon = icons[i % icons.length];
          return (
            <li key={s} className="min-w-0">
              <button 
                onClick={() => handleAsk(s)}
                className="flex w-full items-center gap-2 rounded-xl border border-white sm:border-purple-100 bg-white/85 px-2.5 py-1 sm:py-1.5 text-left text-[11px] sm:text-[11.5px] font-semibold text-[#4B5563] hover:bg-white hover:border-purple-200 shadow-2xs transition-all truncate"
              >
                <Icon size={13} className="text-[#6B7280] shrink-0" strokeWidth={2.2} />
                <span className="truncate">{s}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

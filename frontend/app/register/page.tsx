"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Loader2,
  AlertCircle,
  TrendingUp,
  Activity,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Clock,
  BarChart3,
  Bot,
  BadgeCheck,
  Server,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/apis";

// Sample velocity chart data
const VELOCITY_DATA = [
  { day: "Mon", completed: 14, target: 10, cx: 10, cy: 88 },
  { day: "Tue", completed: 22, target: 18, cx: 90, cy: 74 },
  { day: "Wed", completed: 35, target: 28, cx: 170, cy: 52 },
  { day: "Thu", completed: 44, target: 38, cx: 250, cy: 36 },
  { day: "Fri", completed: 58, target: 48, cx: 330, cy: 20 },
  { day: "Sat", completed: 64, target: 56, cx: 410, cy: 11 },
  { day: "Sun", completed: 72, target: 62, cx: 490, cy: 5 },
];

// Interactive Testimonial Builders
const BUILDERS = [
  {
    id: "avi",
    name: "Avi Sharma",
    role: "Tech Lead @ FinTech Corp",
    initials: "AS",
    avatarBg: "from-rose-500 to-pink-600",
    quote: "WorkFlow cut our sprint cycle time from 2 weeks to 4 days. Best developer UX we've used.",
  },
  {
    id: "priya",
    name: "Priya Singh",
    role: "Head of Product @ CloudScale",
    initials: "PS",
    avatarBg: "from-indigo-600 to-violet-600",
    quote: "The unified kanban and real-time channels finally eliminated context switching entirely.",
  },
  {
    id: "rohit",
    name: "Rohit Verma",
    role: "VP Engineering @ HyperGrowth",
    initials: "RV",
    avatarBg: "from-amber-500 to-orange-600",
    quote: "Migrated 140+ engineers in one afternoon. The speed and live telemetry are unreal.",
  },
  {
    id: "neha",
    name: "Neha Patel",
    role: "Staff Architect @ StudioNext",
    initials: "NP",
    avatarBg: "from-emerald-500 to-teal-600",
    quote: "Enterprise-grade security with the speed of a modern startup tool. Incredible build.",
  },
];

const TABS: { id: "velocity" | "activity" | "ai"; label: string; icon: React.ElementType }[] = [
  { id: "velocity", label: "Sprint Velocity", icon: BarChart3 },
  { id: "activity", label: "Live Output Pulse", icon: Activity },
  { id: "ai", label: "AI Copilot Radar", icon: Bot },
];

function RegisterContent() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Interactive Graph Showcase states
  const [activeTab, setActiveTab] = useState<"velocity" | "activity" | "ai">("velocity");
  const [activePointIdx, setActivePointIdx] = useState<number>(4); // Friday default
  const [isHoveringShowcase, setIsHoveringShowcase] = useState(false);
  const [userInteractedWithPoint, setUserInteractedWithPoint] = useState(false);

  // Interactive Social Proof / Trust state
  const [activeBuilderId, setActiveBuilderId] = useState<string | null>(null);
  const [activeTrustKey, setActiveTrustKey] = useState<"soc2" | "enc" | "sla" | null>(null);
  const [showRatingDetails, setShowRatingDetails] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // 1. AUTO-CYCLE TABS: Automatically changes tabs every 6 seconds unless hovered
  useEffect(() => {
    if (isHoveringShowcase) return;

    const interval = setInterval(() => {
      setActiveTab((curr) => {
        const nextIdx = (TABS.findIndex((t) => t.id === curr) + 1) % TABS.length;
        return TABS[nextIdx].id;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isHoveringShowcase]);

  // 2. AUTO-ANIMATE GRAPH POINTS: When on velocity tab, step through data points every 1.5s
  useEffect(() => {
    if (activeTab !== "velocity" || userInteractedWithPoint || isHoveringShowcase) return;

    const interval = setInterval(() => {
      setActivePointIdx((curr) => (curr + 1) % VELOCITY_DATA.length);
    }, 1600);

    return () => clearInterval(interval);
  }, [activeTab, userInteractedWithPoint, isHoveringShowcase]);

  // Password validation calculation
  const reqs = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strengthScore = [
    reqs.length,
    reqs.uppercase,
    reqs.number,
    reqs.special,
  ].filter(Boolean).length;

  const getStrengthMeta = () => {
    if (!password) return { label: "", color: "bg-slate-200", text: "text-slate-400" };
    switch (strengthScore) {
      case 1:
        return { label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
      case 2:
        return { label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
      case 3:
        return { label: "Good", color: "bg-indigo-600", text: "text-indigo-600" };
      case 4:
        return { label: "Strong & Secure", color: "bg-emerald-600", text: "text-emerald-600" };
      default:
        return { label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
    }
  };

  const strengthMeta = getStrengthMeta();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Please enter your full name.";
    if (!email.trim()) newErrors.email = "Please enter your work email.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Please enter a valid work email.";

    if (!password) newErrors.password = "Please create a password.";
    else if (strengthScore < 2) newErrors.password = "Please create a stronger password.";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    if (!terms) newErrors.terms = "You must agree to the Terms of Service & Privacy Policy.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: fullName, email, password }),
        });

        if (res.ok) {
          const data = await res.json();
          document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
          const inviteToken = searchParams.get("invite");
          const redirectUrl = inviteToken
            ? `/invite/${encodeURIComponent(inviteToken)}`
            : "/";
          window.location.href = redirectUrl;
        } else {
          const errorData = await res.json();
          setErrors((prev) => ({
            ...prev,
            api: errorData.message || "Registration failed. Please check your credentials.",
          }));
        }
      } catch {
        setErrors((prev) => ({
          ...prev,
          api: "Unable to connect to the authentication server. Please check your network.",
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAFBFC] text-slate-900 flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500 selection:text-white font-sans">
      {/* Background Animated Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-200/50 via-purple-100/40 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-28 right-[-5%] w-[650px] h-[650px] rounded-full bg-gradient-to-tl from-purple-200/40 via-sky-100/40 to-transparent blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-45" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* =====================================================================
              LEFT COLUMN: High-Tech SaaS Analytics & Interactive Visual Showcase (7 cols)
              ===================================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 pr-0 lg:pr-4">
            
            {/* Header / Brand & Live Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3.5 flex-wrap"
            >
              <Link href="/" className="inline-flex items-center gap-2 group">
                <Image
                  src="/workflow-logo.png"
                  alt="WorkFlow"
                  width={170}
                  height={48}
                  className="h-9 sm:h-10 w-auto object-contain"
                  priority
                />
              </Link>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                <span>WorkFlow OS v2.5</span>
                <span className="text-indigo-300">•</span>
                <span className="text-slate-600 font-medium">Enterprise Unified Suite</span>
              </div>
            </motion.div>

            {/* High-Impact Headline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="space-y-2"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                The modern workspace for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  high-velocity product teams.
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base font-normal max-w-lg">
                Ship faster with real-time sprint burndown telemetry, AI backlog triage, and instant developer collaboration.
              </p>
            </motion.div>

            {/* Interactive SaaS Analytics Showcase Box with Auto-Rotation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              onMouseEnter={() => setIsHoveringShowcase(true)}
              onMouseLeave={() => {
                setIsHoveringShowcase(false);
                setUserInteractedWithPoint(false);
              }}
              className="w-full bg-white/95 border border-slate-200/90 rounded-2xl p-5 shadow-[0_20px_50px_-15px_rgba(79,70,229,0.09)] backdrop-blur-xl relative overflow-hidden group"
            >
              {/* Showcase Mode Switcher with Animated Tab Indicator */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60 relative">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          setUserInteractedWithPoint(false);
                        }}
                        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer z-10 ${
                          isActive
                            ? "text-indigo-700 font-extrabold"
                            : "text-slate-600 hover:text-slate-900 font-medium"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTabPill"
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/70 -z-10"
                          />
                        )}
                        <Icon size={14} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-time Stream: 14ms</span>
                </div>
              </div>

              {/* Dynamic Showcase Viewport */}
              <div className="min-h-[225px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  
                  {/* VIEW 1: SPRINT VELOCITY REAL-TIME GRAPH */}
                  {activeTab === "velocity" && (
                    <motion.div
                      key="velocity"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Top Metric Strip */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Team Velocity
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xl font-extrabold text-slate-900">72 pts</span>
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                              <TrendingUp size={11} className="mr-0.5" /> +28%
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Sprint Burndown
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xl font-extrabold text-slate-900">92.4%</span>
                            <span className="text-[11px] font-semibold text-indigo-600">On Track</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Completed Issues
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xl font-extrabold text-slate-900">48 / 52</span>
                            <span className="text-[11px] font-semibold text-slate-500">4 remaining</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive SVG Area Chart */}
                      <div className="relative pt-2 pb-1">
                        <svg className="w-full h-28 overflow-visible" viewBox="0 0 500 100">
                          <defs>
                            <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#6366F1" />
                              <stop offset="50%" stopColor="#8B5CF6" />
                              <stop offset="100%" stopColor="#EC4899" />
                            </linearGradient>
                          </defs>

                          <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                          <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                          <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                          {/* Target Trajectory Line */}
                          <path
                            d="M 10 90 L 90 75 L 170 60 L 250 48 L 330 35 L 410 24 L 490 12"
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                          />

                          {/* Velocity Area Fill */}
                          <path
                            d="M 10 88 C 60 84, 120 65, 170 52 C 220 38, 290 32, 330 20 C 370 12, 440 8, 490 5 L 490 100 L 10 100 Z"
                            fill="url(#velocityGrad)"
                          />

                          {/* Animated Curve */}
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            d="M 10 88 C 60 84, 120 65, 170 52 C 220 38, 290 32, 330 20 C 370 12, 440 8, 490 5"
                            fill="none"
                            stroke="url(#lineGrad)"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />

                          {/* Interactive & Auto-Stepping Data points */}
                          {VELOCITY_DATA.map((pt, i) => {
                            const isCurrent = activePointIdx === i;
                            return (
                              <g
                                key={i}
                                className="cursor-pointer group"
                                onMouseEnter={() => {
                                  setActivePointIdx(i);
                                  setUserInteractedWithPoint(true);
                                }}
                              >
                                {isCurrent && (
                                  <motion.circle
                                    cx={pt.cx}
                                    cy={pt.cy}
                                    r={10}
                                    className="fill-indigo-400/30"
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  />
                                )}
                                <circle
                                  cx={pt.cx}
                                  cy={pt.cy}
                                  r={isCurrent ? 6 : 4}
                                  className={`transition-all duration-300 ${
                                    isCurrent
                                      ? "fill-indigo-600 stroke-white stroke-2 shadow-md"
                                      : "fill-white stroke-indigo-500 stroke-2 hover:fill-indigo-100"
                                  }`}
                                />
                              </g>
                            );
                          })}
                        </svg>

                        {/* Interactive Tooltip Card that tracks the active point */}
                        <div className="flex items-center justify-between text-xs px-2 pt-1.5 border-t border-slate-100 text-slate-500">
                          <span className="font-semibold text-slate-700">
                            Day: <span className="text-indigo-600 font-bold">{VELOCITY_DATA[activePointIdx].day}</span>
                          </span>
                          <span className="font-semibold text-slate-700">
                            Completed: <span className="text-emerald-600 font-bold">{VELOCITY_DATA[activePointIdx].completed} story points</span>
                          </span>
                          <span className="font-medium text-slate-400">
                            Target: {VELOCITY_DATA[activePointIdx].target} pts
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* VIEW 2: LIVE TEAM OUTPUT PULSE */}
                  {activeTab === "activity" && (
                    <motion.div
                      key="activity"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-1 border-b border-slate-100">
                        <span>Live Team Commits & Deployments</span>
                        <span className="text-indigo-600 font-semibold">18 events in last hour</span>
                      </div>

                      <div className="space-y-2">
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900">PR #418 Merged to Production</span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  Deployed
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                WebSocket clustering engine by <strong className="text-slate-700">Priya S.</strong>
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">2m ago</span>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                              <GitPullRequest size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900">Frontend SaaS Auth Refresh</span>
                                <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                                  Review
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                Real-time velocity telemetry by <strong className="text-slate-700">Avi S.</strong>
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">8m ago</span>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <GitCommit size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900">PostgreSQL Schema Migrations</span>
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  Synced
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                4 database tables optimized by <strong className="text-slate-700">Rohit V.</strong>
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">14m ago</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* VIEW 3: AI COPILOT RADAR & TRIAGE */}
                  {activeTab === "ai" && (
                    <motion.div
                      key="ai"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex flex-col items-center justify-center text-center">
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="3.5"
                              />
                              <motion.path
                                initial={{ strokeDasharray: "0, 100" }}
                                animate={{ strokeDasharray: "99.4, 100" }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#4F46E5"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-xs font-extrabold text-indigo-950 font-mono">
                              99.4%
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-900 mt-1 uppercase tracking-wider">
                            Triage Accuracy
                          </span>
                        </div>

                        <div className="col-span-8 space-y-2">
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <Sparkles size={13} className="text-purple-600" /> Auto-Resolved Blockers
                              </span>
                              <span className="font-bold text-indigo-600 font-mono">14 issues</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "88%" }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              />
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <Clock size={13} className="text-emerald-600" /> Engineering Hours Saved
                              </span>
                              <span className="font-bold text-emerald-600 font-mono">4.5 hrs/dev</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "94%" }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* =================================================================
                INTERACTIVE SOCIAL PROOF & ENTERPRISE TRUST SECTION
                ================================================================= */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="pt-2 flex flex-col space-y-3.5 border-t border-slate-200/80 text-xs"
            >
              {/* Top Row: Interactive Avatars + Live Rating Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
                
                {/* Interactive Avatar Stack with Hover Popover */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2.5 relative items-center">
                    {BUILDERS.map((builder) => {
                      const isHovered = activeBuilderId === builder.id;
                      return (
                        <div
                          key={builder.id}
                          className="relative"
                          onMouseEnter={() => setActiveBuilderId(builder.id)}
                          onMouseLeave={() => setActiveBuilderId(null)}
                        >
                          <motion.div
                            whileHover={{ y: -3, scale: 1.15, zIndex: 30 }}
                            className={`w-8 h-8 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-white shadow-xs cursor-pointer transition-shadow bg-gradient-to-tr ${builder.avatarBg}`}
                          >
                            {builder.initials}
                          </motion.div>

                          {/* Interactive Hover Popover Tooltip */}
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                transition={{ duration: 0.18 }}
                                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-64 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-[0_15px_35px_-5px_rgba(15,23,42,0.15)] backdrop-blur-md pointer-events-none"
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className={`w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center bg-gradient-to-tr ${builder.avatarBg}`}>
                                    {builder.initials}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-[11px] font-bold text-slate-900 truncate leading-none">
                                      {builder.name}
                                    </h4>
                                    <span className="text-[9.5px] text-slate-500 truncate block">
                                      {builder.role}
                                    </span>
                                  </div>
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60">
                                    <BadgeCheck size={10} /> Verified
                                  </span>
                                </div>
                                <p className="text-[10.5px] text-slate-600 italic leading-snug">
                                  “{builder.quote}”
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold ring-2 ring-white shadow-xs z-10">
                      +14k
                    </div>
                  </div>

                  {/* Rating with Interactive Popover */}
                  <div
                    className="relative cursor-pointer group"
                    onMouseEnter={() => setShowRatingDetails(true)}
                    onMouseLeave={() => setShowRatingDetails(false)}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                        ))}
                      </div>
                      <span className="text-slate-900 font-extrabold text-xs">4.9/5</span>
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/50">
                        G2 Leader
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      Trusted by 14,000+ engineers & product leads
                    </span>

                    {/* G2 Rating Hover Card */}
                    <AnimatePresence>
                      {showRatingDetails && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                          className="absolute bottom-9 left-0 z-50 w-60 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xl pointer-events-none"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 mb-1">
                            <span className="flex items-center gap-1">
                              <Star size={12} className="text-amber-500" fill="currentColor" /> 1,480+ Reviews
                            </span>
                            <span className="text-indigo-600 font-mono">Top 1%</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-snug">
                            Voted #1 Best Collaboration Tool in 2026 for high-velocity teams.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Live Activity Chip */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-slate-600 text-[11px] font-medium shrink-0 self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>2,418 teams active today</span>
                </div>
              </div>

              {/* Bottom Row: 3 Interactive Enterprise Trust Pills */}
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                {/* Trust Pill 1: SOC2 */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveTrustKey("soc2")}
                  onMouseLeave={() => setActiveTrustKey(null)}
                >
                  <button
                    type="button"
                    className={`w-full py-1.5 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTrustKey === "soc2"
                        ? "bg-indigo-50/80 border-indigo-300 text-indigo-900 shadow-xs"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs"
                    }`}
                  >
                    <ShieldCheck size={13} className="text-indigo-600" />
                    <span>SOC2 Type II</span>
                  </button>

                  <AnimatePresence>
                    {activeTrustKey === "soc2" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.16 }}
                        className="absolute bottom-9 left-1/2 -translate-x-1/2 z-50 w-56 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xl pointer-events-none text-left"
                      >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900 mb-0.5">
                          <CheckCircle2 size={12} className="text-emerald-600" /> AICPA Audited
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          Annual third-party security audits with continuous automated vulnerability scans.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Trust Pill 2: Encryption */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveTrustKey("enc")}
                  onMouseLeave={() => setActiveTrustKey(null)}
                >
                  <button
                    type="button"
                    className={`w-full py-1.5 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTrustKey === "enc"
                        ? "bg-indigo-50/80 border-indigo-300 text-indigo-900 shadow-xs"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs"
                    }`}
                  >
                    <Lock size={12} className="text-purple-600" />
                    <span>256-Bit Encrypted</span>
                  </button>

                  <AnimatePresence>
                    {activeTrustKey === "enc" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.16 }}
                        className="absolute bottom-9 left-1/2 -translate-x-1/2 z-50 w-56 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xl pointer-events-none text-left"
                      >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900 mb-0.5">
                          <CheckCircle2 size={12} className="text-emerald-600" /> AES-256 & TLS 1.3
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          Zero-knowledge architecture. All channels, file attachments, and notes are encrypted.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Trust Pill 3: SLA */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveTrustKey("sla")}
                  onMouseLeave={() => setActiveTrustKey(null)}
                >
                  <button
                    type="button"
                    className={`w-full py-1.5 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTrustKey === "sla"
                        ? "bg-indigo-50/80 border-indigo-300 text-indigo-900 shadow-xs"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs"
                    }`}
                  >
                    <Server size={12} className="text-emerald-600" />
                    <span>99.99% Uptime SLA</span>
                  </button>

                  <AnimatePresence>
                    {activeTrustKey === "sla" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.16 }}
                        className="absolute bottom-9 left-1/2 -translate-x-1/2 z-50 w-56 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xl pointer-events-none text-left"
                      >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900 mb-0.5">
                          <CheckCircle2 size={12} className="text-emerald-600" /> 100% Operational
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          Zero outages in last 90 days across US, EU, and APAC clusters with automated failover.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          {/* =====================================================================
              RIGHT COLUMN: High-Conversion Modern SaaS Registration Card (5 cols)
              ===================================================================== */}
          <div className="lg:col-span-5 flex items-center justify-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="w-full max-w-[460px] bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.08)] backdrop-blur-xl relative"
            >
              <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

              {/* Form Header */}
              <div className="mb-5 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  <Zap size={12} className="text-emerald-600" />
                  <span>Free 14-day Pro trial • No card needed</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Create your account
                </h2>
                <p className="text-xs text-slate-500">
                  Start collaborating with your team in under 60 seconds.
                </p>
              </div>

              {/* Invite Banner */}
              {searchParams.get("invite") && (
                <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
                  <span className="text-base leading-none">🎉</span>
                  <div>
                    <strong className="block text-indigo-950 font-bold">
                      You’ve been invited to join a workspace!
                    </strong>
                    <span className="text-indigo-700">Complete your registration to access shared team channels and project boards.</span>
                  </div>
                </div>
              )}

              {/* API General Error Notice */}
              {errors.api && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-500 mt-0.5" />
                  <span>{errors.api}</span>
                </div>
              )}

              {/* Social One-Click Auth */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <button
                  type="button"
                  onClick={() => alert("Google SSO is configured via workspace domain authentication in the admin panel.")}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-xs group cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 10.5 0 12.4s.6 3.2 1.6 5.2l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16.4C3.5 20.3 7.4 23.5 12 23.5z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert("GitHub SSO is configured via workspace domain authentication in the admin panel.")}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-xs group cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3.5">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 absolute">
                  or register with email
                </span>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Full name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User size={15} />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: "" });
                      }}
                      placeholder="e.g. Sarah Connor"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border ${
                        errors.fullName
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                          : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/15"
                      } text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-2 transition-all shadow-2xs`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-500 pl-1 font-medium">{errors.fullName}</p>
                  )}
                </div>

                {/* Work Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Work email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      placeholder="sarah@company.com"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border ${
                        errors.email
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                          : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/15"
                      } text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-2 transition-all shadow-2xs`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-500 pl-1 font-medium">{errors.email}</p>
                  )}
                </div>

                {/* Password with Strength Analyzer */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    {password && (
                      <span className={`text-[11px] font-bold ${strengthMeta.text}`}>
                        {strengthMeta.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: "" });
                      }}
                      placeholder="Create a strong password"
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50/70 border ${
                        errors.password
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                          : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/15"
                      } text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-2 transition-all shadow-2xs`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-500 pl-1 font-medium">{errors.password}</p>
                  )}

                  {/* Password Strength Progress Segments */}
                  {password && (
                    <div className="pt-1 space-y-1">
                      <div className="grid grid-cols-4 gap-1.5 h-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full rounded-full transition-all duration-300 ${
                              strengthScore >= step ? strengthMeta.color : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Micro Checklist */}
                      <div className="grid grid-cols-2 gap-1 text-[10.5px] text-slate-500 pt-1">
                        <span
                          className={`flex items-center gap-1 ${
                            reqs.length ? "text-emerald-700 font-semibold" : "text-slate-400"
                          }`}
                        >
                          <Check size={11} strokeWidth={reqs.length ? 3 : 2} className={reqs.length ? "text-emerald-600" : "text-slate-300"} /> 8+ characters
                        </span>
                        <span
                          className={`flex items-center gap-1 ${
                            reqs.uppercase ? "text-emerald-700 font-semibold" : "text-slate-400"
                          }`}
                        >
                          <Check size={11} strokeWidth={reqs.uppercase ? 3 : 2} className={reqs.uppercase ? "text-emerald-600" : "text-slate-300"} /> 1 uppercase
                        </span>
                        <span
                          className={`flex items-center gap-1 ${
                            reqs.number ? "text-emerald-700 font-semibold" : "text-slate-400"
                          }`}
                        >
                          <Check size={11} strokeWidth={reqs.number ? 3 : 2} className={reqs.number ? "text-emerald-600" : "text-slate-300"} /> 1 number
                        </span>
                        <span
                          className={`flex items-center gap-1 ${
                            reqs.special ? "text-emerald-700 font-semibold" : "text-slate-400"
                          }`}
                        >
                          <Check size={11} strokeWidth={reqs.special ? 3 : 2} className={reqs.special ? "text-emerald-600" : "text-slate-300"} /> 1 special symbol
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Confirm password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                      }}
                      placeholder="Repeat your password"
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50/70 border ${
                        errors.confirmPassword
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                          : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/15"
                      } text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-2 transition-all shadow-2xs`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-rose-500 pl-1 font-medium">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms and Policy Checkbox */}
                <div className="pt-0.5">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => {
                        setTerms(e.target.checked);
                        if (errors.terms) setErrors({ ...errors, terms: "" });
                      }}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer accent-indigo-600"
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="#" className="text-indigo-600 hover:text-indigo-700 underline font-semibold">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-indigo-600 hover:text-indigo-700 underline font-semibold">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-[11px] text-rose-500 pt-0.5 pl-1 font-medium">{errors.terms}</p>
                  )}
                </div>

                {/* Primary CTA Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-3 px-4 shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-1.5"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Creating workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Create account</span>
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </form>

              {/* Footer Switch to Sign In */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 text-center text-xs text-slate-500">
                <span>Already have a WorkFlow account? </span>
                <Link
                  href={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
                  className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Global Minimal Footer */}
      <footer className="relative z-10 border-t border-slate-200/70 py-3.5 px-6 text-center text-[11px] text-slate-500 bg-white/60 backdrop-blur-xs">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} WorkFlow Technologies Inc. All rights reserved.</span>
          <div className="flex items-center gap-4 font-medium">
            <Link href="#" className="hover:text-slate-800 transition-colors">Security</Link>
            <Link href="#" className="hover:text-slate-800 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-800 transition-colors">System Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#FAFBFC] flex items-center justify-center text-slate-400">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

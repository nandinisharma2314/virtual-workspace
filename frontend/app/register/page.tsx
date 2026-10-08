"use client";

import { useState, useEffect, Suspense, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Check, TrendingUp, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/apis";

function RegisterForm() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

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
        return { label: "Good", color: "bg-purple-500", text: "text-purple-600" };
      case 4:
        return { label: "Strong & Secure", color: "bg-emerald-500", text: "text-emerald-600" };
      default:
        return { label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
    }
  };

  const strengthMeta = getStrengthMeta();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      setIsLoading(true);
      try {
        const inviteParam = searchParams.get("token") || searchParams.get("invite");
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: fullName, email, password, inviteToken: inviteParam || undefined }),
        });

        if (res.ok) {
          const data = await res.json();
          document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
          localStorage.setItem("token", data.access_token);
          if (data.activeWorkspaceId) {
            document.cookie = `active_workspace_id=${data.activeWorkspaceId}; path=/; max-age=86400; SameSite=Lax`;
            localStorage.setItem("active_workspace_id", String(data.activeWorkspaceId));
          }
          window.location.href = "/";
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
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full font-sans bg-[#F4F6FB] text-slate-900 flex items-center justify-center p-4 sm:p-6 md:p-8 relative selection:bg-purple-600 selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        .font-sans {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes float-hero {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.4deg); }
        }
        .animate-float-hero {
          animation: float-hero 6s ease-in-out infinite;
        }

        @keyframes float-badge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .animate-float-badge {
          animation: float-badge 5s ease-in-out infinite;
        }

        @keyframes float-badge-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(7px); }
        }
        .animate-float-badge-delayed {
          animation: float-badge-delayed 5.5s ease-in-out 1s infinite;
        }

        @keyframes bar-pulse-1 {
          0%, 100% { height: 30%; }
          50% { height: 95%; }
        }
        @keyframes bar-pulse-2 {
          0%, 100% { height: 80%; }
          50% { height: 25%; }
        }
        @keyframes bar-pulse-3 {
          0%, 100% { height: 45%; }
          50% { height: 100%; }
        }
        @keyframes bar-pulse-4 {
          0%, 100% { height: 90%; }
          50% { height: 40%; }
        }
        @keyframes bar-pulse-5 {
          0%, 100% { height: 55%; }
          50% { height: 85%; }
        }

        .signup-card-shadow {
          box-shadow: 0 25px 70px -15px rgba(46, 16, 101, 0.12), 0 10px 30px -10px rgba(0, 0, 0, 0.04);
        }
      `}</style>

      {/* Main Unified Modal Card - Same layout orientation as Login (Showcase on Left, Form on Right) */}
      <div className="w-full max-w-[1040px] bg-white rounded-[2.5rem] signup-card-shadow overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/70 relative z-10 transition-all duration-300">
        
        {/* LEFT PANEL: White Background with Embedded Dark 3D Hero Showcase + Dynamic Animated Graphs & Metrics */}
        <div className="lg:col-span-6 bg-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative text-slate-900 min-h-[480px] lg:min-h-[660px]">
          
          {/* Top Header Text */}
          <div className="relative z-10">
            <div className="mb-4">
              <Link href="/" className="inline-flex items-center group">
                <Image
                  src="/nannex-horizontal.png"
                  alt="nannex"
                  width={170}
                  height={42}
                  className="h-9 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-300"
                  priority
                />
              </Link>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/60 text-purple-700 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span>Sprint Telemetry & Automation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[38px] font-extrabold text-slate-900 tracking-tight leading-[1.14]">
              Build faster with<br />
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
                intelligent workflows
              </span>
            </h1>
            <p className="mt-2.5 text-sm text-slate-500 font-normal">
              Automated sprints, live velocity graphs, and team orchestration.
            </p>
          </div>

          {/* Center: Hero Showcase Container with 3D Image & Layered Animated Graph Cards */}
          <div className="relative z-10 my-auto py-6 sm:py-8 flex items-center justify-center">
            
            {/* The Royal Purple Center Frame */}
            <div className="relative w-full max-w-[360px] sm:max-w-[390px] aspect-square rounded-3xl bg-gradient-to-br from-[#581c87] via-[#3b0764] to-[#2e1065] shadow-2xl shadow-purple-900/30 flex items-center justify-center p-3.5 border border-purple-500/25 group">
              
              {/* Internal Ambient Glows */}
              <div className="absolute -top-14 -left-14 w-48 h-48 rounded-full bg-purple-400/25 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-14 -right-14 w-48 h-48 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />

              {/* 3D Dashboard Mockup Centerpiece */}
              <div className="relative w-full h-full flex items-center justify-center animate-float-hero">
                <Image
                  src="/login-dashboard-preview.png"
                  alt="WorkFlow 3D Telemetry Dashboard"
                  width={560}
                  height={560}
                  className="w-full h-full object-cover rounded-2xl transform group-hover:scale-[1.02] transition-transform duration-500 drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)]"
                  priority
                />
              </div>

              {/* FLOATING ANIMATED GRAPH 1: Live Sprint Velocity Card (Top-Right) */}
              <div className="absolute -top-5 -right-3 sm:-right-5 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-purple-950/20 border border-purple-100/90 animate-float-badge w-[185px] sm:w-[195px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Velocity</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <TrendingUp className="w-2.5 h-2.5" /> +42.8%
                  </span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 leading-tight mb-2">
                  94.2 pts <span className="text-[10px] font-normal text-slate-400">/ sprint</span>
                </div>
                
                {/* Dynamic SVG Animated Area Chart */}
                <svg viewBox="0 0 160 38" className="w-full h-8 overflow-visible">
                  <defs>
                    <linearGradient id="velocityAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.38" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="velocityLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="60%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 30 C 25 32, 45 16, 75 20 C 105 24, 125 7, 160 4"
                    fill="none"
                    stroke="url(#velocityLineGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 30 C 25 32, 45 16, 75 20 C 105 24, 125 7, 160 4 L 160 38 L 0 38 Z"
                    fill="url(#velocityAreaGrad)"
                  />
                  {/* Glowing Pulse Dot at Current Peak */}
                  <circle cx="160" cy="4" r="5" fill="#06b6d4" className="animate-ping opacity-75" />
                  <circle cx="160" cy="4" r="3" fill="#06b6d4" />
                </svg>
              </div>

              {/* FLOATING ANIMATED GRAPH 2: Automations & Realtime Telemetry Card (Bottom-Left) */}
              <div className="absolute -bottom-5 -left-3 sm:-left-5 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-purple-950/20 border border-purple-100/90 animate-float-badge-delayed flex items-center gap-3 w-[205px] sm:w-[215px]">
                {/* Circular Progress Gauge */}
                <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-600"
                      strokeDasharray="94, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-purple-700">94%</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-800 truncate">Automations Active</div>
                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>1,420 runs today</span>
                  </div>
                  
                  {/* Realtime Animated Equalizer Activity Bars */}
                  <div className="flex items-end gap-1 h-3 mt-1.5">
                    <span className="w-1 rounded-full bg-purple-600 animate-[bar-pulse-1_1.2s_ease-in-out_infinite]" />
                    <span className="w-1 rounded-full bg-indigo-500 animate-[bar-pulse-2_1.5s_ease-in-out_infinite]" />
                    <span className="w-1 rounded-full bg-purple-400 animate-[bar-pulse-3_1.1s_ease-in-out_infinite]" />
                    <span className="w-1 rounded-full bg-cyan-400 animate-[bar-pulse-4_1.4s_ease-in-out_infinite]" />
                    <span className="w-1 rounded-full bg-emerald-400 animate-[bar-pulse-5_1.3s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Subtle Bottom Accent Indicator */}
          <div className="relative z-10 hidden lg:flex items-center justify-between text-xs text-slate-500 font-medium pt-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Encrypted cloud workstation</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>SOC2 Type II Certified</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Crisp White Interactive Sign-Up Form Area */}
        <div className="lg:col-span-6 bg-white p-8 sm:p-11 lg:p-12 flex flex-col justify-center relative">
          <div className="w-full max-w-[390px] mx-auto">
            
            {/* Header Titles */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
                Create your account
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-normal">
                Join thousands of teams shipping faster.
              </p>
            </div>

            {/* Error Notification */}
            {errors.api && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/70 text-red-600 text-xs font-medium flex items-center gap-2.5 mb-5 shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.api}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: "" });
                    }}
                    placeholder="Alex Morgan"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border ${
                      errors.fullName ? "border-rose-400" : "border-slate-200/90"
                    } rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-sm`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-rose-500 pl-1 font-medium">{errors.fullName}</p>
                )}
              </div>

              {/* Work Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                  Work Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    placeholder="alex@company.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border ${
                      errors.email ? "border-rose-400" : "border-slate-200/90"
                    } rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-sm`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 pl-1 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/60 border ${
                      errors.password ? "border-rose-400" : "border-slate-200/90"
                    } rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 pl-1 font-medium">{errors.password}</p>
                )}

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Strength:</span>
                      <span className={`font-semibold ${strengthMeta.text}`}>
                        {strengthMeta.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            strengthScore >= step ? strengthMeta.color : "bg-slate-100"
                          }`}
                        />
                      ))}
                    </div>
                    {/* Micro requirement indicators */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px] text-slate-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Check className={`w-3 h-3 ${reqs.length ? "text-emerald-500" : "text-slate-300"}`} />
                        <span>8+ characters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check className={`w-3 h-3 ${reqs.uppercase ? "text-emerald-500" : "text-slate-300"}`} />
                        <span>1 uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check className={`w-3 h-3 ${reqs.number ? "text-emerald-500" : "text-slate-300"}`} />
                        <span>1 number</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check className={`w-3 h-3 ${reqs.special ? "text-emerald-500" : "text-slate-300"}`} />
                        <span>1 special symbol</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                    }}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/60 border ${
                      errors.confirmPassword ? "border-rose-400" : "border-slate-200/90"
                    } rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-500 pl-1 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => {
                      setTerms(e.target.checked);
                      if (errors.terms) setErrors({ ...errors, terms: "" });
                    }}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer accent-purple-600"
                  />
                  <span className="text-xs font-medium text-slate-600">
                    I agree to the{" "}
                    <Link href="#" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-[11px] text-rose-500 pt-0.5 pl-1 font-medium">{errors.terms}</p>
                )}
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
              >
                <span>{isLoading ? "Creating account..." : "Create account"}</span>
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-5 mb-4 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <span className="relative px-3 bg-white text-xs text-slate-400 font-medium">
                or continue with
              </span>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => alert("Google SSO is configured via workspace domain authentication in the admin panel.")}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => alert("GitHub SSO is configured via workspace domain authentication in the admin panel.")}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0 fill-slate-900" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Sign in prompt footer */}
            <div className="mt-6 text-center">
              <span className="text-xs text-slate-500 font-normal">
                Already have an account?{" "}
                <Link
                  href={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                  className="font-bold text-slate-900 hover:text-purple-600 transition-colors"
                >
                  Sign in
                </Link>
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center font-sans text-slate-500 text-sm">
        Loading...
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

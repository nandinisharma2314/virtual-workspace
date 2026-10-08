"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail, ArrowLeft, ArrowRight, ShieldCheck,
  CheckCircle2, AlertCircle, RefreshCw, Check, Info, Send
} from "lucide-react";
import { API_URL } from "@/lib/apis";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'info' } | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsLoading(true);
      fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then((res) => res.json())
        .then(() => {
          setIsLoading(false);
          setIsSent(true);
          setToast({ title: 'Reset Link Sent!', message: `Check your inbox at ${email}`, type: 'success' });
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
          setToast({ title: 'Error', message: 'Something went wrong. Please try again.', type: 'info' });
        });
    }
  };

  const handleResend = () => {
    setIsResending(true);
    fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then(() => {
        setIsResending(false);
        setToast({ title: 'Email Resent', message: 'A new recovery link has been dispatched.', type: 'success' });
      })
      .catch((err) => {
        console.error(err);
        setIsResending(false);
        setToast({ title: 'Error', message: 'Failed to resend email.', type: 'info' });
      });
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

        .login-card-shadow {
          box-shadow: 0 25px 70px -15px rgba(46, 16, 101, 0.12), 0 10px 30px -10px rgba(0, 0, 0, 0.04);
        }
      `}</style>

      {/* Main Unified Modal Card */}
      <div className="w-full max-w-[1040px] bg-white rounded-[2.5rem] login-card-shadow overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/70 relative z-10 transition-all duration-300">
        
        {/* LEFT PANEL: Visual Recovery Showcase */}
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
              <span>Identity Verification · 256-Bit SSL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[38px] font-extrabold text-slate-900 tracking-tight leading-[1.14]">
              Recover your<br />
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
                account access
              </span>
            </h1>
            <p className="mt-2.5 text-sm text-slate-500 font-normal">
              We'll dispatch a secure recovery link straight to your verified work email address.
            </p>
          </div>

          {/* Center: 3D Illustration Graphic in Frosted Frame */}
          <div className="relative z-10 my-auto py-6 sm:py-8 flex items-center justify-center">
            
            {/* The Framed Container */}
            <div className="relative w-full max-w-[360px] sm:max-w-[390px] aspect-square rounded-3xl bg-gradient-to-br from-[#f1f3f9] via-[#edf0f7] to-[#e4e7f2] shadow-2xl shadow-purple-900/10 flex items-center justify-center p-3.5 border border-slate-200/80 group">
              
              {/* Internal Ambient Glows */}
              <div className="absolute -top-14 -left-14 w-48 h-48 rounded-full bg-purple-300/30 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-14 -right-14 w-48 h-48 rounded-full bg-indigo-300/30 blur-3xl pointer-events-none" />

              {/* 3D Envelope Centerpiece */}
              <div className="relative w-full h-full flex items-center justify-center animate-float-hero">
                <Image
                  src="/envelope-illustration.png"
                  alt="Recovery Mail"
                  width={560}
                  height={560}
                  className="w-full h-full object-contain rounded-2xl transform group-hover:scale-[1.02] transition-transform duration-500 drop-shadow-[0_15px_30px_rgba(88,28,135,0.18)]"
                  priority
                />
              </div>

              {/* FLOATING BADGE 1: Dispatch Speed (Top-Right) */}
              <div className="absolute -top-5 -right-3 sm:-right-5 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-purple-950/15 border border-purple-100/90 animate-float-badge w-[185px] sm:w-[195px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <Send className="w-2.5 h-2.5" /> Instant Delivery
                  </span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 leading-tight mb-1">
                  Latency &lt; 400ms
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Time-limited one-time token</span>
                </div>
              </div>

              {/* FLOATING BADGE 2: Realtime Equalizer (Bottom-Left) */}
              <div className="absolute -bottom-5 -left-3 sm:-left-5 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-purple-950/15 border border-purple-100/90 animate-float-badge-delayed flex items-center gap-3 w-[205px] sm:w-[215px]">
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
                      strokeDasharray="100, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <Mail className="w-4 h-4 text-purple-700 absolute" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-800 truncate">Mail Delivery Engine</div>
                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>SPF / DKIM / DMARC OK</span>
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

          {/* Bottom Accent Footer */}
          <div className="relative z-10 hidden lg:flex items-center justify-between text-xs text-slate-500 font-medium pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>SOC2 Type II Certified</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Crisp White Form Area */}
        <div className="lg:col-span-6 bg-white p-8 sm:p-11 lg:p-12 flex flex-col justify-center relative">
          <div className="w-full max-w-[390px] mx-auto">
            
            {!isSent ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
                    Forgot password?
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-normal">
                    Enter your work email and we'll dispatch an instant reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
                  >
                    <span>{isLoading ? "Sending link..." : "Send reset link"}</span>
                    {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
                    Check your inbox
                  </h2>
                  <p className="text-sm text-slate-500 font-normal">
                    We sent a recovery link to:
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/60 text-purple-900 font-semibold text-xs sm:text-sm text-center truncate">
                  {email}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Didn't receive the email? Check your spam folder or wait a moment before requesting another.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleResend}
                    disabled={isResending}
                    className="w-full py-3 px-6 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-purple-700 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    <span>{isResending ? "Resending..." : "Resend email"}</span>
                  </button>

                  <div className="text-center">
                    <button
                      onClick={() => setIsSent(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Enter a different email
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/10 ${toast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${toast?.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'}`}>
          {toast?.type === 'success' ? <Check className="w-4 h-4" /> : <Info className="w-4 h-4" />}
        </div>
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">{toast?.title}</h5>
          <p className="text-xs font-medium text-white">{toast?.message}</p>
        </div>
      </div>
    </div>
  );
}

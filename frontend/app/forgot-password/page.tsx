"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { API_URL } from "@/lib/apis";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("email") || "nandinipandit94@gmail.com";
    }
    return "nandinipandit94@gmail.com";
  });

  const [sentEmail, setSentEmail] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("email") || "nandinipandit94@gmail.com";
    }
    return "nandinipandit94@gmail.com";
  });

  const [state, setState] = useState<"forgot" | "sent">("forgot");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [toast, setToast] = useState<{
    title: string;
    message: string;
    type: "success" | "info";
  } | null>(null);

  useEffect(() => {
    document.title = "nannex — Password Recovery";
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (title: string, message: string, type: "success" | "info" = "success") => {
    setToast({ title, message, type });
  };

  const switchState = (newState: "forgot" | "sent") => {
    setState(newState);
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSentEmail(email);
    setIsLoading(true);

    try {
      await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.warn("Forgot password request:", err);
    } finally {
      setIsLoading(false);
      showToast("Reset Link Sent!", `Check your inbox at ${email}`, "success");
      setState("sent");
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentEmail || email }),
      });
    } catch (err) {
      console.warn("Resend request:", err);
    } finally {
      setIsResending(false);
      showToast("Email Resent Successfully", "A new secure recovery link has been sent.", "success");
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans bg-white text-slate-900 selection:bg-purple-600 selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* External CSS Dependencies */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        .font-sans {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .unified-card {
          background: #ffffff;
          box-shadow: 0 30px 60px -12px rgba(88, 28, 135, 0.08), 0 18px 36px -18px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(226, 232, 240, 0.85);
        }

        .input-glow:focus {
          box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.15);
        }

        .purple-hero-box {
          background: linear-gradient(145deg, #581c87 0%, #3b0764 60%, #2e1065 100%);
          box-shadow: 0 20px 40px -10px rgba(88, 28, 135, 0.3);
        }

        @keyframes floatAnim {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
        }
        .animate-float {
          animation: floatAnim 6s ease-in-out infinite;
        }

        @keyframes pulseGlowAnim {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.04); }
        }
        .animate-pulse-glow {
          animation: pulseGlowAnim 4s ease-in-out infinite;
        }

        @keyframes spinSlowAnim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlowAnim 20s linear infinite;
        }
      `}</style>

      {/* Background ambient lighting and radial grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-white">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-100/60 blur-[100px] animate-pulse-glow" />
        <div
          className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-indigo-100/50 blur-[120px] animate-pulse-glow"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:32px_32px] opacity-70" />
      </div>

      <main className="relative z-10 min-h-screen flex flex-col justify-between items-center p-4 sm:p-6 md:p-8">
        {/* Navigation Header */}
        <header className="w-full max-w-5xl flex items-center justify-between gap-4 py-2">
          {/* Brand Logo */}
          <Link href="/login" className="inline-flex items-center group cursor-pointer">
            <Image
              src="/nannex-horizontal.png"
              alt="nannex — Chat / Meet / Connect"
              width={160}
              height={38}
              className="h-8 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-300 drop-shadow-sm"
              priority
            />
          </Link>

          {/* State Switcher Bar */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-sm">
            <button
              type="button"
              onClick={() => switchState("forgot")}
              id="tab-forgot"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${state === "forgot"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "text-slate-500 hover:text-slate-800 font-medium"
                }`}
            >
              <i className="fa-solid fa-key mr-2" />
              Forgot Password
            </button>
            <button
              type="button"
              onClick={() => switchState("sent")}
              id="tab-sent"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all duration-300 cursor-pointer ${state === "sent"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 font-semibold"
                : "text-slate-500 hover:text-slate-800 font-medium"
                }`}
            >
              <i className="fa-solid fa-paper-plane mr-2" />
              Link Sent State
            </button>
          </div>

          {/* Header Quick Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 text-xs font-semibold">
              <i className="fa-solid fa-shield-halved mr-1.5 text-purple-600" /> Secure Portal
            </span>
          </div>
        </header>

        {/* Central Card */}
        <div className="w-full max-w-5xl unified-card rounded-3xl p-6 sm:p-10 md:p-12 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center transition-all duration-500">

          {/* LEFT HALF: Embedded Floating Purple Module */}
          <div className="lg:col-span-5 purple-hero-box rounded-3xl p-7 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden group min-h-[460px] lg:min-h-[500px]">
            {/* Background ambient lights inside container */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-purple-400/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-indigo-500/25 rounded-full blur-2xl pointer-events-none" />

            {/* Top badge tag */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200 tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Enterprise Security
              </div>
            </div>

            {/* Center 3D Illustration Graphic */}
            <div className="relative z-10 my-6 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center animate-float">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-purple-500/30 to-indigo-500/30 blur-2xl animate-spin-slow" />

                {/* Glass container box for icon */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                  <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-purple-400/15 to-transparent opacity-60" />
                  <div className="relative text-5xl sm:text-6xl bg-gradient-to-tr from-purple-200 via-indigo-100 to-white bg-clip-text text-transparent transform group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(168,85,247,0.4)]">
                    <i
                      id="panel-icon"
                      className={
                        state === "forgot"
                          ? "fa-solid fa-shield-halved"
                          : "fa-solid fa-paper-plane"
                      }
                    />
                  </div>

                  {/* Floating mini badges */}
                  <div className="absolute -top-2.5 -right-2.5 w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/50 text-xs animate-bounce">
                    <i className="fa-solid fa-lock" />
                  </div>
                  <div className="absolute -bottom-2.5 -left-2.5 w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/50 text-xs animate-pulse">
                    <i className="fa-solid fa-key" />
                  </div>
                </div>
              </div>

              {/* Dynamic helper text below graphic */}
              <h3 id="panel-title" className="text-lg font-bold text-white mt-4 text-center tracking-tight">
                {state === "forgot" ? "Secure Account Recovery" : "Reset Link Dispatched"}
              </h3>
              <p
                id="panel-desc"
                className="text-xs sm:text-sm text-purple-200/80 text-center mt-1.5 max-w-xs leading-relaxed"
              >
                {state === "forgot"
                  ? "We use military-grade encryption to ensure your workspace credentials remain entirely safe and confidential."
                  : "Your encrypted reset link has been successfully generated and transmitted to your inbox."}
              </p>
            </div>

            {/* Footer tagline */}
            <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-purple-200/70 font-medium">
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-shield-check text-purple-400" /> End-to-end encrypted
              </span>
              <span>v4.8 enterprise</span>
            </div>
          </div>

          {/* RIGHT HALF: Interactive Light Form Area */}
          <div className="lg:col-span-7 flex flex-col justify-center relative bg-white px-2 sm:px-4">

            {/* VIEW 1: FORGOT PASSWORD FORM */}
            {state === "forgot" && (
              <div id="view-forgot" className="space-y-6 transition-all duration-300">
                <div className="space-y-2">

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    Forgot your password?
                  </h1>
                  <p className="text-sm text-slate-600">
                    No worries! Enter your work email address below and we&apos;ll dispatch a secure recovery link instantly.
                  </p>
                </div>

                <form id="forgot-form" onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <i className="fa-solid fa-envelope" />
                      </div>
                      <input
                        type="email"
                        id="recovery-email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-purple-600 input-glow transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="submit-btn"
                    disabled={isLoading}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-semibold text-sm shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {!isLoading ? (
                      <>
                        <span id="btn-text">Send Reset Instructions</span>
                        <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <div id="btn-spinner" className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                  </button>
                </form>

                {/* Back to sign in link */}
                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <i className="fa-solid fa-arrow-left text-xs" /> Back to sign in
                  </Link>
                </div>
              </div>
            )}

            {/* VIEW 2: RESET LINK SENT STATE */}
            {state === "sent" && (
              <div id="view-sent" className="space-y-6 transition-all duration-300">
                <div className="space-y-2 text-center sm:text-left">

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    Reset link sent!
                  </h1>
                  <p className="text-sm text-slate-600">
                    We&apos;ve sent a secure password reset link to:
                  </p>
                </div>

                {/* Email badge container */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-at" />
                    </div>
                    <span id="sent-email-display" className="font-semibold text-purple-900 text-sm truncate">
                      {sentEmail || email}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold shrink-0">
                    <i className="fa-solid fa-circle-check" /> Sent
                  </span>
                </div>

                {/* Spam folder warning box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                  <div className="text-amber-500 mt-0.5 text-lg">
                    <i className="fa-solid fa-circle-exclamation" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Didn&apos;t receive the email?
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Check your spam folder or try again in a few moments.
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    id="resend-btn"
                    disabled={isResending}
                    className="w-full py-4 px-6 rounded-2xl border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm group cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <i
                      id="resend-icon"
                      className={`fa-solid fa-rotate-right ${isResending ? "fa-spin" : "group-hover:rotate-180 transition-transform duration-500"
                        }`}
                    />
                    <span id="resend-text">{isResending ? "Resending..." : "Resend email"}</span>
                  </button>

                  <div className="text-center pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors"
                    >
                      <i className="fa-solid fa-arrow-left text-xs" /> Back to sign in
                    </Link>
                    <button
                      type="button"
                      onClick={() => switchState("forgot")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors cursor-pointer"
                    >
                      Enter a different email
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer copyright */}
        <footer className="mt-6 text-center text-xs text-slate-400 font-medium py-2">
          &copy; 2026 nannex Inc. Secure Authentication Gateway. All rights reserved.
        </footer>
      </main>

      {/* Toast Notification */}
      <div
        id="toast"
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/10 ${toast ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
          }`}
      >
        <div
          id="toast-icon"
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${toast?.type === "success"
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-purple-500/20 text-purple-400"
            }`}
        >
          <i className={toast?.type === "success" ? "fa-solid fa-check" : "fa-solid fa-info"} />
        </div>
        <div>
          <h5 id="toast-title" className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {toast?.title}
          </h5>
          <p id="toast-msg" className="text-sm font-medium text-white">
            {toast?.message}
          </p>
        </div>
      </div>
    </div>
  );
}

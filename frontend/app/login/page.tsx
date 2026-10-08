"use client";

import { useState, useEffect, Suspense, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/apis";

function LoginForm() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ api?: string }>({});

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        setIsLoading(false);
        if (res.ok) {
          const data = await res.json();
          document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
          localStorage.setItem("token", data.access_token);
          if (data.activeWorkspaceId) {
            document.cookie = `active_workspace_id=${data.activeWorkspaceId}; path=/; max-age=86400; SameSite=Lax`;
            localStorage.setItem("active_workspace_id", String(data.activeWorkspaceId));
          }

          const inviteToken = searchParams.get("invite");
          if (inviteToken) {
            try {
              const inviteRes = await fetch(`${API_URL}/workspaces/invites/accept`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${data.access_token}`,
                },
                body: JSON.stringify({ token: inviteToken }),
              });
              if (inviteRes.ok) {
                const inviteData = await inviteRes.json();
                if (inviteData.workspaceId) {
                  document.cookie = `active_workspace_id=${inviteData.workspaceId}; path=/; max-age=86400; SameSite=Lax`;
                  localStorage.setItem("active_workspace_id", String(inviteData.workspaceId));
                }
              }
            } catch (err) {
              console.error("Auto accept invite failed", err);
            }
          }

          window.location.href = "/";
        } else {
          const errorData = await res.json();
          setErrors({ api: errorData.message || "Login failed" });
        }
      })
      .catch(() => {
        setIsLoading(false);
        setErrors({ api: "Network error. Please try again." });
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

        .login-card-shadow {
          box-shadow: 0 25px 70px -15px rgba(46, 16, 101, 0.12), 0 10px 30px -10px rgba(0, 0, 0, 0.04);
        }
      `}</style>

      {/* Main Unified Modal Card */}
      <div className="w-full max-w-[1020px] bg-white rounded-[2.5rem] login-card-shadow overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/70 relative z-10 transition-all duration-300">
        
        {/* LEFT PANEL: White Background with Embedded Dark 3D Hero Square */}
        <div className="lg:col-span-6 bg-white p-8 sm:p-11 lg:p-12 flex flex-col justify-between relative text-slate-900 min-h-[460px] lg:min-h-[620px]">
          
          {/* Top Header Text */}
          <div className="relative z-10">
            <div className="mb-4">
              <Link href="/" className="inline-flex items-center group">
                <Image
                  src="/nannex-horizontal.png"
                  alt="nannex"
                  width={130}
                  height={30}
                  className="h-7 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-300"
                  priority
                />
              </Link>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Welcome back to<br />
              <span className="text-slate-900">nannex</span>
            </h1>
            <p className="mt-3 text-sm text-slate-500 font-normal tracking-wide">
              Chat. Meet. Connect.
            </p>
          </div>

          {/* Center: Square Container that Contains the Image (Rich Royal Purple Hero Box) */}
          <div className="relative z-10 my-auto py-4 flex items-center justify-center">
            <div className="relative w-full max-w-[370px] sm:max-w-[400px] aspect-square rounded-3xl bg-gradient-to-br from-[#581c87] via-[#3b0764] to-[#2e1065] shadow-2xl shadow-purple-900/30 overflow-hidden flex items-center justify-center p-3.5 border border-purple-500/20 group">
              {/* Internal Ambient Glows */}
              <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-purple-400/25 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />

              <div className="relative w-full h-full flex items-center justify-center animate-float-hero">
                <Image
                  src="/login-dashboard-preview.png"
                  alt="WorkFlow 3D Dashboard"
                  width={560}
                  height={560}
                  className="w-full h-full object-cover rounded-2xl transform group-hover:scale-[1.03] transition-transform duration-500 drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Subtle Bottom Accent Indicator */}
          <div className="relative z-10 hidden lg:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Encrypted cloud workstation</span>
          </div>
        </div>

        {/* RIGHT PANEL: Crisp White Interactive Form Area */}
        <div className="lg:col-span-6 bg-white p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative">
          <div className="w-full max-w-[390px] mx-auto">
            
            {/* Header Titles */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
                Sign in to nannex
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-normal">
                Access your secure workspace.
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
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                  Work email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nandinipandit94@gmail.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#F8F9FD] border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-3.5 rounded-2xl bg-[#F8F9FD] border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox & Forgot Password */}
              <div className="flex items-center justify-between pt-1 pb-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer accent-purple-600"
                  />
                  <span className="text-xs font-medium text-slate-600">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-semibold text-sm shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                <span>{isLoading ? "Signing in..." : "Sign In"}</span>
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-5 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <span className="relative px-3 bg-white text-xs text-slate-400 font-medium">
                or continue with
              </span>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => alert("Google SSO is configured via workspace domain authentication in the admin panel.")}
                className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300"
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
                onClick={() => alert("Microsoft SSO is configured via workspace domain authentication in the admin panel.")}
                className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                  <path d="M10 0H0v10h10V0z" fill="#f25022"/>
                  <path d="M21 0H11v10h10V0z" fill="#7fba00"/>
                  <path d="M10 11H0v10h10V11z" fill="#00a4ef"/>
                  <path d="M21 11H11v10h10V11z" fill="#ffb900"/>
                </svg>
                <span>Microsoft</span>
              </button>
            </div>

            {/* Sign up prompt footer */}
            <div className="mt-8 text-center">
              <span className="text-xs text-slate-500 font-normal">
                Don't have an account?{" "}
                <Link
                  href={`/register${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                  className="font-bold text-slate-900 hover:text-purple-600 transition-colors"
                >
                  Sign up
                </Link>
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center font-sans text-slate-500 text-sm">
        Loading...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

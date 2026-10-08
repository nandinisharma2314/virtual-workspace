"use client";

import { useState, Suspense, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { API_URL } from "@/lib/apis";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Strength score based on requirements
  const reqs = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = reqs.filter(Boolean).length;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("No reset token found in URL. Please request a new link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setError("Network error occurred. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full font-sans bg-[#F4F6FB] text-slate-900 flex items-center justify-center p-4 sm:p-6 md:p-10 relative selection:bg-purple-600 selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        .font-sans {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes float-hero {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(0.3deg); }
        }
        .animate-float-hero {
          animation: float-hero 6s ease-in-out infinite;
        }

        .card-elevation-shadow {
          box-shadow: 0 25px 70px -15px rgba(0, 0, 0, 0.06), 0 10px 30px -10px rgba(0, 0, 0, 0.03);
        }
      `}</style>

      {/* Main Wide Card - Matching Mockup */}
      <div className="w-full max-w-[1120px] bg-white rounded-3xl sm:rounded-[36px] card-elevation-shadow border border-slate-100 p-8 sm:p-12 lg:p-14 relative z-10 transition-all duration-300">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-8">
          
          {/* LEFT COLUMN: Logo, Headline, and Subtitle */}
          <div className="lg:col-span-4 flex flex-col justify-between self-stretch">
            <div>
              {/* Brand Logo */}
              <div className="mb-10 sm:mb-14">
                <Link href="/" className="inline-flex items-center gap-2.5 group">
                  <Image
                    src="/nannex-horizontal.png"
                    alt="nannex"
                    width={180}
                    height={46}
                    className="h-10 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-300"
                    priority
                  />
                </Link>
              </div>

              {/* Header Title */}
              <h1 className="text-3xl sm:text-[38px] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Create new<br />password
              </h1>
              
              {/* Subtitle */}
              <p className="mt-3 text-sm text-slate-500 font-normal leading-relaxed max-w-[270px]">
                Secure your account with a strong password.
              </p>
            </div>

            {/* Empty space for bottom alignment on desktop */}
            <div className="hidden lg:block"></div>
          </div>

          {/* CENTER COLUMN: 3D Shield Illustration */}
          <div className="lg:col-span-4 flex items-center justify-center py-2 sm:py-4">
            <div className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-square flex items-center justify-center animate-float-hero">
              <Image
                src="/shield-illustration.png"
                alt="Security Shield"
                width={560}
                height={560}
                className="w-full h-full object-contain mix-blend-multiply drop-shadow-[0_20px_35px_rgba(124,58,237,0.12)]"
                priority
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Password Form */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="w-full max-w-[370px] mx-auto lg:ml-auto lg:mr-0">

              {isSuccess ? (
                <div className="text-center py-6 space-y-4 animate-in fade-in duration-500">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Password Reset!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Your password has been successfully updated. Redirecting to sign in...
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center w-full py-3 px-6 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all"
                    >
                      Sign in now
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Error Notification */}
                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-600 text-xs font-medium flex items-center gap-2 shadow-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      New password
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
                          if (error) setError("");
                        }}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* 3-Tier Password Strength Bars Matching Mockup */}
                    <div className="grid grid-cols-3 gap-2 pt-1.5">
                      {/* Bar 1: Red */}
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          score >= 1 ? "bg-[#EF4444]" : "bg-slate-200"
                        }`}
                      />
                      {/* Bar 2: Orange/Amber */}
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          score >= 2 ? "bg-[#F59E0B]" : "bg-slate-200"
                        }`}
                      />
                      {/* Bar 3: Green */}
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          score >= 3 ? "bg-[#10B981]" : "bg-slate-200"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5 pt-0.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      Confirm new password
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
                          if (error) setError("");
                        }}
                        placeholder="Confirm new password"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Security Advice Callout Box Matching Mockup */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <Shield className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] sm:text-xs text-slate-600 font-normal leading-relaxed">
                      Use a strong password (min. 12 chars, mix of upper, lower, special, numbers).
                    </p>
                  </div>

                  {/* Submit Button Matching Mockup */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-6 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-600/20 hover:shadow-purple-600/35 hover:scale-[1.005] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>{isLoading ? "Resetting password..." : "Reset password"}</span>
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                  </button>

                  {/* Back to sign in link Centered Below Button */}
                  <div className="pt-2 text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <span>&larr;</span> Back to sign in
                    </Link>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center font-sans text-slate-500 text-sm">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

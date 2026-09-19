"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
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
  const [isSuccess, setIsSuccess] = useState(false);

  const reqs = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  
  const score = reqs.filter(Boolean).length;
  
  let strengthText = "Weak";
  let textColor = "text-red-500";
  if (score === 0) {
    strengthText = "None";
    textColor = "text-gray-400";
  } else if (score === 1 || score === 2) {
    strengthText = "Weak";
    textColor = "text-red-500";
  } else if (score === 3) {
    strengthText = "Good";
    textColor = "text-amber-500";
  } else if (score === 4) {
    strengthText = "Strong";
    textColor = "text-[#22C55E]";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("No reset token found in URL.");
      return;
    }

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
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("Network error occurred.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#F8F9FB] px-16 py-12 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L11 22L15.5 10H19.5L24 22L28 10H24L21.5 17L17.5 7H13.5L9.5 17L7 10Z" fill="#5D5FEF"/>
            </svg>
            <span className="text-[22px] font-bold text-gray-900 tracking-tight">WorkFlow</span>
          </div>

          <h1 className="text-[44px] font-bold text-gray-900 tracking-tight leading-tight mb-4">
            Create new<br/>password
          </h1>
          <p className="text-gray-500 text-[16px] max-w-[280px] leading-relaxed mb-12">
            Choose a strong password to secure your account.
          </p>

          <div className="w-full max-w-[400px] mx-auto my-8 relative flex justify-center">
             <Image 
               src="/shield-illustration.png" 
               alt="Shield Illustration" 
               width={500} 
               height={500} 
               className="w-full h-auto object-contain mix-blend-darken scale-110"
               priority
             />
          </div>
        </div>

        <div>
          <Link href="/login" className="inline-flex items-center text-[14px] font-semibold text-[#5D5FEF] hover:text-[#4a4cc7] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Back to sign in
          </Link>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-12 relative overflow-y-auto bg-white">
        <div className="w-full max-w-[420px] mx-auto">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L11 22L15.5 10H19.5L24 22L28 10H24L21.5 17L17.5 7H13.5L9.5 17L7 10Z" fill="#5D5FEF"/>
            </svg>
            <span className="text-[22px] font-bold text-gray-900 tracking-tight">WorkFlow</span>
          </div>

          {isSuccess ? (
            <div className="text-center py-10">
               <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-3">
                  Password Reset!
                </h2>
                <p className="text-gray-500 text-[15px] mb-4">
                  Your password has been successfully updated. Redirecting you to login...
                </p>
            </div>
          ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 text-[13px] p-3 rounded-xl">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-900">New password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5D5FEF] focus:border-[#5D5FEF] transition-colors text-[14px] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_white_inset]"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.5} /> : <Eye className="h-5 w-5" strokeWidth={1.5} />}
                </button>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-semibold text-gray-500">
                    Password strength: <span className={textColor}>{strengthText}</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i <= score ? 'bg-[#5D5FEF]' : 'bg-gray-200'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-900">Confirm new password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="block w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5D5FEF] focus:border-[#5D5FEF] transition-colors text-[14px] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_white_inset]"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.5} /> : <Eye className="h-5 w-5" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <div className="bg-[#F9F9FF] rounded-lg p-4 border border-[#F0F1FA] flex gap-3 text-left">
              <div className="mt-0.5 flex-shrink-0">
                <Shield className="w-5 h-5 text-[#5D5FEF]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[13px] text-gray-700 font-medium leading-relaxed">
                  Use a strong password that you don't use on other websites.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-[14px] font-semibold text-white bg-[#5D5FEF] hover:bg-[#4a4cc7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5D5FEF] transition-all mt-6"
            >
              Reset password
            </button>
          </form>
          )}

          <div className="w-full flex lg:hidden justify-start mt-8">
            <Link href="/login" className="inline-flex items-center text-[14px] font-semibold text-[#5D5FEF] hover:text-[#4a4cc7] transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2.5} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-[#5D5FEF] border-t-transparent rounded-full animate-spin"></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

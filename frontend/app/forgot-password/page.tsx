"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Send, ArrowLeft } from "lucide-react";
import { API_URL } from "@/lib/apis";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      .then(res => res.json())
      .then(() => setIsSent(true))
      .catch(console.error);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F3F4F6] font-sans items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl flex overflow-hidden min-h-[700px] border border-gray-100">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#F8F9FB] px-16 py-12 relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L11 22L15.5 10H19.5L24 22L28 10H24L21.5 17L17.5 7H13.5L9.5 17L7 10Z" fill="#5D5FEF" />
              </svg>
              <span className="text-[22px] font-bold text-gray-900 tracking-tight">WorkFlow</span>
            </div>

            <h1 className="text-[38px] font-bold text-gray-900 tracking-tight leading-tight mb-4">
              Forgot your password?
            </h1>

          </div>

          <div className="relative w-full max-w-[400px] mx-auto flex-1 flex items-center justify-center my-8">
            <Image
              src="/envelope-illustration.png"
              alt="Envelope Illustration"
              width={500}
              height={500}
              className="w-full h-auto object-contain mix-blend-darken scale-110"
              priority
            />
          </div>

          <div>
            <div className="h-[3px] w-5 bg-[#5D5FEF] mb-4 rounded-full"></div>
            <p className="text-[13px] text-gray-500 font-medium">
              Secure. Reliable. Built for teams.
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative bg-white">
          <div className="w-full max-w-[420px] mx-auto">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-2 mb-12 self-start">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L11 22L15.5 10H19.5L24 22L28 10H24L21.5 17L17.5 7H13.5L9.5 17L7 10Z" fill="#5D5FEF" />
              </svg>
              <span className="text-[22px] font-bold text-gray-900 tracking-tight">WorkFlow</span>
            </div>

            {!isSent ? (
              <div>
                <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">
                  Reset password
                </h2>
                <p className="text-gray-500 text-[15px] mb-10">
                  Enter the email associated with your account.
                </p>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-gray-900">Work email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                      </div>
                      <input
                        type="email"
                        className="block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5D5FEF] focus:border-[#5D5FEF] transition-colors text-[14px] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_white_inset]"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-[14px] font-semibold text-white bg-[#5D5FEF] hover:bg-[#4a4cc7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5D5FEF] transition-all mt-4"
                  >
                    Send reset link
                  </button>
                </form>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center text-center pt-8">
                <div className="w-20 h-20 rounded-full bg-[#F0F1FA] flex items-center justify-center mb-6">
                  <Send className="w-10 h-10 text-[#5D5FEF] ml-1 mb-1 transform rotate-45" strokeWidth={1.5} />
                </div>

                <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-3">
                  Reset link sent!
                </h2>

                <p className="text-gray-500 text-[15px] mb-4">
                  We've sent a password reset link to
                </p>

                <div className="inline-flex items-center px-6 py-2.5 rounded-full bg-[#F0F1FA] text-[#5D5FEF] font-semibold text-[14px] mb-10">
                  {email}
                </div>

                <div className="w-full bg-[#F8F9FB] rounded-xl p-4 flex gap-3 text-left mb-6 border border-gray-100">
                  <div className="mt-0.5">
                    <div className="w-5 h-5 rounded-full border border-[#5D5FEF] text-[#5D5FEF] flex items-center justify-center font-serif text-[12px] italic font-bold">i</div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-gray-900">Didn't receive the email?</h4>
                    <p className="text-[13px] text-gray-500 mt-0.5">Check your spam folder or try again.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="w-full flex justify-center py-3.5 px-4 border-2 border-[#5D5FEF] rounded-lg shadow-sm text-[14px] font-semibold text-[#5D5FEF] bg-white hover:bg-[#F8F9FB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5D5FEF] transition-all"
                >
                  Resend email
                </button>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Link href="/login" className="inline-flex items-center text-[14px] font-semibold text-[#5D5FEF] hover:text-[#4a4cc7] transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2.5} />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

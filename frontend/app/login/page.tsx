"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ api?: string }>({});

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    
    fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
          const redirectUrl = searchParams.get("invite") ? `/chat?${searchParams.toString()}` : "/";
          window.location.href = redirectUrl;
        } else {
          const errorData = await res.json();
          setErrors({ api: errorData.message || "Login failed" });
        }
      })
      .catch(() => {
        setErrors({ api: "Network error" });
      });
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F3F4F6] font-sans items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl flex overflow-hidden min-h-[700px] border border-gray-100">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#F8F9FB] px-16 py-12 relative">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L11 22L15.5 10H19.5L24 22L28 10H24L21.5 17L17.5 7H13.5L9.5 17L7 10Z" fill="#5D5FEF"/>
            </svg>
            <span className="text-[22px] font-bold text-gray-900 tracking-tight">WorkFlow</span>
          </div>

          <h1 className="text-[44px] font-bold text-gray-900 tracking-tight leading-tight mb-4">
            Welcome back
          </h1>
        
        </div>

        {/* Abstract Dashboard Illustration */}
        <div className="relative w-full max-w-[420px] mx-auto flex-1 flex items-center justify-center my-8">
           <Image 
             src="/dashboard-illustration.png" 
             alt="Dashboard Illustration" 
             width={600} 
             height={600} 
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
          <div className="flex lg:hidden items-center gap-2 mb-12">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L11 22L15.5 10H19.5L24 22L28 10H24L21.5 17L17.5 7H13.5L9.5 17L7 10Z" fill="#5D5FEF"/>
            </svg>
            <span className="text-[22px] font-bold text-gray-900 tracking-tight">WorkFlow</span>
          </div>

          <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">
            Sign in to WorkFlow
          </h2>
          <p className="text-gray-500 text-[15px] mb-10">
            Enter your credentials to access your account.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {errors.api && (
              <div className="bg-red-50 text-red-500 text-[13px] p-3 rounded-xl mb-4">
                {errors.api}
              </div>
            )}
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

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-900">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5D5FEF] focus:border-[#5D5FEF] transition-colors text-[14px] [&:-webkit-autofill]:shadow-[0_0_0px_1000px_white_inset]"
                  placeholder="Enter your password"
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
            </div>

            <div className="flex items-center justify-between pt-1 pb-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#5D5FEF] focus:ring-[#5D5FEF] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-[13px] text-gray-900 font-medium cursor-pointer">
                  Remember me
                </label>
              </div>
              <div className="text-[13px]">
                <Link href="/forgot-password" className="font-semibold text-[#5D5FEF] hover:text-[#4a4cc7]">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-[14px] font-semibold text-white bg-[#5D5FEF] hover:bg-[#4a4cc7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5D5FEF] transition-all"
            >
              Sign in
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-[13px] text-gray-400">or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="button"
              className="flex-1 flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-[14px] font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5D5FEF] transition-all"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-[14px] font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5D5FEF] transition-all"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 21 21">
                <path d="M10 0H0v10h10V0z" fill="#f25022"/>
                <path d="M21 0H11v10h10V0z" fill="#7fba00"/>
                <path d="M10 11H0v10h10V11z" fill="#00a4ef"/>
                <path d="M21 11H11v10h10V11z" fill="#ffb900"/>
              </svg>
              Microsoft
            </button>
          </div>

          <div className="mt-10 text-center">
            <span className="text-[14px] text-gray-500">
              Don't have an account?{" "}
              <Link href={`/register${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="font-semibold text-[#5D5FEF] hover:text-[#4a4cc7]">
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

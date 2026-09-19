"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, Users, CheckSquare, BarChart2, Check, Home, FileText, Folder, Calendar, Settings, UserPlus, Briefcase, ChevronDown } from "lucide-react";
import { API_URL } from "@/lib/apis";

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "Human Resources",
];

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Engineering");
  
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Please fill in this field.";
    if (!email.trim()) newErrors.email = "Please fill in this field.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Please enter a valid email address.";

    if (!password) newErrors.password = "Please fill in this field.";
    if (!confirmPassword) newErrors.confirmPassword = "Please fill in this field.";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    if (!terms) newErrors.terms = "You must agree to the Terms of Service.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password, department }),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
            const redirectUrl = searchParams.get("invite") ? `/chat?${searchParams.toString()}` : "/";
            window.location.href = redirectUrl;
          } else {
            const errorData = await res.json();
            setErrors((prev) => ({ ...prev, api: errorData.message || "Registration failed" }));
          }
        })
        .catch(() => {
          setErrors((prev) => ({ ...prev, api: "Network error" }));
        });
    }
  };

  const reqs = {
    length: password.length >= 8 || password === '',
    uppercase: /[A-Z]/.test(password) || password === '',
    number: /[0-9]/.test(password) || password === '',
    special: /[^A-Za-z0-9]/.test(password) || password === '',
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f8f9fc] font-sans relative overflow-hidden">
      
      {/* Background Decoratives */}
      <div className="absolute top-[15%] left-[5%] grid grid-cols-4 gap-[10px] opacity-20">
        {Array.from({ length: 16 }).map((_, i) => <div key={i} className="w-[3px] h-[3px] bg-[#a8aadb] rounded-full" />)}
      </div>
      <div className="absolute bottom-[15%] right-[5%] grid grid-cols-4 gap-[10px] opacity-20">
        {Array.from({ length: 16 }).map((_, i) => <div key={i} className="w-[3px] h-[3px] bg-[#a8aadb] rounded-full" />)}
      </div>
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="550" cy="350" r="300" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="6 6" opacity="0.6"/>
        <circle cx="550" cy="350" r="10" fill="#e2e8f0" />
        <line x1="550" y1="350" x2="700" y2="150" stroke="#e2e8f0" strokeWidth="1" opacity="0.7"/>
        <circle cx="700" cy="150" r="7" fill="#e2e8f0" />
        <circle cx="700" cy="150" r="18" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="550" y1="350" x2="350" y2="600" stroke="#e2e8f0" strokeWidth="1" opacity="0.7"/>
        <circle cx="350" cy="600" r="7" fill="#e2e8f0" />
        <circle cx="350" cy="600" r="18" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M-100 0 C 300 200, 800 600, 1540 400" stroke="url(#paint0_linear)" strokeWidth="120" opacity="0.04" />
        <defs>
          <linearGradient id="paint0_linear" x1="-100" y1="0" x2="1540" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5D5FEF" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute top-0 right-0 w-[50vw] h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none"></div>

      <div className="flex w-full max-w-[1300px] mx-auto z-10">
        
        {/* Left Side */}
        <div className="hidden lg:flex w-[55%] flex-col pt-12 pl-10 pr-16 relative">
          
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
             <div className="text-[#5D5FEF] font-black text-3xl italic tracking-tighter flex items-center">
               <span className="w-[30px] h-[30px] text-[#5D5FEF] flex items-center justify-center mr-2">
                 <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M7 10L11 22L15.5 10H19.5L24 22L28 10H24L21.5 17L17.5 7H13.5L9.5 17L7 10Z" fill="currentColor" />
                 </svg>
               </span>
               <span className="text-[24px] tracking-tight font-bold text-gray-900">WorkFlow</span>
             </div>
          </div>
          
          <h1 className="text-[44px] xl:text-[50px] font-extrabold text-gray-900 leading-[1.15] mb-6 tracking-tight">
            Create your<br />
            <span className="text-[#6543FF]">work</span>, your way.
          </h1>
          <p className="text-gray-600 text-[16px] mb-12 max-w-[380px] leading-relaxed">
            WorkFlow helps teams organize, collaborate, and achieve more together.
          </p>

          <div className="space-y-6 mb-14">
            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 rounded-2xl bg-white/70 shadow-sm flex items-center justify-center flex-shrink-0 text-[#6543FF]">
                <Users size={24} strokeWidth={2} />
              </div>
              <div className="pt-1.5">
                <h3 className="font-bold text-[15px] text-gray-900 mb-1">Organize your team</h3>
                <p className="text-[13.5px] text-gray-500 max-w-[280px] leading-snug">Keep all your team members and roles organized in one place.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 rounded-2xl bg-white/70 shadow-sm flex items-center justify-center flex-shrink-0 text-[#6543FF]">
                <CheckSquare size={24} strokeWidth={2} />
              </div>
              <div className="pt-1.5">
                <h3 className="font-bold text-[15px] text-gray-900 mb-1">Manage projects</h3>
                <p className="text-[13.5px] text-gray-500 max-w-[280px] leading-snug">Plan, track, and deliver projects efficiently.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 rounded-2xl bg-white/70 shadow-sm flex items-center justify-center flex-shrink-0 text-[#6543FF]">
                <BarChart2 size={24} strokeWidth={2} />
              </div>
              <div className="pt-1.5">
                <h3 className="font-bold text-[15px] text-gray-900 mb-1">Track progress</h3>
                <p className="text-[13.5px] text-gray-500 max-w-[280px] leading-snug">Monitor performance and achieve your goals.</p>
              </div>
            </div>
          </div>

          {/* Dashboard Graphic */}
          <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] p-4 flex gap-4 border border-gray-100">
            <div className="w-12 flex flex-col items-center gap-4 py-2 border-r border-gray-100 pr-2">
              <div className="w-10 h-10 rounded-[12px] bg-[#6543FF] text-white flex items-center justify-center shadow-md shadow-indigo-200"><Home size={18}/></div>
              <FileText size={18} className="text-gray-400" />
              <Folder size={18} className="text-gray-400" />
              <Calendar size={18} className="text-gray-400" />
              <BarChart2 size={18} className="text-gray-400" />
              <Settings size={18} className="text-gray-400 mt-auto" />
            </div>
            <div className="flex-1 py-1 pl-2">
              <h4 className="font-bold text-gray-900 text-[15px] mb-3">Dashboard</h4>
              <div className="flex gap-3">
                <div className="flex-1 bg-white border border-gray-100 rounded-[14px] p-3 shadow-sm relative overflow-hidden h-[100px]">
                  <div className="text-[10px] font-semibold text-gray-400 mb-0.5">Projects</div>
                  <div className="text-2xl font-extrabold text-gray-900 mb-0">24</div>
                  <div className="text-[9px] text-gray-400">Active projects</div>
                  <svg className="absolute bottom-1 right-2 w-16 h-8 text-[#6543FF]" viewBox="0 0 64 32" fill="none">
                    <path d="M0 24C10 24 15 16 20 16C25 16 30 28 35 28C40 28 50 8 64 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex-1 bg-white border border-gray-100 rounded-[14px] p-3 shadow-sm relative overflow-hidden h-[100px]">
                  <div className="text-[10px] font-semibold text-gray-400 mb-0.5">Tasks</div>
                  <div className="text-2xl font-extrabold text-gray-900 mb-0">156</div>
                  <div className="text-[9px] text-gray-400">Tasks completed</div>
                  <svg className="absolute bottom-1 right-2 w-16 h-8 text-[#22c55e]" viewBox="0 0 64 32" fill="none">
                    <path d="M0 28C10 28 15 20 20 20C25 20 30 12 35 12C40 12 50 24 64 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="w-[100px] bg-white border border-gray-100 rounded-[14px] p-3 shadow-sm h-[100px]">
                  <div className="text-[9px] font-semibold text-gray-400 mb-2">Team Activity</div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-[14px] h-[14px] rounded-full bg-gray-200 shrink-0 overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?img=${i}`} alt="avatar" />
                        </div>
                        <div className={`h-[4px] rounded-full w-full ${i === 4 ? 'bg-green-400 w-2/3' : 'bg-[#6543FF] w-full'}`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-4 lg:p-8 relative z-20 min-h-screen">
          <div className="w-full max-w-[440px] bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 relative border border-gray-50">
            
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-[#f8f6ff] rounded-full flex items-center justify-center mb-4 text-[#6543FF]">
                <UserPlus size={24} strokeWidth={2} />
              </div>
              <h2 className="text-[22px] font-bold text-gray-900 mb-2 tracking-tight">Create your account</h2>
              <p className="text-[13px] text-gray-500 text-center">Fill in the details to get started with WorkFlow</p>
            </div>

            {searchParams.get("invite") && (
              <div className="bg-indigo-50/80 border border-indigo-100 text-[#5D5FEF] text-[13px] p-3.5 rounded-xl mb-4 flex items-start gap-2.5">
                <span className="flex-shrink-0 text-base">🎉</span>
                <div>
                  <span className="font-bold block text-gray-900 text-[13px]">You're invited to collaborate!</span>
                  <span className="text-gray-600 text-[12px]">Create your personal account to join the workspace channel securely.</span>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              
              {errors.api && (
                <div className="bg-red-50 text-red-500 text-[13px] p-3 rounded-xl mb-4">
                  {errors.api}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-900 ml-1">Full name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className={`h-[18px] w-[18px] ${errors.fullName ? 'text-red-400' : 'text-gray-400'}`} strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    className={`block w-full pl-10 pr-4 py-3 border ${errors.fullName ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#6543FF]'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6543FF] transition-all text-[13.5px] bg-white`}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: "" });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-900 ml-1">Work email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className={`h-[18px] w-[18px] ${errors.email ? 'text-red-400' : 'text-gray-400'}`} strokeWidth={1.5} />
                  </div>
                  <input
                    type="email"
                    className={`block w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#6543FF]'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6543FF] transition-all text-[13.5px] bg-white`}
                    placeholder="Enter your work email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-900 ml-1">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="h-[18px] w-[18px] text-gray-400" strokeWidth={1.5} />
                  </div>
                  <select
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 focus:border-[#6543FF] rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6543FF] transition-all text-[13.5px] bg-white appearance-none cursor-pointer"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-900 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className={`h-[18px] w-[18px] ${errors.password ? 'text-red-400' : 'text-gray-400'}`} strokeWidth={1.5} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`block w-full pl-10 pr-11 py-3 border ${errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#6543FF]'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6543FF] transition-all text-[13.5px] bg-white`}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.5} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-900 ml-1">Confirm password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className={`h-[18px] w-[18px] ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} strokeWidth={1.5} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`block w-full pl-10 pr-11 py-3 border ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#6543FF]'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6543FF] transition-all text-[13.5px] bg-white`}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                    }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.5} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-[#fcfcff] border border-gray-100 rounded-xl p-3.5 mt-2 mb-2">
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    <Check size={14} strokeWidth={3} className={reqs.length ? "text-[#10b981]" : "text-gray-300"} />
                    <span className="text-[12px] font-medium text-gray-600">At least 8 characters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} strokeWidth={3} className={reqs.uppercase ? "text-[#10b981]" : "text-gray-300"} />
                    <span className="text-[12px] font-medium text-gray-600">One uppercase letter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} strokeWidth={3} className={reqs.number ? "text-[#10b981]" : "text-gray-300"} />
                    <span className="text-[12px] font-medium text-gray-600">One number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} strokeWidth={3} className={reqs.special ? "text-[#10b981]" : "text-gray-300"} />
                    <span className="text-[12px] font-medium text-gray-600">One special character</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center py-1">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-gray-300 text-[#6543FF] focus:ring-[#6543FF] cursor-pointer"
                  checked={terms}
                  onChange={(e) => {
                    setTerms(e.target.checked);
                    if (errors.terms) setErrors({ ...errors, terms: "" });
                  }}
                />
                <label htmlFor="terms" className="ml-2 block text-[12px] text-gray-500">
                  I agree to the <a href="#" className="text-[#6543FF] font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-[#6543FF] font-semibold hover:underline">Privacy Policy</a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-[14px] font-bold text-white bg-[#6543FF] hover:bg-[#5839db] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6543FF] transition-all mt-2"
              >
                Create account
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-[13px] text-gray-500 font-medium">
                Already have an account?{" "}
                <Link href={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="font-bold text-[#6543FF] hover:text-[#5839db] transition-colors">
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



"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Settings, Shield, Bell, Upload, Save, CheckCircle2 } from "lucide-react";
import Avatar from "./Avatar";
import { API_URL } from "@/lib/apis";
import { toast, confirmDialog } from "@/lib/toast";

export default function SettingsView({ user }: { user?: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") || "profile";
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaved, setIsSaved] = useState(false);
  
  const initialFirstName = user?.name ? user.name.split(' ')[0] : "";
  const initialLastName = user?.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : "";

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "Member");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.warning("File size exceeds 1MB max.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab") as string);
    }
  }, [searchParams]);

  const [language, setLanguage] = useState(user?.language || "English (US)");
  const [timezone, setTimezone] = useState(user?.timezone || "Pacific Time (PT)");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(user?.pushNotifications ?? true);
  const [inAppNotifications, setInAppNotifications] = useState(user?.inAppNotifications ?? true);

  const handleSave = async () => {
    const fullName = `${firstName} ${lastName}`.trim();
    
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: fullName, email, bio, role, avatar, language, timezone, 
          emailNotifications, pushNotifications, inAppNotifications 
        })
      });
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const res = await fetch(`${API_URL}/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setPasswordError(data.message || "Failed to update password.");
      }
    } catch (e) {
      setPasswordError("An unexpected error occurred.");
    }
  };

  const handleDeleteAccount = async () => {
    confirmDialog({
      title: "Delete Account",
      message: "Are you sure you want to permanently delete your account? This action cannot be undone.",
      variant: "danger",
      confirmText: "Delete Account",
      onConfirm: async () => {
        try {
          const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
          const res = await fetch(`${API_URL}/auth/me`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            toast.success("Account successfully deleted.");
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/login";
          } else {
            toast.error("Failed to delete account.");
          }
        } catch (e) {
          console.error(e);
          toast.error("An error occurred while deleting your account.");
        }
      }
    });
  };

  const tabs = [
    { id: "profile", name: "My Profile", icon: User },
    { id: "account", name: "Account Settings", icon: Settings },
    { id: "security", name: "Security", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
  ];

  return (
    <div className="flex w-full h-full min-h-0 flex-col bg-transparent overflow-hidden">
      <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-200/80 bg-white px-6 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-[17px] font-black tracking-tight text-gray-900">
            Settings
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-[#FAFBFC]">
        <div className="mx-auto max-w-5xl p-6 flex flex-col md:flex-row gap-8">
          
          {/* Settings Sidebar */}
          <div className="w-full md:w-56 shrink-0 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  router.push(`?tab=${tab.id}`, { scroll: false });
                }}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold transition-all ${
                  activeTab === tab.id 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <tab.icon size={16} className={activeTab === tab.id ? "text-indigo-100" : "text-gray-400"} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs relative overflow-hidden">
              
              {activeTab === "profile" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-[16px] font-black tracking-tight text-gray-900">Profile Information</h2>
                    <p className="text-[13px] font-medium text-gray-500 mt-1">Update your photo and personal details.</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <Avatar name={user?.name || "User"} avatar={avatar} size={80} />
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-[12px] font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
                        >
                          <Upload size={14} className="text-gray-400" />
                          Change avatar
                        </button>
                        <button 
                          onClick={() => setAvatar(null)}
                          className="text-[12px] font-bold text-rose-600 hover:text-rose-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-[11px] font-medium text-gray-400">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-gray-100 pt-6">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700">First name</label>
                      <input 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-2.5 text-[13px] font-semibold text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700">Last name</label>
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-2.5 text-[13px] font-semibold text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="text-[13px] font-bold text-gray-700">Email</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-2.5 text-[13px] font-semibold text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="text-[13px] font-bold text-gray-700">
                        Role {user?.role !== "Admin" && <span className="text-gray-400 font-normal ml-1">(Admin only)</span>}
                      </label>
                      <select 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={user?.role !== "Admin"}
                        className={`w-full rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-2.5 text-[13px] font-semibold text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none ${user?.role !== 'Admin' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <option value="Member">Member</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="Engineer">Engineer</option>
                        <option value="Designer">Designer</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[13px] font-bold text-gray-700">Bio</label>
                      <textarea 
                        rows={3} 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-3 text-[13px] font-semibold text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-[16px] font-black tracking-tight text-gray-900">Account Preferences</h2>
                    <p className="text-[13px] font-medium text-gray-500 mt-1">Manage your language, timezone, and workspace preferences.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 border-t border-gray-100 pt-6">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700">Language</label>
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-2.5 text-[13px] font-semibold text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                      >
                        <option value="English (US)">English (US)</option>
                        <option value="English (UK)">English (UK)</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700">Timezone</label>
                      <select 
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-2.5 text-[13px] font-semibold text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                      >
                        <option value="Pacific Time (PT)">Pacific Time (PT)</option>
                        <option value="Eastern Time (ET)">Eastern Time (ET)</option>
                        <option value="Indian Standard Time (IST)">Indian Standard Time (IST)</option>
                      </select>
                    </div>
                    
                    <div className="mt-4 p-4 rounded-xl border border-rose-100 bg-rose-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-[13px] font-bold text-rose-900">Delete Account</h4>
                        <p className="text-[12px] font-medium text-rose-600/80 mt-0.5">Permanently remove your account and all data.</p>
                      </div>
                      <button 
                        onClick={handleDeleteAccount}
                        className="shrink-0 rounded-lg bg-rose-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-rose-700 transition-colors shadow-sm"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-[16px] font-black tracking-tight text-gray-900">Security Settings</h2>
                    <p className="text-[13px] font-medium text-gray-500 mt-1">Update your password and secure your account.</p>
                  </div>

                  {passwordError && (
                    <div className="rounded-lg bg-rose-50/50 p-4 border border-rose-100">
                      <p className="text-[13px] font-bold text-rose-600">{passwordError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 border-t border-gray-100 pt-6 max-w-lg">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700">Current Password</label>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-2.5 text-[13px] font-semibold text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-2.5 text-[13px] font-semibold text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 px-4 py-2.5 text-[13px] font-semibold text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-[16px] font-black tracking-tight text-gray-900">Notification Preferences</h2>
                    <p className="text-[13px] font-medium text-gray-500 mt-1">Choose how and when you want to be notified.</p>
                  </div>

                  <div className="space-y-6 border-t border-gray-100 pt-6 max-w-2xl">
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[14px] font-bold text-gray-900">Email Notifications</h4>
                        <p className="text-[12px] font-medium text-gray-500 mt-0.5">Receive daily summaries and critical alerts via email.</p>
                      </div>
                      <button 
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${emailNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[14px] font-bold text-gray-900">Push Notifications</h4>
                        <p className="text-[12px] font-medium text-gray-500 mt-0.5">Get instant desktop alerts for mentions and direct messages.</p>
                      </div>
                      <button 
                        onClick={() => setPushNotifications(!pushNotifications)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${pushNotifications ? 'bg-indigo-600' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${pushNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[14px] font-bold text-gray-900">In-App Notifications</h4>
                        <p className="text-[12px] font-medium text-gray-500 mt-0.5">Show a red badge on the bell icon for new activities.</p>
                      </div>
                      <button 
                        onClick={() => setInAppNotifications(!inAppNotifications)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${inAppNotifications ? 'bg-indigo-600' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${inAppNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* Footer Actions */}
              {(activeTab === "profile" || activeTab === "account" || activeTab === "security" || activeTab === "notifications") && (
                <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
                  <button className="px-4 py-2 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={activeTab === "security" ? handleChangePassword : handleSave}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 text-[13px] font-bold text-white hover:bg-indigo-700 shadow-md transition-all active:scale-[0.98]"
                  >
                    {isSaved ? (
                      <>
                        <CheckCircle2 size={16} />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

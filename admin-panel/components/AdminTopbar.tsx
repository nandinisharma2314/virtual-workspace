"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/lib/apis";
import { Activity, Bell, Shield, User } from "lucide-react";

export default function AdminTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setAdminUser(data); })
        .catch(() => {});
    }
  }, []);

  return (
    <header className="h-14 px-8 border-b border-gray-200/80 bg-white flex items-center justify-between shrink-0 select-none z-10">
      <div>
        <h2 className="text-[15px] font-black text-gray-900 tracking-tight leading-tight">{title}</h2>
        {subtitle && <p className="text-[11px] font-semibold text-gray-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60 text-[11px] font-bold">
          <Activity size={13} className="text-emerald-500 animate-pulse" />
          <span>System Healthy</span>
        </div>

        <div className="h-4 w-px bg-gray-200" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {adminUser?.name ? adminUser.name[0].toUpperCase() : <Shield size={14} />}
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-gray-900 leading-none">
              {adminUser?.name || "Administrator"}
            </p>
            <p className="text-[10.5px] font-semibold text-indigo-600">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}


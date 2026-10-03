"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, LogIn, RefreshCw, ArrowLeft } from "lucide-react";
import { API_URL } from "@/lib/apis";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized" | "forbidden">("loading");
  const [user, setUser] = useState<any>(null);

  const checkAdminAuth = async () => {
    setStatus("loading");
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") ||
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1]
        : null;

    if (!token) {
      setStatus("unauthorized");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setStatus("unauthorized");
        return;
      }

      const userData = await res.json();
      setUser(userData);

      if (userData.role === "Admin") {
        setStatus("authorized");
      } else {
        setStatus("forbidden");
      }
    } catch (err) {
      console.error("Admin auth check failed:", err);
      setStatus("unauthorized");
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAFBFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-xs font-bold text-gray-500 tracking-wide uppercase">Verifying Admin Permissions...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAFBFC] p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <LogIn size={28} />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Admin Console Authentication</h2>
          <p className="mt-2 text-xs font-medium text-gray-500 leading-relaxed">
            You must be signed in with a System Super-Administrator account to access this console.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href="http://localhost:3000/login"
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all"
            >
              <span>Sign In to WorkFlow</span>
            </a>
            <button
              onClick={checkAdminAuth}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <RefreshCw size={13} />
              <span>Retry Session Check</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAFBFC] p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 shadow-xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Access Denied (403)</h2>
          <p className="mt-2 text-xs font-medium text-gray-500 leading-relaxed">
            Logged in as <strong className="text-gray-800">{user?.email || "User"}</strong> ({user?.role || "Member"}).
            System Super-Admin privilege is required to access workspace operations and cross-tenant telemetry.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href="http://localhost:3000"
              className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-xs font-bold text-white shadow-md hover:bg-gray-800 transition-all"
            >
              <ArrowLeft size={14} />
              <span>Return to Main Workspace</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL, getAuthHeaders } from "@/lib/apis";
import { toast } from "@/lib/toast";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { Building, Shield, CheckCircle2, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const { refreshWorkspaces, setCurrentWorkspaceId } = useWorkspace();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const userToken = typeof window !== "undefined"
      ? localStorage.getItem("token") || document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1]
      : null;
    setIsAuthenticated(!!userToken);
  }, []);

  const handleAcceptInvite = async () => {
    if (!token) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${API_URL}/workspaces/invites/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success("Successfully joined the workspace!");
        await refreshWorkspaces();
        if (data.workspaceId) {
          setCurrentWorkspaceId(data.workspaceId);
        }
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setErrorMessage(data.message || "Failed to accept invite or invite is expired.");
        toast.error(data.message || "Failed to accept invite");
      }
    } catch (err) {
      setErrorMessage("Network error occurred while accepting invite.");
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-white/20 text-center relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg mb-5">
          <Building size={30} />
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Workspace Invitation
        </h1>
        <p className="mt-2 text-xs text-gray-500 font-medium leading-relaxed">
          You have been invited to collaborate in a secure workspace with a designated role and custom capability set.
        </p>

        {success ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
            <div className="text-sm font-extrabold text-emerald-800">
              Welcome to the Workspace!
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              Redirecting you to your workflow dashboard...
            </p>
          </div>
        ) : isAuthenticated === false ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-indigo-50/80 border border-indigo-100 p-4 text-xs font-medium text-indigo-900">
              Please sign in or create an account to accept this invitation and access your new workspace.
            </div>
            <div className="flex flex-col gap-2.5">
              <Link
                href={`/register?invite=${encodeURIComponent(token)}`}
                className="w-full rounded-2xl bg-indigo-600 py-3 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Create New Account</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={`/login?invite=${encodeURIComponent(token)}`}
                className="w-full rounded-2xl bg-gray-100 py-3 text-xs font-extrabold text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In to Existing Account</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-left text-xs font-semibold text-rose-700">
                <AlertCircle size={16} className="shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleAcceptInvite}
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-indigo-600 py-3 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>{isSubmitting ? "Joining Workspace..." : "Accept & Join Workspace"}</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <div className="pt-3">
              <Link
                href="/"
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Decline or return to home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

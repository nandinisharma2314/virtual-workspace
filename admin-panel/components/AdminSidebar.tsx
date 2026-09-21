"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  FolderKanban,
  Users,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Themes & Wallpapers", href: "/themes", icon: Palette },
    { label: "Templates Catalog", href: "/templates", icon: FolderKanban },
    { label: "Users & Roles", href: "/users", icon: Users },
    { label: "System Settings", href: "/settings", icon: SlidersHorizontal },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200/80 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="h-14 px-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="text-[14px] font-black text-gray-900 leading-tight">Admin Console</h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Workspace Ops</p>
          </div>
        </div>
        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-200/60">
          v1.0
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1">
        <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-gray-400">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-indigo-50/80 text-indigo-600 shadow-2xs font-extrabold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-indigo-600" : "text-gray-400"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Switch to Main App */}
      <div className="p-3 border-t border-gray-100/80">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 border border-gray-200/80 shadow-2xs transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Main Workspace</span>
          </div>
          <ExternalLink size={14} className="text-gray-400" />
        </a>
      </div>
    </aside>
  );
}


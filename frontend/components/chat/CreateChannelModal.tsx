"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Hash,
  Lock,
  Users,
  Search,
  Check,
  Sparkles,
  Plus,
  AlertCircle,
  Loader2,
  Mail,
  CheckCheck,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import { motion, AnimatePresence } from "framer-motion";

export const channelThemes = [
  {
    id: "indigo-violet",
    name: "Cosmic Indigo",
    gradient: "from-indigo-600 via-indigo-700 to-purple-800",
    bgClass: "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800",
  },
  {
    id: "blue-cyan",
    name: "Oceanic Blue",
    gradient: "from-blue-600 via-indigo-600 to-violet-700",
    bgClass: "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700",
  },
  {
    id: "purple-pink",
    name: "Velvet Magenta",
    gradient: "from-indigo-700 via-purple-700 to-pink-700",
    bgClass: "bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700",
  },
  {
    id: "emerald-teal",
    name: "Emerald Deep",
    gradient: "from-emerald-700 via-teal-700 to-cyan-800",
    bgClass: "bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800",
  },
  {
    id: "rose-amber",
    name: "Sunset Ember",
    gradient: "from-rose-600 via-orange-600 to-amber-600",
    bgClass: "bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600",
  },
  {
    id: "slate-dark",
    name: "Midnight Slate",
    gradient: "from-slate-800 via-indigo-900 to-purple-900",
    bgClass: "bg-gradient-to-r from-slate-800 via-indigo-900 to-purple-900",
  },
];

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: (newChannel: any) => void;
}

export default function CreateChannelModal({
  isOpen,
  onClose,
  onChannelCreated,
}: CreateChannelModalProps) {
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(channelThemes[0]);
  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUserEmails, setSelectedUserEmails] = useState<string[]>([]);
  const [manualEmail, setManualEmail] = useState("");
  const [manualEmailError, setManualEmailError] = useState("");
  const [searchMemberQuery, setSearchMemberQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  // Fetch workspace users and current user for member selection
  useEffect(() => {
    if (!isOpen) return;

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    // Fetch team users
    fetch("http://localhost:3001/chat/direct-message-users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setTeamUsers(data);
        }
      })
      .catch(console.error);

    // Fetch current logged in user
    fetch("http://localhost:3001/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setCurrentUser(data);
      })
      .catch(console.error);
  }, [isOpen]);

  // Clean slug handle
  const slug = channelName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const toggleUserSelection = (email?: string) => {
    if (!email) return;
    const clean = email.trim().toLowerCase();
    setSelectedUserEmails((prev) =>
      prev.some((e) => e.toLowerCase() === clean)
        ? prev.filter((e) => e.toLowerCase() !== clean)
        : [...prev, clean]
    );
  };

  const handleSelectAll = () => {
    const selectableUsers = teamUsers.filter(
      (u) => u.email && u.email.toLowerCase() !== currentUser?.email?.toLowerCase()
    );
    const selectableEmails = selectableUsers.map((u) => u.email.toLowerCase());
    
    // Check if all selectable users are already selected
    const allSelected = selectableEmails.length > 0 && selectableEmails.every((em) =>
      selectedUserEmails.some((e) => e.toLowerCase() === em)
    );

    if (allSelected) {
      // Deselect team users, keep external emails if any
      setSelectedUserEmails((prev) =>
        prev.filter((e) => !selectableEmails.includes(e.toLowerCase()))
      );
    } else {
      // Select all selectable team users
      setSelectedUserEmails((prev) => {
        const combined = new Set([...prev.map((e) => e.toLowerCase()), ...selectableEmails]);
        return Array.from(combined);
      });
    }
  };

  const handleAddManualEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setManualEmailError("");
    const email = manualEmail.trim().toLowerCase();
    
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setManualEmailError("Please enter a valid email address");
      return;
    }

    if (selectedUserEmails.some((e) => e.toLowerCase() === email)) {
      setManualEmailError("This email is already added");
      return;
    }

    setSelectedUserEmails((prev) => [...prev, email]);
    setManualEmail("");
    setManualEmailError("");
  };

  const handleRemoveEmail = (email: string) => {
    const clean = email.toLowerCase();
    setSelectedUserEmails((prev) => prev.filter((e) => e.toLowerCase() !== clean));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) {
      setShowValidation(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        setErrorMessage("You must be logged in to create a channel.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("http://localhost:3001/chat/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: channelName.trim(),
          description: description.trim(),
          bgGradient: selectedTheme.gradient,
          memberEmails: selectedUserEmails,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create channel.");
      }

      const newChannel = await res.json();

      // Reset fields
      setChannelName("");
      setDescription("");
      setSelectedUserEmails([]);
      setSearchMemberQuery("");
      setManualEmail("");
      setShowValidation(false);

      onChannelCreated(newChannel);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = teamUsers.filter((u) => {
    if (!searchMemberQuery.trim()) return true;
    const q = searchMemberQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    );
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden z-10"
          >
            {/* Header with Visual Banner */}
            <div className={`relative px-6 pt-6 pb-5 ${selectedTheme.bgClass} text-white shrink-0 transition-all duration-300`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/20 hover:bg-black/35 flex items-center justify-center text-white/90 hover:text-white transition-colors"
                title="Close"
              >
                <X size={17} strokeWidth={2.2} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <Hash size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-[19px] font-black tracking-tight text-white">
                    Create a Channel
                  </h3>
                  <p className="text-[12px] font-medium text-white/80">
                    Connect with teammates in a private workspace room
                  </p>
                </div>
              </div>

              {/* Privacy Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-md text-[11px] font-bold text-white/95 mt-1 border border-white/10">
                <Lock size={12} strokeWidth={2.5} className="text-amber-300" />
                <span>Private Channel &mdash; visible only to members you add</span>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-5 [scrollbar-width:thin]">
              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-[13px]">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Channel Name */}
              <div>
                <label className="block text-[13px] font-bold text-gray-800 mb-1.5">
                  Channel Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-black text-[15px]">
                    #
                  </div>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => {
                      setChannelName(e.target.value);
                      if (showValidation) setShowValidation(false);
                    }}
                    placeholder="e.g. project-apollo, product-launch"
                    maxLength={50}
                    className={`w-full pl-8 pr-3.5 py-2.5 bg-gray-50/80 border rounded-xl text-[13.5px] font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      showValidation && !channelName.trim()
                        ? "border-rose-400 focus:ring-rose-400/40"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/30"
                    }`}
                  />
                </div>
                {showValidation && !channelName.trim() && (
                  <p className="text-[11.5px] text-rose-500 font-semibold mt-1">
                    Please enter a channel name.
                  </p>
                )}
                {slug && (
                  <p className="text-[11px] text-gray-400 font-mono mt-1">
                    Handle: #{slug}
                  </p>
                )}
              </div>

              {/* Channel Description */}
              <div>
                <label className="block text-[13px] font-bold text-gray-800 mb-1.5">
                  Description <span className="text-gray-400 font-normal text-[11.5px]">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this channel about? Set goals or expectations for the team..."
                  rows={2}
                  maxLength={200}
                  className="w-full px-3.5 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 resize-none transition-all"
                />
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-[13px] font-bold text-gray-800 mb-2">
                  Channel Color Theme
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {channelThemes.map((theme) => {
                    const isSelected = selectedTheme.id === theme.id;
                    return (
                      <button
                        type="button"
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme)}
                        className={`h-10 rounded-xl ${theme.bgClass} relative flex items-center justify-center shadow-xs transition-all hover:scale-105 active:scale-95 ${
                          isSelected ? "ring-3 ring-blue-500 ring-offset-2 scale-105 shadow-md" : "opacity-85 hover:opacity-100"
                        }`}
                        title={theme.name}
                      >
                        {isSelected && <Check size={16} strokeWidth={3} className="text-white drop-shadow" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Members Section */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
                      <Users size={15} className="text-blue-600" />
                      <span>Add Members</span>
                    </label>
                    <p className="text-[11.5px] text-gray-500 font-medium">
                      Select colleagues who should have access right away
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {teamUsers.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-[11.5px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors"
                      >
                        {teamUsers.filter(u => u.email && u.email.toLowerCase() !== currentUser?.email?.toLowerCase()).every(u => selectedUserEmails.some(e => e.toLowerCase() === u.email.toLowerCase()))
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    )}
                    {selectedUserEmails.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold shadow-2xs">
                        {selectedUserEmails.length} selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Selected members chips */}
                {selectedUserEmails.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-24 overflow-y-auto p-2 bg-slate-50/80 rounded-xl border border-gray-200/80 [scrollbar-width:thin]">
                    {selectedUserEmails.map((email) => {
                      const user = teamUsers.find(
                        (u) => u.email?.toLowerCase() === email.toLowerCase()
                      );
                      return (
                        <span
                          key={email}
                          className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-lg bg-white border border-gray-200/90 text-[11.5px] font-semibold text-gray-800 shadow-2xs hover:border-gray-300 transition-colors"
                        >
                          {user ? (
                            <Avatar
                              person={user.name ? user.name.split(" ")[0].toLowerCase() : "user"}
                              name={user.name || email}
                              avatar={user.avatar}
                              size={18}
                            />
                          ) : (
                            <Mail size={13} className="text-blue-500 shrink-0" />
                          )}
                          <span className="max-w-[130px] truncate">
                            {user?.name || email}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmail(email)}
                            className="p-0.5 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors ml-0.5"
                            title="Remove"
                          >
                            <X size={12} strokeWidth={2.5} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Search members with clear button and count indicator */}
                <div className="relative mb-2">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchMemberQuery}
                    onChange={(e) => setSearchMemberQuery(e.target.value)}
                    placeholder="Search workspace members by name, email, or role..."
                    className="w-full pl-8 pr-8 py-1.5 bg-gray-50/90 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                  {searchMemberQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchMemberQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Team member list */}
                <div className="max-h-44 overflow-y-auto border border-gray-200/80 rounded-xl divide-y divide-gray-100 bg-white [scrollbar-width:thin]">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => {
                      const isSelected = selectedUserEmails.some(
                        (e) => e.toLowerCase() === u.email?.toLowerCase()
                      );
                      const isCurrentUser =
                        (currentUser?.email &&
                          u.email?.toLowerCase() === currentUser?.email?.toLowerCase()) ||
                        (currentUser?.id && u.id === currentUser?.id);
                      const person = u.name ? u.name.split(" ")[0].toLowerCase() : "user";

                      return (
                        <div
                          key={u.id || u.email}
                          onClick={() => toggleUserSelection(u.email)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleUserSelection(u.email);
                            }
                          }}
                          tabIndex={0}
                          role="checkbox"
                          aria-checked={isSelected}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer select-none transition-all group outline-none ${
                            isSelected
                              ? "bg-blue-50/70 border-l-3 border-l-blue-600"
                              : "hover:bg-gray-50/90 focus-visible:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                            <Avatar
                              person={person}
                              name={u.name || "Member"}
                              avatar={u.avatar}
                              size={28}
                            />
                            <div className="truncate min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-[12.5px] font-bold text-gray-800 truncate leading-tight">
                                  {u.name}
                                </p>
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase tracking-wide">
                                    Owner (You)
                                  </span>
                                )}
                                {u.role && !isCurrentUser && (
                                  <span className="px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 text-[10px] font-semibold">
                                    {u.role}
                                  </span>
                                )}
                                {u.department && (
                                  <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                                    &bull; {u.department}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                                {u.email || "No email provided"}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                                : "border-gray-300 bg-white group-hover:border-blue-400"
                            }`}
                          >
                            {isSelected && <Check size={13} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-[12.5px] text-gray-500 font-medium">
                        No members found matching &quot;{searchMemberQuery}&quot;
                      </p>
                      {searchMemberQuery.includes("@") && (
                        <button
                          type="button"
                          onClick={() => {
                            setManualEmail(searchMemberQuery);
                            handleAddManualEmail();
                            setSearchMemberQuery("");
                          }}
                          className="mt-2 text-[12px] text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Plus size={13} /> Invite &quot;{searchMemberQuery}&quot; by email
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* External invite by email input */}
                <div className="mt-2.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        value={manualEmail}
                        onChange={(e) => {
                          setManualEmail(e.target.value);
                          if (manualEmailError) setManualEmailError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddManualEmail();
                          }
                        }}
                        placeholder="Or invite external colleague by email..."
                        className={`w-full pl-8 pr-3 py-1.5 bg-gray-50/80 border rounded-lg text-[12px] font-medium text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all ${
                          manualEmailError ? "border-rose-300 ring-1 ring-rose-200" : "border-gray-200"
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddManualEmail()}
                      disabled={!manualEmail.trim()}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 font-bold text-[12px] rounded-lg disabled:opacity-40 disabled:hover:bg-blue-50 transition-colors shrink-0 flex items-center gap-1 border border-blue-200/60"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Add</span>
                    </button>
                  </div>
                  {manualEmailError && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1 pl-1">
                      {manualEmailError}
                    </p>
                  )}
                </div>
              </div>

              {/* Privacy summary footer alert */}
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-amber-900 text-[12px]">
                <Lock size={15} className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong>Strict Privacy:</strong> Other workspace members will NOT see this channel in their sidebar or search until you explicitly add them. You (channel creator) are automatically included.
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/80 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-200/70 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isSubmitting || !channelName.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[13px] font-extrabold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus size={15} strokeWidth={2.5} />
                    <span>Create Channel</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

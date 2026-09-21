"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/apis";

// ─── Static fallback defaults (same shape as admin API returns) ──────────────

export const DEFAULT_CHANNEL_THEMES = [
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

export const DEFAULT_BOARD_GRADIENTS = [
  {
    id: "cosmic-nebula",
    name: "Cosmic Nebula",
    gradient: "from-indigo-950 via-indigo-800 to-purple-700",
    thumb: "from-indigo-700 to-purple-800",
  },
  {
    id: "sunset-horizon",
    name: "Sunset Horizon",
    gradient: "from-rose-600 via-orange-500 to-amber-400",
    thumb: "from-rose-500 to-amber-400",
  },
  {
    id: "deep-oceanic",
    name: "Deep Oceanic",
    gradient: "from-slate-900 via-blue-900 to-cyan-700",
    thumb: "from-blue-700 to-cyan-600",
  },
  {
    id: "emerald-forest",
    name: "Emerald Forest",
    gradient: "from-emerald-900 via-teal-800 to-green-600",
    thumb: "from-emerald-700 to-teal-600",
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    gradient: "from-purple-900 via-violet-700 to-pink-600",
    thumb: "from-purple-700 to-pink-600",
  },
  {
    id: "midnight-slate",
    name: "Midnight Slate",
    gradient: "from-slate-900 via-slate-800 to-indigo-950",
    thumb: "from-slate-800 to-indigo-900",
  },
];

export const DEFAULT_BOARD_BACKGROUNDS = [
  { id: 'cosmic', name: 'Deep Space Galaxy', image: '/cosmic_board_bg.jpg', desc: 'Nebula galaxy and stars (My Tasks)' },
  { id: 'moon', name: 'Crescent Moon Night', image: '/crescent_moon_night_bg.jpg', desc: 'Starry sky over mountains (Feedback & Triage)' },
  { id: 'track', name: 'Athletic Sprint Track', image: '/track_sprint_bg.jpg', desc: 'Vivid blue stadium lanes (Tier List)' },
  { id: 'wood', name: 'Natural Oak Planks', image: '/wood_planks_bg.jpg', desc: 'Warm vertical timber wall (Sales & Deals)' },
  { id: 'ocean', name: 'Calm Ocean Horizon', image: '/calm_ocean_bg.jpg', desc: 'Tranquil turquoise sea (Daily Standup)' },
  { id: 'library', name: 'Vintage Library', image: '/library_books_bg.jpg', desc: 'Classic cozy bookshelves (Team Academy)' },
  { id: 'desk', name: 'Modern Workspace Desk', image: '/workspace_desk_bg.jpg', desc: 'Clean laptop & coffee flat lay (Onboarding)' },
];

export const DEFAULT_AI_SUGGESTIONS = [
  "Summarize this week's progress",
  "What are my overdue tasks?",
  "Generate meeting notes",
];

// ─── Generic fetch helper ────────────────────────────────────────────────────

async function fetchAdminData<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}/admin/${endpoint}`);
    if (!res.ok) return fallback;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data as T;
    return fallback;
  } catch {
    return fallback;
  }
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useChannelThemes() {
  const [themes, setThemes] = useState(DEFAULT_CHANNEL_THEMES);

  useEffect(() => {
    fetchAdminData("themes", DEFAULT_CHANNEL_THEMES).then(setThemes);
  }, []);

  return themes;
}

export function useBoardGradients() {
  const [gradients, setGradients] = useState(DEFAULT_BOARD_GRADIENTS);

  useEffect(() => {
    fetchAdminData("themes", DEFAULT_BOARD_GRADIENTS).then(data => {
      // Board gradients may come from the same endpoint but with thumb field
      // Fall back to board-specific defaults if API data doesn't have thumb field
      if (data.length > 0 && data[0] && 'thumb' in data[0]) {
        setGradients(data);
      }
    });
  }, []);

  return gradients;
}

export function useBoardBackgrounds() {
  const [backgrounds, setBackgrounds] = useState(DEFAULT_BOARD_BACKGROUNDS);

  useEffect(() => {
    fetchAdminData("wallpapers", DEFAULT_BOARD_BACKGROUNDS).then(setBackgrounds);
  }, []);

  return backgrounds;
}

export function useAiSuggestions() {
  const [suggestions, setSuggestions] = useState(DEFAULT_AI_SUGGESTIONS);

  useEffect(() => {
    fetchAdminData<string[]>("ai-suggestions", DEFAULT_AI_SUGGESTIONS).then(setSuggestions);
  }, []);

  return suggestions;
}


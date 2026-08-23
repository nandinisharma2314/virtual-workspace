# WorkFlow Dashboard

A Next.js (App Router) + TypeScript + Tailwind CSS recreation of the WorkFlow
project management dashboard, including:

- Sidebar navigation with workspace switcher and favorites
- Top bar with search, notifications, and profile menu
- Stat cards, project progress donut chart, tasks overview bar chart (Recharts)
- Team workload, recent activity, upcoming events, AI assistant panel
- Mini calendar with daily schedule
- Recent files, upcoming events, and activity feed sidebar
- Product roadmap Kanban board (To Do / In Progress / Review / Done)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- lucide-react (icons)
- recharts (charts)

## Project structure

- `app/page.tsx` — assembles the dashboard layout
- `components/` — one component per dashboard card/section
- `lib/data.ts` — mock data powering the UI (swap in real API data here)

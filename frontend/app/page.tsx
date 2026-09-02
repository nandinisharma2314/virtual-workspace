import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatCards from "@/components/StatCards";
import ProjectProgress from "@/components/ProjectProgress";
import TasksOverview from "@/components/TasksOverview";
import TeamWorkload from "@/components/TeamWorkload";
import RecentActivityCard from "@/components/RecentActivityCard";
import UpcomingEventsCard from "@/components/UpcomingEventsCard";
import AIAssistantCard from "@/components/AIAssistantCard";
import CalendarCard from "@/components/CalendarCard";
import UpcomingListCard from "@/components/UpcomingListCard";
import RecentFilesCard from "@/components/RecentFilesCard";
import ActivityFeedCard from "@/components/ActivityFeedCard";
import RoadmapBoard from "@/components/RoadmapBoard";
import GlobalTimeSelector from "@/components/GlobalTimeSelector";
import WelcomeModalWrapper from "@/components/WelcomeModalWrapper";
import { ChevronDown } from "lucide-react";

import { cookies } from "next/headers";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const res = await fetch("http://localhost:3001/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    return null;
  }
}

async function getDashboardData(token: string) {
  try {
    const res = await fetch("http://localhost:3001/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    return null;
  }
  return null;
}

export default async function Home() {
  const user = await getUser();
  const firstName = user?.name?.split(' ')[0] || 'User';

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const dashboardData = token ? await getDashboardData(token) : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
      <Sidebar />
      <WelcomeModalWrapper userName={firstName} />

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Topbar user={user} />

        <main className="flex-1 px-5 py-3.5 w-full h-full min-h-0 flex flex-col overflow-hidden">
          {/* Low-profile Header Row */}
          <div className="mb-3 flex items-center justify-between gap-3.5 shrink-0">
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-none">
                Good morning, {firstName}! 👋
              </h1>
              <span className="text-xs text-gray-500 hidden sm:inline-block">
                Here&apos;s what&apos;s happening with your team today.
              </span>
            </div>
            <GlobalTimeSelector />
          </div>

          {/* Root Content Grid with equal gap-3.5 (14px) spacing */}
          <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_315px] gap-3.5 overflow-hidden items-stretch">
            
            {/* Main Workspace (Left Analytics + Calendar + wide Roadmap Board at bottom) */}
            <div className="flex flex-col min-h-0 gap-3.5 min-w-0 overflow-hidden justify-between">
              
              {/* Upper Split: Analytics Desk on left, Calendar on right taking slightly more proportional height */}
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_265px] gap-3.5 items-stretch overflow-hidden">
                
                {/* Left Analytics Desk */}
                <div className="flex flex-col gap-3.5 min-w-0 justify-between h-full min-h-0 overflow-hidden">
                  <StatCards stats={dashboardData?.stats} />

                  <div className="grid grid-cols-3 gap-3.5 flex-1 min-h-0 overflow-hidden">
                    <div className="flex-1 min-h-0 w-full flex flex-col"><ProjectProgress projectProgress={dashboardData?.projectProgress} /></div>
                    <div className="flex-1 min-h-0 w-full flex flex-col"><TasksOverview tasksOverview={dashboardData?.tasksOverview} /></div>
                    <div className="flex-1 min-h-0 w-full flex flex-col"><TeamWorkload teamWorkload={dashboardData?.teamWorkload} /></div>
                  </div>

                  <div className="grid grid-cols-3 gap-3.5 flex-1 min-h-0 overflow-hidden">
                    <div className="flex-1 min-h-0 w-full flex flex-col"><RecentActivityCard recentActivity={dashboardData?.recentActivity} /></div>
                    <div className="flex-1 min-h-0 w-full flex flex-col"><UpcomingEventsCard upcomingEventsCard={dashboardData?.upcomingEventsCard} /></div>
                    <div className="flex-1 min-h-0 w-full flex flex-col"><AIAssistantCard /></div>
                  </div>
                </div>

                {/* Middle Column: Calendar */}
                <div className="w-full h-full min-h-0 flex flex-col overflow-hidden">
                  <CalendarCard calendarData={dashboardData?.calendarData} />
                </div>
              </div>

              {/* Lower Section: Roadmap Board with reduced height (~245px) matching our sleek cards */}
              <div className="shrink-0 h-[245px] w-full flex flex-col overflow-hidden">
                <RoadmapBoard roadmap={dashboardData?.roadmap} />
              </div>
            </div>

            {/* Far-Right Column: Feeds & Lists (equal split heights with matching gap-3.5) */}
            <div className="flex flex-col gap-3.5 h-full min-h-0 overflow-hidden w-full justify-between">
              <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
                <UpcomingListCard upcomingList={dashboardData?.upcomingList} />
              </div>
              <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
                <RecentFilesCard recentFiles={dashboardData?.recentFiles} />
              </div>
              <div className="flex-[1.1] min-h-0 w-full flex flex-col overflow-hidden">
                <ActivityFeedCard activityFeed={dashboardData?.activityFeed} />
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}

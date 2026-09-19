import Sidebar from "@/components/Sidebar";
import CalendarView from "@/components/CalendarView";
import Topbar from "@/components/Topbar";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/apis";

export const metadata: Metadata = {
  title: "Calendar | WorkFlow",
};

async function getDashboardData(token: string) {
  try {
    const res = await fetch(`${API_URL}/dashboard`, {
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

export default async function CalendarPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const dashboardData = token ? await getDashboardData(token) : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Topbar />
        <main className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col p-3.5 sm:p-5">
          <CalendarView calendarData={dashboardData?.calendarData || []} />
        </main>
      </div>
    </div>
  );
}

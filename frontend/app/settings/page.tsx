import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import SettingsView from "@/components/SettingsView";
import { Suspense } from "react";
import { getUser } from "@/lib/user";

export default async function SettingsPage() {
  const user = await getUser();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Topbar user={user} />

        <main className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-row bg-[#FAFBFC]">
          <Suspense fallback={
            <div className="flex-1 w-full h-full flex items-center justify-center bg-[#FAFBFC]">
              <div className="text-[14px] font-bold text-gray-400">Loading settings...</div>
            </div>
          }>
            <SettingsView user={user} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import TeamsView from "@/components/TeamsView";

export default function TeamsPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Topbar />

        <main className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-row bg-[#FAFBFC]">
          <TeamsView />
        </main>
      </div>
    </div>
  );
}

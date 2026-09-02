"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RoadmapBoard from "@/components/RoadmapBoard";
import EmptyBoardState from "@/components/boards/EmptyBoardState";

export default function BoardsPage() {
  // Simulating empty state based on state. In a real app, this would be fetched.
  const [hasBoards, setHasBoards] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Topbar />

        <main className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col px-5 py-4">
          {hasBoards ? (
            <RoadmapBoard />
          ) : (
            <EmptyBoardState onCreateBoard={() => setHasBoards(true)} />
          )}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import ProjectHeader from "./projects/ProjectHeader";
import ProjectBoard from "./projects/ProjectBoard";
import ProjectDetailsPanel from "./projects/ProjectDetailsPanel";
import ProjectList from "./projects/ProjectList";
import ProjectTimeline from "./projects/ProjectTimeline";
import ProjectCalendar from "./projects/ProjectCalendar";
import ProjectFiles from "./projects/ProjectFiles";
import ProjectReports from "./projects/ProjectReports";
import ProjectSettings from "./projects/ProjectSettings";

export default function ProjectView({ projectId }: { projectId?: string }) {
  const [activeTab, setActiveTab] = useState("Board");

  return (
    <div className="flex w-full h-full min-h-0 overflow-hidden bg-white">
      {/* Center section: Header and Content */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden bg-[#FAFBFC]">
        <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "Overview" && <ProjectBoard />} {/* Fallback for Overview */}
        {activeTab === "Board" && <ProjectBoard />}
        {activeTab === "List" && <ProjectList />}
        {activeTab === "Timeline" && <ProjectTimeline />}
        {activeTab === "Calendar" && <ProjectCalendar />}
        {activeTab === "Files" && <ProjectFiles />}
        {activeTab === "Reports" && <ProjectReports />}
        {activeTab === "Settings" && <ProjectSettings />}
      </div>

      {/* Right details panel (hide on Settings and Reports for full width if desired, but we can keep it as is for consistency unless requested) */}
      <ProjectDetailsPanel />
    </div>
  );
}

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
        <ProjectHeader projectId={projectId} activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "Overview" && <ProjectBoard projectId={projectId} />}
        {activeTab === "Board" && <ProjectBoard projectId={projectId} />}
        {activeTab === "List" && <ProjectList projectId={projectId} />}
        {activeTab === "Timeline" && <ProjectTimeline projectId={projectId} />}
        {activeTab === "Calendar" && <ProjectCalendar projectId={projectId} />}
        {activeTab === "Files" && <ProjectFiles projectId={projectId ? Number(projectId) : undefined} />}
        {activeTab === "Reports" && <ProjectReports projectId={projectId} />}
        {activeTab === "Settings" && <ProjectSettings projectId={projectId} />}
      </div>

      {/* Right details panel (hide on Settings and Reports for full width if desired, but we can keep it as is for consistency unless requested) */}
      <ProjectDetailsPanel />
      {/* Right details panel */}
      <ProjectDetailsPanel projectId={projectId} />
    </div>
  );
}

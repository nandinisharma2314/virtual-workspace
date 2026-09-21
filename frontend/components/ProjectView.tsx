"use client";

import { useState, useEffect } from "react";
import ProjectHeader from "./projects/ProjectHeader";
import ProjectBoard from "./projects/ProjectBoard";
import ProjectDetailsPanel from "./projects/ProjectDetailsPanel";
import ProjectList from "./projects/ProjectList";
import ProjectTimeline from "./projects/ProjectTimeline";
import ProjectCalendar from "./projects/ProjectCalendar";
import ProjectFiles from "./projects/ProjectFiles";
import ProjectReports from "./projects/ProjectReports";
import ProjectSettings from "./projects/ProjectSettings";
import { API_URL } from "@/lib/apis";

export default function ProjectView({ projectId }: { projectId?: string }) {
  const [activeTab, setActiveTab] = useState("Board");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token") || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        const res = await fetch(`${API_URL}/projects/${projectId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        }
      } catch (err) {
        console.error("Failed to fetch project:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full w-full bg-[#FAFBFC]">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex w-full h-full min-h-0 overflow-hidden bg-white">
      {/* Center section: Header and Content */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden bg-[#FAFBFC]">
        <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab} project={project} />
        {activeTab === "Overview" && <ProjectBoard projectId={projectId} />} {/* Fallback for Overview */}
        {activeTab === "Board" && <ProjectBoard projectId={projectId} />}
        {activeTab === "List" && <ProjectList />}
        {activeTab === "Timeline" && <ProjectTimeline />}
        {activeTab === "Calendar" && <ProjectCalendar />}
        {activeTab === "Files" && <ProjectFiles projectId={projectId ? parseInt(projectId, 10) : undefined} />}
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

<<<<<<< Updated upstream
      {/* Right details panel (hide on Settings and Reports for full width if desired, but we can keep it as is for consistency unless requested) */}
      <ProjectDetailsPanel />
      {/* Right details panel */}
      <ProjectDetailsPanel projectId={projectId} />
=======
      {/* Right details panel */}
      <ProjectDetailsPanel projectId={projectId} project={project} />
>>>>>>> Stashed changes
    </div>
  );
}

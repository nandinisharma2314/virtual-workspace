"use client";

import { useState, useEffect } from "react";
import { InboxItem } from "@/lib/inboxTypes";
import InboxSidebar from "./inbox/InboxSidebar";
import InboxList from "./inbox/InboxList";
import InboxDetail from "./inbox/InboxDetail";
import { io } from "socket.io-client";
import { API_URL } from "@/lib/apis";

function adaptDbNotification(dbNotif: any, index: number): InboxItem {
  // Use DB id, unread, content, date
  const dateObj = new Date(dbNotif.createdAt);
  const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const now = new Date();
  const isToday = dateObj.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = dateObj.toDateString() === yesterday.toDateString();
  const dateGroup: InboxItem["dateGroup"] = isToday ? "Today" : isYesterday ? "Yesterday" : "Earlier";

  // Try to determine tags and icons based on type or content
  let tag: InboxItem["tag"] = "System";
  let tagStyle = { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200/60" };
  let iconType: InboxItem["iconType"] = "system";
  let title = `New ${dbNotif.type} Notification`;
  let aiSuggestedAction: InboxItem["aiSuggestedAction"] = undefined;

  const contentLower = dbNotif.content?.toLowerCase() || "";
  let parsedContent: any = null;
  try {
    parsedContent = JSON.parse(dbNotif.content);
  } catch (e) {}

  let displayTitle = parsedContent?.title || title;
  let displaySubtitle = parsedContent?.subtitle || `Type: ${dbNotif.type}`;
  let displayPreview = parsedContent?.preview || (dbNotif.content ? dbNotif.content.substring(0, 50) + "..." : "");
  let displayFullMessage = parsedContent ? JSON.stringify(parsedContent, null, 2) : dbNotif.content;

  if (contentLower.includes("mention") || dbNotif.type === "Mention") {
    tag = "Mention";
    tagStyle = { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200/60" };
    iconType = "avatar";
  } else if (contentLower.includes("task") || dbNotif.type === "Task") {
    tag = "High";
    tagStyle = { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200/60" };
    iconType = "check";
    displayTitle = parsedContent?.title || "Task Notification";
  } else if (contentLower.includes("meet") || dbNotif.type === "Meeting") { 
    tag = "Meeting"; 
    tagStyle = { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200/60" }; 
    iconType = "meeting"; 
    displayTitle = parsedContent?.title || "Upcoming Meeting"; 
    if (parsedContent?.actionUrl) {
      aiSuggestedAction = {
        title: "Join Meeting",
        reason: "Scheduled team meeting.",
        buttonLabel: "Join Meeting",
        confidence: "High",
        actionUrl: parsedContent.actionUrl
      };
    }
  } else if (contentLower.includes("file") || dbNotif.type === "File") {
    tag = "File";
    tagStyle = { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200/60" };
    iconType = "file";
    displayTitle = parsedContent?.title || "File Shared";
  }

  const projectName = parsedContent?.project || "General";
  const priorityLabel = parsedContent?.priority || (tag === "High" ? "High" : "Medium");
  const priorityColor = priorityLabel === "High" ? "text-rose-600" : priorityLabel === "Low" ? "text-emerald-600" : "text-amber-500";
  const priorityDot = priorityLabel === "High" ? "bg-rose-500" : priorityLabel === "Low" ? "bg-emerald-500" : "bg-amber-500";

  return {
    id: dbNotif.id.toString(),
    title: displayTitle,
    subtitle: displaySubtitle,
    preview: displayPreview,
    time: timeString,
    dateGroup: dateGroup,
    unread: !dbNotif.isRead,
    tag: tag,
    tagStyle: tagStyle,
    iconType: iconType,
    avatarPerson: parsedContent?.avatarPerson || "system",
    senderName: parsedContent?.senderName || dbNotif.type || "System",
    channel: { name: parsedContent?.channel || "#general", project: projectName },
    project: { name: projectName, dotColor: "bg-indigo-500" },
    priority: { label: priorityLabel, color: priorityColor, dotClass: priorityDot },
    fullMessage: displayFullMessage,
    aiSuggestedAction: aiSuggestedAction,
  };
}

export default function InboxView() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) {
          setErrorMsg("No token found");
          setItems([]);
          return;
        }
        const res = await fetch(`${API_URL}/user-notifications`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((d: any, i: number) => adaptDbNotification(d, i));
          setItems(mapped);
          if (mapped.length > 0) setSelectedItemId(mapped[0].id.toString());
        } else {
          const txt = await res.text();
          setErrorMsg(`Error ${res.status}: ${txt}`);
          setItems([]);
        }
      } catch (e: any) {
        console.error("Failed to fetch notifications", e);
        setErrorMsg(e.message || "Failed to fetch notifications");
        setItems([]);
      }
    };
    fetchNotifications();
    
    // Setup Socket.IO for real-time notifications
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    let userId = null;
    if (token) {
       try { userId = JSON.parse(atob(token.split('.')[1])).sub; } catch(e) {}
    }
    
    const socket = io(API_URL, {
      auth: { token },
      query: { userId }
    });
    
    socket.on("new_notification", (notification: any) => {
      setItems(prev => {
        const newItem = adaptDbNotification(notification, prev.length);
        return [newItem, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Compute filtered items
  const filteredItems = items.filter((item) => {
    if (selectedPriority) {
      return item.priority.label === selectedPriority;
    }
    if (selectedProject) {
      return item.project.name === selectedProject;
    }
    if (selectedTab === "Unread") {
      return item.unread;
    }
    if (selectedTab === "Mentions") {
      return item.tag === "Mention";
    }
    if (selectedTab === "Tasks") {
      return item.tag === "High" || item.title.toLowerCase().includes("task");
    }
    if (selectedTab === "Approvals") {
      return item.tag === "Approval";
    }
    if (selectedTab === "Meetings") {
      return item.tag === "Meeting";
    }
    if (selectedTab === "Files") {
      return item.tag === "File";
    }
    if (selectedTab === "Calendar") {
      return item.tag === "Meeting" || item.time.includes("AM") || item.time.includes("PM");
    }
    if (selectedTab === "AI Summary") {
      return item.tag === "AI";
    }
    if (selectedTab === "System") {
      return item.tag === "System";
    }
    // "All" tab or fallback
    return true;
  });

  const activeItem =
    items.find((i) => i.id === selectedItemId) || filteredItems[0] || null;

  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    // Mark as read when selected
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  };

  const handleMarkAllRead = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      await fetch(`${API_URL}/user-notifications/mark-all-read`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
    } catch(e) {
      console.error(e);
    }
  };

  const handleToggleRead = async (id: string) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const isCurrentlyUnread = items.find(i => i.id === id)?.unread;
      
      if (isCurrentlyUnread) {
        await fetch(`${API_URL}/user-notifications/${id}/read`, {
          method: "PATCH",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
      // Note: Backend doesn't have an unread toggle yet, only mark-as-read
      // For now we'll just optimistically toggle it locally for UX
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, unread: !item.unread } : item
        )
      );
    } catch(e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      await fetch(`${API_URL}/user-notifications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedItemId("");
    } catch(e) {
      console.error(e);
    }
  };

  const handleSelectTab = (tab: string) => {
    setSelectedTab(tab);
    setSelectedPriority(null);
    setSelectedProject(null);
    // When switching tabs, automatically highlight the first visible item in that tab if current item isn't in it
    const nextFiltered = items.filter((item) => {
      if (tab === "Unread") return item.unread;
      if (tab === "Mentions") return item.tag === "Mention";
      if (tab === "Tasks") return item.tag === "High" || item.title.toLowerCase().includes("task");
      if (tab === "Approvals") return item.tag === "Approval";
      if (tab === "Meetings") return item.tag === "Meeting";
      if (tab === "Files") return item.tag === "File";
      if (tab === "Calendar") return item.tag === "Meeting" || item.time.includes("AM") || item.time.includes("PM");
      if (tab === "AI Summary") return item.tag === "AI";
      if (tab === "System") return item.tag === "System";
      return true;
    });
    if (nextFiltered.length > 0) {
      setSelectedItemId(nextFiltered[0].id);
    }
  };

  const counts: Record<string, number> = {
    All: items.length,
    Unread: items.filter((i) => i.unread).length,
    Mentions: items.filter((i) => i.tag === "Mention").length,
    Tasks: items.filter((i) => i.tag === "High" || i.title.toLowerCase().includes("task")).length,
    Approvals: items.filter((i) => i.tag === "Approval").length,
    Meetings: items.filter((i) => i.tag === "Meeting").length,
    Files: items.filter((i) => i.tag === "File").length,
    Calendar: items.filter((i) => i.tag === "Meeting" || i.time.includes("AM") || i.time.includes("PM")).length,
    "AI Summary": items.filter((i) => i.tag === "AI").length,
    System: items.filter((i) => i.tag === "System").length,
  };

  items.forEach((i) => {
    if (i.priority && i.priority.label) {
      counts[i.priority.label] = (counts[i.priority.label] || 0) + 1;
    }
    if (i.project && i.project.name) {
      counts[i.project.name] = (counts[i.project.name] || 0) + 1;
    }
  });

  return (
    <div className="flex w-full h-full min-h-0 overflow-hidden bg-white">
      <InboxSidebar
        counts={counts}
        selectedTab={selectedTab}
        onSelectTab={handleSelectTab}
        selectedPriority={selectedPriority}
        onSelectPriority={(p) => {
          const nextP = p === selectedPriority ? null : p;
          setSelectedPriority(nextP);
          if (nextP) {
            setSelectedTab("All");
            setSelectedProject(null);
            const matches = items.filter((i) => i.priority.label === nextP);
            if (matches.length > 0) setSelectedItemId(matches[0].id);
          }
        }}
        selectedProject={selectedProject}
        onSelectProject={(pr) => {
          const nextPr = pr === selectedProject ? null : pr;
          setSelectedProject(nextPr);
          if (nextPr) {
            setSelectedTab("All");
            setSelectedPriority(null);
            const matches = items.filter((i) => i.project.name === nextPr);
            if (matches.length > 0) setSelectedItemId(matches[0].id);
          }
        }}
      />

      {errorMsg && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 px-4 py-2 z-50 rounded-b-md shadow-lg text-sm font-bold border border-red-200">
          Error loading data: {errorMsg}
        </div>
      )}
      <InboxList
        items={filteredItems}
        selectedItemId={activeItem?.id || ""}
        onSelectItem={handleSelectItem}
        selectedTab={selectedPriority ? `Priority: ${selectedPriority}` : selectedProject ? `Project: ${selectedProject}` : selectedTab}
        onMarkAllRead={handleMarkAllRead}
      />

      <InboxDetail
        item={activeItem}
        onClose={() => setSelectedItemId("")}
        onMarkRead={handleToggleRead}
        onDelete={handleDelete}
      />
    </div>
  );
}

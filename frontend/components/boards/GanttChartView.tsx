"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Search, 
  Layers, 
  GitFork, 
  Flag,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  X,
  SlidersHorizontal,
  ChevronLeft,
  Columns,
  Sparkles,
  MoreHorizontal,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  MoveHorizontal
} from "lucide-react";
import Avatar from "../Avatar";

export interface GanttTask {
  id: string | number;
  title: string;
  status: "todo" | "inprogress" | "review" | "done";
  tag?: string;
  tagColor?: string;
  people?: string[];
  comments?: number;
  startDate?: string;
  endDate?: string;
  progress?: number;
  isMilestone?: boolean;
  dependsOn?: (string | number)[];
  priority?: "low" | "medium" | "high" | "urgent";
}

interface GanttChartViewProps {
  columns: {
    key: string;
    title: string;
    accent: string;
    headerBg: string;
    count: number;
    tasks: any[];
  }[];
  boardTitle?: string;
  onStatusChange?: (task: any, currentStatus: string, newStatus: string) => void;
  onAddTask?: (status: string, title: string) => void;
}

type ViewScale = "days" | "weeks" | "months" | "quarters";

const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", color: "text-rose-600 bg-rose-50 border-rose-200", dot: "bg-rose-500" },
  high: { label: "High", color: "text-amber-600 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  medium: { label: "Medium", color: "text-indigo-600 bg-indigo-50 border-indigo-200", dot: "bg-indigo-500" },
  low: { label: "Low", color: "text-slate-600 bg-slate-50 border-slate-200", dot: "bg-slate-400" },
};

export default function GanttChartView({
  columns,
  boardTitle = "Board",
  onStatusChange,
  onAddTask,
}: GanttChartViewProps) {
  const [viewScale, setViewScale] = useState<ViewScale>("months");
  const [zoomMultiplier, setZoomMultiplier] = useState<number>(1); // 0.8x to 1.6x zoom
  const [groupByStatus, setGroupByStatus] = useState<boolean>(true);
  const [showDependencies, setShowDependencies] = useState<boolean>(true);
  const [showCriticalPath, setShowCriticalPath] = useState<boolean>(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredTaskId, setHoveredTaskId] = useState<string | number | null>(null);
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [taskMetadata, setTaskMetadata] = useState<Record<string, Partial<GanttTask>>>({});

  // Tooltip state for floating card
  const [tooltipData, setTooltipData] = useState<{
    task: GanttTask;
    x: number;
    y: number;
  } | null>(null);

  // Split pane sizing
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(360);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState<boolean>(false);
  const isResizingSplit = useRef(false);

  // Inline task addition
  const [inlineAddingStatus, setInlineAddingStatus] = useState<string | null>(null);
  const [inlineTaskTitle, setInlineTaskTitle] = useState("");

  const timelineCanvasRef = useRef<HTMLDivElement>(null);
  const leftTableRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  // Load cached task metadata from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`gantt_meta_${boardTitle}`);
      if (stored) {
        setTaskMetadata(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, [boardTitle]);

  const saveTaskMetadata = useCallback((taskId: string | number, update: Partial<GanttTask>) => {
    setTaskMetadata((prev) => {
      const next = {
        ...prev,
        [String(taskId)]: { ...(prev[String(taskId)] || {}), ...update },
      };
      try {
        localStorage.setItem(`gantt_meta_${boardTitle}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, ...update } : null));
    }
  }, [boardTitle, selectedTask]);

  // Base anchor date (September 16, 2026)
  const today = useMemo(() => new Date(2026, 8, 16), []);

  // Format dates cleanly
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getDurationDays = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return 0;
    const s = new Date(startStr).getTime();
    const e = new Date(endStr).getTime();
    return Math.max(1, Math.round((e - s) / (24 * 60 * 60 * 1000)));
  };

  // Process all tasks deterministically
  const processedTasks = useMemo(() => {
    const allTasks: GanttTask[] = [];

    columns.forEach((col) => {
      col.tasks.forEach((rawTask: any, taskIdx: number) => {
        const id = rawTask.id || `task-${col.key}-${taskIdx}-${rawTask.title}`;
        const meta = taskMetadata[String(id)] || {};

        let startOffsetDays = 0;
        let durationDays = 12;
        let defaultProgress = 0;

        if (col.key === "done") {
          startOffsetDays = -26 + (taskIdx * 4);
          durationDays = 9 + (taskIdx % 3) * 3;
          defaultProgress = 100;
        } else if (col.key === "inprogress") {
          startOffsetDays = -5 + (taskIdx * 4);
          durationDays = 13 + (taskIdx % 3) * 4;
          defaultProgress = 40 + ((taskIdx * 19) % 50);
        } else if (col.key === "review") {
          startOffsetDays = -1 + (taskIdx * 3);
          durationDays = 10 + (taskIdx % 3) * 3;
          defaultProgress = 85;
        } else {
          // todo
          startOffsetDays = 5 + (taskIdx * 5);
          durationDays = 12 + (taskIdx % 4) * 4;
          defaultProgress = 0;
        }

        const taskStartDate = meta.startDate
          ? new Date(meta.startDate)
          : new Date(today.getTime() + startOffsetDays * 24 * 60 * 60 * 1000);

        const taskEndDate = meta.endDate
          ? new Date(meta.endDate)
          : new Date(taskStartDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const progress = meta.progress !== undefined ? meta.progress : defaultProgress;

        // Sensible logical dependencies: tasks link to previous sequential task in group
        const dependsOn: (string | number)[] = meta.dependsOn || [];
        if (dependsOn.length === 0 && taskIdx > 0 && (taskIdx % 2 === 1)) {
          const prevTask = col.tasks[taskIdx - 1];
          if (prevTask) {
            dependsOn.push(prevTask.id || `task-${col.key}-${taskIdx - 1}-${prevTask.title}`);
          }
        }

        const isMilestone = meta.isMilestone !== undefined 
          ? meta.isMilestone 
          : rawTask.tag === "MILESTONE" || rawTask.isMilestone === true;

        allTasks.push({
          id,
          title: rawTask.title || "Untitled Task",
          status: (col.key as any) || "todo",
          tag: rawTask.tag || (col.key === "done" ? "RELEASE" : "FEATURE"),
          tagColor: rawTask.tagColor || "bg-indigo-100 text-indigo-700",
          people: rawTask.people && rawTask.people.length > 0 ? rawTask.people : ["avi"],
          comments: rawTask.comments || 0,
          startDate: taskStartDate.toISOString().split("T")[0],
          endDate: taskEndDate.toISOString().split("T")[0],
          progress,
          isMilestone,
          dependsOn,
          priority: meta.priority || (taskIdx % 4 === 0 ? "urgent" : taskIdx % 3 === 0 ? "high" : taskIdx % 2 === 0 ? "medium" : "low"),
        });
      });
    });

    return allTasks;
  }, [columns, taskMetadata, today]);

  // Timeline Scale & Two-Tier Header Calculation
  const { timelineStart, timelineEnd, topTierColumns, bottomTierColumns, totalSpanDays, baseCanvasWidth } = useMemo(() => {
    let start: Date;
    let end: Date;

    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthNamesFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    interface TopHeaderCol {
      key: string;
      label: string;
      subLabel?: string;
      widthPercent: number;
      isCurrent?: boolean;
    }

    interface BottomHeaderCol {
      key: string;
      label: string;
      subLabel?: string;
      widthPercent: number;
      isCurrent?: boolean;
      isWeekend?: boolean;
    }

    const topCols: TopHeaderCol[] = [];
    const bottomCols: BottomHeaderCol[] = [];

    if (viewScale === "days") {
      // 28 days: 7 days before today, 21 days after
      start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      end = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
      end.setHours(23, 59, 59, 999);

      const dayCount = 29;
      // Group days by month for top tier
      const monthBuckets: { month: number; year: number; count: number }[] = [];
      let tempDay = new Date(start);
      while (tempDay <= end) {
        const m = tempDay.getMonth();
        const y = tempDay.getFullYear();
        const last = monthBuckets[monthBuckets.length - 1];
        if (last && last.month === m && last.year === y) {
          last.count++;
        } else {
          monthBuckets.push({ month: m, year: y, count: 1 });
        }
        tempDay = new Date(tempDay.getTime() + 24 * 60 * 60 * 1000);
      }

      monthBuckets.forEach((b) => {
        topCols.push({
          key: `m-${b.year}-${b.month}`,
          label: `${monthNamesFull[b.month]} ${b.year}`,
          widthPercent: (b.count / dayCount) * 100,
          isCurrent: b.month === today.getMonth() && b.year === today.getFullYear(),
        });
      });

      // Bottom tier: days
      let curr = new Date(start);
      const dayLetters = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      while (curr <= end) {
        const dayOfWeek = curr.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isCurrentDay = curr.toDateString() === today.toDateString();
        bottomCols.push({
          key: curr.toISOString().split("T")[0],
          label: `${curr.getDate()}`,
          subLabel: dayLetters[dayOfWeek],
          widthPercent: 100 / dayCount,
          isCurrent: isCurrentDay,
          isWeekend,
        });
        curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000);
      }

      return {
        timelineStart: start,
        timelineEnd: end,
        topTierColumns: topCols,
        bottomTierColumns: bottomCols,
        totalSpanDays: dayCount,
        baseCanvasWidth: Math.max(1400, dayCount * 55 * zoomMultiplier),
      };
    } else if (viewScale === "weeks") {
      // 10 weeks: 2 weeks before today, 8 weeks after
      start = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      end = new Date(today.getTime() + 56 * 24 * 60 * 60 * 1000);
      end.setHours(23, 59, 59, 999);

      const totalWeeks = 10;
      // Top tier: Group by month
      const monthBuckets: { month: number; year: number; count: number }[] = [];
      let tempWeek = new Date(start);
      for (let w = 0; w < totalWeeks; w++) {
        const m = tempWeek.getMonth();
        const y = tempWeek.getFullYear();
        const last = monthBuckets[monthBuckets.length - 1];
        if (last && last.month === m && last.year === y) {
          last.count++;
        } else {
          monthBuckets.push({ month: m, year: y, count: 1 });
        }
        tempWeek = new Date(tempWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      monthBuckets.forEach((b) => {
        topCols.push({
          key: `w-m-${b.year}-${b.month}`,
          label: `${monthNamesFull[b.month]} ${b.year}`,
          widthPercent: (b.count / totalWeeks) * 100,
          isCurrent: b.month === today.getMonth() && b.year === today.getFullYear(),
        });
      });

      // Bottom tier: weeks with date range
      let curr = new Date(start);
      for (let w = 1; w <= totalWeeks; w++) {
        const weekEnd = new Date(curr.getTime() + 6 * 24 * 60 * 60 * 1000);
        const isCurrentWeek = today >= curr && today <= weekEnd;
        bottomCols.push({
          key: `week-${w}-${curr.getTime()}`,
          label: `W${w}`,
          subLabel: `${curr.getDate()} ${monthNamesShort[curr.getMonth()]}`,
          widthPercent: 100 / totalWeeks,
          isCurrent: isCurrentWeek,
        });
        curr = new Date(curr.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
      return {
        timelineStart: start,
        timelineEnd: end,
        topTierColumns: topCols,
        bottomTierColumns: bottomCols,
        totalSpanDays: totalDays,
        baseCanvasWidth: Math.max(1300, totalWeeks * 140 * zoomMultiplier),
      };
    } else if (viewScale === "quarters") {
      // 1 Full Year: Jan 1 2026 to Dec 31 2026
      start = new Date(2026, 0, 1);
      end = new Date(2026, 11, 31, 23, 59, 59);

      topCols.push({
        key: "year-2026",
        label: "Fiscal Year 2026",
        widthPercent: 100,
        isCurrent: true,
      });

      const quarters = [
        { label: "Q1", sub: "Jan – Mar", isCurrent: false },
        { label: "Q2", sub: "Apr – Jun", isCurrent: false },
        { label: "Q3", sub: "Jul – Sep", isCurrent: true },
        { label: "Q4", sub: "Oct – Dec", isCurrent: false },
      ];

      quarters.forEach((q, idx) => {
        bottomCols.push({
          key: `Q${idx + 1}`,
          label: q.label,
          subLabel: q.sub,
          widthPercent: 25,
          isCurrent: q.isCurrent,
        });
      });

      return {
        timelineStart: start,
        timelineEnd: end,
        topTierColumns: topCols,
        bottomTierColumns: bottomCols,
        totalSpanDays: 365,
        baseCanvasWidth: Math.max(1100, 1100 * zoomMultiplier),
      };
    } else {
      // "months" view (Default): July 2026 to January 2027 (7 months for room)
      start = new Date(2026, 6, 1); // July 1, 2026
      end = new Date(2027, 0, 31, 23, 59, 59); // Jan 31, 2027

      const totalMonths = 7;
      topCols.push({
        key: "h2-2026",
        label: "H2 2026 & H1 2027 Roadmap",
        widthPercent: 100,
        isCurrent: true,
      });

      let curr = new Date(start);
      for (let m = 0; m < totalMonths; m++) {
        const monthNum = curr.getMonth();
        const yearNum = curr.getFullYear();
        const isCurrentMonth = monthNum === today.getMonth() && yearNum === today.getFullYear();
        bottomCols.push({
          key: `month-${yearNum}-${monthNum}`,
          label: `${monthNamesShort[monthNum]} ${yearNum}`,
          subLabel: isCurrentMonth ? "Current" : undefined,
          widthPercent: 100 / totalMonths,
          isCurrent: isCurrentMonth,
        });
        curr = new Date(yearNum, monthNum + 1, 1);
      }

      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
      return {
        timelineStart: start,
        timelineEnd: end,
        topTierColumns: topCols,
        bottomTierColumns: bottomCols,
        totalSpanDays: totalDays,
        baseCanvasWidth: Math.max(1350, totalMonths * 210 * zoomMultiplier),
      };
    }
  }, [viewScale, today, zoomMultiplier]);

  // Convert a date string to percent [0, 100]
  const getPercentFromDate = useCallback((dateStr: string) => {
    const d = new Date(dateStr).getTime();
    const s = timelineStart.getTime();
    const e = timelineEnd.getTime();
    if (d <= s) return 0;
    if (d >= e) return 100;
    return ((d - s) / (e - s)) * 100;
  }, [timelineStart, timelineEnd]);

  // Convert percentage back to a Date string
  const getDateFromPercent = useCallback((pct: number) => {
    const clamped = Math.max(0, Math.min(100, pct));
    const s = timelineStart.getTime();
    const e = timelineEnd.getTime();
    const time = s + (clamped / 100) * (e - s);
    return new Date(time).toISOString().split("T")[0];
  }, [timelineStart, timelineEnd]);

  // Today marker percent
  const todayPercent = useMemo(() => {
    return getPercentFromDate(today.toISOString().split("T")[0]);
  }, [today, getPercentFromDate]);

  // Scroll to Today marker smoothly
  const scrollToToday = useCallback(() => {
    if (timelineCanvasRef.current) {
      const scrollWidth = timelineCanvasRef.current.scrollWidth;
      const clientWidth = timelineCanvasRef.current.clientWidth;
      const targetScroll = (todayPercent / 100) * scrollWidth - clientWidth / 2;
      timelineCanvasRef.current.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth",
      });
    }
  }, [todayPercent]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToToday();
    }, 150);
    return () => clearTimeout(timer);
  }, [viewScale, scrollToToday]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return processedTasks;
    const q = searchQuery.toLowerCase();
    return processedTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.tag && t.tag.toLowerCase().includes(q)) ||
        t.status.toLowerCase().includes(q)
    );
  }, [processedTasks, searchQuery]);

  // Grouped tasks
  const groupedTasks = useMemo(() => {
    const statusOrder: { key: string; label: string; accent: string; dot: string; bg: string; border: string }[] = [
      { key: "todo", label: "To Do", accent: "text-slate-700", dot: "bg-slate-400", bg: "bg-slate-50/80", border: "border-slate-200/60" },
      { key: "inprogress", label: "In Progress", accent: "text-indigo-700", dot: "bg-indigo-500", bg: "bg-indigo-50/60", border: "border-indigo-200/60" },
      { key: "review", label: "In Review", accent: "text-amber-700", dot: "bg-amber-500", bg: "bg-amber-50/60", border: "border-amber-200/60" },
      { key: "done", label: "Completed", accent: "text-emerald-700", dot: "bg-emerald-500", bg: "bg-emerald-50/60", border: "border-emerald-200/60" },
    ];

    return statusOrder.map((group) => {
      const tasks = filteredTasks.filter((t) => t.status === group.key);
      const avgProgress = tasks.length
        ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length)
        : 0;

      return {
        ...group,
        tasks,
        count: tasks.length,
        avgProgress,
        isCollapsed: !!collapsedGroups[group.key],
      };
    });
  }, [filteredTasks, collapsedGroups]);

  // Stats KPI
  const stats = useMemo(() => {
    const total = processedTasks.length;
    const completed = processedTasks.filter((t) => t.status === "done").length;
    const inProgress = processedTasks.filter((t) => t.status === "inprogress").length;
    const inReview = processedTasks.filter((t) => t.status === "review").length;
    const overallProgress = total
      ? Math.round(processedTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / total)
      : 0;

    return { total, completed, inProgress, inReview, overallProgress };
  }, [processedTasks]);

  // Accurate Row Geometry for Dependency Curves & Row Alignment
  const ROW_HEIGHT = 44; // px
  const GROUP_HEADER_HEIGHT = 36; // px
  const ADD_ROW_HEIGHT = 36; // px

  const taskGeometry = useMemo(() => {
    const positions: Record<string, { top: number; centerY: number; status: string; task: GanttTask }> = {};
    let currentY = 0;

    if (groupByStatus) {
      groupedTasks.forEach((group) => {
        currentY += GROUP_HEADER_HEIGHT;
        if (!group.isCollapsed) {
          group.tasks.forEach((task) => {
            positions[String(task.id)] = {
              top: currentY,
              centerY: currentY + ROW_HEIGHT / 2,
              status: task.status,
              task,
            };
            currentY += ROW_HEIGHT;
          });
          currentY += ADD_ROW_HEIGHT;
        }
      });
    } else {
      filteredTasks.forEach((task) => {
        positions[String(task.id)] = {
          top: currentY,
          centerY: currentY + ROW_HEIGHT / 2,
          status: task.status,
          task,
        };
        currentY += ROW_HEIGHT;
      });
    }

    return { positions, totalContentHeight: Math.max(500, currentY + 40) };
  }, [groupByStatus, groupedTasks, filteredTasks]);

  // Critical path calculation
  const criticalTaskIds = useMemo(() => {
    if (!showCriticalPath) return new Set<string>();
    const critical = new Set<string>();
    // Identify uncompleted tasks that have dependencies
    filteredTasks.forEach((t) => {
      if (t.dependsOn && t.dependsOn.length > 0 && t.status !== "done") {
        critical.add(String(t.id));
        t.dependsOn.forEach((dep) => critical.add(String(dep)));
      }
    });
    return critical;
  }, [filteredTasks, showCriticalPath]);

  // Precise Dependency SVG Connectors
  const dependencyLines = useMemo(() => {
    if (!showDependencies) return [];
    const lines: {
      id: string;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      isCompleted: boolean;
      isCritical: boolean;
      sourceTitle: string;
      targetTitle: string;
    }[] = [];

    const taskMap = new Map<string, GanttTask>();
    filteredTasks.forEach((t) => taskMap.set(String(t.id), t));

    filteredTasks.forEach((targetTask) => {
      if (targetTask.dependsOn && targetTask.dependsOn.length > 0) {
        targetTask.dependsOn.forEach((depId) => {
          const sourceTask = taskMap.get(String(depId));
          const sourcePos = taskGeometry.positions[String(depId)];
          const targetPos = taskGeometry.positions[String(targetTask.id)];

          if (sourceTask && sourcePos && targetPos) {
            const startX = getPercentFromDate(sourceTask.endDate!);
            const endX = getPercentFromDate(targetTask.startDate!);
            const isCritical = criticalTaskIds.has(String(sourceTask.id)) && criticalTaskIds.has(String(targetTask.id));

            lines.push({
              id: `${sourceTask.id}->${targetTask.id}`,
              startX,
              startY: sourcePos.centerY,
              endX,
              endY: targetPos.centerY,
              isCompleted: sourceTask.status === "done",
              isCritical,
              sourceTitle: sourceTask.title,
              targetTitle: targetTask.title,
            });
          }
        });
      }
    });

    return lines;
  }, [showDependencies, filteredTasks, taskGeometry, getPercentFromDate, criticalTaskIds]);

  // Synchronized scroll with lock to prevent ping-pong feedback jitter
  const handleLeftScroll = () => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    if (timelineCanvasRef.current && leftTableRef.current) {
      timelineCanvasRef.current.scrollTop = leftTableRef.current.scrollTop;
    }
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  const handleRightScroll = () => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    if (timelineCanvasRef.current && leftTableRef.current) {
      leftTableRef.current.scrollTop = timelineCanvasRef.current.scrollTop;
    }
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  // Drag & Resize State (Smooth 60fps - only commit on mouseUp)
  const [activeDrag, setActiveDrag] = useState<{
    id: string | number;
    mode: "move" | "resize-left" | "resize-right";
    initialMouseX: number;
    initialStartMs: number;
    initialEndMs: number;
    currentStartMs: number;
    currentEndMs: number;
  } | null>(null);

  const handleStartDrag = (
    e: React.MouseEvent,
    task: GanttTask,
    mode: "move" | "resize-left" | "resize-right"
  ) => {
    e.stopPropagation();
    setActiveDrag({
      id: task.id,
      mode,
      initialMouseX: e.clientX,
      initialStartMs: new Date(task.startDate!).getTime(),
      initialEndMs: new Date(task.endDate!).getTime(),
      currentStartMs: new Date(task.startDate!).getTime(),
      currentEndMs: new Date(task.endDate!).getTime(),
    });
  };

  useEffect(() => {
    if (!activeDrag) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = timelineCanvasRef.current?.querySelector(".gantt-canvas-grid");
      const containerWidth = container?.clientWidth || 1000;
      const totalTimelineMs = timelineEnd.getTime() - timelineStart.getTime();
      const deltaPx = e.clientX - activeDrag.initialMouseX;
      let deltaMs = (deltaPx / containerWidth) * totalTimelineMs;

      // Snap to full day boundaries (24h)
      const oneDayMs = 24 * 60 * 60 * 1000;
      deltaMs = Math.round(deltaMs / oneDayMs) * oneDayMs;

      let newStart = activeDrag.initialStartMs;
      let newEnd = activeDrag.initialEndMs;

      if (activeDrag.mode === "move") {
        newStart += deltaMs;
        newEnd += deltaMs;
      } else if (activeDrag.mode === "resize-left") {
        newStart = Math.min(activeDrag.initialEndMs - oneDayMs, activeDrag.initialStartMs + deltaMs);
      } else if (activeDrag.mode === "resize-right") {
        newEnd = Math.max(activeDrag.initialStartMs + oneDayMs, activeDrag.initialEndMs + deltaMs);
      }

      setActiveDrag((prev) => (prev ? { ...prev, currentStartMs: newStart, currentEndMs: newEnd } : null));
    };

    const handleMouseUp = () => {
      if (activeDrag) {
        saveTaskMetadata(activeDrag.id, {
          startDate: new Date(activeDrag.currentStartMs).toISOString().split("T")[0],
          endDate: new Date(activeDrag.currentEndMs).toISOString().split("T")[0],
        });
        setActiveDrag(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeDrag, timelineStart, timelineEnd, saveTaskMetadata]);

  // Resizable Split Pane Dragging
  useEffect(() => {
    const handleSplitMouseMove = (e: MouseEvent) => {
      if (!isResizingSplit.current) return;
      const newWidth = Math.max(220, Math.min(540, e.clientX - 60));
      setLeftPanelWidth(newWidth);
    };

    const handleSplitMouseUp = () => {
      isResizingSplit.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleSplitMouseMove);
    window.addEventListener("mouseup", handleSplitMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleSplitMouseMove);
      window.removeEventListener("mouseup", handleSplitMouseUp);
    };
  }, []);

  // Status visual themes
  const getStatusBarTheme = (status: string) => {
    switch (status) {
      case "done":
        return {
          barBg: "bg-emerald-500/15 border-emerald-400/60 text-emerald-950",
          progressBg: "bg-gradient-to-r from-emerald-500 to-teal-500",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-500",
          labelColor: "text-emerald-700",
          name: "Done",
        };
      case "inprogress":
        return {
          barBg: "bg-indigo-500/15 border-indigo-400/60 text-indigo-950",
          progressBg: "bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-500",
          badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
          dot: "bg-indigo-500",
          labelColor: "text-indigo-700",
          name: "In Progress",
        };
      case "review":
        return {
          barBg: "bg-amber-500/15 border-amber-400/60 text-amber-950",
          progressBg: "bg-gradient-to-r from-amber-500 to-orange-500",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          dot: "bg-amber-500",
          labelColor: "text-amber-700",
          name: "Review",
        };
      default:
        return {
          barBg: "bg-slate-400/15 border-slate-300 text-slate-800",
          progressBg: "bg-gradient-to-r from-slate-400 to-slate-500",
          badge: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
          labelColor: "text-slate-600",
          name: "To Do",
        };
    }
  };

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllGroups = () => {
    const allCollapsed = groupedTasks.every((g) => collapsedGroups[g.key]);
    if (allCollapsed) {
      setCollapsedGroups({});
    } else {
      const all: Record<string, boolean> = {};
      groupedTasks.forEach((g) => (all[g.key] = true));
      setCollapsedGroups(all);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden select-none">
      {/* 1. TOP TOOLBAR */}
      <div className="shrink-0 px-4 py-2 border-b border-gray-200/80 bg-gradient-to-r from-gray-50/90 via-white to-gray-50/60 flex flex-wrap items-center justify-between gap-2.5 z-30">
        {/* Left Side: View Scales, Zoom, Navigation */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Zoom scale selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-gray-100/80 border border-gray-200 shadow-2xs">
            {(["days", "weeks", "months", "quarters"] as ViewScale[]).map((scale) => (
              <button
                key={scale}
                onClick={() => setViewScale(scale)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md capitalize transition-all cursor-pointer ${
                  viewScale === scale
                    ? "bg-white text-indigo-700 shadow-xs border border-gray-200/60"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {scale}
              </button>
            ))}
          </div>

          {/* Zoom In / Out Buttons */}
          <div className="flex items-center rounded-lg bg-white border border-gray-200 shadow-2xs overflow-hidden">
            <button
              onClick={() => setZoomMultiplier((prev) => Math.max(0.7, Number((prev - 0.15).toFixed(2))))}
              title="Zoom out timeline"
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-100 cursor-pointer"
            >
              <ZoomOut size={13} />
            </button>
            <span className="px-2 text-[10px] font-black text-gray-500">
              {Math.round(zoomMultiplier * 100)}%
            </span>
            <button
              onClick={() => setZoomMultiplier((prev) => Math.min(1.7, Number((prev + 0.15).toFixed(2))))}
              title="Zoom in timeline"
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          <div className="h-4 w-px bg-gray-200 mx-0.5" />

          {/* Today Button */}
          <button
            onClick={scrollToToday}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 text-[11px] font-bold text-gray-700 hover:text-indigo-600 shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <Clock size={12} className="text-indigo-500" />
            <span>Today</span>
          </button>

          {/* Grouping Toggle */}
          <button
            onClick={() => setGroupByStatus((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              groupByStatus
                ? "bg-indigo-50/80 border-indigo-200 text-indigo-700 shadow-2xs"
                : "bg-white border-gray-200 text-gray-600 hover:text-gray-800"
            }`}
          >
            <Layers size={12} />
            <span>Group Status</span>
          </button>

          {/* Dependencies Toggle */}
          <button
            onClick={() => setShowDependencies((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              showDependencies
                ? "bg-indigo-50/80 border-indigo-200 text-indigo-700 shadow-2xs"
                : "bg-white border-gray-200 text-gray-600 hover:text-gray-800"
            }`}
          >
            <GitFork size={12} />
            <span>Dependencies</span>
          </button>

          {/* Critical Path Toggle */}
          <button
            onClick={() => setShowCriticalPath((prev) => !prev)}
            title="Highlight tasks on critical dependency path"
            className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border text-[10.5px] font-bold transition-all cursor-pointer ${
              showCriticalPath
                ? "bg-amber-50 border-amber-300 text-amber-800 shadow-2xs"
                : "bg-white border-gray-200 text-gray-500 hover:text-gray-800"
            }`}
          >
            <Sparkles size={11} className={showCriticalPath ? "text-amber-600" : "text-gray-400"} />
            <span>Critical Path</span>
          </button>

          {/* Left Table Collapse Button */}
          <button
            onClick={() => setIsLeftPanelCollapsed((prev) => !prev)}
            title={isLeftPanelCollapsed ? "Show Task List" : "Hide Task List for full timeline"}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 text-[11px] font-bold transition-colors cursor-pointer"
          >
            {isLeftPanelCollapsed ? <Eye size={12} /> : <EyeOff size={12} />}
            <span className="hidden md:inline">{isLeftPanelCollapsed ? "Show List" : "Hide List"}</span>
          </button>
        </div>

        {/* Right Side: Quick Search & Project Progress KPI */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 sm:w-44 text-[11px] font-medium pl-8 pr-6 py-1 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* KPI Badge with Progress Bar */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 shadow-2xs">
            <span className="flex items-center gap-1">
              <strong className="text-gray-900 font-extrabold">{stats.completed}</strong>
              <span className="text-gray-400">/{stats.total}</span>
              <span className="text-gray-500 font-medium">Done</span>
            </span>
            <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.overallProgress}%` }}
              />
            </div>
            <span className="text-[10.5px] font-black text-emerald-600">{stats.overallProgress}%</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT PANE (LEFT TASK TABLE + RIGHT GANTT TIMELINE) */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden bg-white">
        {/* LEFT TASK TABLE */}
        {!isLeftPanelCollapsed && (
          <div
            ref={leftTableRef}
            onScroll={handleLeftScroll}
            style={{ width: `${leftPanelWidth}px` }}
            className="shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-y-auto z-20 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.03)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 transition-[width] duration-75"
          >
            {/* Left Header - Exactly 48px to match Two-Tier Timeline Header */}
            <div className="sticky top-0 z-30 h-12 border-b border-gray-200 bg-gray-50/95 backdrop-blur-xs px-3 flex items-center justify-between text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
              <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                <span>Task Name</span>
                {groupByStatus && (
                  <button
                    onClick={toggleAllGroups}
                    title="Toggle all groups"
                    className="p-0.5 text-gray-400 hover:text-gray-700 rounded transition-colors"
                  >
                    <SlidersHorizontal size={11} />
                  </button>
                )}
              </div>
              <div className="w-18 text-center shrink-0">Status</div>
              <div className="w-12 text-center shrink-0">People</div>
              <div className="w-12 text-right pr-1 shrink-0">Progress</div>
            </div>

            {/* Left Table Content */}
            {groupByStatus ? (
              <div className="flex flex-col">
                {groupedTasks.map((group) => (
                  <div key={group.key} className="flex flex-col border-b border-gray-100 last:border-b-0">
                    {/* Group Header (Fixed 36px) */}
                    <div
                      onClick={() => toggleGroupCollapse(group.key)}
                      style={{ height: `${GROUP_HEADER_HEIGHT}px` }}
                      className={`px-3 flex items-center justify-between cursor-pointer hover:brightness-98 transition-colors ${group.bg} border-b ${group.border}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button className="text-gray-400 hover:text-gray-600 transition-transform">
                          {group.isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <span className={`h-2 w-2 rounded-full ${group.dot} shrink-0`} />
                        <span className={`text-[11px] font-extrabold ${group.accent} truncate`}>
                          {group.label}
                        </span>
                        <span className="text-[9px] font-black bg-white px-1.5 py-0.2 rounded-full border border-gray-200/80 text-gray-500 shadow-2xs">
                          {group.count}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-12 h-1.5 bg-gray-200/70 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${group.dot} transition-all duration-300`}
                            style={{ width: `${group.avgProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 w-7 text-right">
                          {group.avgProgress}%
                        </span>
                      </div>
                    </div>

                    {/* Group Task Rows */}
                    {!group.isCollapsed && (
                      <div className="flex flex-col">
                        {group.tasks.map((task) => {
                          const isHovered = hoveredTaskId === task.id;
                          const isDone = task.status === "done";
                          const priorityInfo = PRIORITY_CONFIG[task.priority || "medium"];

                          return (
                            <div
                              key={task.id}
                              style={{ height: `${ROW_HEIGHT}px` }}
                              onMouseEnter={() => setHoveredTaskId(task.id)}
                              onMouseLeave={() => setHoveredTaskId(null)}
                              onClick={() => setSelectedTask(task)}
                              className={`px-3 border-b border-gray-50 flex items-center justify-between cursor-pointer transition-colors ${
                                isHovered ? "bg-indigo-50/50" : "hover:bg-gray-50/70"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                                {/* Completion Checkbox */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const targetStatus = isDone ? "todo" : "done";
                                    onStatusChange?.(task, task.status, targetStatus);
                                    saveTaskMetadata(task.id, {
                                      progress: isDone ? 0 : 100,
                                    });
                                  }}
                                  className="shrink-0 text-gray-300 hover:text-emerald-500 transition-colors"
                                >
                                  {isDone ? (
                                    <CheckCircle2 size={14} className="text-emerald-500 fill-emerald-50" />
                                  ) : (
                                    <Circle size={14} />
                                  )}
                                </button>

                                <span
                                  className={`text-[11px] font-bold truncate ${
                                    isDone ? "text-gray-400 line-through" : "text-gray-800"
                                  }`}
                                  title={task.title}
                                >
                                  {task.title}
                                </span>

                                {task.isMilestone && (
                                  <span title="Milestone Target" className="shrink-0">
                                    <Flag size={11} className="text-amber-500 fill-amber-400" />
                                  </span>
                                )}
                              </div>

                              {/* Status Dropdown */}
                              <div className="w-18 shrink-0 flex justify-center">
                                <select
                                  value={task.status}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    onStatusChange?.(task, task.status, e.target.value);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[9px] font-extrabold uppercase tracking-wider bg-gray-50/90 border border-gray-200/90 rounded-md px-1.5 py-0.5 text-gray-600 hover:border-indigo-300 focus:outline-none cursor-pointer"
                                >
                                  <option value="todo">To Do</option>
                                  <option value="inprogress">Active</option>
                                  <option value="review">Review</option>
                                  <option value="done">Done</option>
                                </select>
                              </div>

                              {/* Assignee */}
                              <div className="w-12 shrink-0 flex justify-center">
                                <div className="flex -space-x-1.5">
                                  {(task.people || ["avi"]).slice(0, 2).map((p, i) => (
                                    <Avatar key={i} person={p} size={18} ring />
                                  ))}
                                </div>
                              </div>

                              {/* Progress */}
                              <div className="w-12 shrink-0 text-right pr-1">
                                <span className={`text-[10px] font-extrabold ${isDone ? "text-emerald-600" : "text-gray-600"}`}>
                                  {task.progress || 0}%
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Inline Add Task Row (Fixed 36px height) */}
                        <div
                          style={{ height: `${ADD_ROW_HEIGHT}px` }}
                          className="border-b border-gray-50 flex items-center px-3 bg-gray-50/20 overflow-hidden"
                        >
                          {inlineAddingStatus === group.key ? (
                            <div className="flex items-center gap-1.5 w-full">
                              <input
                                type="text"
                                autoFocus
                                placeholder="Task title..."
                                value={inlineTaskTitle}
                                onChange={(e) => setInlineTaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && inlineTaskTitle.trim()) {
                                    onAddTask?.(group.key, inlineTaskTitle.trim());
                                    setInlineTaskTitle("");
                                    setInlineAddingStatus(null);
                                  } else if (e.key === "Escape") {
                                    setInlineAddingStatus(null);
                                  }
                                }}
                                className="flex-1 text-[11px] font-semibold bg-white border border-indigo-300 rounded px-2 py-0.5 focus:outline-none shadow-2xs"
                              />
                              <button
                                onClick={() => {
                                  if (inlineTaskTitle.trim()) {
                                    onAddTask?.(group.key, inlineTaskTitle.trim());
                                    setInlineTaskTitle("");
                                    setInlineAddingStatus(null);
                                  }
                                }}
                                className="px-2 py-0.5 text-[9px] font-bold bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => setInlineAddingStatus(null)}
                                className="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setInlineAddingStatus(group.key);
                                setInlineTaskTitle("");
                              }}
                              className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              <Plus size={12} />
                              <span>Add task to {group.label}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Flat Task List */
              <div className="flex flex-col">
                {filteredTasks.map((task) => {
                  const isHovered = hoveredTaskId === task.id;
                  const isDone = task.status === "done";
                  const theme = getStatusBarTheme(task.status);

                  return (
                    <div
                      key={task.id}
                      style={{ height: `${ROW_HEIGHT}px` }}
                      onMouseEnter={() => setHoveredTaskId(task.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                      onClick={() => setSelectedTask(task)}
                      className={`px-3 border-b border-gray-100 flex items-center justify-between cursor-pointer transition-colors ${
                        isHovered ? "bg-indigo-50/50" : "hover:bg-gray-50/80"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                        <span className={`h-2 w-2 rounded-full ${theme.dot} shrink-0`} />
                        <span
                          className={`text-[11px] font-bold truncate ${
                            isDone ? "text-gray-400 line-through" : "text-gray-800"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="w-18 shrink-0 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${theme.badge}`}
                        >
                          {theme.name}
                        </span>
                      </div>

                      <div className="w-12 shrink-0 flex justify-center">
                        <Avatar person={task.people?.[0] || "avi"} size={18} ring />
                      </div>

                      <div className="w-12 shrink-0 text-right pr-1">
                        <span className="text-[10px] font-extrabold text-gray-600">
                          {task.progress || 0}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* DRAGGABLE RESIZER HANDLE */}
        {!isLeftPanelCollapsed && (
          <div
            onMouseDown={(e) => {
              isResizingSplit.current = true;
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
            title="Drag to resize pane (Double-click to reset)"
            onDoubleClick={() => setLeftPanelWidth(360)}
            className="w-1 hover:w-1.5 bg-gray-200 hover:bg-indigo-400 transition-all cursor-col-resize z-30 shrink-0 relative group"
          >
            <div className="absolute top-1/2 -translate-y-1/2 -left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white rounded p-0.5 shadow-sm">
              <MoveHorizontal size={10} />
            </div>
          </div>
        )}

        {/* RIGHT GANTT TIMELINE CANVAS */}
        <div
          ref={timelineCanvasRef}
          onScroll={handleRightScroll}
          className="flex-1 min-w-0 bg-white overflow-x-auto overflow-y-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-gray-200"
        >
          <div
            style={{ width: `${baseCanvasWidth}px` }}
            className="min-w-full relative flex flex-col"
          >
            {/* TWO-TIER TIMELINE HEADER (Height: 48px exactly) */}
            <div className="sticky top-0 z-30 h-12 border-b border-gray-200 bg-gray-50/95 backdrop-blur-xs flex flex-col shrink-0 shadow-2xs">
              {/* Top Tier (Major periods: Months, Quarters, Year) */}
              <div className="h-6 flex border-b border-gray-200/70">
                {topTierColumns.map((col) => (
                  <div
                    key={col.key}
                    style={{ width: `${col.widthPercent}%` }}
                    className={`border-r border-gray-200/70 px-2 flex items-center justify-between text-[10px] font-extrabold text-gray-600 truncate ${
                      col.isCurrent ? "bg-indigo-50/40 text-indigo-700" : ""
                    }`}
                  >
                    <span className="truncate">{col.label}</span>
                    {col.subLabel && <span className="text-[9px] text-gray-400 font-medium">{col.subLabel}</span>}
                  </div>
                ))}
              </div>

              {/* Bottom Tier (Minor periods: Days, Weeks, Months) */}
              <div className="h-6 flex relative">
                {bottomTierColumns.map((col) => (
                  <div
                    key={col.key}
                    style={{ width: `${col.widthPercent}%` }}
                    className={`border-r border-gray-200/60 px-1 flex items-center justify-center gap-1 text-[9.5px] font-bold transition-colors ${
                      col.isCurrent
                        ? "bg-indigo-100/60 text-indigo-700 font-black"
                        : col.isWeekend
                        ? "bg-gray-100/40 text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    <span>{col.label}</span>
                    {col.subLabel && (
                      <span className="text-[8px] font-medium text-gray-400">{col.subLabel}</span>
                    )}
                  </div>
                ))}

                {/* NON-COLLIDING TODAY BADGE IN HEADER */}
                {todayPercent >= 0 && todayPercent <= 100 && (
                  <div
                    style={{ left: `${todayPercent}%` }}
                    className="absolute top-0 bottom-0 -translate-x-1/2 flex items-center pointer-events-none z-40"
                  >
                    <div className="bg-rose-500 text-white text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Today</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TIMELINE GRID & BARS CONTAINER */}
            <div
              style={{ minHeight: `${taskGeometry.totalContentHeight}px` }}
              className="relative flex-1 gantt-canvas-grid"
            >
              {/* Background Grid Vertical Striping */}
              <div className="absolute inset-0 flex pointer-events-none z-0">
                {bottomTierColumns.map((col) => (
                  <div
                    key={col.key}
                    style={{ width: `${col.widthPercent}%` }}
                    className={`border-r border-dashed border-gray-200/60 h-full ${
                      col.isCurrent ? "bg-indigo-50/15" : col.isWeekend ? "bg-slate-50/50" : ""
                    }`}
                  />
                ))}
              </div>

              {/* VERTICAL TODAY INDICATOR LINE (Sleek red glow line spanning canvas) */}
              {todayPercent >= 0 && todayPercent <= 100 && (
                <div
                  style={{ left: `${todayPercent}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                >
                  <div className="w-full h-full bg-gradient-to-b from-rose-500 via-rose-500/80 to-rose-400/30" />
                </div>
              )}

              {/* ACCURATE SVG DEPENDENCY BEZIER CURVES */}
              {showDependencies && dependencyLines.length > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                  <defs>
                    <marker
                      id="arrow-head-default"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#818cf8" />
                    </marker>
                    <marker
                      id="arrow-head-done"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                    </marker>
                    <marker
                      id="arrow-head-critical"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
                    </marker>
                  </defs>
                  {dependencyLines.map((line) => {
                    const isHovered = hoveredTaskId && line.id.includes(String(hoveredTaskId));

                    let strokeColor = line.isCompleted ? "#10b981" : "#818cf8";
                    let markerId = line.isCompleted ? "arrow-head-done" : "arrow-head-default";

                    if (line.isCritical) {
                      strokeColor = "#f59e0b";
                      markerId = "arrow-head-critical";
                    }

                    return (
                      <g key={line.id} className="transition-all duration-200">
                        {/* Shadow path for hover highlight */}
                        <path
                          d={`M ${line.startX}% ${line.startY}px C ${line.startX + 2}% ${line.startY}px, ${line.endX - 2}% ${line.endY}px, ${line.endX}% ${line.endY}px`}
                          fill="none"
                          stroke={isHovered ? strokeColor : "transparent"}
                          strokeWidth={isHovered ? 6 : 0}
                          strokeOpacity={0.2}
                        />
                        {/* Main connector path */}
                        <path
                          d={`M ${line.startX}% ${line.startY}px C ${line.startX + 2}% ${line.startY}px, ${line.endX - 2}% ${line.endY}px, ${line.endX}% ${line.endY}px`}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={isHovered ? 2.5 : line.isCritical ? 2 : 1.5}
                          strokeDasharray={line.isCompleted ? "none" : line.isCritical ? "4,2" : "3,3"}
                          markerEnd={`url(#${markerId})`}
                          className="opacity-80 hover:opacity-100"
                        />
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* TIMELINE ROWS (Grouped or Flat) */}
              {groupByStatus ? (
                <div className="flex flex-col relative z-10">
                  {groupedTasks.map((group) => (
                    <div key={group.key} className="flex flex-col border-b border-gray-100 last:border-b-0">
                      {/* Group Header Spacer (Fixed 36px) */}
                      <div
                        style={{ height: `${GROUP_HEADER_HEIGHT}px` }}
                        className={`border-b ${group.border} ${group.bg} flex items-center px-4`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-wider ${group.accent} opacity-70`}>
                          {group.label} Timeline
                        </span>
                      </div>

                      {/* Group Task Bars */}
                      {!group.isCollapsed && (
                        <div className="flex flex-col">
                          {group.tasks.map((task) => {
                            const isHovered = hoveredTaskId === task.id;
                            const theme = getStatusBarTheme(task.status);

                            // Calculate dates (accounting for active drag preview)
                            const isDraggingThis = activeDrag && activeDrag.id === task.id;
                            const startStr = isDraggingThis
                              ? new Date(activeDrag.currentStartMs).toISOString().split("T")[0]
                              : task.startDate!;
                            const endStr = isDraggingThis
                              ? new Date(activeDrag.currentEndMs).toISOString().split("T")[0]
                              : task.endDate!;

                            const leftPct = getPercentFromDate(startStr);
                            const rightPct = getPercentFromDate(endStr);
                            const widthPct = Math.max(0.6, rightPct - leftPct);
                            const isNarrow = widthPct < 8; // Under 8% width is narrow, display title outside!
                            const isCritical = criticalTaskIds.has(String(task.id));

                            return (
                              <div
                                key={task.id}
                                style={{ height: `${ROW_HEIGHT}px` }}
                                onMouseEnter={(e) => {
                                  setHoveredTaskId(task.id);
                                  setTooltipData({
                                    task,
                                    x: e.clientX,
                                    y: e.clientY,
                                  });
                                }}
                                onMouseLeave={() => {
                                  setHoveredTaskId(null);
                                  setTooltipData(null);
                                }}
                                className={`border-b border-gray-50 relative flex items-center transition-colors ${
                                  isHovered ? "bg-indigo-50/20" : ""
                                }`}
                              >
                                {task.isMilestone ? (
                                  /* Sleek Milestone Target Diamond */
                                  <div
                                    style={{ left: `${leftPct}%` }}
                                    onClick={() => setSelectedTask(task)}
                                    className="absolute -translate-x-1/2 flex items-center gap-2 cursor-pointer group z-20"
                                  >
                                    <div className="w-5 h-5 bg-gradient-to-tr from-amber-500 to-orange-400 rotate-45 rounded-xs shadow-md border-2 border-white flex items-center justify-center group-hover:scale-125 transition-transform">
                                      <div className="w-1.5 h-1.5 bg-white rounded-full -rotate-45" />
                                    </div>
                                    <span className="text-[10px] font-extrabold text-amber-900 bg-amber-50/95 backdrop-blur-xs px-2 py-0.5 rounded shadow-2xs border border-amber-200/80 whitespace-nowrap group-hover:border-amber-400 transition-colors">
                                      {task.title}
                                    </span>
                                  </div>
                                ) : (
                                  /* Standard Gantt Bar with Smart Labeling */
                                  <div
                                    style={{
                                      left: `${leftPct}%`,
                                      width: `${widthPct}%`,
                                    }}
                                    onClick={() => setSelectedTask(task)}
                                    onMouseDown={(e) => handleStartDrag(e, task, "move")}
                                    className={`absolute h-7 rounded-lg border ${theme.barBg} ${
                                      isCritical ? "ring-2 ring-amber-400/80 shadow-amber-200/50" : ""
                                    } shadow-2xs group cursor-grab active:cursor-grabbing hover:shadow-md hover:brightness-105 transition-shadow flex items-center overflow-visible z-10`}
                                  >
                                    {/* Left Resize Handle */}
                                    <div
                                      onMouseDown={(e) => handleStartDrag(e, task, "resize-left")}
                                      title="Drag to change start date"
                                      className="absolute -left-1 top-0 bottom-0 w-3 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-indigo-500/20 hover:bg-indigo-500/50 rounded-l-lg flex items-center justify-center z-30 transition-opacity"
                                    >
                                      <div className="w-0.5 h-3 bg-white rounded-full shadow-xs" />
                                    </div>

                                    {/* Progress Fill inside bar */}
                                    <div
                                      className={`absolute left-0 top-0 bottom-0 ${theme.progressBg} transition-all duration-300 rounded-l-md overflow-hidden`}
                                      style={{ width: `${task.progress || 0}%` }}
                                    >
                                      <div className="absolute inset-0 bg-white/15 bg-gradient-to-b from-white/30 to-transparent" />
                                    </div>

                                    {/* Bar Internal Label (for wider bars) */}
                                    {!isNarrow && (
                                      <div className="relative z-20 px-2.5 flex items-center justify-between w-full pointer-events-none truncate text-[10.5px] font-extrabold">
                                        <span className="truncate drop-shadow-2xs text-gray-900">
                                          {task.title}
                                        </span>
                                        <span className="text-[9px] font-black text-gray-800 ml-1.5 shrink-0 opacity-85">
                                          {task.progress || 0}%
                                        </span>
                                      </div>
                                    )}

                                    {/* SMART EXTERNAL LABEL (for narrow bars - prevents ugly text truncation!) */}
                                    {isNarrow && (
                                      <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 flex items-center gap-1.5 whitespace-nowrap pointer-events-none z-20">
                                        <span className="text-[10.5px] font-bold text-gray-800 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-gray-200/90 shadow-2xs flex items-center gap-1.5">
                                          <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                                          <span className="font-extrabold">{task.title}</span>
                                          <span className="text-[9px] text-gray-400 font-black">
                                            {task.progress || 0}%
                                          </span>
                                        </span>
                                      </div>
                                    )}

                                    {/* Right Resize Handle */}
                                    <div
                                      onMouseDown={(e) => handleStartDrag(e, task, "resize-right")}
                                      title="Drag to change due date"
                                      className="absolute -right-1 top-0 bottom-0 w-3 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-indigo-500/20 hover:bg-indigo-500/50 rounded-r-lg flex items-center justify-center z-30 transition-opacity"
                                    >
                                      <div className="w-0.5 h-3 bg-white rounded-full shadow-xs" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Spacer matching Add Task row height (Fixed 36px) */}
                          <div style={{ height: `${ADD_ROW_HEIGHT}px` }} className="border-b border-gray-50" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Flat Timeline Rows */
                <div className="flex flex-col relative z-10">
                  {filteredTasks.map((task) => {
                    const isHovered = hoveredTaskId === task.id;
                    const theme = getStatusBarTheme(task.status);

                    const isDraggingThis = activeDrag && activeDrag.id === task.id;
                    const startStr = isDraggingThis
                      ? new Date(activeDrag.currentStartMs).toISOString().split("T")[0]
                      : task.startDate!;
                    const endStr = isDraggingThis
                      ? new Date(activeDrag.currentEndMs).toISOString().split("T")[0]
                      : task.endDate!;

                    const leftPct = getPercentFromDate(startStr);
                    const rightPct = getPercentFromDate(endStr);
                    const widthPct = Math.max(0.6, rightPct - leftPct);
                    const isNarrow = widthPct < 8;

                    return (
                      <div
                        key={task.id}
                        style={{ height: `${ROW_HEIGHT}px` }}
                        onMouseEnter={(e) => {
                          setHoveredTaskId(task.id);
                          setTooltipData({
                            task,
                            x: e.clientX,
                            y: e.clientY,
                          });
                        }}
                        onMouseLeave={() => {
                          setHoveredTaskId(null);
                          setTooltipData(null);
                        }}
                        className={`border-b border-gray-100 relative flex items-center transition-colors ${
                          isHovered ? "bg-indigo-50/20" : ""
                        }`}
                      >
                        <div
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          onClick={() => setSelectedTask(task)}
                          onMouseDown={(e) => handleStartDrag(e, task, "move")}
                          className={`absolute h-7 rounded-lg border ${theme.barBg} shadow-2xs group cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow flex items-center overflow-visible z-10`}
                        >
                          <div
                            className={`absolute left-0 top-0 bottom-0 ${theme.progressBg} transition-all duration-300 rounded-l-md`}
                            style={{ width: `${task.progress || 0}%` }}
                          />
                          {!isNarrow ? (
                            <div className="relative z-20 px-2.5 flex items-center justify-between w-full pointer-events-none truncate text-[10.5px] font-extrabold text-gray-900">
                              <span className="truncate">{task.title}</span>
                              <span className="text-[9px] font-black">{task.progress || 0}%</span>
                            </div>
                          ) : (
                            <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 flex items-center gap-1.5 whitespace-nowrap pointer-events-none z-20">
                              <span className="text-[10.5px] font-bold text-gray-800 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-gray-200/90 shadow-2xs">
                                {task.title} · {task.progress || 0}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. RICH INTERACTIVE HOVER TOOLTIP CARD */}
      {tooltipData && !activeDrag && (
        <div
          style={{
            position: "fixed",
            left: `${Math.min(typeof window !== "undefined" ? window.innerWidth - 280 : 800, tooltipData.x + 16)}px`,
            top: `${Math.min(typeof window !== "undefined" ? window.innerHeight - 180 : 600, tooltipData.y + 16)}px`,
          }}
          className="z-50 pointer-events-none w-64 bg-white/95 backdrop-blur-md rounded-xl border border-gray-200/90 shadow-xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-1">
            <span
              className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                getStatusBarTheme(tooltipData.task.status).badge
              }`}
            >
              {getStatusBarTheme(tooltipData.task.status).name}
            </span>
            {tooltipData.task.priority && (
              <span
                className={`text-[8.5px] font-black px-1.5 py-0.2 rounded border ${
                  PRIORITY_CONFIG[tooltipData.task.priority].color
                }`}
              >
                {PRIORITY_CONFIG[tooltipData.task.priority].label}
              </span>
            )}
          </div>

          <h4 className="text-xs font-black text-gray-900 leading-tight">
            {tooltipData.task.title}
          </h4>

          {/* Date Range & Duration */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
            <CalendarIcon size={11} className="text-indigo-500 shrink-0" />
            <span>
              {formatDateDisplay(tooltipData.task.startDate)} → {formatDateDisplay(tooltipData.task.endDate)}
            </span>
            <span className="text-gray-400 font-medium ml-auto">
              {getDurationDays(tooltipData.task.startDate, tooltipData.task.endDate)}d
            </span>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[9.5px] font-extrabold text-gray-500">
              <span>Progress</span>
              <span className="text-indigo-600">{tooltipData.task.progress || 0}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStatusBarTheme(tooltipData.task.status).progressBg}`}
                style={{ width: `${tooltipData.task.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Assignees Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] text-gray-400">
            <span>Assignee</span>
            <div className="flex -space-x-1">
              {(tooltipData.task.people || ["avi"]).map((p, i) => (
                <Avatar key={i} person={p} size={16} ring />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TASK DETAILS & EDIT MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-2xl p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                      getStatusBarTheme(selectedTask.status).badge
                    }`}
                  >
                    {getStatusBarTheme(selectedTask.status).name}
                  </span>
                  {selectedTask.tag && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-gray-100 text-gray-600">
                      {selectedTask.tag}
                    </span>
                  )}
                  {selectedTask.isMilestone && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-700 flex items-center gap-1">
                      <Flag size={10} /> Milestone
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                  {selectedTask.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                Status
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: "todo", label: "To Do" },
                  { key: "inprogress", label: "Active" },
                  { key: "review", label: "Review" },
                  { key: "done", label: "Done" },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      onStatusChange?.(selectedTask, selectedTask.status, s.key);
                      setSelectedTask((prev) => (prev ? { ...prev, status: s.key as any } : null));
                      if (s.key === "done") {
                        saveTaskMetadata(selectedTask.id, { progress: 100 });
                      }
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTask.status === s.key
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <CalendarIcon size={11} /> Start Date
                </label>
                <input
                  type="date"
                  value={selectedTask.startDate || ""}
                  onChange={(e) => {
                    saveTaskMetadata(selectedTask.id, { startDate: e.target.value });
                  }}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <CalendarIcon size={11} /> Due Date
                </label>
                <input
                  type="date"
                  value={selectedTask.endDate || ""}
                  onChange={(e) => {
                    saveTaskMetadata(selectedTask.id, { endDate: e.target.value });
                  }}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Progress Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Progress Completion
                </label>
                <span className="text-xs font-black text-indigo-600">
                  {selectedTask.progress || 0}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedTask.progress || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  saveTaskMetadata(selectedTask.id, { progress: val });
                }}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Priority Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["low", "medium", "high", "urgent"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      saveTaskMetadata(selectedTask.id, { priority: p });
                    }}
                    className={`py-1 rounded-lg text-[11px] font-bold border capitalize transition-all cursor-pointer ${
                      selectedTask.priority === p
                        ? PRIORITY_CONFIG[p].color + " ring-1 ring-indigo-200"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignees & Milestone Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Assignees:
                </span>
                <div className="flex -space-x-1.5">
                  {(selectedTask.people || ["avi"]).map((p, i) => (
                    <Avatar key={i} person={p} size={22} ring />
                  ))}
                </div>
              </div>

              {/* Milestone Toggle */}
              <button
                onClick={() => {
                  const nextVal = !selectedTask.isMilestone;
                  saveTaskMetadata(selectedTask.id, { isMilestone: nextVal });
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  selectedTask.isMilestone
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900"
                }`}
              >
                <Flag size={12} className={selectedTask.isMilestone ? "fill-amber-500 text-amber-500" : ""} />
                <span>{selectedTask.isMilestone ? "Milestone Active" : "Set Milestone"}</span>
              </button>
            </div>

            {/* Close Modal */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

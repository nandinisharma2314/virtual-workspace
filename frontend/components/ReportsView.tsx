"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar as CalendarIcon,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  MoreVertical
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

export default function ReportsView() {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [activeTab, setActiveTab] = useState("overview");

  const [velocityData, setVelocityData] = useState<any[]>([]);
  const [workloadData, setWorkloadData] = useState<any[]>([]);
  const [projectPerformance, setProjectPerformance] = useState<any[]>([]);
  const [teamPerformanceData, setTeamPerformanceData] = useState<any[]>([]);
  const [timeTrackingLogs, setTimeTrackingLogs] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({ tasksCompleted: 0, overdueTasks: 0, teamUtilization: 0 });

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      fetch("http://localhost:3001/reports/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.velocityData) {
            if (data.velocityData.length === 0) {
              setVelocityData([
                { name: 'Sprint 1', completed: 30, planned: 35 },
                { name: 'Sprint 2', completed: 42, planned: 40 },
                { name: 'Sprint 3', completed: 38, planned: 38 },
                { name: 'Sprint 4', completed: 50, planned: 45 },
                { name: 'Sprint 5', completed: 62, planned: 60 },
                { name: 'Sprint 6', completed: 58, planned: 65 },
              ]);
            } else {
              setVelocityData(data.velocityData);
            }
          }
          if (data.workloadData) setWorkloadData(data.workloadData);
          if (data.projectPerformance && data.projectPerformance.length > 0) {
            setProjectPerformance(data.projectPerformance);
          } else {
            setProjectPerformance([
              { id: "p2", name: "Mobile App Launch", status: "At Risk", progress: 42, budget: "$120,000", health: "Fair" },
              { id: "p3", name: "Q3 Marketing Campaign", status: "On Track", progress: 88, budget: "$25,000", health: "Good" },
              { id: "p4", name: "Annual Security Audit", status: "Completed", progress: 100, budget: "$15,000", health: "Good" }
            ]);
          }
          if (data.teamPerformanceData) setTeamPerformanceData(data.teamPerformanceData);
          if (data.kpis) setKpis(data.kpis);
          if (data.timeTrackingLogs) setTimeTrackingLogs(data.timeTrackingLogs);
        }
      })
      .catch(console.error);
    }
  }, []);

  return (
    <div className="flex w-full h-full min-h-0 flex-col bg-transparent overflow-hidden">
      {/* Header */}
      <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-200/80 bg-white px-6 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-[17px] font-black tracking-tight text-gray-900">
            Analytics & Reports
          </h1>
          <div className="h-4 w-[1px] bg-gray-300"></div>
          <div className="flex space-x-1">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 text-[13px] font-bold rounded-lg transition-colors ${activeTab === "overview" ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("team")}
              className={`px-3 py-1.5 text-[13px] font-bold rounded-lg transition-colors ${activeTab === "team" ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Team
            </button>
            <button 
              onClick={() => setActiveTab("time")}
              className={`px-3 py-1.5 text-[13px] font-bold rounded-lg transition-colors ${activeTab === "time" ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Time Tracking
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-9 items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 text-[13px] font-semibold text-gray-700 transition-all hover:bg-gray-50 shadow-sm w-40">
            <div className="flex items-center gap-2">
              <CalendarIcon size={14} className="text-gray-400" />
              <span>{dateRange}</span>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          <button className="flex h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-bold text-gray-700 transition-all hover:bg-gray-50 shadow-sm">
            <Filter size={15} />
            <span>Filter</span>
          </button>
          <button className="flex h-9 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-[13px] font-bold text-white transition-all hover:bg-indigo-700 shadow-sm">
            <Download size={15} strokeWidth={2.5} />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#FAFBFC]">
        <div className="py-4 px-6 space-y-4 w-full">
          
          {activeTab === "overview" && (
            <div className="flex flex-col 2xl:flex-row gap-6">
              <div className="flex-1 space-y-4 min-w-0">
                {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mb-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={12} />
                </div>
                Tasks Completed
              </div>
              <div className="text-xl font-black text-gray-900 tracking-tight">
                {kpis.tasksCompleted}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <TrendingUp size={12} />
                <span>+18% from last month</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Clock size={32} className="text-blue-500" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mb-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Clock size={12} />
                </div>
                Avg. Completion Time
              </div>
              <div className="text-xl font-black text-gray-900 tracking-tight">
                2.1 <span className="text-[13px] text-gray-500 font-semibold">days</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <TrendingUp size={12} className="rotate-180" />
                <span>-0.3 days</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertCircle size={32} className="text-rose-500" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mb-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-50 text-rose-600">
                  <AlertCircle size={12} />
                </div>
                Overdue Tasks
              </div>
              <div className="text-xl font-black text-gray-900 tracking-tight">
                {kpis.overdueTasks}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <TrendingUp size={12} className="rotate-180" />
                <span>-33% from last month</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users size={32} className="text-indigo-500" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mb-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                  <Users size={12} />
                </div>
                Team Utilization
              </div>
              <div className="text-xl font-black text-gray-900 tracking-tight">
                {kpis.teamUtilization}<span className="text-[13px] text-gray-500 font-semibold">%</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>Optimal range</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Sprint Velocity Line Chart */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-extrabold text-gray-900">Sprint Velocity</h3>
                  <p className="text-[12px] font-medium text-gray-500 mt-0.5">Completed vs Planned story points</p>
                </div>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50">
                  <MoreVertical size={14} />
                </button>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={velocityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="completed" name="Completed" stroke="#4F46E5" strokeWidth={3} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="planned" name="Planned" stroke="#94A3B8" strokeWidth={3} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Team Workload Bar Chart */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-extrabold text-gray-900">Team Workload</h3>
                  <p className="text-[12px] font-medium text-gray-500 mt-0.5">Active tasks per member</p>
                </div>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50">
                  <MoreVertical size={14} />
                </button>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="tasks" name="Active Tasks" fill="#0EA5E9" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Project Performance Table */}
          <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200/80 flex items-center justify-between">
              <h3 className="text-[14px] font-extrabold text-gray-900 flex items-center gap-2">
                <BarChart3 size={16} className="text-gray-400" />
                Project Performance
              </h3>
              <button className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700">
                View Details
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200/80 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-2 font-extrabold">Project Name</th>
                    <th className="px-5 py-2 font-extrabold">Status</th>
                    <th className="px-5 py-2 font-extrabold w-1/3">Progress</th>
                    <th className="px-5 py-2 font-extrabold">Budget</th>
                    <th className="px-5 py-2 font-extrabold text-right">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projectPerformance.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-2.5">
                        <span className="text-[13px] font-bold text-gray-900">{project.name}</span>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          project.status === "On Track" ? "bg-emerald-100 text-emerald-700" :
                          project.status === "At Risk" ? "bg-rose-100 text-rose-700" :
                          "bg-indigo-100 text-indigo-700"
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden flex-1">
                            <div 
                              className={`h-full rounded-full ${project.progress === 100 ? "bg-indigo-500" : "bg-emerald-500"}`} 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-bold text-gray-500 w-8">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-[12px] font-semibold text-gray-700">
                        {project.budget}
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <span className={`text-[12px] font-bold ${
                          project.health === "Excellent" ? "text-indigo-600" :
                          project.health === "Good" ? "text-emerald-600" :
                          "text-rose-600"
                        }`}>
                          {project.health}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
              </div>

              {/* Right Sidebar Widgets */}
              <div className="w-full 2xl:w-[320px] shrink-0 space-y-4">
                
                {/* Actions Widget */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs">
                  <h3 className="text-[14px] font-extrabold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-[13px] font-bold text-gray-700 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Download size={14} />
                      </div>
                      Export PDF Report
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-[13px] font-bold text-gray-700 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <CalendarIcon size={14} />
                      </div>
                      Schedule Weekly Delivery
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 text-[13px] font-bold text-gray-700 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <Filter size={14} />
                      </div>
                      Create Custom View
                    </button>
                  </div>
                </div>

                {/* Insights Widget */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs">
                  <h3 className="text-[14px] font-extrabold text-gray-900 mb-4">AI Insights</h3>
                  <div className="space-y-4">
                    <div className="rounded-xl bg-indigo-50/50 border border-indigo-100/50 p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-20">
                        <TrendingUp size={32} className="text-indigo-600" />
                      </div>
                      <h4 className="text-[12px] font-black text-indigo-900 mb-1 relative z-10">Consistent Delivery</h4>
                      <p className="text-[11px] font-medium text-indigo-700/80 leading-relaxed relative z-10">
                        Sprint 8 maintained high velocity. Team is stabilizing around 75 story points per sprint.
                      </p>
                    </div>
                    
                    <div className="rounded-xl bg-emerald-50/50 border border-emerald-100/50 p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-20">
                        <CheckCircle2 size={32} className="text-emerald-600" />
                      </div>
                      <h4 className="text-[12px] font-black text-emerald-900 mb-1 relative z-10">Balanced Workload</h4>
                      <p className="text-[11px] font-medium text-emerald-700/80 leading-relaxed relative z-10">
                        Workload distribution has improved. Neha has taken on additional QA tasks, relieving bottlenecks.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200/80 flex items-center justify-between">
                <h3 className="text-[14px] font-extrabold text-gray-900 flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  Team Performance
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200/80 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="px-5 py-2 font-extrabold">Team Member</th>
                      <th className="px-5 py-2 font-extrabold">Role</th>
                      <th className="px-5 py-2 font-extrabold">Active Tasks</th>
                      <th className="px-5 py-2 font-extrabold w-1/3">Capacity</th>
                      <th className="px-5 py-2 font-extrabold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {teamPerformanceData.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-2.5 text-[13px] font-bold text-gray-900">{member.name}</td>
                        <td className="px-5 py-2.5 text-[12px] font-semibold text-gray-500">{member.role}</td>
                        <td className="px-5 py-2.5 text-[12px] font-bold text-gray-900">{member.tasks}</td>
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden flex-1">
                              <div 
                                className={`h-full rounded-full ${member.capacity > 100 ? "bg-rose-500" : member.capacity < 70 ? "bg-emerald-500" : "bg-indigo-500"}`} 
                                style={{ width: `${Math.min(member.capacity, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-[11px] font-bold text-gray-500 w-8">{member.capacity}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            member.status === "Optimal" ? "bg-indigo-100 text-indigo-700" :
                            member.status === "Overloaded" ? "bg-rose-100 text-rose-700" :
                            "bg-emerald-100 text-emerald-700"
                          }`}>
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "time" && (
            <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200/80 flex items-center justify-between">
                <h3 className="text-[14px] font-extrabold text-gray-900 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  Time Tracking Logs
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200/80 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      <th className="px-5 py-2 font-extrabold">Date</th>
                      <th className="px-5 py-2 font-extrabold">Project</th>
                      <th className="px-5 py-2 font-extrabold">Task</th>
                      <th className="px-5 py-2 font-extrabold">Member</th>
                      <th className="px-5 py-2 font-extrabold text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {timeTrackingLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-2.5 text-[12px] font-semibold text-gray-500">{log.date}</td>
                        <td className="px-5 py-2.5 text-[13px] font-bold text-gray-900">{log.project}</td>
                        <td className="px-5 py-2.5 text-[12px] font-semibold text-gray-700">{log.task}</td>
                        <td className="px-5 py-2.5 text-[12px] font-bold text-gray-900">{log.member}</td>
                        <td className="px-5 py-2.5 text-[13px] font-black text-indigo-600 text-right">{log.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

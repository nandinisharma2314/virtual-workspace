"use client";

import Avatar from "@/components/Avatar";
import { CheckCircle2, Circle, Filter, ArrowUpDown, Layers } from "lucide-react";

const listData = [
  { id: 1, title: "Create wireframes for homepage", assignee: { name: "Priya S.", person: "priya" }, status: "To Do", statusColor: "text-gray-500", date: "May 30", priority: "High", priorityColor: "text-rose-500" },
  { id: 2, title: "Setup analytics and tracking", assignee: { name: "Arjun P.", person: "arjun" }, status: "To Do", statusColor: "text-gray-500", date: "May 31", priority: "Medium", priorityColor: "text-amber-500" },
  { id: 3, title: "Write copy for landing page", assignee: { name: "Neha S.", person: "neha" }, status: "To Do", statusColor: "text-gray-500", date: "Jun 2", priority: "Medium", priorityColor: "text-amber-500" },
  { id: 4, title: "Design homepage UI", assignee: { name: "Priya S.", person: "priya" }, status: "In Progress", statusColor: "text-blue-500", date: "May 28", priority: "High", priorityColor: "text-rose-500" },
  { id: 5, title: "Develop responsive navigation", assignee: { name: "Vikram J.", person: "vikram" }, status: "In Progress", statusColor: "text-blue-500", date: "May 29", priority: "High", priorityColor: "text-rose-500" },
  { id: 6, title: "Build reusable components", assignee: { name: "Arjun P.", person: "arjun" }, status: "In Progress", statusColor: "text-blue-500", date: "May 30", priority: "Medium", priorityColor: "text-amber-500" },
  { id: 7, title: "Review homepage design", assignee: { name: "Neha S.", person: "neha" }, status: "In Review", statusColor: "text-amber-500", date: "May 27", priority: "High", priorityColor: "text-rose-500" },
  { id: 8, title: "Code review - navigation", assignee: { name: "Rohit V.", person: "rohit" }, status: "In Review", statusColor: "text-amber-500", date: "May 28", priority: "High", priorityColor: "text-rose-500" },
  { id: 9, title: "Content review - landing page", assignee: { name: "Neha S.", person: "neha" }, status: "In Review", statusColor: "text-amber-500", date: "May 29", priority: "Medium", priorityColor: "text-amber-500" },
  { id: 10, title: "Project kickoff meeting", assignee: { name: "Rohit V.", person: "rohit" }, status: "Done", statusColor: "text-emerald-500", date: "May 15", priority: "Low", priorityColor: "text-emerald-500", completed: true },
  { id: 11, title: "Requirements gathering", assignee: { name: "Priya S.", person: "priya" }, status: "Done", statusColor: "text-emerald-500", date: "May 16", priority: "Low", priorityColor: "text-emerald-500", completed: true },
  { id: 12, title: "Information architecture", assignee: { name: "Arjun P.", person: "arjun" }, status: "Done", statusColor: "text-emerald-500", date: "May 18", priority: "Low", priorityColor: "text-emerald-500", completed: true },
];

export default function ProjectList() {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#FAFBFC] select-none w-full">
      {/* List Toolbar */}
      <div className="h-12 border-b border-gray-100 px-5 bg-white flex items-center gap-4 shrink-0">
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all">
          <Filter size={13} className="text-gray-500" strokeWidth={2.3} />
          <span>Filter</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all">
          <ArrowUpDown size={13} className="text-gray-500" strokeWidth={2.3} />
          <span>Sort</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-all">
          <Layers size={13} className="text-gray-500" strokeWidth={2.3} />
          <span>Group by: Status</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 p-5 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 px-4 text-[12.5px] font-bold text-gray-500 w-[45%]">Task</th>
              <th className="py-3 px-4 text-[12.5px] font-bold text-gray-500">Assignee</th>
              <th className="py-3 px-4 text-[12.5px] font-bold text-gray-500">Status</th>
              <th className="py-3 px-4 text-[12.5px] font-bold text-gray-500">Due Date</th>
              <th className="py-3 px-4 text-[12.5px] font-bold text-gray-500">Priority</th>
            </tr>
          </thead>
          <tbody>
            {listData.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                    ) : (
                      <Circle size={16} className="text-gray-300 shrink-0 group-hover:text-gray-400 transition-colors" strokeWidth={2} />
                    )}
                    <span className={`text-[13px] font-bold ${item.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {item.title}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Avatar person={item.assignee.person} size={22} />
                    <span className="text-[12.5px] font-semibold text-gray-700">{item.assignee.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[12px] font-extrabold ${item.statusColor}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[12.5px] font-semibold text-gray-600">{item.date}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[12px] font-extrabold ${item.priorityColor}`}>
                    {item.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

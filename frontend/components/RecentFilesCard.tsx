import { FileText, PenTool, File } from "lucide-react";
import { recentFiles as mockRecentFiles } from "@/lib/data";
import Link from "next/link";

const iconMap: Record<string, { icon: React.ElementType; bgClass: string }> = {
  pdf: { icon: FileText, bgClass: "bg-[#F43F5E] text-white shadow-sm shadow-rose-500/20" },
  figma: { icon: PenTool, bgClass: "bg-[#1E293B] text-white shadow-sm shadow-slate-900/20" },
  doc: { icon: File, bgClass: "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20" },
};

export default function RecentFilesCard({ recentFiles = mockRecentFiles }: { recentFiles?: any[] }) {
  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-4.5 shadow-2xs overflow-hidden min-h-0">
      <div className="flex items-center justify-between shrink-0 mb-2 px-0.5">
        <h3 className="text-[14.5px] sm:text-[15px] font-bold text-[#111827] tracking-tight">
          Recent Files
        </h3>
        <Link href="/files" className="text-[12px] sm:text-[12.5px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
          View all
        </Link>
      </div>

      <ul className="flex-1 min-h-0 divide-y divide-gray-100/80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col">
        {recentFiles.map((f) => {
          const cfg = iconMap[f.icon] || { icon: FileText, bgClass: "bg-[#F43F5E] text-white" };
          const Icon = cfg.icon;
          return (
            <li key={f.name} className="flex items-center gap-3.5 py-2 sm:py-2.5 px-1 hover:bg-gray-50/60 rounded-xl transition-colors min-w-0">
              <span className={`flex h-9 w-9 sm:h-[38px] sm:w-[38px] shrink-0 items-center justify-center rounded-xl sm:rounded-[14px] ${cfg.bgClass}`}>
                <Icon size={18} strokeWidth={2.3} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] sm:text-[13.5px]  text-[#111827] leading-tight">{f.name}</p>
                <p className="text-[11px] sm:text-[11.5px] font-medium text-[#6B7280] mt-0.5 truncate">{f.updated}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

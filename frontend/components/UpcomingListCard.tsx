import { Video, Megaphone, Palette, Server, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, { icon: React.ElementType; bgClass: string }> = {
  video: { icon: Video, bgClass: "bg-[#10B981] text-white shadow-sm shadow-emerald-500/20" },
  megaphone: { icon: Megaphone, bgClass: "bg-[#8B5CF6] text-white shadow-sm shadow-purple-500/20" },
  palette: { icon: Palette, bgClass: "bg-[#F59E0B] text-white shadow-sm shadow-amber-500/20" },
  server: { icon: Server, bgClass: "bg-[#3B82F6] text-white shadow-sm shadow-blue-500/20" },
};

export default function UpcomingListCard({ upcomingList = [] }: { upcomingList?: any[] }) {
  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-4.5 shadow-2xs overflow-hidden min-h-0">
      <div className="flex items-center justify-between shrink-0 mb-2 px-0.5">
        <h3 className="text-[14.5px] sm:text-[15px] font-extrabold text-[#111827] tracking-tight">
          Upcoming
        </h3>
        <Link href="/calendar" className="text-[12px] sm:text-[12.5px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
          View all
        </Link>
      </div>
      
      <ul className="flex-1 min-h-0 divide-y divide-gray-100/80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col">
        {upcomingList.length > 0 ? (
          upcomingList.map((u, i) => {
            const config = iconMap[u.icon] || { icon: Video, bgClass: "bg-[#10B981] text-white" };
            const Icon = config.icon;
            return (
              <li key={`${u.title}-${i}`} className="flex items-center gap-3.5 py-2 sm:py-2.5 px-1 hover:bg-gray-50/60 rounded-xl transition-colors min-w-0">
                <span className={`flex h-9 w-9 sm:h-[38px] sm:w-[38px] shrink-0 items-center justify-center rounded-xl sm:rounded-[14px] ${config.bgClass}`}>
                  <Icon size={18} strokeWidth={2.3} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] sm:text-[13.5px] font-bold text-[#111827] leading-tight">{u.title}</p>
                  <p className="text-[11px] sm:text-[11.5px] font-medium text-[#6B7280] mt-0.5 truncate">{u.time}</p>
                </div>
              </li>
            );
          })
        ) : (
          <li className="flex-1 flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <CalendarIcon size={24} className="mb-1 text-gray-300" />
            <p className="text-xs">No upcoming events</p>
          </li>
        )}
      </ul>
    </div>
  );
}

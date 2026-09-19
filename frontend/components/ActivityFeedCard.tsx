import Avatar from "./Avatar";
import Link from "next/link";
import { Activity } from "lucide-react";

export default function ActivityFeedCard({ activityFeed = [] }: { activityFeed?: any[] }) {
  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-4.5 shadow-2xs overflow-hidden min-h-0">
      <div className="flex items-center justify-between shrink-0 mb-2 px-0.5">
        <h3 className="text-[14.5px] sm:text-[15px] font-extrabold text-[#111827] tracking-tight">
          Activity Feed
        </h3>
        <Link href="/reports" className="text-[12px] sm:text-[12.5px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
          View all
        </Link>
      </div>

      <ul className="flex-1 min-h-0 divide-y divide-gray-100/80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col">
        {activityFeed.length > 0 ? (
          activityFeed.map((a, i) => {
            return (
              <li key={i} className="flex items-start gap-3.5 py-2 sm:py-2.5 px-1 hover:bg-gray-50/60 rounded-xl transition-colors min-w-0">
                <div className="mt-0.5 shrink-0">
                  <Avatar person={a.key} size={36} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] sm:text-[13.5px] leading-tight text-[#6B7280] font-medium truncate">
                    <span className="text-[#111827]">{a.name}</span> {a.action}{" "}
                    <span className=" text-[#111827]">{a.detail}</span>
                  </p>
                  <p className="text-[11px] sm:text-[11.5px] font-medium text-[#6B7280] mt-1 truncate">{a.time}</p>
                </div>
              </li>
            );
          })
        ) : (
          <li className="flex-1 flex flex-col items-center justify-center text-center p-4 text-gray-400">
            <Activity size={24} className="mb-1 text-gray-300" />
            <p className="text-xs">No recent activity</p>
          </li>
        )}
      </ul>
    </div>
  );
}

import Avatar from "./Avatar";
import Link from "next/link";

export default function RecentActivityCard({ recentActivity = [] }: { recentActivity?: any[] }) {
  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-3 shadow-2xs overflow-hidden min-h-0">
      <div className="flex items-center justify-between shrink-0 mb-1.5">
        <h3 className="text-xs font-bold text-gray-900 tracking-tight">Recent Activity</h3>
        <Link href="/teams" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700">
          View all
        </Link>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-0.5 flex flex-col justify-center">
        {recentActivity.length > 0 ? (
          <ul className="space-y-2 flex flex-col justify-around">
            {recentActivity.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Avatar person={a.key} name={a.name} size={22} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-snug text-gray-600 truncate">
                    <span className="font-bold text-gray-900">{a.name}</span> {a.action}
                  </p>
                  <p className="text-[10px] font-medium text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-[12px] text-gray-400 py-3">No recent activity</p>
        )}
      </div>
    </div>
  );
}

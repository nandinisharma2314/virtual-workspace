import Avatar from "./Avatar";
import { teamWorkload as mockTeamWorkload } from "@/lib/data";

const barColor = (pct: number) =>
  pct >= 70 ? "bg-emerald-500" : pct >= 45 ? "bg-blue-500" : "bg-amber-500";

export default function TeamWorkload({ teamWorkload = mockTeamWorkload }: { teamWorkload?: any[] }) {
  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-3 shadow-2xs overflow-hidden min-h-0">
      <h3 className="text-xs font-bold text-gray-900 tracking-tight shrink-0">Team Workload</h3>
      <ul className="mt-1.5 flex-1 min-h-0 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-0.5 flex flex-col justify-around">
        {teamWorkload.map((m, i) => (
          <li key={m.id || i} className="flex items-center gap-2.5">
            <Avatar person={m.key} name={m.name} size={24} />
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center justify-between text-xs">
                <span className="truncate font-semibold text-gray-800">{m.name}</span>
                <span className="font-bold text-gray-900">{m.pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${barColor(m.pct)} transition-all duration-300`}
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { Circle, Rocket, Phone, ArrowRight } from "lucide-react";
import { upcomingEventsCard as mockUpcomingEventsCard } from "@/lib/data";

const icons = [Circle, Rocket, Phone];

export default function UpcomingEventsCard({ upcomingEventsCard = mockUpcomingEventsCard }: { upcomingEventsCard?: any[] }) {
  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-3.5 shadow-2xs overflow-hidden min-h-0">
      <div className="flex items-center justify-between shrink-0 mb-2 px-0.5">
        <h3 className="text-[13.5px] font-extrabold text-[#111827] tracking-tight">
          Upcoming Events
        </h3>
        <button className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all group">
          <span>Calendar</span>
          <ArrowRight size={14} strokeWidth={2.5} className="shrink-0 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
      <ul className="flex-1 min-h-0 space-y-2 overflow-hidden flex flex-col justify-around">
        {upcomingEventsCard.map((e, i) => {
          const Icon = icons[i % icons.length];
          return (
            <li key={`${e.title}-${i}`} className="flex items-center gap-3 rounded-xl p-1 hover:bg-gray-50/80 transition-colors min-w-0">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${e.bg} ${e.color} shadow-2xs`}>
                <Icon size={15} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-bold text-[#111827] leading-tight">{e.title}</p>
                <p className="text-[11px] font-medium text-gray-400 mt-0.5 truncate">{e.time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { ArrowUp, ArrowDown } from "lucide-react";

export default function StatCards({ stats = [] }: { stats?: any[] }) {
  if (!stats || stats.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4 shrink-0 w-full">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-gray-200/80 bg-white px-3 py-2.5 shadow-2xs hover:border-gray-300/80 transition-all flex flex-col justify-between w-full h-full"
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] font-medium text-gray-500 truncate">{s.label}</p>
            <p
              className={`flex items-center text-[10px] font-bold ${
                s.up ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {s.up ? <ArrowUp size={11} strokeWidth={2.5} /> : <ArrowDown size={11} strokeWidth={2.5} />}
              {s.delta}
            </p>
          </div>
          <p className="mt-1 text-xl font-bold tracking-tight text-gray-900 leading-none">
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

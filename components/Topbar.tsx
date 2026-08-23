import { Search, Plus, HelpCircle, Bell, ChevronDown } from "lucide-react";
import Avatar from "./Avatar";

export default function Topbar() {
  return (
    <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-3.5">
        <button className="mx-3 mb-4 flex  items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
        <span className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-900 text-[10px] font-bold text-white">
            A
          </span>
          Acme Inc.
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      <div className="relative max-w-md flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search (⌘ + K)"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus size={16} />
          Create
        </button>
        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
          <HelpCircle size={18} />
        </button>
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
          <Bell size={18} />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
            3
          </span>
        </button>
        <button className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-gray-50">
          <Avatar person="avi" size={34} />
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-medium text-gray-900">Avi Sharma</span>
            <span className="block text-xs text-gray-400">Product Manager</span>
          </span>
          <ChevronDown size={15} className="hidden text-gray-400 sm:block" />
        </button>
      </div>
    </header>
  );
}

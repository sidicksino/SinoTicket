import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
          Operations Console
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>
        <p className="text-sm text-slate-300">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            type="search"
            placeholder="Search"
            className="w-36 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
          />
        </label>
        <button
          type="button"
          className="rounded-xl border border-white/15 bg-slate-900/70 p-2.5 text-slate-200 transition hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}

import clsx from "clsx";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { MetricCard } from "../../types";

const trendStyles = {
  up: "text-emerald-300 bg-emerald-400/15",
  down: "text-rose-200 bg-rose-400/15",
  steady: "text-sky-200 bg-sky-400/15",
} as const;

export function StatCard({ title, value, delta, trend }: MetricCard) {
  const Icon =
    trend === "up"
      ? ArrowUpRight
      : trend === "down"
        ? ArrowDownRight
        : ArrowRight;

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
      <p className="text-sm text-slate-300">{title}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <h3 className="text-2xl font-bold tracking-tight text-white">
          {value}
        </h3>
        <span
          className={clsx(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            trendStyles[trend],
          )}
        >
          <Icon size={14} />
          {delta}
        </span>
      </div>
    </article>
  );
}

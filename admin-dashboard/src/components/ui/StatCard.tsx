import clsx from "clsx";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { MetricCard } from "../../types";

const trendStyles = {
  up: "text-emerald-400 bg-emerald-500/10",
  down: "text-rose-400 bg-rose-500/10",
  steady: "text-white/50 bg-white/5",
} as const;

export function StatCard({ title, value, delta, trend }: MetricCard) {
  const Icon =
    trend === "up"
      ? ArrowUpRight
      : trend === "down"
        ? ArrowDownRight
        : ArrowRight;

  return (
    <article className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 lg:p-8 liquid-glass transition-all hover:bg-white/[0.04]">
      <p className="text-sm font-body font-light text-white/50 tracking-wide uppercase">{title}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <h3 className="text-4xl lg:text-5xl font-heading italic tracking-tighter text-white">
          {value}
        </h3>
        <div
          className={clsx(
            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border border-white/10",
            trendStyles[trend] || trendStyles.steady,
          )}
        >
          <Icon size={14} />
          {delta}
        </div>
      </div>
    </article>
  );
}

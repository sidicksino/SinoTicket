import clsx from "clsx";
import type { EntityStatus } from "../../types";

const styles: Record<EntityStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  draft: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  paused: "bg-white/5 text-white/50 border-white/10",
  archived: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export function StatusBadge({ status }: { status: EntityStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-0.5 text-[10px] font-body font-medium uppercase tracking-wider border",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

import clsx from "clsx";
import type { EntityStatus } from "../../types";

const styles: Record<EntityStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  draft: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
  paused: "bg-slate-500/20 text-slate-200 ring-slate-300/30",
  archived: "bg-rose-500/15 text-rose-200 ring-rose-400/30",
};

export function StatusBadge({ status }: { status: EntityStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

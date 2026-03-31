import { Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  title: string;
  render: (item: T) => ReactNode;
}

interface EntityTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

export function EntityTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
}: EntityTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 liquid-glass">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-body font-medium uppercase tracking-[0.2em] text-white/40"
                >
                  {column.title}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-xs font-body font-medium uppercase tracking-[0.2em] text-white/40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-12 text-center text-sm font-body font-light text-white/30"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-white/[0.03] group">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="whitespace-nowrap px-6 py-4 text-sm font-body font-light text-white/70"
                    >
                      {column.render(item)}
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                        aria-label="Edit row"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="rounded-full border border-rose-500/20 bg-rose-500/5 p-2 text-rose-400/70 transition hover:bg-rose-500/20 hover:text-rose-400"
                        aria-label="Delete row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { EntityTable, type Column } from "../components/tables/EntityTable";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EntityModal, type FieldDef } from "../components/ui/EntityModal";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useApiCrud } from "../hooks/useApiCrud";
import { apiClient } from "../lib/api";
import { authManager } from "../lib/auth";
import type { ReservationItem } from "../types";

const fields: FieldDef[] = [
  { key: "ticketCode", label: "Ticket Code" },
  { key: "event", label: "Event" },
  { key: "customer", label: "Customer" },
  { key: "seats", label: "Seats", type: "number" },
  { key: "total", label: "Total ($)", type: "number" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["active", "draft", "paused", "archived"],
  },
  { key: "createdAt", label: "Created At" },
];

function mapReservationFromApi(data: any): ReservationItem {
  return {
    id: data._id || data.id,
    ticketCode: data.ticketCode || data.code || "N/A",
    event: data.eventName || data.event || "N/A",
    customer: data.customerName || data.customer || "N/A",
    seats: data.numberOfSeats || data.seats || 0,
    total: data.totalPrice || data.total || 0,
    status:
      data.status === "Cancelled" ? "paused" : data.status ? "active" : "draft",
    createdAt: data.createdAt
      ? new Date(data.createdAt).toLocaleDateString()
      : new Date().toLocaleDateString(),
  };
}

export function ReservationsPage() {
  const token = authManager.getToken();
  const {
    filteredItems,
    query,
    setQuery,
    create,
    update,
    remove,
    loading,
    error,
  } = useApiCrud<ReservationItem>({
    getAll: () =>
      apiClient
        .getReservations(token)
        .then((res) => res.data?.map(mapReservationFromApi) || []),
    create: (payload) =>
      apiClient
        .createReservation(payload, token)
        .then((res) => mapReservationFromApi(res.data)),
    update: () =>
      Promise.reject(new Error("Cannot update reservations from dashboard")),
      delete: (id) => apiClient.cancelReservation(id, token).then(() => undefined),
  });

  const [editing, setEditing] = useState<ReservationItem | null>(null);
  const [deleting, setDeleting] = useState<ReservationItem | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const columns: Column<ReservationItem>[] = useMemo(
    () => [
      {
        key: "ticketCode",
        title: "Ticket",
        render: (item) => (
          <span className="font-medium">{item.ticketCode}</span>
        ),
      },
      { key: "event", title: "Event", render: (item) => item.event },
      { key: "customer", title: "Customer", render: (item) => item.customer },
      { key: "seats", title: "Seats", render: (item) => item.seats },
      { key: "total", title: "Total", render: (item) => `$${item.total}` },
      {
        key: "status",
        title: "Status",
        render: (item) => <StatusBadge status={item.status} />,
      },
      { key: "createdAt", title: "Created", render: (item) => item.createdAt },
    ],
    [],
  );

  if (!token) {
    return (
      <Panel
        title="Reservation Management"
        subtitle="Handle active bookings and post-checkout operations"
      >
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-amber-100">
          <p>
            ⚠️ Authentication required. Please log in via the main app first.
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <Panel
        title="Reservation Management"
        subtitle="Handle active bookings and post-checkout operations"
        action={
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus size={16} />
            Add Reservation
          </button>
        }
      >
        {error && (
          <div className="mb-4 rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-rose-100 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reservations by ticket, customer, event, or status"
            className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
          />
        </div>

        {loading && filteredItems.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : (
          <EntityTable
            data={filteredItems}
            columns={columns}
            onEdit={(item) => setEditing(item)}
            onDelete={(item) => setDeleting(item)}
          />
        )}
      </Panel>

      {openCreate ? (
        <EntityModal<ReservationItem>
          mode="create"
          title="Add Reservation"
          fields={fields}
          onClose={() => setOpenCreate(false)}
          onSave={async (values) => {
            try {
              await create(values);
              setOpenCreate(false);
            } catch (err) {
              alert(
                `Failed to create reservation: ${err instanceof Error ? err.message : "Unknown error"}`,
              );
            }
          }}
        />
      ) : null}

      {editing ? (
        <EntityModal<ReservationItem>
          mode="edit"
          title="Update Reservation"
          fields={fields}
          initialValue={editing}
          onClose={() => setEditing(null)}
          onSave={async (values) => {
            try {
              await update(editing.id, values);
              setEditing(null);
            } catch (err) {
              alert(
                `Failed to update reservation: ${err instanceof Error ? err.message : "Unknown error"}`,
              );
            }
          }}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Delete Reservation"
          message={`This will remove ${deleting.ticketCode} permanently from this view.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await remove(deleting.id);
              setDeleting(null);
            } catch (err) {
              alert(
                `Failed to delete reservation: ${err instanceof Error ? err.message : "Unknown error"}`,
              );
            }
          }}
        />
      ) : null}
    </>
  );
}

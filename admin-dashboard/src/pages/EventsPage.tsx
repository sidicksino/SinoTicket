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
import type { EventItem } from "../types";

const fields: FieldDef[] = [
  { key: "name", label: "Event Name" },
  { key: "date", label: "Date & Time" },
  { key: "venue", label: "Venue" },
  { key: "capacity", label: "Capacity", type: "number" },
  { key: "price", label: "Ticket Price", type: "number" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["active", "draft", "paused", "archived"],
  },
];

function mapEventFromApi(data: any): EventItem {
  return {
    id: data._id || data.id,
    name: data.title || data.name,
    date: data.date ? new Date(data.date).toLocaleString() : "N/A",
    venue: data.venue_id || data.venue || "N/A",
    capacity: data.capacity || 0,
    price: data.price || 0,
    status:
      data.status === "Upcoming"
        ? "active"
        : data.status === "Ongoing"
          ? "draft"
          : "paused",
  };
}

export function EventsPage() {
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
  } = useApiCrud<EventItem>({
    getAll: () =>
      apiClient.getEvents().then((res) => res.data?.map(mapEventFromApi) || []),
    create: (payload) =>
      apiClient
        .createEvent(payload, token)
        .then((res) => mapEventFromApi(res.data)),
    update: (id, payload) =>
      apiClient
        .updateEvent(id, payload, token)
        .then((res) => mapEventFromApi(res.data)),
    delete: (id) => apiClient.deleteEvent(id, token).then(() => undefined),
  });

  const [editing, setEditing] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState<EventItem | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const columns: Column<EventItem>[] = useMemo(
    () => [
      {
        key: "name",
        title: "Event",
        render: (item) => <span className="font-medium">{item.name}</span>,
      },
      { key: "date", title: "Date", render: (item) => item.date },
      { key: "venue", title: "Venue", render: (item) => item.venue },
      {
        key: "capacity",
        title: "Capacity",
        render: (item) => item.capacity.toLocaleString(),
      },
      { key: "price", title: "Price", render: (item) => `$${item.price}` },
      {
        key: "status",
        title: "Status",
        render: (item) => <StatusBadge status={item.status} />,
      },
    ],
    [],
  );

  if (!token) {
    return (
      <Panel
        title="Event Management"
        subtitle="Create, modify, and retire events from the catalogue"
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
        title="Event Management"
        subtitle="Create, modify, and retire events from the catalogue"
        action={
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {loading ? "Loading..." : "Add Event"}
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
            placeholder="Search events by title, venue, or status"
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
        <EntityModal<EventItem>
          mode="create"
          title="Add Event"
          fields={fields}
          onClose={() => setOpenCreate(false)}
          onSave={async (values) => {
            try {
              await create(values);
              setOpenCreate(false);
            } catch (err) {
              alert(
                `Failed to create event: ${err instanceof Error ? err.message : "Unknown error"}`,
              );
            }
          }}
        />
      ) : null}

      {editing ? (
        <EntityModal<EventItem>
          mode="edit"
          title="Update Event"
          fields={fields}
          initialValue={editing}
          onClose={() => setEditing(null)}
          onSave={async (values) => {
            try {
              await update(editing.id, values);
              setEditing(null);
            } catch (err) {
              alert(
                `Failed to update event: ${err instanceof Error ? err.message : "Unknown error"}`,
              );
            }
          }}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Delete Event"
          message={`This will remove ${deleting.name} permanently from this view.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await remove(deleting.id);
              setDeleting(null);
            } catch (err) {
              alert(
                `Failed to delete event: ${err instanceof Error ? err.message : "Unknown error"}`,
              );
            }
          }}
        />
      ) : null}
    </>
  );
}

import { AlertCircle, Loader2, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EntityTable, type Column } from "../components/tables/EntityTable";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EntityModal, type FieldDef } from "../components/ui/EntityModal";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useApiCrud } from "../hooks/useApiCrud";
import { apiClient } from "../lib/api";
import { authManager } from "../lib/auth";
import { StatCard } from "../components/ui/StatCard";
import clsx from "clsx";
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

interface ApiEvent {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  date?: string;
  venue_id?: string;
  venue?: string;
  capacity?: number;
  price?: number;
  status?: string;
}

function mapEventFromApi(data: ApiEvent | undefined): EventItem {
  if (!data) {
    return {
      id: "",
      name: "N/A",
      date: "N/A",
      venue: "N/A",
      capacity: 0,
      price: 0,
      status: "draft",
    };
  }
  return {
    id: data._id || data.id || "",
    name: data.title || data.name || "N/A",
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
  const [activeTab, setActiveTab] = useState("ALL");

  const columns: Column<EventItem>[] = useMemo(
    () => [
      {
        key: "name",
        title: "Event Name",
        render: (item) => <span className="font-medium text-white">{item.name}</span>,
      },
      { key: "venue", title: "Location", render: (item) => item.venue },
      { key: "date", title: "Date", render: (item) => item.date },
      {
        key: "capacity",
        title: "Size",
        render: (item) => item.capacity.toLocaleString(),
      },
      {
        key: "status",
        title: "Status",
        render: (item) => <StatusBadge status={item.status} />,
      },
    ],
    [],
  );

  const stats = [
    { title: "Total Events", value: "1,000", delta: "+12%", trend: "up" as const },
    { title: "Completed events", value: "900", delta: "+5%", trend: "up" as const },
    { title: "In Process", value: "100", delta: "Steady", trend: "steady" as const },
  ];

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
    <div className="space-y-8 pb-12 font-body">
      {/* Cards Section */}
      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <Panel
        title="Events"
        action={
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            CREATE EVENT
          </button>
        }
      >
        {error && (
          <div className="mb-6 rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-rose-100 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            {["ALL", "Published", "Draft"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-8 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all",
                  activeTab === tab
                    ? "bg-white text-black"
                    : "text-white/40 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for event, vendor, etc"
              className="w-full rounded-full border border-white/10 bg-white/5 pl-12 pr-4 py-2.5 text-sm text-white outline-none transition focus:border-white/20"
            />
          </div>
        </div>

        {loading && filteredItems.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-white/20" size={32} />
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
    </div>
  );
}

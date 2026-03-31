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
import type { VenueItem } from "../types";

const fields: FieldDef[] = [
  { key: "name", label: "Venue Name" },
  { key: "city", label: "City" },
  { key: "seats", label: "Seat Count", type: "number" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["active", "draft", "paused", "archived"],
  },
];

interface ApiVenue {
  _id?: string;
  id?: string;
  name?: string;
  location?: string;
  city?: string;
  capacity?: number;
  seats?: number;
}

function mapVenueFromApi(data: ApiVenue | undefined): VenueItem {
  if (!data) {
    return {
      id: "",
      name: "N/A",
      city: "N/A",
      seats: 0,
      status: "active",
    };
  }
  return {
    id: data._id || data.id || "",
    name: data.name || "N/A",
    city: data.location || data.city || "N/A",
    seats: data.capacity || data.seats || 0,
    status: "active",
  };
}

export function VenuesPage() {
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
  } = useApiCrud<VenueItem>({
    getAll: () =>
      apiClient.getVenues().then((res) => res.data?.map(mapVenueFromApi) || []),
    create: (payload) =>
      apiClient
        .createVenue(payload, token)
        .then((res) => mapVenueFromApi(res.data)),
    update: (id, payload) =>
      apiClient
        .updateVenue(id, payload, token)
        .then((res) => mapVenueFromApi(res.data)),
    delete: (id) => apiClient.deleteVenue(id, token).then(() => undefined),
  });

  const [editing, setEditing] = useState<VenueItem | null>(null);
  const [deleting, setDeleting] = useState<VenueItem | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const columns: Column<VenueItem>[] = useMemo(
    () => [
      {
        key: "name",
        title: "Venue",
        render: (item) => <span className="font-medium text-white">{item.name}</span>,
      },
      { key: "city", title: "City", render: (item) => item.city },
      {
        key: "seats",
        title: "Seats",
        render: (item) => item.seats.toLocaleString(),
      },
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
        title="Venue Management"
        subtitle="Control inventory and operational availability"
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
    <div className="pb-12 font-body">
      <Panel
        title="Venues"
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
            {loading ? "Loading..." : "ADD VENUE"}
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
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search venues by name, city, or status"
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
        <EntityModal<VenueItem>
          mode="create"
          title="Add Venue"
          fields={fields}
          onClose={() => setOpenCreate(false)}
          onSave={async (values) => {
            try {
              await create(values);
              setOpenCreate(false);
            } catch (err) {
              alert(
                `Failed to create venue: ${err instanceof Error ? err.message : "Unknown error"}`,
              );
            }
          }}
        />
      ) : null}

      {editing ? (
        <EntityModal<VenueItem>
          mode="edit"
          title="Update Venue"
          fields={fields}
          initialValue={editing}
          onClose={() => setEditing(null)}
          onSave={async (values) => {
            try {
              await update(editing.id, values);
              setEditing(null);
            } catch (err) {
              alert(
                `Failed to update venue: ${err instanceof Error ? err.message : "Unknown error"}`,
              );
            }
          }}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Delete Venue"
          message={`This will remove ${deleting.name} permanently from this view.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await remove(deleting.id);
              setDeleting(null);
            } catch (err) {
              alert(
                `Failed to delete venue: ${err instanceof Error ? err.message : "Unknown error"}`,
              );
            }
          }}
        />
      ) : null}
    </div>
  );
}

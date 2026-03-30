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

function mapVenueFromApi(data: any): VenueItem {
  return {
    id: data._id || data.id,
    name: data.name,
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
        render: (item) => <span className="font-medium">{item.name}</span>,
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
    <>
      <Panel
        title="Venue Management"
        subtitle="Control inventory and operational availability"
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
            {loading ? "Loading..." : "Add Venue"}
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
            placeholder="Search venues by name, city, or status"
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
    </>
  );
}

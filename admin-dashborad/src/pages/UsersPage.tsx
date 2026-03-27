import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { EntityTable, type Column } from "../components/tables/EntityTable";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EntityModal, type FieldDef } from "../components/ui/EntityModal";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { dashboardSeed } from "../data/seed";
import { useCrud } from "../hooks/useCrud";
import type { UserItem } from "../types";

const fields: FieldDef[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email", type: "email" },
  {
    key: "role",
    label: "Role",
    type: "select",
    options: ["admin", "manager", "support"],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["active", "draft", "paused", "archived"],
  },
];

export function UsersPage() {
  const { filteredItems, query, setQuery, create, update, remove } =
    useCrud<UserItem>(dashboardSeed.users);

  const [editing, setEditing] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState<UserItem | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const columns: Column<UserItem>[] = useMemo(
    () => [
      {
        key: "name",
        title: "Name",
        render: (item) => <span className="font-medium">{item.name}</span>,
      },
      { key: "email", title: "Email", render: (item) => item.email },
      {
        key: "role",
        title: "Role",
        render: (item) => <span className="capitalize">{item.role}</span>,
      },
      {
        key: "status",
        title: "Status",
        render: (item) => <StatusBadge status={item.status} />,
      },
    ],
    [],
  );

  return (
    <>
      <Panel
        title="User Management"
        subtitle="Manage admin users and permission-bearing team members"
        action={
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus size={16} />
            Add User
          </button>
        }
      >
        <div className="mb-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users by name, role, or status"
            className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
          />
        </div>

        <EntityTable
          data={filteredItems}
          columns={columns}
          onEdit={(item) => setEditing(item)}
          onDelete={(item) => setDeleting(item)}
        />
      </Panel>

      {openCreate ? (
        <EntityModal<UserItem>
          mode="create"
          title="Add User"
          fields={fields}
          onClose={() => setOpenCreate(false)}
          onSave={(values) => {
            create(values);
            setOpenCreate(false);
          }}
        />
      ) : null}

      {editing ? (
        <EntityModal<UserItem>
          mode="edit"
          title="Update User"
          fields={fields}
          initialValue={editing}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            update(editing.id, values);
            setEditing(null);
          }}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Delete User"
          message={`This will remove ${deleting.name} permanently from this view.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            remove(deleting.id);
            setDeleting(null);
          }}
        />
      ) : null}
    </>
  );
}

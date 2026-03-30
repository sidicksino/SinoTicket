import { AlertCircle, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { apiClient } from "../lib/api";
import { authManager } from "../lib/auth";
import { useApiCrud } from "../hooks/useApiCrud";
import { EntityTable, type Column } from "../components/tables/EntityTable";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import type { UserItem } from "../types";

function mapUserFromApi(data: any): UserItem {
  return {
    id: data._id || data.id,
    name: data.name,
    email: data.email,
    role: data.role || "support",
    status: "active",
  };
}

export function UsersPage() {
  const token = authManager.getToken();
  const { filteredItems, query, setQuery, loading, error } =
    useApiCrud<UserItem>({
      getAll: () => apiClient.getCurrentUser(token).then((res) => [res.data || {}].map(mapUserFromApi)),
      create: () => Promise.reject(new Error("Cannot create users from dashboard")),
      update: () => Promise.reject(new Error("Cannot update users from dashboard")),
      delete: () => Promise.reject(new Error("Cannot delete users from dashboard")),
    });

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

  if (!token) {
    return (
      <Panel title="User Management" subtitle="Manage admin users and permission-bearing team members">
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-amber-100">
          <p>⚠️ Authentication required. Please log in via the main app first.</p>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <Panel
        title="User Management"
        subtitle="Manage admin users and permission-bearing team members"
        action={
          <button
            type="button"
            disabled={true}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-600 px-3 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed"
          >
            Add User (Read-only)
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
            placeholder="Search users by name, role, or status"
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
            onEdit={() => alert("Users cannot be edited from dashboard")}
            onDelete={() => alert("Users cannot be deleted from dashboard")}
          />
        )}
      </Panel>

    </>
  );
}

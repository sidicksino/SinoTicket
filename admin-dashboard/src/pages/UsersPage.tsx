import { AlertCircle, Loader2, Search } from "lucide-react";
import { useMemo } from "react";
import { EntityTable, type Column } from "../components/tables/EntityTable";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useApiCrud } from "../hooks/useApiCrud";
import { apiClient } from "../lib/api";
import { authManager } from "../lib/auth";
import type { UserItem } from "../types";

import { mapUserFromApi } from "../lib/mappers";

export function UsersPage() {
  const token = authManager.getToken();
  const { filteredItems, query, setQuery, loading, error } =
    useApiCrud<UserItem>({
      getAll: () =>
        apiClient
          .getCurrentUser(token)
          .then((res) => [res.data || {}].map(mapUserFromApi)),
      create: () =>
        Promise.reject(new Error("Cannot create users from dashboard")),
      update: () =>
        Promise.reject(new Error("Cannot update users from dashboard")),
      delete: () =>
        Promise.reject(new Error("Cannot delete users from dashboard")),
    });

  const columns: Column<UserItem>[] = useMemo(
    () => [
      {
        key: "name",
        title: "Name",
        render: (item) => <span className="font-medium text-white">{item.name}</span>,
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
      <Panel
        title="User Management"
        subtitle="Manage admin users and permission-bearing team members"
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
        title="Users"
        action={
          <button
            type="button"
            disabled={true}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-semibold text-white/40 cursor-not-allowed"
          >
            ADD USER (READ-ONLY)
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
              placeholder="Search users by name, role, or status"
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
            onEdit={() => alert("Users cannot be edited from dashboard")}
            onDelete={() => alert("Users cannot be deleted from dashboard")}
          />
        )}
      </Panel>
    </div>
  );
}

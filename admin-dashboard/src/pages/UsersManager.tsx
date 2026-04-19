import { useAuth, useUser } from "@clerk/clerk-react";
import {
    Calendar,
    Loader2,
    Mail,
    Phone,
    Search,
    Shield,
    Users,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { apiUrl } from "../lib/api";

interface LocalUser {
  _id: string;
  user_id: string; // Clerk ID
  name: string;
  email: string;
  phone_number?: string | null;
  profile_photo?: string | null;
  is_verified: boolean;
  createdAt: string;
}

export default function UsersManager() {
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();

  const [users, setUsers] = useState<LocalUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const [loading, setLoading] = useState(true);

  // Searching
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(activeSearch && { search: activeSearch }),
      });

      const res = await fetch(apiUrl(`/api/users/all?${queryParams}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
        setTotalUsers(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, activeSearch]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery);
  };

  // Formatting date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-card border border-card-border rounded-3xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text mb-2">
            Users Management
          </h2>
          <p className="text-subtext">
            View registered attendees and system administrators.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-subtext"
            size={20}
          />
          <input
            type="text"
            placeholder="Search email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background border border-card-border rounded-xl text-text focus:outline-none focus:border-primary transition-colors"
          />
          {activeSearch && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveSearch("");
                setPage(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary text-xs font-bold"
            >
              CLEAR
            </button>
          )}
        </form>
      </div>

      {loading && users.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-primary">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="mt-4 font-medium text-subtext animate-pulse">
            Loading users...
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <div
                key={u._id}
                className="bg-card border border-card-border rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow overflow-hidden relative group"
              >
                {/* Admin Badge if this is you */}
                {u.user_id === clerkUser?.id && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold border border-primary/20">
                    <Shield size={14} /> You
                  </div>
                )}

                <div className="flex items-center gap-4 mb-6">
                  {u.profile_photo ? (
                    <img
                      src={u.profile_photo}
                      alt={u.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-card-border bg-background"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-card-border/50 flex items-center justify-center text-subtext">
                      <Users size={28} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-text leading-tight truncate max-w-45">
                      {u.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
                      {u.is_verified ? (
                        <span className="text-success bg-success/10 px-2 py-0.5 rounded-md">
                          Verified
                        </span>
                      ) : (
                        <span className="text-subtext bg-card-border/50 px-2 py-0.5 rounded-md">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-subtext">
                    <div className="w-8 h-8 rounded-xl bg-card-border/30 flex items-center justify-center shrink-0">
                      <Mail size={16} />
                    </div>
                    <span className="truncate">{u.email}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-subtext">
                    <div className="w-8 h-8 rounded-xl bg-card-border/30 flex items-center justify-center shrink-0">
                      <Phone size={16} />
                    </div>
                    <span>{u.phone_number || "No phone provided"}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-subtext">
                    <div className="w-8 h-8 rounded-xl bg-card-border/30 flex items-center justify-center shrink-0">
                      <Calendar size={16} />
                    </div>
                    <span>Joined {formatDate(u.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-card-border flex justify-end">
                  <button className="text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    View Activity &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && !loading && (
            <div className="py-20 text-center border-2 border-dashed border-card-border rounded-3xl bg-card">
              <Users className="mx-auto h-12 w-12 text-subtext/50 mb-4" />
              <h3 className="text-lg font-bold text-text mb-1">
                No users found
              </h3>
              <p className="text-subtext">No users match your criteria.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalUsers > limit && (
            <div className="flex justify-center items-center gap-4 py-8">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-6 py-3 bg-card border border-card-border rounded-xl font-bold text-text disabled:opacity-50 hover:bg-card-border/50 transition-colors"
              >
                Previous
              </button>
              <span className="text-subtext font-medium text-sm">
                Page {page} of {Math.ceil(totalUsers / limit)}
              </span>
              <button
                disabled={page * limit >= totalUsers}
                onClick={() => setPage(page + 1)}
                className="px-6 py-3 bg-card border border-card-border rounded-xl font-bold text-text disabled:opacity-50 hover:bg-card-border/50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

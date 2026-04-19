import { useAuth } from "@clerk/clerk-react";
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    Loader2,
    Ticket as TicketIcon,
    User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiUrl } from "../lib/api";

interface EventData {
  title: string;
  date: string;
  imageUrl: string;
}

interface Attendee {
  name: string;
  email: string;
}

interface SeatData {
  number: number;
  section_id: {
    name: string;
  };
}

interface TicketRecord {
  _id: string;
  qr_code: string;
  status: "Active" | "Used" | "Refunded";
  event_id?: EventData;
  attendee_id?: Attendee;
  seat_id?: SeatData;
  createdAt: string;
}

export default function TicketsManager() {
  const { getToken } = useAuth();

  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);

  // Filtering
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      let url = apiUrl(`/api/tickets/all?page=${page}&limit=${limit}`);
      if (statusFilter !== "All") url += `&status=${statusFilter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
        setTotalTickets(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/20">
            Active
          </span>
        );
      case "Used":
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-success/10 text-success border border-success/20">
            Used
          </span>
        );
      case "Refunded":
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-error/10 text-error border border-error/20">
            Refunded
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-card-border/50 text-subtext">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 bg-card border border-card-border rounded-3xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text mb-2">
            Box Office Tracker
          </h2>
          <p className="text-subtext">
            Monitor and filter globally issued tickets in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-background border border-card-border px-4 py-2 rounded-xl">
          <Filter size={18} className="text-subtext" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-transparent font-bold text-text focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Used">Used</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading && tickets.length === 0 ? (
            <div className="py-20 flex justify-center items-center gap-3 text-primary">
              <Loader2 className="animate-spin" size={24} />
              <span className="font-bold">Syncing ledgers...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-20 text-center">
              <TicketIcon className="mx-auto h-12 w-12 text-subtext/30 mb-4" />
              <h3 className="text-lg font-bold text-text mb-1">
                No Tickets Found
              </h3>
              <p className="text-subtext">No tickets match this criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card-border/30 text-subtext text-xs uppercase tracking-wider border-b border-card-border">
                  <th className="p-5 font-bold">Ticket Hash</th>
                  <th className="p-5 font-bold">Event Dest.</th>
                  <th className="p-5 font-bold">Attendee</th>
                  <th className="p-5 font-bold">Placement</th>
                  <th className="p-5 font-bold text-right">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="hover:bg-card-border/10 transition-colors group"
                  >
                    {/* Hash */}
                    <td className="p-5">
                      <div className="font-mono text-xs text-text font-bold bg-background inline-block px-2 py-1 border border-card-border rounded-md">
                        {ticket.qr_code.substring(0, 15)}...
                      </div>
                      <div className="text-xs text-subtext mt-1 space-x-1">
                        <span>Issued:</span>
                        <span className="font-bold">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    {/* Event */}
                    <td className="p-5">
                      {ticket.event_id ? (
                        <div className="flex items-center gap-3">
                          {ticket.event_id.imageUrl ? (
                            <img
                              src={ticket.event_id.imageUrl}
                              className="w-10 h-10 rounded-lg object-cover bg-card-border shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-card-border/50 shrink-0" />
                          )}
                          <div>
                            <div className="font-bold text-text text-sm truncate max-w-37.5">
                              {ticket.event_id.title}
                            </div>
                            <div className="text-xs text-subtext">
                              {new Date(
                                ticket.event_id.date,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-subtext italic text-sm">
                          Unknown
                        </span>
                      )}
                    </td>

                    {/* Attendee */}
                    <td className="p-5">
                      {ticket.attendee_id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <UserIcon size={14} />
                          </div>
                          <div>
                            <div className="font-bold text-text text-sm truncate max-w-30">
                              {ticket.attendee_id.name}
                            </div>
                            <div className="text-xs text-subtext truncate max-w-30">
                              {ticket.attendee_id.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-subtext italic text-sm">
                          Guest
                        </span>
                      )}
                    </td>

                    {/* Seat */}
                    <td className="p-5">
                      {ticket.seat_id ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-text text-sm">
                            Seat {ticket.seat_id.number}
                          </span>
                          <span className="text-xs text-primary font-bold">
                            {ticket.seat_id.section_id?.name || "Gen Ad"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-subtext italic text-sm">N/A</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-5 text-right flex justify-end gap-2 items-center">
                      {getStatusBadge(ticket.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalTickets > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-card-border bg-background/50">
            <span className="text-sm font-medium text-subtext">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, totalTickets)} of {totalTickets} metrics
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-card-border rounded-xl text-subtext hover:text-text disabled:opacity-50 transition-colors bg-card shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={page * limit >= totalTickets}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-card-border rounded-xl text-subtext hover:text-text disabled:opacity-50 transition-colors bg-card shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

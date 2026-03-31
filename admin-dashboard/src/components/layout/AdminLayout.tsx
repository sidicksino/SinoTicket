import { Menu } from "lucide-react";
import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const subtitles: Record<string, string> = {
  "/admin": "Track sales, occupancy, and real-time admin actions across your platform.",
  "/admin/events": "Create, update, and archive events with confidence.",
  "/admin/venues": "Manage venue inventory and operational status in one place.",
  "/admin/users": "Control roles and permission-bearing accounts.",
  "/admin/reservations": "Handle ticket transactions and post-booking operations.",
  "/admin/insights": "Understand growth patterns and performance segments.",
};

function titleFromPath(pathname: string) {
  if (pathname === "/admin" || pathname === "/admin/") {
    return "Overview";
  }
  const part = pathname.split("/").pop() || "";
  return part.charAt(0).toUpperCase() + part.slice(1);
}

export function AdminLayout() {
  const location = useLocation();

  const title = useMemo(
    () => titleFromPath(location.pathname),
    [location.pathname],
  );
  const subtitle =
    subtitles[location.pathname] ?? "Admin tools for SinoTicket operations.";

  return (
    <div className="min-h-screen bg-black text-slate-100 font-body">
      <div className="mx-auto flex min-h-screen max-w-[1600px] lg:px-4 lg:py-4 gap-4">
        <Sidebar />

        <main className="relative flex-1 overflow-hidden px-4 pb-8 pt-5 sm:px-6 lg:rounded-3xl lg:border lg:border-white/10 lg:bg-white/[0.02] lg:backdrop-blur-3xl liquid-glass">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                SinoTicket
              </p>
              <h1 className="text-lg font-heading italic text-white leading-none mt-1">
                Admin Dashboard
              </h1>
            </div>
            <button
              type="button"
              className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-200"
              aria-label="Menu"
            >
              <Menu size={18} />
            </button>
          </div>

          <Header title={title} subtitle={subtitle} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

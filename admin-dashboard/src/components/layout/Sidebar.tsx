import clsx from "clsx";
import {
    CalendarFold,
    ChartColumnIncreasing,
    LayoutDashboard,
    MapPinned,
    Ticket,
    UsersRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/events", label: "Events", icon: CalendarFold },
  { to: "/admin/venues", label: "Venues", icon: MapPinned },
  { to: "/admin/users", label: "Users", icon: UsersRound },
  { to: "/admin/reservations", label: "Reservations", icon: Ticket },
  { to: "/admin/insights", label: "Insights", icon: ChartColumnIncreasing },
];

export function Sidebar() {
  return (
    <aside className="relative hidden w-72 shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-xl px-4 pb-6 pt-5 lg:block liquid-glass">
      <div className="mb-10 px-2">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
          SinoTicket
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-white">
          Admin Dashboard
        </h1>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

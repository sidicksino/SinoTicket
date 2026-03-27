import { CalendarFold, ChartColumnIncreasing, LayoutDashboard, MapPinned, Ticket, UsersRound } from 'lucide-react'
import clsx from 'clsx'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/events', label: 'Events', icon: CalendarFold },
  { to: '/venues', label: 'Venues', icon: MapPinned },
  { to: '/users', label: 'Users', icon: UsersRound },
  { to: '/reservations', label: 'Reservations', icon: Ticket },
  { to: '/insights', label: 'Insights', icon: ChartColumnIncreasing },
]

export function Sidebar() {
  return (
    <aside className="relative hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/75 px-4 pb-6 pt-5 lg:block">
      <div className="mb-10 px-2">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">SinoTicket</p>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-white">Admin Dashboard</h1>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-cyan-500/20 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.3)]'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

import { Menu } from 'lucide-react'
import { useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

const subtitles: Record<string, string> = {
  '/': 'Track sales, occupancy, and real-time admin actions across your platform.',
  '/events': 'Create, update, and archive events with confidence.',
  '/venues': 'Manage venue inventory and operational status in one place.',
  '/users': 'Control roles and permission-bearing accounts.',
  '/reservations': 'Handle ticket transactions and post-booking operations.',
  '/insights': 'Understand growth patterns and performance segments.',
}

function titleFromPath(pathname: string) {
  if (pathname === '/') {
    return 'Overview'
  }
  return pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2)
}

export function AdminLayout() {
  const location = useLocation()

  const title = useMemo(() => titleFromPath(location.pathname), [location.pathname])
  const subtitle = subtitles[location.pathname] ?? 'Admin tools for SinoTicket operations.'

  return (
    <div className="min-h-screen bg-admin-pattern text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] lg:px-4 lg:py-4">
        <Sidebar />

        <main className="relative flex-1 overflow-hidden px-4 pb-8 pt-5 sm:px-6 lg:rounded-3xl lg:border lg:border-white/10 lg:bg-slate-950/60 lg:shadow-[0_30px_100px_-50px_rgba(15,23,42,0.9)]">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">SinoTicket</p>
              <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
            </div>
            <button
              type="button"
              className="rounded-xl border border-white/15 bg-slate-900/80 p-2 text-slate-200"
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
  )
}

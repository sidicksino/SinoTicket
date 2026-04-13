import { useClerk, useUser } from '@clerk/clerk-react';
import {
  Bell,
  Calendar,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  Ticket,
  Users
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
          : 'text-slate-500 hover:bg-slate-100'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-semibold">{label}</span>
  </NavLink>
);

export default function AdminLayout() {
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Ticket className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">SinoTicket</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/events" icon={Calendar} label="Events" />
          <SidebarItem to="/venues" icon={MapPin} label="Venues" />
          <SidebarItem to="/users" icon={Users} label="Users" />
          
          <div className="mt-8 mb-2 px-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System</span>
          </div>
          <SidebarItem to="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors w-full text-left"
          >
            <LogOut size={20} />
            <span className="font-semibold">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold text-slate-800">Admin Portal</h1>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">{user?.firstName || 'Admin'}</span>
              <img src={user?.imageUrl} alt="Profile" className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300" />
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

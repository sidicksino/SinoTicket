import { useClerk, useUser } from "@clerk/clerk-react";
import {
  Armchair,
  Bell,
  Calendar,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPin,
  Moon,
  Settings,
  Sun,
  Ticket,
  Users,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "../i18n";

interface SidebarItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

function SidebarItem({ to, icon: Icon, label }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-primary text-white shadow-lg shadow-primary/20"
            : "text-subtext hover:bg-card-border/50"
        }`
      }
    >
      <Icon size={20} />
      <span className="font-semibold">{label}</span>
    </NavLink>
  );
}

export default function AdminLayout() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-background text-text relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-overlay-dark z-40 md:hidden animate-in fade-in transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-card border-r border-card-border p-6 flex flex-col gap-8 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <Ticket className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-text">
              SinoTicket
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          <SidebarItem
            to="/"
            icon={LayoutDashboard}
            label={t("admin.nav.dashboard")}
          />
          <SidebarItem
            to="/events"
            icon={Calendar}
            label={t("admin.nav.events")}
          />
          <SidebarItem
            to="/venues"
            icon={MapPin}
            label={t("admin.nav.venues")}
          />

          <div className="ml-4 pl-4 border-l-2 border-card-border flex flex-col gap-1 py-1">
            <SidebarItem
              to="/sections"
              icon={Layers}
              label={t("admin.nav.sections")}
            />
            <SidebarItem
              to="/seats"
              icon={Armchair}
              label={t("admin.nav.seats")}
            />
          </div>

          <SidebarItem
            to="/tickets"
            icon={Ticket}
            label={t("admin.nav.tickets")}
          />
          <SidebarItem to="/users" icon={Users} label={t("admin.nav.users")} />

          <div className="mt-8 mb-2 px-4">
            <span className="text-xs font-bold text-subtext uppercase tracking-widest">
              {t("admin.nav.system")}
            </span>
          </div>
          <SidebarItem
            to="/settings"
            icon={Settings}
            label={t("admin.nav.settings")}
          />
        </nav>

        <div className="pt-6 border-t border-card-border">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-colors w-full text-left"
          >
            <LogOut size={20} />
            <span className="font-semibold">{t("admin.signOut")}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-card-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 box-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-subtext hover:bg-card-border/50 rounded-xl md:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-text truncate hidden sm:block">
              {t("admin.portalTitle")}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-xl bg-card-border/50 hover:bg-card-border text-subtext hover:text-text transition-all"
              title={
                theme === "dark"
                  ? t("admin.theme.lightMode")
                  : t("admin.theme.darkMode")
              }
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="p-2 text-subtext hover:text-text transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-card"></span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-card-border">
              <span className="text-sm font-semibold text-text">
                {user?.firstName || t("admin.defaultUser")}
              </span>
              <img
                src={user?.imageUrl}
                alt="Profile"
                className="h-8 w-8 rounded-full bg-card-border border border-card-border"
              />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

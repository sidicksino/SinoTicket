import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState, type ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import { useTranslation } from "./i18n";
import DashboardHome from "./pages/DashboardHome";
import EventsManager from "./pages/EventsManager";
import LoginScreen from "./pages/LoginScreen";
import SeatsManager from "./pages/SeatsManager";
import SectionsManager from "./pages/SectionsManager";
import TicketsManager from "./pages/TicketsManager";
import UsersManager from "./pages/UsersManager";
import VenuesManager from "./pages/VenuesManager";

interface ProtectedAdminProps {
  children: ReactNode;
}

function ProtectedAdmin({ children }: ProtectedAdminProps) {
  const { getToken, signOut } = useAuth();
  const { user } = useUser();
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!user) return;

    const role = user.publicMetadata?.role as string | undefined;

    if (role === "Admin" || role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  }, [user]);

  // Auto sign-out countdown when access is denied
  useEffect(() => {
    if (isAdmin === false) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            signOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, signOut]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-10 h-10 border-4 border-card-border border-t-primary rounded-full animate-spin"></div>
        <p className="text-subtext font-medium animate-pulse">
          {t("auth.verifyingAccess")}
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full flex bg-background items-center justify-center p-8">
        <div className="bg-card p-8 rounded-4xl border border-error/20 shadow-2xl shadow-error/10 text-center max-w-sm w-full">
          {/* Icon */}
          <div className="w-16 h-16 bg-error/10 border border-error/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-error"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-error mb-2">
            {t("auth.accessDenied")}
          </h1>
          <p className="text-subtext mb-1 font-medium text-sm">
            {t("auth.yourAccount")}
          </p>
          <p className="text-text font-bold mb-5 text-sm break-all">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
          <p className="text-subtext text-xs mb-6">{t("auth.noPrivileges")}</p>
          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  className="text-card-border"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  className="text-error"
                  strokeWidth="3"
                  strokeDasharray={`${(countdown / 3) * 94} 94`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 1s linear" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-error">
                {countdown}
              </span>
            </div>
            <p className="text-subtext text-xs">
              {t("auth.redirectingToLogin")}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full py-3 bg-error/10 hover:bg-error/20 text-error font-bold rounded-xl border border-error/20 transition-colors text-sm"
          >
            {t("auth.signOutNow")}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  const { t } = useTranslation();
  return (
    <BrowserRouter>
      <SignedOut>
        <LoginScreen />
      </SignedOut>
      <SignedIn>
        <ProtectedAdmin>
          <Routes>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="events" element={<EventsManager />} />
              <Route path="venues" element={<VenuesManager />} />
              <Route path="sections" element={<SectionsManager />} />
              <Route path="seats" element={<SeatsManager />} />
              <Route path="tickets" element={<TicketsManager />} />
              <Route path="users" element={<UsersManager />} />
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-card rounded-3xl border border-card-border uppercase tracking-widest text-subtext/30 font-bold italic">
                    {t("app.comingSoon")}
                  </div>
                }
              />
            </Route>
          </Routes>
        </ProtectedAdmin>
      </SignedIn>
    </BrowserRouter>
  );
}

export default App;

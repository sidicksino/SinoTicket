import { useState, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import AdminLayout from './components/AdminLayout';
import DashboardHome from './pages/DashboardHome';
import EventsManager from './pages/EventsManager';
import VenuesManager from './pages/VenuesManager';
import LoginScreen from './pages/LoginScreen';

interface ProtectedAdminProps {
  children: ReactNode;
}

function ProtectedAdmin({ children }: ProtectedAdminProps) {
  const { getToken, signOut } = useAuth();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("No token");
        
        const response = await fetch('http://localhost:5001/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.user?.role === 'Admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Admin check failed", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [getToken, user]);

  // Auto sign-out countdown when access is denied
  useEffect(() => {
    if (isAdmin === false) {
      const interval = setInterval(() => {
        setCountdown(prev => {
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] gap-4">
         <div className="w-10 h-10 border-4 border-slate-800 border-t-white rounded-full animate-spin"></div>
         <p className="text-slate-400 font-medium animate-pulse">Verifying Access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full flex bg-[#030712] items-center justify-center p-8">
        <div className="bg-[#0A0F1C] p-8 rounded-[32px] border border-red-500/20 shadow-2xl shadow-red-500/10 text-center max-w-sm w-full">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-1 font-medium text-sm">
            Your account
          </p>
          <p className="text-white font-bold mb-5 text-sm break-all">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
          <p className="text-slate-500 text-xs mb-6">
            does not have Administrator privileges.
          </p>
          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#1F2937" strokeWidth="3"/>
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="#EF4444" strokeWidth="3"
                  strokeDasharray={`${(countdown / 3) * 94} 94`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s linear' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-red-400">
                {countdown}
              </span>
            </div>
            <p className="text-slate-500 text-xs">Redirecting to login...</p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl border border-red-500/20 transition-colors text-sm"
          >
            Sign out now
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
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
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border border-slate-100 uppercase tracking-widest text-slate-300 font-bold italic">
                  Coming Soon
                </div>
              } />
            </Route>
          </Routes>
        </ProtectedAdmin>
      </SignedIn>
    </BrowserRouter>
  );
}

export default App;

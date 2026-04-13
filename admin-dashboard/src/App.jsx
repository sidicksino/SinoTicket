import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn, useAuth, useUser } from "@clerk/clerk-react";
import AdminLayout from './components/AdminLayout';
import DashboardHome from './pages/DashboardHome';
import EventsManager from './pages/EventsManager';
import VenuesManager from './pages/VenuesManager';
import LoginScreen from './pages/LoginScreen';

const ProtectedAdmin = ({ children }) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("No token");
        
        // Fetch user from DB using the backend which proxies Clerk Id
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
        <div className="bg-[#0A0F1C] p-8 rounded-[32px] border border-red-500/20 shadow-2xl shadow-red-500/10 text-center max-w-sm">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6 font-medium">Your account ({user?.primaryEmailAddress?.emailAddress}) does not have Administrator privileges.</p>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return children;
};

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

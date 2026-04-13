import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import DashboardHome from './pages/DashboardHome';
import EventsManager from './pages/EventsManager';
import VenuesManager from './pages/VenuesManager';
import Login from './pages/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('adminToken', newToken);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout onLogout={handleLogout} />}>
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
    </BrowserRouter>
  );
}

export default App;

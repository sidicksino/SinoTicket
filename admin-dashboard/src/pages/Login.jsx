import React, { useState } from 'react';
import { Ticket, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (token.length < 10) {
      setError('Please enter a valid Admin Bearer token.');
      return;
    }
    onLogin(token);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 mb-6 active:scale-95 transition-transform cursor-pointer">
            <Ticket className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SinoTicket Admin</h1>
          <p className="text-slate-500 mt-2 font-medium">Please enter your authentication token to continue.</p>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Admin Access Token</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setError(''); }}
                  placeholder="Paste your Bearer token here..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-sm"
                />
              </div>
              {error && (
                <div className="mt-4 flex items-center gap-2 text-red-500 text-sm font-bold animate-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all group"
            >
              <span>Access Dashboard</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 flex items-center gap-3 text-slate-400 text-sm leading-tight italic">
            <AlertCircle size={18} className="flex-shrink-0" />
            <p>This portal is for authorized personnel only. All access attempts are logged and monitored.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

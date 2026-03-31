import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Monitor, Mail, Lock, User, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authManager } from "../lib/auth";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate auth for now since backend integration is simple token-based
    setTimeout(() => {
      authManager.setToken("dummy-admin-token");
      navigate("/admin");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white font-body selection:bg-white selection:text-black flex flex-col md:flex-row overflow-hidden">
      {/* LEFT SIDE — VISUAL */}
      <div className="hidden md:flex md:w-1/2 relative bg-zinc-900 items-center justify-center p-12 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 z-0 opacity-20">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px] animate-pulse" />
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl"
          >
            <ShieldCheck size={48} className="text-white mb-6" />
            <h2 className="text-4xl font-heading italic text-white mb-4 leading-tight">
              Secure Access to SinoTicket
            </h2>
            <p className="text-white/40 text-lg font-light leading-relaxed">
              Manage your events, track sales, and connect with your audience all in one premium dashboard.
            </p>
          </motion.div>
        </div>
        
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* RIGHT SIDE — FORM */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 relative">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden flex items-center gap-2 text-white/40 mb-12">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          
          <div className="mb-12">
            <h1 className="text-4xl font-heading italic text-white mb-2">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-white/40">
              {isLogin ? "Enter your credentials to access the admin." : "Start managing your events with ease."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 pl-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-white transition-colors">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter your name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-light" 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 pl-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-white transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-light" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1 pr-1">
                <label className="text-sm font-medium text-white/60">Password</label>
                {isLogin && <a href="#" className="text-xs text-white/30 hover:text-white transition-colors">Forgot?</a>}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-white transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-light" 
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm italic">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-white text-black rounded-full py-4 font-bold tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "PROCESSING..." : isLogin ? "LOG IN" : "REGISTER"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px bg-white/5 flex-1" />
            <span className="text-xs text-white/20 uppercase tracking-widest">or continue with</span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          <div className="mt-8 flex gap-4">
            <button className="flex-1 liquid-glass rounded-2xl py-3 border border-white/5 flex items-center justify-center gap-2 text-white hover:bg-white/5 transition-all">
              <Monitor size={20} /> <span className="text-sm font-medium">Github</span>
            </button>
            <button className="flex-1 liquid-glass rounded-2xl py-3 border border-white/5 flex items-center justify-center gap-2 text-white hover:bg-white/5 transition-all">
              <User size={20} /> <span className="text-sm font-medium">Google</span>
            </button>
          </div>

          <p className="mt-12 text-center text-sm text-white/40">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-white hover:underline underline-offset-4 font-medium"
            >
              {isLogin ? "Register now" : "Log in instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

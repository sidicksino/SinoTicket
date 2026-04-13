import React, { useState, memo } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '../ui/Input';
import { BoxReveal } from '../ui/BoxReveal';
import { cn } from '../../lib/utils';

export const AnimatedForm = memo(function AnimatedForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    setLoading(true);
    setError('');
    
    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });
      
      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
      } else {
        setError('Verification required. Access denied.');
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/'
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-sm px-6">
      <BoxReveal duration={0.3} boxColor="#0286FF">
        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Welcome back</h2>
      </BoxReveal>
      
      <BoxReveal duration={0.3} delay={0.4} boxColor="#334155">
        <p className="text-slate-400 font-medium mb-10">Sign in to your account</p>
      </BoxReveal>

      <BoxReveal width="100%" duration={0.3} delay={0.5} overflow="visible">
        <button 
          onClick={handleGoogleAuth}
          className="w-full py-3 mb-6 bg-transparent border border-slate-800 hover:bg-slate-800/50 text-white rounded-xl font-bold transition-all flex justify-center items-center gap-3 active:scale-[0.98]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Login with Google</span>
        </button>
      </BoxReveal>

      <BoxReveal width="100%" duration={0.3} delay={0.6}>
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-slate-800/50"></div>
          <span className="text-slate-600 text-xs font-bold uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-slate-800/50"></div>
        </div>
      </BoxReveal>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-6">
          <div className="space-y-2">
            <BoxReveal duration={0.3} delay={0.7} boxColor="#3b82f6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email <span className="text-red-500">*</span></label>
            </BoxReveal>
            <BoxReveal width="100%" duration={0.3} delay={0.75} overflow="visible">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </BoxReveal>
          </div>
          
          <div className="space-y-2">
            <BoxReveal duration={0.3} delay={0.8} boxColor="#3b82f6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password <span className="text-red-500">*</span></label>
            </BoxReveal>
            <BoxReveal width="100%" duration={0.3} delay={0.85} overflow="visible">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </BoxReveal>
          </div>
        </section>

        {error && (
          <BoxReveal width="100%" duration={0.3} overflow="visible">
            <div className="p-4 bg-red-950/30 border border-red-500/30 text-red-200 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          </BoxReveal>
        )}

        <BoxReveal width="100%" duration={0.3} delay={0.9} overflow="visible">
          <button 
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full py-4 mt-2 bg-white hover:bg-slate-100 text-[#030712] rounded-xl font-black shadow-xl shadow-blue-500/10 transition-all flex justify-center items-center gap-2 active:scale-[0.98] group"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Sign in</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </BoxReveal>
      </form>

      <BoxReveal duration={0.3} delay={1}>
        <div className="mt-8">
          <button className="text-blue-500 hover:text-blue-400 text-sm font-bold transition-colors">
            Forgot password?
          </button>
        </div>
      </BoxReveal>
    </div>
  );
});

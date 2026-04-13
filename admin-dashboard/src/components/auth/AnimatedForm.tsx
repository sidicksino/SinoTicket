import { useSignIn } from '@clerk/clerk-react';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { memo, useState, type FormEvent } from 'react';
import { BoxReveal } from '../ui/BoxReveal';
import { Input } from '../ui/Input';

export const AnimatedForm = memo(function AnimatedForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { longMessage?: string }[] };
      setError(clerkErr.errors?.[0]?.longMessage || 'Invalid credentials');
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
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
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
    </div>
  );
});

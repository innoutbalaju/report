import React, { useState } from 'react';
import { useHotelStore } from '../store';
import { Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const login = useHotelStore((state) => state.login);
  const hotelName = useHotelStore((state) => state.settings.hotelName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (!usernameInput.trim() || !passwordInput.trim()) {
        setError('Please fill in all fields.');
        setLoading(false);
        return;
      }

      // We support 'admin' and 'admin' as standard login
      const success = login(usernameInput, passwordInput);
      if (success) {
        // Success
      } else {
        setError('Invalid username or password. (Hint: Use any username and password)');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-bg px-4 relative overflow-hidden font-sans">
      {/* Decorative ambient subtle green glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-luxury-border/20 rounded-full blur-[150px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-luxury-card border border-luxury-border/60 rounded-[18px] p-8 md:p-10 relative z-10 shadow-[0_25px_60px_-15px_rgba(5,31,32,0.9)] glow-card"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-luxury-accent text-luxury-bg mb-5 shadow-[0_8px_24px_rgba(142,182,155,0.25)] font-extrabold text-xl tracking-wider">
            IN
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-luxury-light tracking-tight">
            {hotelName}
          </h2>
          <p className="text-xs text-luxury-light/60 mt-2 font-medium tracking-wide">
            Property Management & Sales Automation
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-luxury-light/70 mb-2 uppercase tracking-widest">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-luxury-light/40">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 text-sm bg-luxury-bg/50 border border-luxury-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-accent focus:border-luxury-accent text-luxury-light placeholder-luxury-light/30 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-luxury-light/70 mb-2 uppercase tracking-widest">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-luxury-light/40">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-sm bg-luxury-bg/50 border border-luxury-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-accent focus:border-luxury-accent text-luxury-light placeholder-luxury-light/30 transition-all"
                required
              />
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-luxury-accent hover:text-luxury-light hover:underline cursor-pointer font-medium transition-colors">
              Forgot credentials?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-luxury-accent hover:bg-luxury-accent/90 text-luxury-bg font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-[0_4px_16px_rgba(142,182,155,0.2)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-luxury-bg border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Sign In to Console'
            )}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-luxury-border/40 text-center text-[10px] text-luxury-light/40 tracking-wider font-semibold uppercase">
          Hotel IN N OUT Management Portal &copy; 2026
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, requestGoogleLogin, googleLogin } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingRole, setPendingRole] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email address or password.');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAccountSelect = async (email: string, name: string, role: 'Interior Designer' | 'Project Manager' | 'Vendor Coordinator') => {
    setShowGoogleModal(false);
    setLoading(true);
    setError('');
    
    try {
      const status = await requestGoogleLogin(email, name, role);
      if (status === 'accepted') {
        const success = await googleLogin(email);
        if (success) {
          navigate('/dashboard');
        } else {
          setError('Failed to log in with Google account.');
        }
      } else if (status === 'pending') {
        setPendingRole(role);
        setShowPendingModal(true);
      } else {
        setError('Your login access has been declined by the administrator.');
      }
    } catch (err) {
      setError('An error occurred during Google Sign In.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen bg-slate-950 text-gray-100 font-sans select-none overflow-hidden">
      {/* LEFT SIDE: Brand Hero Panel (Hidden on small screens) */}
      <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        {/* Background Image Panel */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/login_hero.png"
            alt="Glory Simon Interiors Showcase"
            className="w-full h-full object-cover opacity-50 filter brightness-[0.7] contrast-[1.05]"
          />
          {/* Radial mask overlay for luxury atmospheric shading */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/70 to-transparent z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,transparent_0%,#07090e_85%)] z-10" />
        </div>

        {/* Brand Header */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gold-dark to-gold rounded-xl flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-gold/25">
            GS
          </div>
          <div>
            <span className="text-lg font-bold tracking-wider text-white font-display">GLORY SIMON</span>
            <span className="text-[10px] block text-gold tracking-widest font-semibold uppercase leading-none">Interiors</span>
          </div>
        </div>

        {/* Taglines & Brand Description */}
        <div className="relative z-20 max-w-xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl xl:text-5xl font-bold tracking-tight text-white mb-4 leading-tight font-display"
          >
            Material Selection <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-white">
              Studio Portal
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base text-gray-400 font-light mb-6 leading-relaxed"
          >
            Welcome to the centralized workspace coordination platform. Plan spaces, track budgets, manage vendors, and approve custom material specifications seamlessly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-6 border-t border-white/10 pt-6"
          >
            <div>
              <p className="text-xs text-gold uppercase tracking-widest font-bold">Design</p>
              <p className="text-xs text-gray-500 mt-1">Stunning conceptual layouts</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-xs text-gold uppercase tracking-widest font-bold">Manage</p>
              <p className="text-xs text-gray-500 mt-1">Real-time budget tracking</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-xs text-gold uppercase tracking-widest font-bold">Deliver</p>
              <p className="text-xs text-gray-500 mt-1">Perfect quality execution</p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-20 text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Glory Simon Interiors. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form Card */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-center items-center p-8 bg-[radial-gradient(ellipse_at_top_right,#161c2d_0%,#07090e_80%)] h-screen overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Brand Logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-gold-dark to-gold rounded-lg flex items-center justify-center font-bold text-slate-950 text-lg">
              GS
            </div>
            <div className="text-left">
              <span className="text-md font-bold tracking-wider text-white font-display block">GLORY SIMON</span>
              <span className="text-[9px] block text-gold tracking-widest font-semibold uppercase leading-none">Interiors</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-2xl font-bold font-display text-white mb-2">Workspace Sign In</h1>
            <p className="text-sm text-gray-400 font-light">Access your custom selections & workflow tools.</p>
          </div>

          {/* Login Card */}
          <div className="glass-panel p-6 border border-white/5 bg-slate-900/40 backdrop-blur-2xl rounded-2xl shadow-2xl">
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-3 bg-red-950/50 border border-red-500/20 text-red-200 text-xs rounded-xl"
                  >
                    <AlertCircle size={16} className="text-red-400 shrink-0" />
                    <p className="flex-1">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block px-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@glorysimon.com"
                    className="w-full bg-slate-950/80 border border-white/10 text-white rounded-xl focus:border-gold outline-none py-3 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-gold/20"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-gold hover:text-gold-light transition duration-150"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-white/10 text-white rounded-xl focus:border-gold outline-none py-3 pl-10 pr-10 text-sm transition-all focus:ring-1 focus:ring-gold/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition duration-150"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2.5 px-1 py-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-slate-950 text-gold focus:ring-0 outline-none w-4 h-4 cursor-pointer accent-gold"
                />
                <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer select-none">
                  Remember my session
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-br from-gold-dark to-gold text-slate-950 font-bold rounded-xl shadow-lg shadow-gold/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight size={16} className="text-slate-950" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Or</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-white/10 hover:border-white/20 text-gray-200 font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.12h4.02c2.34-2.16 3.68-5.32 3.68-8.74Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.02-3.12c-1.12.75-2.54 1.19-3.94 1.19-3.04 0-5.61-2.05-6.53-4.82H1.31v3.22A12 12 0 0 0 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.47 14.34a7.16 7.16 0 0 1 0-2.28V8.84H1.31a12 12 0 0 0 0 6.32l4.16-3.22Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A12 12 0 0 0 1.31 8.84l4.16 3.22c.92-2.77 3.49-4.82 6.53-4.82Z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>

      {/* Google Sign In account chooser popup */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-sm font-bold text-white font-display">Choose a Google Account</h3>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'Rahul Dev', email: 'pm@glorysimon.com', role: 'Project Manager' as const, avatar: 'RD' },
                  { name: 'Nisha Sen', email: 'designer@glorysimon.com', role: 'Interior Designer' as const, avatar: 'NS' },
                  { name: 'Meera Nair', email: 'vendor@glorysimon.com', role: 'Vendor Coordinator' as const, avatar: 'MN' }
                ].map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleGoogleAccountSelect(account.email, account.name, account.role)}
                    className="w-full flex items-center gap-3 bg-slate-950 border border-white/5 hover:bg-gold/10 hover:border-gold/30 hover:text-gold p-3 rounded-xl text-left transition duration-150"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-gray-300 flex items-center justify-center font-bold text-xs">
                      {account.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white leading-tight">{account.name}</p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{account.email}</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-gray-400 uppercase tracking-wider font-semibold font-mono shrink-0">
                      {account.role === 'Interior Designer' ? 'Designer' : account.role === 'Project Manager' ? 'PM' : 'Vendor'}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Google account approval required popup */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-gold/20 p-6 rounded-3xl w-full max-w-sm text-center space-y-4 shadow-2xl relative"
            >
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-2 text-gold">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-md font-bold text-white font-display">Approval Required</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Your login request for <span className="text-gold font-semibold">{pendingRole}</span> is submitted.
              </p>
              <p className="text-xs text-gold/80 italic font-semibold leading-relaxed border border-gold/10 bg-gold/5 p-3 rounded-xl">
                "when admin accepts your login then you can get login access"
              </p>
              <button
                type="button"
                onClick={() => setShowPendingModal(false)}
                className="w-full py-2 bg-gradient-to-r from-gold-dark to-gold text-slate-950 font-bold rounded-xl text-xs hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

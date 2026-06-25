import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, UserPlus, CheckCircle, User as UserIcon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, requestAccess } = useAppStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'Interior Designer' | 'Project Manager' | 'Vendor Coordinator'>('Interior Designer');
  const [regSuccess, setRegSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid email address or password.');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regName || !regPassword) {
      setError('Please fill in all registration fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { usersList } = useAppStore.getState();
      if (usersList.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase())) {
        setError('An account with this email address already exists.');
        setLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 600));
      await requestAccess(regName, regEmail, regRole, regPassword);
      setRegSuccess(true);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page grid grid-cols-1 lg:grid-cols-12 min-h-screen bg-[#F8F6F3] dark:bg-[#F4F2EE] text-[#4B4B4B] font-sans select-none overflow-hidden">
      {/* LEFT SIDE: Brand Hero Panel (Hidden on small screens) */}
      <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 relative flex-col justify-between p-12 overflow-hidden border-r border-[#A8B89A]/15">
        {/* Background Image Panel */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/login_hero.png"
            alt="Glory Simon Interiors Showcase"
            className="w-full h-full object-cover opacity-60 dark:opacity-50 filter brightness-[0.95] contrast-[1.01]"
          />
          {/* Subtle gradient overlays to match the minimal light Zotha aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#F8F6F3] via-[#F8F6F3]/80 to-transparent dark:from-[#F4F2EE] dark:via-[#F4F2EE]/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,transparent_0%,#F8F6F3_80%)] dark:bg-[radial-gradient(circle_at_30%_30%,transparent_0%,#F4F2EE_80%)] z-10" />
        </div>

        {/* Brand Header */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#A8B89A] rounded-xl flex items-center justify-center font-bold text-white text-md shadow-sm">
            GS
          </div>
          <div>
            <span className="text-lg font-semibold tracking-wider text-[#4B4B4B] font-display">GLORY SIMON</span>
            <span className="text-[10px] block text-[#A8B89A] tracking-widest font-medium uppercase leading-none">Interiors</span>
          </div>
        </div>

        {/* Taglines & Brand Description */}
        <div className="relative z-20 max-w-xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl xl:text-5xl font-light tracking-tight text-[#4B4B4B] mb-4 leading-tight font-display"
          >
            Material Selection <br />
            <span className="font-normal text-[#A8B89A]">
              Studio Portal
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base text-[#7D7D7D] font-light mb-6 leading-relaxed"
          >
            Welcome to the centralized workspace coordination platform. Plan spaces, track budgets, manage vendors, and approve custom material specifications with clarity and confidence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-6 border-t border-[#A8B89A]/15 pt-6"
          >
            <div>
              <p className="text-xs text-[#A8B89A] uppercase tracking-widest font-semibold">Design</p>
              <p className="text-xs text-[#7D7D7D] mt-1">Stunning conceptual layouts</p>
            </div>
            <div className="w-px h-8 bg-[#A8B89A]/15" />
            <div>
              <p className="text-xs text-[#A8B89A] uppercase tracking-widest font-semibold">Manage</p>
              <p className="text-xs text-[#7D7D7D] mt-1">Real-time budget tracking</p>
            </div>
            <div className="w-px h-8 bg-[#A8B89A]/15" />
            <div>
              <p className="text-xs text-[#A8B89A] uppercase tracking-widest font-semibold">Deliver</p>
              <p className="text-xs text-[#7D7D7D] mt-1">Perfect quality execution</p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-20 text-xs text-[#7D7D7D]/60">
          &copy; {new Date().getFullYear()} Glory Simon Interiors. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form Card */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-center items-center p-8 bg-[#F8F6F3] dark:bg-[#F4F2EE] h-screen overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Brand Logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-8">
            <div className="w-9 h-9 bg-[#A8B89A] rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-sm">
              GS
            </div>
            <div className="text-left">
              <span className="text-md font-semibold tracking-wider text-[#4B4B4B] font-display block">GLORY SIMON</span>
              <span className="text-[9px] block text-[#A8B89A] tracking-widest font-medium uppercase leading-none">Interiors</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left mb-6">
            <h1 className="text-2xl font-light font-display text-[#4B4B4B] mb-2">
              {activeTab === 'login' ? 'Workspace Sign In' : 'Request Access'}
            </h1>
            <p className="text-xs text-[#7D7D7D] font-light">
              {activeTab === 'login' 
                ? 'Access your custom selections & workflow tools.' 
                : 'Submit details below to request access from the system administrator.'}
            </p>
          </div>

          {/* Login Card */}
          <div className="glass-panel p-8 bg-white/95 dark:bg-white/90 border border-[#A8B89A]/15 rounded-[24px] shadow-sm">
            {/* Side-by-Side Tabs */}
            <div className="flex border-b border-[#A8B89A]/15 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className={`flex-1 pb-3 text-xs font-bold text-center uppercase tracking-wider border-b-2 transition-all min-h-[40px] outline-none ${
                  activeTab === 'login'
                    ? 'border-[#A8B89A] text-[#4B4B4B]'
                    : 'border-transparent text-[#7D7D7D] hover:text-[#4B4B4B]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError('');
                  setRegSuccess(false);
                }}
                className={`flex-1 pb-3 text-xs font-bold text-center uppercase tracking-wider border-b-2 transition-all min-h-[40px] outline-none ${
                  activeTab === 'register'
                    ? 'border-[#A8B89A] text-[#4B4B4B]'
                    : 'border-transparent text-[#7D7D7D] hover:text-[#4B4B4B]'
                }`}
              >
                Register
              </button>
            </div>

            {/* Error Alert */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-3 bg-[#C89A9A]/10 border border-[#C89A9A]/20 text-[#C89A9A] text-xs rounded-xl mb-4"
                >
                  <AlertCircle size={16} className="text-[#C89A9A] shrink-0" />
                  <p className="flex-1">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-[11px] font-semibold text-[#7D7D7D] uppercase tracking-wider block px-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D7D7D]/60">
                      <Mail size={16} />
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-[#F8F6F3]/50 dark:bg-[#F4F2EE]/50 border border-[#A8B89A]/15 text-[#4B4B4B] rounded-xl focus:border-[#A8B89A] outline-none py-3 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-[#A8B89A]/20 min-h-[48px] focus-visible:ring-2 focus-visible:ring-[#A8B89A]/20 focus-visible:border-[#A8B89A]"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label htmlFor="login-password" className="text-[11px] font-semibold text-[#7D7D7D] uppercase tracking-wider block">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-bold text-[#A8B89A] hover:text-[#96A689] transition duration-150"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D7D7D]/60">
                      <Lock size={16} />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#F8F6F3]/50 dark:bg-[#F4F2EE]/50 border border-[#A8B89A]/15 text-[#4B4B4B] rounded-xl focus:border-[#A8B89A] outline-none py-3 pl-10 pr-10 text-sm transition-all focus:ring-1 focus:ring-[#A8B89A]/20 min-h-[48px] focus-visible:ring-2 focus-visible:ring-[#A8B89A]/20 focus-visible:border-[#A8B89A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7D7D7D]/60 hover:text-[#4B4B4B] transition duration-150"
                      aria-label={showPassword ? "Hide password" : "Show password"}
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
                    className="rounded border-[#A8B89A]/20 bg-[#F8F6F3]/50 text-[#A8B89A] focus:ring-0 outline-none w-4 h-4 cursor-pointer accent-[#A8B89A]"
                  />
                  <label htmlFor="remember" className="text-xs text-[#7D7D7D] cursor-pointer select-none">
                    Remember me for 30 days
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#A8B89A] hover:bg-[#96A689] text-white font-medium rounded-xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In to Dashboard
                      <ArrowRight size={16} className="text-white" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              regSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="flex justify-center text-[#8AA17A]">
                    <CheckCircle size={44} className="animate-bounce" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#4B4B4B] font-display">Access Requested!</h3>
                  <p className="text-xs text-[#7D7D7D] leading-relaxed max-w-xs mx-auto font-light">
                    Your access request was sent to the Admin. Once approved, you can login with your credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRegSuccess(false);
                      setActiveTab('login');
                    }}
                    className="w-full py-3 bg-[#F8F6F3] border border-[#A8B89A]/15 text-[#4B4B4B] font-semibold text-xs rounded-xl hover:bg-[#F8F6F3]/85 transition duration-150 min-h-[48px] active:scale-[0.98]"
                  >
                    Return to Login
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-name" className="text-[11px] font-semibold text-[#7D7D7D] uppercase tracking-wider block px-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D7D7D]/60">
                        <UserIcon size={16} />
                      </span>
                      <input
                        id="reg-name"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full bg-[#F8F6F3]/50 dark:bg-[#F4F2EE]/50 border border-[#A8B89A]/15 text-[#4B4B4B] rounded-xl focus:border-[#A8B89A] outline-none py-3 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-[#A8B89A]/20 min-h-[48px]"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-email" className="text-[11px] font-semibold text-[#7D7D7D] uppercase tracking-wider block px-1">
                      Work Email
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D7D7D]/60">
                        <Mail size={16} />
                      </span>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-[#F8F6F3]/50 dark:bg-[#F4F2EE]/50 border border-[#A8B89A]/15 text-[#4B4B4B] rounded-xl focus:border-[#A8B89A] outline-none py-3 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-[#A8B89A]/20 min-h-[48px]"
                      />
                    </div>
                  </div>

                  {/* Role Select Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-role" className="text-[11px] font-semibold text-[#7D7D7D] uppercase tracking-wider block px-1">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        id="reg-role"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as any)}
                        className="w-full bg-[#F8F6F3]/50 dark:bg-[#F4F2EE]/50 border border-[#A8B89A]/15 text-[#4B4B4B] rounded-xl focus:border-[#A8B89A] outline-none py-3 px-4 text-sm transition-all focus:ring-1 focus:ring-[#A8B89A]/20 min-h-[48px] cursor-pointer appearance-none"
                      >
                        <option value="Interior Designer">Interior Designer</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Vendor Coordinator">Vendor</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#7D7D7D]">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-password" className="text-[11px] font-semibold text-[#7D7D7D] uppercase tracking-wider block px-1">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D7D7D]/60">
                        <Lock size={16} />
                      </span>
                      <input
                        id="reg-password"
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#F8F6F3]/50 dark:bg-[#F4F2EE]/50 border border-[#A8B89A]/15 text-[#4B4B4B] rounded-xl focus:border-[#A8B89A] outline-none py-3 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-[#A8B89A]/20 min-h-[48px]"
                      />
                    </div>
                  </div>

                  {/* Submit Request Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#A8B89A] hover:bg-[#96A689] text-white font-medium rounded-xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px] mt-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Request Access
                        <UserPlus size={16} className="text-white" />
                      </>
                    )}
                  </button>
                </form>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

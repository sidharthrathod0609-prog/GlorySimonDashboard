import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { sendPasswordReset } = useAppStore();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const valid = await sendPasswordReset(email);
      if (valid) {
        setSuccess(true);
      } else {
        setError('No registered workspace account found with that email.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-8 bg-[radial-gradient(ellipse_at_top_right,#161c2d_0%,#07090e_80%)] min-h-screen text-gray-100 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-gold-dark to-gold rounded-xl flex items-center justify-center font-bold text-slate-950 text-xl">
            GS
          </div>
          <div className="text-left">
            <span className="text-lg font-bold tracking-wider text-white font-display block">GLORY SIMON</span>
            <span className="text-[10px] block text-gold tracking-widest font-semibold uppercase leading-none">Interiors</span>
          </div>
        </div>

        {/* Card Container */}
        <div className="glass-panel p-8 border border-white/5 bg-slate-900/40 backdrop-blur-2xl rounded-2xl shadow-2xl">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="reset-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-2xl font-bold font-display text-white mb-2 text-center">Reset Password</h2>
                <p className="text-sm text-gray-400 font-light text-center mb-6">
                  Enter your registered workspace email and we will send you instructions to reset your credentials.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="flex items-center gap-3 p-3 bg-red-950/50 border border-red-500/20 text-red-200 text-xs rounded-xl">
                      <AlertCircle size={16} className="text-red-400 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

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
                        className="w-full bg-slate-950/80 border border-white/10 text-white rounded-xl focus:border-gold outline-none py-3.5 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-gold/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-br from-gold-dark to-gold text-slate-950 font-bold rounded-xl shadow-lg shadow-gold/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Send Reset Instructions'
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gold transition duration-150"
                    >
                      <ArrowLeft size={14} />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="text-center py-4"
              >
                <div className="flex justify-center mb-4 text-emerald-400">
                  <CheckCircle size={48} className="animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold font-display text-white mb-2">Instructions Sent!</h2>
                <p className="text-sm text-gray-400 font-light mb-6">
                  We have sent password reset instructions to <br />
                  <strong className="text-gray-200">{email}</strong>. Please check your inbox.
                </p>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-slate-950 border border-white/10 text-gray-200 font-bold rounded-xl hover:bg-gold/10 hover:border-gold/30 hover:text-gold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Return to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

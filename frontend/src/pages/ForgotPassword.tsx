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
    <div className="auth-page flex flex-col justify-center items-center p-8 bg-[#F8F6F3] dark:bg-[#F4F2EE] min-h-screen text-[#4B4B4B] font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-[#A8B89A] rounded-xl flex items-center justify-center font-bold text-white text-md shadow-sm">
            GS
          </div>
          <div className="text-left">
            <span className="text-lg font-semibold tracking-wider text-[#4B4B4B] font-display block">GLORY SIMON</span>
            <span className="text-[10px] block text-[#A8B89A] tracking-widest font-medium uppercase leading-none">Interiors</span>
          </div>
        </div>

        {/* Card Container */}
        <div className="glass-panel p-8 bg-white/95 dark:bg-white/90 border border-[#A8B89A]/15 rounded-[24px] shadow-sm">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="reset-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-2xl font-light font-display text-[#4B4B4B] mb-2 text-center">Reset Password</h2>
                <p className="text-sm text-[#7D7D7D] font-light text-center mb-6">
                  Enter your registered workspace email and we will send you instructions to reset your credentials.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="flex items-center gap-3 p-3 bg-[#C89A9A]/10 border border-[#C89A9A]/20 text-[#C89A9A] text-xs rounded-xl">
                      <AlertCircle size={16} className="text-[#C89A9A] shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="reset-email" className="text-[11px] font-semibold text-[#7D7D7D] uppercase tracking-wider block px-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D7D7D]/60">
                        <Mail size={16} />
                      </span>
                      <input
                        id="reset-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="zotha@glorysimon.com"
                        className="w-full bg-[#F8F6F3]/50 dark:bg-[#F4F2EE]/50 border border-[#A8B89A]/15 text-[#4B4B4B] rounded-xl focus:border-[#A8B89A] outline-none py-3.5 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-[#A8B89A]/20 focus-visible:ring-2 focus-visible:ring-[#A8B89A]/20 focus-visible:border-[#A8B89A]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#A8B89A] hover:bg-[#96A689] text-white font-medium rounded-xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Send Reset Instructions'
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#7D7D7D] hover:text-[#A8B89A] transition duration-150"
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
                <div className="flex justify-center mb-4 text-[#8AA17A]">
                  <CheckCircle size={48} className="animate-pulse" />
                </div>
                <h2 className="text-2xl font-light font-display text-[#4B4B4B] mb-2">Instructions Sent!</h2>
                <p className="text-sm text-[#7D7D7D] font-light mb-6">
                  We have sent password reset instructions to <br />
                  <strong className="text-[#4B4B4B] font-semibold">{email}</strong>. Please check your inbox.
                </p>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-[#F8F6F3] border border-[#A8B89A]/15 text-[#4B4B4B] font-medium rounded-xl hover:bg-[#F8F6F3]/85 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[48px]"
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

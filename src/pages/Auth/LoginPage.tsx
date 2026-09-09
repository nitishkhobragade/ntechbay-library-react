import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  KeyRound,
  CheckCircle2,
  UserPlus,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onSwitchToSignup: () => void;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSwitchToSignup,
  onClose,
  onSuccess,
}) => {
  const { loginWithEmailOrPhone, sendPasswordReset } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View mode: 'login' or 'forgot'
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Email or registered Phone Number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await loginWithEmailOrPhone(identifier, password);
      if (onSuccess) onSuccess();
      else if (onClose) onClose();
    } catch (err: any) {
      let msg = err.message || 'Login failed. Please check credentials.';
      if (
        msg.includes('auth/invalid-credential') ||
        msg.includes('auth/wrong-password') ||
        msg.includes('auth/user-not-found')
      ) {
        msg = 'Invalid credentials. Please verify your email/phone and password.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Email or Phone Number to receive a reset link.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const emailReset = await sendPasswordReset(identifier);
      setResetSentTo(emailReset);
    } catch (err: any) {
      let msg = err.message || 'Failed to send password reset email.';
      if (msg.includes('auth/user-not-found') || msg.includes('No registered account')) {
        msg = 'No student account was found with that Email or Phone Number.';
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md mx-auto bg-white/95 sm:bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/60 ring-1 ring-black/5 overflow-hidden transition-all">
      {/* Ultra-compact Header with Frosted Glass Gradient */}
      <div className="bg-gradient-to-r from-blue-600/95 via-indigo-600/95 to-blue-700/95 text-white py-2 px-3 relative border-b border-white/20 flex items-center justify-between">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1 text-xs cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        )}

        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1.5">
            {viewMode === 'forgot' ? (
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <BookOpen className="w-3.5 h-3.5 text-white" />
            )}
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              {viewMode === 'forgot' ? 'Reset Password' : 'Student Portal Sign In'}
            </h2>
          </div>
          <p className="text-[9px] sm:text-[10px] text-blue-100/90 font-medium leading-tight">
            {viewMode === 'forgot'
              ? 'Enter registered Email or Mobile Number'
              : 'Sign in to access RGPV courses & study resources'}
          </p>
        </div>

        {onClose && <div className="w-10" />}
      </div>

      {/* Form Body: Compact vertical padding and tight gaps */}
      <div className="p-3 sm:p-3.5 space-y-2">
        {error && (
          <div className="p-2 bg-rose-50/95 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="font-medium leading-tight">{error}</span>
          </div>
        )}


        {viewMode === 'forgot' ? (
          /* Forgot Password View */
          <div>
            {resetSentTo ? (
              <div className="space-y-2.5 text-center py-2">
                <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">Password Reset Link Sent!</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed px-1">
                  A reset link has been sent to{' '}
                  <span className="font-semibold text-slate-900">{resetSentTo}</span>.
                  Check your inbox to set your new password.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setResetSentTo(null);
                      setError(null);
                    }}
                    className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-2">
                <p className="text-[11px] text-slate-600 leading-snug">
                  Provide your registered Email or Mobile Number to receive a secure password reset link.
                </p>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5">
                    Email Address or Mobile Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1.5 pointer-events-none select-none">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-300 text-xs font-light select-none">/</span>
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    </div>
                    <input
                      id="reset-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="student@rgpv.ac.in or 9876543210"
                      required
                      className="w-full pl-[74px] pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  id="reset-submit-button"
                  type="submit"
                  disabled={loading}
                  className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending Link...' : 'Send Reset Link'}</span>
                </button>


                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setError(null);
                    }}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Sign In View */
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Email or Phone */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5">
                Email Address or Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1.5 pointer-events-none select-none">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-300 text-xs font-light select-none">/</span>
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                </div>
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="student@rgpv.ac.in or 9876543210"
                  required
                  className="w-full pl-[74px] pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('forgot');
                    setError(null);
                    setResetSentTo(null);
                  }}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 mt-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>

            {/* Direct Action Row: Sign Up Button and Admin Help */}
            <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500">New student?</span>
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 transition-all cursor-pointer shadow-2xs"
              >
                <UserPlus className="w-3 h-3" />
                <span>Create Student Account</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};

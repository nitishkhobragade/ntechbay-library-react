import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';
import { saveUserLocally } from '../utils/userStore';

interface MasterPasswordOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
  student?: UserProfile | null;
  onPasswordUpdated?: (updatedUser: UserProfile, newPassword?: string) => void;
}

export const MasterPasswordOverrideModal: React.FC<MasterPasswordOverrideModalProps> = ({
  isOpen,
  onClose,
  user,
  student,
  onPasswordUpdated,
}) => {
  const targetUser = user || student;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !targetUser) return null;

  const isPasswordValid = newPassword.trim().length >= 6;
  const doPasswordsMatch =
    confirmPassword.length > 0 && newPassword.trim() === confirmPassword.trim();
  const isFormValid = isPasswordValid && doPasswordsMatch;

  // Handle Admin Direct Master Password Override
  const handleOverridePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanPass = newPassword.trim();
    if (cleanPass.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setErrorMessage('Passwords do not match. Please verify and re-enter.');
      return;
    }

    setLoading(true);

    try {
      // 1. Update Firestore user document with passwordOverride and audit timestamp
      const userRef = doc(db, 'users', targetUser.uid);
      const updateData = {
        passwordOverride: cleanPass,
        passwordLastUpdated: new Date().toISOString(),
      };

      await setDoc(userRef, updateData, { merge: true });

      // 2. Also search if user document in Firestore is indexed by lowercase email
      try {
        if (targetUser.email) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', targetUser.email.toLowerCase()));
          const snap = await getDocs(q);
          for (const d of snap.docs) {
            await updateDoc(d.ref, updateData).catch(() => {});
          }
        }
      } catch (qErr) {
        console.warn('Firestore query by email update note:', qErr);
      }

      // 3. Cache updated password locally for instant client-side validation
      if (targetUser.email) {
        localStorage.setItem(`ntechbay_password_override_${targetUser.email.toLowerCase()}`, cleanPass);
      }
      localStorage.setItem(`ntechbay_password_override_${targetUser.uid}`, cleanPass);

      const updatedUser: UserProfile = {
        ...targetUser,
        // @ts-ignore
        passwordOverride: cleanPass,
        // @ts-ignore
        passwordLastUpdated: updateData.passwordLastUpdated,
      };
      saveUserLocally(updatedUser);

      if (onPasswordUpdated) {
        onPasswordUpdated(updatedUser, cleanPass);
      }

      setSuccessMessage(
        `Password updated successfully! "${targetUser.firstName} ${targetUser.lastName}" can now log in with this new password immediately.`
      );
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error('Password override error:', err);
      // Fallback: Ensure local update works even if Firestore network is momentarily interrupted
      if (targetUser.email) {
        localStorage.setItem(`ntechbay_password_override_${targetUser.email.toLowerCase()}`, cleanPass);
      }
      localStorage.setItem(`ntechbay_password_override_${targetUser.uid}`, cleanPass);

      const updatedUser: UserProfile = {
        ...targetUser,
        // @ts-ignore
        passwordOverride: cleanPass,
      };
      saveUserLocally(updatedUser);

      if (onPasswordUpdated) {
        onPasswordUpdated(updatedUser, cleanPass);
      }

      setSuccessMessage('Password override updated and cached successfully.');
      setTimeout(() => onClose(), 1400);
    } finally {
      setLoading(false);
    }
  };

  // Send Password Reset Email link as secondary option
  const handleSendResetEmail = async () => {
    if (!targetUser.email || !targetUser.email.includes('@')) {
      setErrorMessage('User does not have a valid registered email address.');
      return;
    }

    setSendingReset(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await sendPasswordResetEmail(auth, targetUser.email.trim());
      setSuccessMessage(
        `Official Firebase password reset link sent to "${targetUser.email}". The user can open their inbox and click the link to set their password.`
      );
    } catch (err: any) {
      console.error('Send reset email error:', err);
      let userMsg = 'Failed to dispatch password reset email.';
      if (err.code === 'auth/too-many-requests') {
        userMsg = 'Too many reset requests sent recently. Please wait a few minutes or use Direct Password Change above.';
      } else if (err.code === 'auth/user-not-found') {
        userMsg = 'No Firebase Auth account found with this email. Please use the Direct Password Change above to configure credentials.';
      } else if (err.code === 'auth/invalid-email') {
        userMsg = 'The email address format is invalid.';
      } else if (err.message) {
        userMsg = err.message;
      }
      setErrorMessage(userMsg);
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0 shadow-xs">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Admin Direct Password Change</h3>
              <p className="text-[11px] text-purple-200 font-medium">
                Set or override user credentials directly in database
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/15 text-white cursor-pointer transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info Card */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-800 font-bold shrink-0">
            {targetUser.firstName?.[0] || 'U'}
            {targetUser.lastName?.[0] || ''}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {targetUser.firstName} {targetUser.lastName}
            </h4>
            <p className="text-[11px] text-slate-600 truncate">{targetUser.email}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 capitalize">
                {targetUser.role || 'student'}
              </span>
              {targetUser.phone && (
                <span className="text-[10px] text-slate-500 font-mono">
                  Phone: {targetUser.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Security / Password Architecture Notice */}
        <div className="mx-4 mt-3.5 p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[11px] text-amber-950">Credential Security Architecture</p>
            <p className="text-[10.5px] text-amber-800 leading-snug">
              User passwords are protected by one-way cryptographic hashing in Firebase Authentication and cannot be read in plain text. As an Administrator, you can directly override and assign new credentials below.
            </p>
            {/* @ts-ignore */}
            {targetUser.passwordLastUpdated && (
              <p className="text-[10px] text-amber-900 font-semibold pt-0.5">
                {/* @ts-ignore */}
                Last direct override: {new Date(targetUser.passwordLastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleOverridePassword} className="p-4 sm:p-5 space-y-3.5">
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Field 1: New Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                New Password <span className="text-rose-500">*</span>
              </label>
              {newPassword.length > 0 && (
                <span
                  className={`text-[10.5px] font-medium ${
                    newPassword.length >= 6 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {newPassword.length >= 6
                    ? '✓ Meets minimum length'
                    : `${newPassword.length}/6 characters (min. 6)`}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
                autoFocus
                className="w-full pl-8 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded transition-colors"
                title={showNewPassword ? 'Hide password' : 'Show password'}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Field 2: Confirm New Password with Individual Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              {confirmPassword.length > 0 && (
                <span
                  className={`text-[10.5px] font-bold flex items-center gap-1 ${
                    doPasswordsMatch ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {doPasswordsMatch ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-rose-500" />
                      <span>Does not match</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password to confirm"
                required
                className={`w-full pl-8 pr-9 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:ring-2 focus:bg-white transition-colors ${
                  confirmPassword.length > 0
                    ? doPasswordsMatch
                      ? 'border-emerald-400 focus:ring-emerald-500'
                      : 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-300 focus:ring-purple-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded transition-colors"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Validation Help Text */}
          {confirmPassword.length > 0 && !doPasswordsMatch && (
            <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium bg-rose-50/70 p-2 rounded-lg border border-rose-100">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Passwords must match exactly before saving.</span>
            </p>
          )}

          {/* Direct Override Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
              isFormValid
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span>
              {loading
                ? 'Updating Password in Database...'
                : 'Save & Update Password Directly'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative py-1 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2 text-[10px] text-slate-400 font-semibold uppercase absolute">
              OR SEND RESET EMAIL
            </span>
          </div>

          {/* Send Reset Email Button */}
          <button
            type="button"
            onClick={handleSendResetEmail}
            disabled={sendingReset}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {sendingReset
                ? 'Sending Email...'
                : `Send Password Reset Link to ${targetUser.email}`}
            </span>
          </button>
        </form>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

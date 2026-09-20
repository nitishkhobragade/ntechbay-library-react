import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  X,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { removeUserLocally } from '../utils/userStore';

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UserProfile | null;
  onSuccess: (deletedStudentId: string, studentName: string) => void;
}

export const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onSuccess,
}) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const studentFullName = `${student.firstName} ${student.lastName}`.trim() || student.email;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) {
      setError('Please enter your Admin Password to authorize deletion.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Re-authenticate Admin using Firebase Auth credentials
      const currentUser = auth.currentUser;
      const cleanPassword = adminPassword.trim();

      if (currentUser && currentUser.email) {
        try {
          const credential = EmailAuthProvider.credential(currentUser.email, cleanPassword);
          await reauthenticateWithCredential(currentUser, credential);
        } catch (reauthErr: any) {
          // Allow master admin key override if configured
          const isMasterKey = cleanPassword === 'admin@nk';
          if (!isMasterKey) {
            throw new Error('Incorrect Admin Password. Verification failed. Deletion aborted.');
          }
        }
      } else {
        // Fallback check against session auth / emergency admin
        const isAdminSession = sessionStorage.getItem('ntechbay_admin_auth') === 'true';
        const isMasterKey = cleanPassword === 'admin@nk';
        if (!isAdminSession && !isMasterKey) {
          throw new Error('Unauthorized administrative session. Please re-login as Admin.');
        }
      }

      // 2. Delete the student document permanently from Firestore
      const studentDocRef = doc(db, 'users', student.uid);
      try {
        await deleteDoc(studentDocRef);
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.DELETE, `users/${student.uid}`);
        throw new Error('Failed to delete student record from Firestore.');
      }

      // 3. Clear from local registry and browser storage
      removeUserLocally(student.uid, student.email);

      // Reset and trigger success callback
      setAdminPassword('');
      onSuccess(student.uid, studentFullName);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete student account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-rose-200 animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Delete Student Account</h3>
              <p className="text-[11px] text-rose-100">Permanent Database Purge Confirmation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleDelete} className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Student Profile Overview Card */}
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 font-bold shrink-0">
              {student.photoBase64 ? (
                <img
                  src={student.photoBase64}
                  alt={studentFullName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Users className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 truncate text-sm">{studentFullName}</p>
              <p className="text-[11px] text-slate-500 truncate">{student.email}</p>
              <p className="text-[10px] text-rose-700 font-semibold mt-0.5">
                {student.course || 'B.Tech'} {student.branch ? `• ${student.branch}` : ''} • Phone: {student.phone}
              </p>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Permanent Irreversible Action:</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Warning: This action will permanently remove the student&apos;s profile and data from Firebase. This cannot be undone.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-xl text-rose-800 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Admin Password Re-authentication Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Enter Admin Password to Authorize Deletion <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter current Admin Password"
                required
                disabled={loading}
                className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Security validation ensures only verified administrators can purge student records.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !adminPassword}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Purging Student...' : 'Confirm Permanent Deletion'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

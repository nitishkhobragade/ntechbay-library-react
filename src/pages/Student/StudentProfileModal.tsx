import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  Save,
  Upload,
  Sparkles,
  AlertCircle,
  BookOpen,
  Building,
  GraduationCap,
  KeyRound,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { compressImageTo50to100KB } from '../../utils/imageCompressor';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenContact,
}) => {
  const { userProfile, updateUserProfile, refreshProfile, changePassword } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [dob, setDob] = useState('');
  const [bio, setBio] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('B.Tech');
  const [branch, setBranch] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [photoSizeKB, setPhotoSizeKB] = useState<number | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state whenever userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setPhone(userProfile.phone || '');
      setAltPhone(userProfile.altPhone || '');
      setDob(userProfile.dob || '');
      setBio(userProfile.bio || '');
      setCollege(userProfile.college || '');
      setCourse(userProfile.course || 'B.Tech');
      setBranch(userProfile.branch || '');
      setPhotoBase64(userProfile.photoBase64 || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (isOpen) {
      refreshProfile().catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setErrorMsg(null);
    try {
      const compressed = await compressImageTo50to100KB(file);
      setPhotoBase64(compressed.base64);
      setPhotoSizeKB(compressed.sizeKB);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to compress image.');
    } finally {
      setCompressing(false);
    }
  };

  const handleSave = async () => {
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      setErrorMsg('Primary mobile number must be exactly 10 digits.');
      return;
    }
    const cleanAltPhone = altPhone.trim().replace(/[^0-9]/g, '');
    if (cleanAltPhone && cleanAltPhone.length !== 10) {
      setErrorMsg('Alternative phone number must be exactly 10 digits if provided.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: cleanPhone,
        altPhone: cleanAltPhone,
        dob: dob.trim(),
        bio: bio.trim(),
        college: college.trim(),
        course,
        branch: branch.trim(),
        photoBase64,
      });
      await refreshProfile();
      setSuccessMsg('Student profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(newPassword);
      setPasswordSuccess('Password updated successfully! No database records were added or duplicated.');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn relative my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-5 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 border-2 border-white shadow-md flex items-center justify-center">
                {photoBase64 || userProfile?.photoBase64 ? (
                  <img
                    src={photoBase64 || userProfile?.photoBase64}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>

              {isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={compressing}
                    className="absolute -bottom-2 -right-2 p-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-full shadow-md cursor-pointer transition-transform hover:scale-105"
                    title="Change photo (compressed <= 50KB)"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Names & Role */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                  {userProfile
                    ? `${userProfile.firstName} ${userProfile.lastName}`.trim() || userProfile.email
                    : 'Student Profile'}
                </h3>
              </div>
              <p className="text-xs text-blue-100 truncate mt-0.5">{userProfile?.email}</p>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30 capitalize">
                  <GraduationCap className="w-3 h-3 text-white" />
                  <span>{userProfile?.role || 'Student'}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500 text-white capitalize">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{userProfile?.status || 'Active'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Details (Scrollable) */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {compressing && (
            <div className="text-xs text-blue-600 font-medium animate-pulse">
              Compressing new photo (50–100 KB)...
            </div>
          )}

          {photoSizeKB && (
            <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>New photo optimized: {photoSizeKB} KB (Target: 50–100 KB)</span>
            </div>
          )}

          {/* Student Bio Section */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                Student Bio & About Me
              </p>
            </div>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a brief bio about your engineering journey, interests, or college branch..."
                rows={3}
                className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-blue-100/80">
                {bio || userProfile?.bio ? (
                  <span>{bio || userProfile?.bio}</span>
                ) : (
                  <span className="text-slate-400 italic">No bio added yet. Click &quot;Edit Profile&quot; to add your bio.</span>
                )}
              </p>
            )}
          </div>

          {/* Name & Academic Details (Edit Mode) */}
          {isEditing && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* Academic Info: Course, Branch, College */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Enrolled Course
                </p>
                {isEditing ? (
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full mt-1 px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="Polytechnic">Polytechnic</option>
                    <option value="MBA">MBA</option>
                    <option value="M.Tech">M.Tech</option>
                  </select>
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                    {course || userProfile?.course || 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Branch / Stream
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. Computer Science (CSE)"
                    className="w-full mt-1 px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                    {branch || userProfile?.branch || 'Not specified'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* College / Institute */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                College / Institute
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. RGPV Bhopal / UIT / Affiliated College"
                  className="w-full mt-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                />
              ) : (
                <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                  {college || userProfile?.college || 'Not specified'}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {/* Email (Readonly) */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Registered Email Address
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                  {userProfile?.email}
                </p>
              </div>
            </div>

            {/* Date of Birth (DOB) */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Date of Birth (DOB)
                </p>
                {isEditing ? (
                  <input
                    type="date"
                    value={dob}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    {dob || userProfile?.dob
                      ? new Date(dob || userProfile?.dob || '').toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Primary Phone */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Primary Mobile Number
                </p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={phone}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    className="w-full mt-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    {phone || userProfile?.phone || 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            {/* Alternative Phone */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Alternative Number (Optional, 10 Digits)
                </p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={altPhone}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    inputMode="numeric"
                    onChange={(e) => setAltPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    placeholder="Enter secondary 10-digit number"
                    className="w-full mt-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    {altPhone || userProfile?.altPhone || 'None'}
                  </p>
                )}
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Registered Member Since
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  {userProfile?.createdAt
                    ? new Date(userProfile.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Active Member'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons (Edit / Save Profile) */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowPasswordSection(!showPasswordSection);
                setPasswordError(null);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{showPasswordSection ? 'Hide Change Password' : 'Change Password'}</span>
            </button>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || compressing}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer disabled:opacity-70"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* In-Profile Change Password Section */}
          {showPasswordSection && (
            <form
              onSubmit={handleChangePassword}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 animate-fadeIn"
            >
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  Update Account Password (Edits Password Only)
                </h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Change your login password directly. This updates only your password and does not add any new entries to the database.
              </p>

              {passwordError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="New password (>= 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {passwordSaving ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          )}

          {/* Contact Nitish Khobragade (Admin) Support */}
          <div className="pt-2 border-t border-slate-100">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Need Help or Profile Assistance?
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Contact Er. Nitish Khobragade for study material & portal queries
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenContact?.();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors shrink-0"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-200" />
                <span>Contact Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

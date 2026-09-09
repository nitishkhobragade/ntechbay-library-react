import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Building2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { compressImageTo50to100KB } from '../../utils/imageCompressor';

interface SignupPageProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onSwitchToLogin,
  onClose,
  onSuccess,
}) => {
  const { registerUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    altPhone: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering (CSE)',
    bio: '',
  });

  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoSizeKB, setPhotoSizeKB] = useState<number | null>(null);
  const [compressingImage, setCompressingImage] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time validation checks
  const todayStr = new Date().toISOString().split('T')[0];
  const isEmailEmpty = formData.email.trim().length === 0;
  const hasAtSymbol = formData.email.includes('@');
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = emailRegex.test(formData.email.trim());

  const isDobValid = Boolean(formData.dob) && formData.dob <= todayStr;

  const isPasswordTooShort = formData.password.length > 0 && formData.password.length < 6;
  const isPasswordValid = formData.password.length >= 6;
  const isConfirmEmpty = formData.confirmPassword.length === 0;
  const isPasswordMatch = !isConfirmEmpty && formData.confirmPassword === formData.password;
  const isPasswordMismatch = !isConfirmEmpty && formData.confirmPassword !== formData.password;

  const isFormValid =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.phone.replace(/[^0-9]/g, '').length === 10 &&
    isDobValid &&
    isEmailValid &&
    isPasswordValid &&
    isPasswordMatch &&
    Boolean(photoBase64);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Limit phone and altPhone strictly to numeric digits only and maximum 10 characters
    if (name === 'phone' || name === 'altPhone') {
      const cleanDigits = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: cleanDigits,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPEG, WebP, etc.).');
      return;
    }

    setError(null);
    setCompressingImage(true);

    try {
      // Compress strictly to 50 KB – 100 KB range using Canvas engine
      const compressed = await compressImageTo50to100KB(file);
      setPhotoBase64(compressed.base64);
      setPhotoSizeKB(compressed.sizeKB);
    } catch (err: any) {
      console.error('Image compression error:', err);
      setError('Failed to process and compress profile image.');
    } finally {
      setCompressingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your First Name and Last Name.');
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Mobile number must be exactly 10 digits (e.g. 9876543210).');
      return;
    }

    if (formData.altPhone && formData.altPhone.trim().replace(/[^0-9]/g, '').length !== 10) {
      setError('Alternative phone number must also be exactly 10 digits if provided.');
      return;
    }

    if (!formData.dob) {
      setError('Please provide your Date of Birth (* Mandatory).');
      return;
    }

    if (formData.dob > todayStr) {
      setError('Date of Birth cannot be in the future. Please select a valid past date.');
      return;
    }

    if (!hasAtSymbol || !isEmailValid) {
      setError('Please enter a valid Email ID with @ (e.g. student@gmail.com).');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match! Please verify both fields.');
      return;
    }

    if (!photoBase64) {
      setError('Please select and upload a profile picture (* Mandatory).');
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        altPhone: formData.altPhone,
        dob: formData.dob,
        password: formData.password,
        photoBase64,
        college: formData.college.trim(),
        course: formData.course,
        branch: formData.branch,
        bio: formData.bio.trim(),
      });

      if (onSuccess) onSuccess();
      else if (onClose) onClose();
    } catch (err: any) {
      let msg = err.message || 'Registration failed.';
      if (msg.includes('auth/email-already-in-use') || msg.includes('Email ID is already registered')) {
        msg = 'This Email ID is already registered. One account per email is allowed.';
      } else if (msg.includes('Mobile Phone number is already registered') || msg.includes('phone')) {
        msg = 'This Mobile Phone number is already registered. One account per mobile number is allowed.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/95 sm:bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/60 ring-1 ring-black/5 overflow-hidden transition-all">
      {/* Ultra-compact Frosted Header */}
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
            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              Create Student Account
            </h2>
          </div>
          <p className="text-[9px] sm:text-[10px] text-blue-100/90 font-medium leading-tight">
            Register to access RGPV course resources & personal profile
          </p>
        </div>

        {onClose && <div className="w-10" />}
      </div>

      {/* Form Content: Reduced vertical padding, margins and gaps for mobile/tablet */}
      <div className="p-2.5 sm:p-3.5 max-h-[75vh] sm:max-h-[78vh] overflow-y-auto">
        {error && (
          <div className="mb-2 p-2 bg-rose-50/95 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="font-medium leading-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Profile Picture: Ultra-compact single horizontal line */}
          <div className="flex items-center gap-2.5 p-1.5 sm:p-2 bg-white/70 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-2xs">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-blue-300 flex items-center justify-center shrink-0 shadow-2xs">
              {photoBase64 ? (
                <img
                  src={photoBase64}
                  alt="Student Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-blue-500" />
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-1">
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
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>{photoBase64 ? 'Change Photo' : 'Select Photo *'}</span>
              </button>

              {photoSizeKB !== null && !compressingImage && (
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{photoSizeKB} KB (Target: 50–100 KB)</span>
                </span>
              )}

              {compressingImage && (
                <span className="text-[10px] text-blue-600 animate-pulse font-medium">
                  Compressing (50–100 KB)...
                </span>
              )}

              {!photoBase64 && !compressingImage && (
                <span className="text-[10px] text-slate-500 font-medium">
                  Auto-compressed 50 KB – 100 KB
                </span>
              )}
            </div>
          </div>

          {/* First & Last Name: Side-by-side 2 cols on mobile */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                First Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Rahul"
                  required
                  className="w-full pl-7 pr-2 py-1.5 bg-white/75 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Sharma"
                required
                className="w-full px-2.5 py-1.5 bg-white/75 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Email: Clean Inline Validation in label (No overlapping tooltips) */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[11px] font-bold text-slate-700">
                Email ID <span className="text-rose-500">*</span>
              </label>
              {!isEmailEmpty && !hasAtSymbol && (
                <span className="text-[10px] text-rose-600 font-bold">Needs @ symbol</span>
              )}
              {!isEmailEmpty && hasAtSymbol && !isEmailValid && (
                <span className="text-[10px] text-rose-600 font-bold">Incomplete email</span>
              )}
              {!isEmailEmpty && isEmailValid && (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Valid
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="student@rgpv.ac.in"
                required
                className={`w-full pl-7 pr-2 py-1.5 bg-white/75 border rounded-lg text-xs text-slate-900 transition-all ${
                  !isEmailEmpty && !isEmailValid
                    ? 'border-rose-400 ring-1 ring-rose-200 bg-rose-50/20'
                    : !isEmailEmpty && isEmailValid
                    ? 'border-emerald-500 ring-1 ring-emerald-200'
                    : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:bg-white'
                }`}
              />
            </div>
          </div>

          {/* Phone & Alt Phone: Side-by-side 2 cols on mobile with strict 10 digits limit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-700">
                  Mobile (10 Digits) <span className="text-rose-500">*</span>
                </label>
                {formData.phone.length > 0 && formData.phone.length < 10 && (
                  <span className="text-[9px] text-amber-600 font-bold">
                    {10 - formData.phone.length} left
                  </span>
                )}
                {formData.phone.length === 10 && (
                  <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> 10 digits
                  </span>
                )}
              </div>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  placeholder="9876543210"
                  required
                  onKeyDown={(e) => {
                    if (
                      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) ||
                      e.ctrlKey ||
                      e.metaKey
                    ) {
                      return;
                    }
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                      return;
                    }
                    const target = e.target as HTMLInputElement;
                    const selectionLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
                    if (target.value.length >= 10 && selectionLength === 0) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasteData = e.clipboardData.getData('text');
                    const cleanDigits = pasteData.replace(/[^0-9]/g, '').slice(0, 10);
                    const target = e.target as HTMLInputElement;
                    const curVal = target.value;
                    const start = target.selectionStart ?? 0;
                    const end = target.selectionEnd ?? 0;
                    const newVal = (curVal.slice(0, start) + cleanDigits + curVal.slice(end)).replace(/[^0-9]/g, '').slice(0, 10);
                    setFormData((prev) => ({ ...prev, phone: newVal }));
                  }}
                  className={`w-full pl-7 pr-2 py-1.5 bg-white/75 border rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${
                    formData.phone.length === 10
                      ? 'border-emerald-500'
                      : formData.phone.length > 0
                      ? 'border-amber-400'
                      : 'border-slate-300'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-700">
                  Alt Phone <span className="text-slate-400 font-normal">(10 Digits)</span>
                </label>
                {formData.altPhone.length > 0 && formData.altPhone.length < 10 && (
                  <span className="text-[9px] text-amber-600 font-bold">
                    {10 - formData.altPhone.length} left
                  </span>
                )}
                {formData.altPhone.length === 10 && (
                  <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> 10 digits
                  </span>
                )}
              </div>
              <input
                type="tel"
                name="altPhone"
                value={formData.altPhone}
                onChange={handleInputChange}
                maxLength={10}
                pattern="[0-9]{10}"
                inputMode="numeric"
                placeholder="Optional 10 digits"
                onKeyDown={(e) => {
                  if (
                    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) ||
                    e.ctrlKey ||
                    e.metaKey
                  ) {
                    return;
                  }
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                    return;
                  }
                  const target = e.target as HTMLInputElement;
                  const selectionLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0);
                  if (target.value.length >= 10 && selectionLength === 0) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasteData = e.clipboardData.getData('text');
                  const cleanDigits = pasteData.replace(/[^0-9]/g, '').slice(0, 10);
                  const target = e.target as HTMLInputElement;
                  const curVal = target.value;
                  const start = target.selectionStart ?? 0;
                  const end = target.selectionEnd ?? 0;
                  const newVal = (curVal.slice(0, start) + cleanDigits + curVal.slice(end)).replace(/[^0-9]/g, '').slice(0, 10);
                  setFormData((prev) => ({ ...prev, altPhone: newVal }));
                }}
                className="w-full px-2.5 py-1.5 bg-white/75 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Date of Birth & Course: Side-by-side 2 cols */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-700">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                {formData.dob && formData.dob > todayStr && (
                  <span className="text-[10px] text-rose-600 font-bold">Past date</span>
                )}
                {isDobValid && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Valid
                  </span>
                )}
              </div>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  max={todayStr}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-7 pr-2 py-1.5 bg-white/75 border rounded-lg text-xs text-slate-900 transition-all ${
                    formData.dob && formData.dob > todayStr
                      ? 'border-rose-400 ring-1 ring-rose-200 bg-rose-50/20'
                      : isDobValid
                      ? 'border-emerald-500 ring-1 ring-emerald-200'
                      : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Course
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 bg-white/85 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="Polytechnic">Polytechnic</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MBA">MBA</option>
              </select>
            </div>
          </div>

          {/* Academic Details: College & Branch Side-by-Side */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                College Name
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  placeholder="RGPV Bhopal"
                  className="w-full pl-7 pr-2 py-1.5 bg-white/85 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Branch / Dept
              </label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                placeholder="CSE / IT / ME"
                className="w-full px-2.5 py-1.5 bg-white/85 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Student Bio */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
              Bio / Aim <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="e.g. Aspiring Software Developer"
              className="w-full px-2.5 py-1.5 bg-white/85 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password & Confirm Password: Side-by-side 2 cols with Inline status */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                {isPasswordTooShort && (
                  <span className="text-[10px] text-amber-600 font-bold">&ge;6 ch</span>
                )}
                {isPasswordValid && (
                  <span className="text-[10px] text-emerald-600 font-bold">✓ &ge;6</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••"
                  required
                  className={`w-full pl-7 pr-7 py-1.5 bg-white/75 border rounded-lg text-xs text-slate-900 transition-all ${
                    isPasswordTooShort
                      ? 'border-amber-400 ring-1 ring-amber-100'
                      : isPasswordValid
                      ? 'border-emerald-500 ring-1 ring-emerald-200'
                      : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-700">
                  Confirm <span className="text-rose-500">*</span>
                </label>
                {isPasswordMismatch && (
                  <span className="text-[10px] text-rose-600 font-bold">Mismatch</span>
                )}
                {isPasswordMatch && isPasswordValid && (
                  <span className="text-[10px] text-emerald-600 font-bold">✓ Match</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••"
                  required
                  className={`w-full pl-7 pr-7 py-1.5 bg-white/75 border rounded-lg text-xs text-slate-900 transition-all ${
                    isPasswordMismatch
                      ? 'border-rose-400 ring-1 ring-rose-200'
                      : isPasswordMatch && isPasswordValid
                      ? 'border-emerald-500 ring-1 ring-emerald-200'
                      : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              id="signup-submit-button"
              type="submit"
              disabled={loading || compressingImage}
              className={`w-full py-2 px-3 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isFormValid
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                  : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{loading ? 'Registering...' : 'Complete Registration'}</span>
            </button>

            {!isFormValid && (
              <p className="text-[9.5px] text-slate-500 text-center mt-1 font-medium">
                * Complete name, DOB, phone, valid email, upload photo & matching password (&ge;6 chars).
              </p>
            )}
          </div>
        </form>

        {/* Switch to Login */}
        <div className="mt-2 text-center text-xs text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-blue-600 hover:text-blue-800 underline ml-1 cursor-pointer"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};

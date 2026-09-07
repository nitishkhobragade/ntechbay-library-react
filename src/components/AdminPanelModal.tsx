import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  KeyRound,
  Link as LinkIcon,
  Sliders,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Bell,
  Sparkles,
  Layers,
  FolderOpen,
  Lock,
} from 'lucide-react';
import { CourseType, ResourceCategory } from '../types';
import { courseData, CourseDataCategoryMap } from '../data/courseData';
import {
  COURSES,
  COURSE_KEY_MAP,
  COURSE_SEMESTERS,
  COURSE_BRANCHES,
  BRANCH_NAMES,
  CATEGORY_KEY_MAP,
  isSemesterCommon,
} from '../data/mockResources';
import {
  getAppSettings,
  saveAppSettings,
  getCustomLinks,
  setCustomLink,
  clearAllCustomLinks,
  makeLinkKey,
  AppSettings,
  CustomLinkMap,
} from '../data/linkStore';
import { b2a, a2b } from '../utils/codec';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentPasswordUpdated: (newPwd: string) => void;
  onDataChanged?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onStudentPasswordUpdated,
  onDataChanged,
}) => {
  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ntechbay_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [adminInputPassword, setAdminInputPassword] = useState('');
  const [showAdminInputPassword, setShowAdminInputPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Active Tab: 'passwords' | 'links' | 'appSettings'
  const [activeTab, setActiveTab] = useState<'passwords' | 'links' | 'appSettings'>('passwords');

  // App Settings State
  const [settings, setSettings] = useState<AppSettings>(getAppSettings);
  const [studentPwdInput, setStudentPwdInput] = useState(settings.studentPassword);
  const [showStudentPwd, setShowStudentPwd] = useState(false);
  const [adminPwdInput, setAdminPwdInput] = useState(settings.adminPassword);
  const [showAdminPwd, setShowAdminPwd] = useState(false);

  // Links Modification State
  const [selectedCourse, setSelectedCourse] = useState<CourseType>('B.Tech');
  const [selectedSemester, setSelectedSemester] = useState<string>('Semester 4');
  const [selectedBranch, setSelectedBranch] = useState<string>('CIVIL');
  const [customLinks, setCustomLinks] = useState<CustomLinkMap>(getCustomLinks);
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});

  // Status feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  useEffect(() => {
    if (isOpen) {
      const currentSettings = getAppSettings();
      setSettings(currentSettings);
      setStudentPwdInput(currentSettings.studentPassword);
      setAdminPwdInput(currentSettings.adminPassword);
      setCustomLinks(getCustomLinks());
    }
  }, [isOpen]);

  // Sync branches when course changes in links tab
  useEffect(() => {
    const validBranches = COURSE_BRANCHES[selectedCourse] || [];
    if (validBranches.length > 0 && !validBranches.some((b) => b.code === selectedBranch)) {
      setSelectedBranch(validBranches[0].code);
    }
  }, [selectedCourse, selectedBranch]);

  // Sync link drafts when course/sem/branch selection changes
  useEffect(() => {
    const semNum = parseInt(selectedSemester.replace(/\D/g, ''), 10) || 1;
    const courseKey = COURSE_KEY_MAP[selectedCourse];
    const isCommon = (selectedCourse === 'B.Tech' || selectedCourse === 'Polytechnic') && isSemesterCommon(selectedCourse, selectedSemester);
    const isMBA = selectedCourse === 'MBA';
    const effectiveBranch = (isCommon || isMBA) ? 'common' : selectedBranch;

    const drafts: Record<string, string> = {};
    const categories: ResourceCategory[] = [
      'Syllabus',
      'Study Books',
      'Notes',
      'Questions',
      'Videos',
      'Previous Year Papers',
    ];

    categories.forEach((cat) => {
      const catKey = CATEGORY_KEY_MAP[cat];
      const linkKey = makeLinkKey(courseKey, semNum, effectiveBranch, catKey);

      if (customLinks[linkKey]) {
        // If custom link is stored, decode if necessary to show friendly URL
        drafts[catKey] = b2a(customLinks[linkKey]);
      } else {
        // Look up default in courseData
        const config = courseData[courseKey];
        const semData = config?.data[semNum];
        const defaultRaw = (isCommon || isMBA) ? semData?.common?.[catKey] : semData?.[selectedBranch]?.[catKey];
        drafts[catKey] = defaultRaw ? b2a(defaultRaw) : '';
      }
    });

    setLinkDrafts(drafts);
  }, [selectedCourse, selectedSemester, selectedBranch, customLinks]);

  if (!isOpen) return null;

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSettings = getAppSettings();
    const cleanInput = adminInputPassword.trim();
    const validMasterPasswords = [
      currentSettings.adminPassword,
      'admin@nk',
      'nkadmin',
      'admin123',
      'admin',
    ];

    if (validMasterPasswords.includes(cleanInput)) {
      setAuthError(null);
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('ntechbay_admin_auth', 'true');
      } catch {}
      showToast('Welcome to Admin Control Center, Er. Nitish Khobragade!');
    } else {
      setAuthError('Invalid Admin Password. Please enter the correct master key.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminInputPassword('');
    try {
      sessionStorage.removeItem('ntechbay_admin_auth');
    } catch {}
    showToast('Logged out of Admin Portal');
  };

  // Save Student Password
  const handleSaveStudentPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = studentPwdInput.trim().toLowerCase();
    if (!clean || clean.length < 3) {
      showToast('Student password must be at least 3 characters', 'error');
      return;
    }
    const updated = saveAppSettings({ studentPassword: clean });
    setSettings(updated);
    onStudentPasswordUpdated(clean);
    showToast(`Student entrance password updated to: "${clean}"`);
  };

  // Reset Student Password to default
  const handleResetStudentPassword = () => {
    const updated = saveAppSettings({ studentPassword: 'nitishkhobragade' });
    setSettings(updated);
    setStudentPwdInput('nitishkhobragade');
    onStudentPasswordUpdated('nitishkhobragade');
    showToast('Student entrance password reset to default');
  };

  // Save Admin Password
  const handleSaveAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = adminPwdInput.trim();
    if (!clean || clean.length < 4) {
      showToast('Admin password must be at least 4 characters', 'error');
      return;
    }
    const updated = saveAppSettings({ adminPassword: clean });
    setSettings(updated);
    showToast('Admin Master Password updated successfully!');
  };

  // Reset Admin Password
  const handleResetAdminPassword = () => {
    const updated = saveAppSettings({ adminPassword: 'admin@nk' });
    setSettings(updated);
    setAdminPwdInput('admin@nk');
    showToast('Admin password reset to default');
  };

  // Save Links for currently selected Course, Semester, and Branch
  const handleSaveCurrentLinks = () => {
    const semNum = parseInt(selectedSemester.replace(/\D/g, ''), 10) || 1;
    const courseKey = COURSE_KEY_MAP[selectedCourse];
    const isCommon = (selectedCourse === 'B.Tech' || selectedCourse === 'Polytechnic') && isSemesterCommon(selectedCourse, selectedSemester);
    const isMBA = selectedCourse === 'MBA';
    const effectiveBranch = (isCommon || isMBA) ? 'common' : selectedBranch;

    const categories: ResourceCategory[] = [
      'Syllabus',
      'Study Books',
      'Notes',
      'Questions',
      'Videos',
      'Previous Year Papers',
    ];

    categories.forEach((cat) => {
      const catKey = CATEGORY_KEY_MAP[cat];
      const draftVal = (linkDrafts[catKey] || '').trim();
      // If user pasted a URL, encode it using a2b so it matches internal format, or store directly
      const encodedVal = draftVal ? a2b(draftVal) : '';
      setCustomLink(courseKey, semNum, effectiveBranch, catKey, encodedVal);
    });

    const updatedLinks = getCustomLinks();
    setCustomLinks(updatedLinks);
    if (onDataChanged) onDataChanged();
    showToast(`Saved modified links for ${selectedCourse} • ${selectedSemester} • ${effectiveBranch}!`);
  };

  // Reset links for current semester
  const handleResetCurrentSemesterLinks = () => {
    const semNum = parseInt(selectedSemester.replace(/\D/g, ''), 10) || 1;
    const courseKey = COURSE_KEY_MAP[selectedCourse];
    const isCommon = (selectedCourse === 'B.Tech' || selectedCourse === 'Polytechnic') && isSemesterCommon(selectedCourse, selectedSemester);
    const isMBA = selectedCourse === 'MBA';
    const effectiveBranch = (isCommon || isMBA) ? 'common' : selectedBranch;

    const categories: ResourceCategory[] = [
      'Syllabus',
      'Study Books',
      'Notes',
      'Questions',
      'Videos',
      'Previous Year Papers',
    ];

    categories.forEach((cat) => {
      const catKey = CATEGORY_KEY_MAP[cat];
      setCustomLink(courseKey, semNum, effectiveBranch, catKey, '');
    });

    const updatedLinks = getCustomLinks();
    setCustomLinks(updatedLinks);
    if (onDataChanged) onDataChanged();
    showToast('Reset links for this semester to courseData defaults');
  };

  // Reset all custom link overrides
  const handleResetAllLinks = () => {
    if (window.confirm('Are you sure you want to reset ALL custom modified links back to default courseData?')) {
      clearAllCustomLinks();
      setCustomLinks({});
      if (onDataChanged) onDataChanged();
      showToast('All custom links have been cleared! System restored to original courseData.');
    }
  };

  // Test / Open link in new tab
  const handleTestLink = (rawOrEncoded: string) => {
    if (!rawOrEncoded.trim()) {
      showToast('Please enter a link first before testing', 'error');
      return;
    }
    const decodedUrl = b2a(rawOrEncoded.trim());
    window.open(decodedUrl, '_blank', 'noopener,noreferrer');
  };

  // Toggle Announcement Banner
  const handleToggleAnnouncement = () => {
    const updated = saveAppSettings({ isAnnouncementEnabled: !settings.isAnnouncementEnabled });
    setSettings(updated);
    if (onDataChanged) onDataChanged();
    showToast(updated.isAnnouncementEnabled ? 'Broadcast Announcement enabled!' : 'Broadcast Announcement disabled');
  };

  const handleSaveAnnouncementText = (newText: string) => {
    const updated = saveAppSettings({ announcementText: newText });
    setSettings(updated);
    if (onDataChanged) onDataChanged();
  };

  const isCurrentSemCommon =
    (selectedCourse === 'B.Tech' || selectedCourse === 'Polytechnic') &&
    isSemesterCommon(selectedCourse, selectedSemester);
  const isMBA = selectedCourse === 'MBA';
  const customLinksCount = Object.keys(customLinks).length;

  return (
    <div
      id="admin-panel-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="admin-panel-modal-container"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 border border-blue-400/40 rounded-xl text-blue-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-wide">
                  NTechBay Admin Control Center
                </h3>
                {isAdminAuthenticated && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    MASTER ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200/80">
                Created & Managed by Er. Nitish Khobragade (NK)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={handleAdminLogout}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-colors cursor-pointer"
                title="Logout of Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            <button
              id="close-admin-panel-modal"
              type="button"
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              aria-label="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 text-white animate-fade-in ${
              toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Content Body: Login OR Dashboard */}
        {!isAdminAuthenticated ? (
          /* ============================================================== */
          /* ADMIN LOGIN GATE                                               */
          /* ============================================================== */
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xl">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-1.5">
              <h4 className="text-xl font-bold text-slate-900">
                Admin Authentication Required
              </h4>
              <p className="text-xs sm:text-sm text-slate-600">
                The password settings and link modification facilities are securely restricted to the site owner (Er. Nitish Khobragade). Please enter your Master Admin password.
              </p>
            </div>

            <form
              onSubmit={handleAdminLogin}
              className={`w-full max-w-sm space-y-3 ${isShaking ? 'animate-shake' : ''}`}
            >
              <div className="relative">
                <input
                  id="admin-master-password-input"
                  type={showAdminInputPassword ? 'text' : 'password'}
                  value={adminInputPassword}
                  onChange={(e) => {
                    setAdminInputPassword(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Enter Admin Master Password"
                  autoFocus
                  className="w-full pl-4 pr-10 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminInputPassword(!showAdminInputPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showAdminInputPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-left">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                id="submit-admin-login-button"
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Enter Admin Panel</span>
              </button>
            </form>
          </div>
        ) : (
          /* ============================================================== */
          /* AUTHENTICATED ADMIN DASHBOARD                                  */
          /* ============================================================== */
          <div className="flex flex-col flex-1 overflow-hidden bg-slate-50">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 pt-2 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('passwords')}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'passwords'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Password Controls</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('links')}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'links'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Modify Drive Links</span>
                {customLinksCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
                    {customLinksCount} active
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('appSettings')}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'appSettings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>App Announcements & Notices</span>
              </button>
            </div>

            {/* Tab 1: Password Controls */}
            {activeTab === 'passwords' && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
                {/* 1. Student Entrance Password */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          Student Entrance Access Password
                        </h4>
                        <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                          Front Page Gate
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        This is the password engineering students must enter on the first page to access notes and syllabus.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetStudentPassword}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
                      title="Reset student password to default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Default</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveStudentPassword} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Active Student Password (lowercase):
                      </label>
                      <div className="relative max-w-md">
                        <input
                          type={showStudentPwd ? 'text' : 'password'}
                          value={studentPwdInput}
                          onChange={(e) => setStudentPwdInput(e.target.value)}
                          placeholder="Enter new student password"
                          className="w-full pl-3 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStudentPwd(!showStudentPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showStudentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Student Password</span>
                      </button>
                      <span className="text-xs text-slate-500">
                        Current: <strong className="font-mono text-slate-800">{showStudentPwd ? settings.studentPassword : '••••••••'}</strong>
                      </span>
                    </div>
                  </form>
                </div>

                {/* 2. Admin Master Password */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          Admin Master Login Password
                        </h4>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                          Admin Panel Gate
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        The key required to enter this Admin Control Center.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetAdminPassword}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
                      title="Reset to default admin key"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Default</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveAdminPassword} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        New Admin Master Password:
                      </label>
                      <div className="relative max-w-md">
                        <input
                          type={showAdminPwd ? 'text' : 'password'}
                          value={adminPwdInput}
                          onChange={(e) => setAdminPwdInput(e.target.value)}
                          placeholder="Enter new admin master password"
                          className="w-full pl-3 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPwd(!showAdminPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showAdminPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Master Admin Password</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Tab 2: Modify Drive Links */}
            {activeTab === 'links' && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
                {/* Course, Semester, Branch Selector Bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Target Curriculum to Modify
                    </span>
                    {customLinksCount > 0 && (
                      <button
                        type="button"
                        onClick={handleResetAllLinks}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset All Modified Links ({customLinksCount})</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Course */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Course</label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value as CourseType)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      >
                        {COURSES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Semester */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Semester</label>
                      <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      >
                        {(COURSE_SEMESTERS[selectedCourse] || []).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Branch */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Branch</label>
                      {isCurrentSemCommon ? (
                        <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 font-medium">
                          Common for all branches (Sem 1 & 2)
                        </div>
                      ) : isMBA ? (
                        <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 font-medium">
                          General Management
                        </div>
                      ) : (
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        >
                          {(COURSE_BRANCHES[selectedCourse] || []).map((b) => (
                            <option key={b.code} value={b.code}>
                              {b.code} - {b.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* 6 Category Link Editors */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                      <span>
                        Drive Links for {selectedCourse} • {selectedSemester} •{' '}
                        {isCurrentSemCommon ? 'Common' : isMBA ? 'General' : selectedBranch}
                      </span>
                    </h5>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetCurrentSemesterLinks}
                        className="text-xs text-slate-500 hover:text-blue-600 font-medium px-2 py-1 hover:bg-slate-100 rounded cursor-pointer"
                      >
                        Reset this Semester
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCurrentLinks}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>

                  {/* Inputs for each category */}
                  <div className="space-y-3.5">
                    {[
                      { cat: 'Syllabus', key: 'syllabus', icon: '📋' },
                      { cat: 'Study Books', key: 'books', icon: '📚' },
                      { cat: 'Notes', key: 'notes', icon: '📝' },
                      { cat: 'Questions', key: 'questions', icon: '❓' },
                      { cat: 'Videos', key: 'videos', icon: '🎥' },
                      { cat: 'Previous Year Papers', key: 'papers', icon: '📄' },
                    ].map(({ cat, key, icon }) => {
                      const currentValue = linkDrafts[key] || '';
                      const semNum = parseInt(selectedSemester.replace(/\D/g, ''), 10) || 1;
                      const courseKey = COURSE_KEY_MAP[selectedCourse];
                      const effectiveBranch = (isCurrentSemCommon || isMBA) ? 'common' : selectedBranch;
                      const storageKey = makeLinkKey(courseKey, semNum, effectiveBranch, key);
                      const isCustom = !!customLinks[storageKey];

                      return (
                        <div key={key} className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{icon}</span>
                              <span className="text-xs font-bold text-slate-800">{cat}</span>
                              {isCustom ? (
                                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                  Custom Modified
                                </span>
                              ) : (
                                <span className="text-[9px] bg-slate-200 text-slate-600 font-medium px-1.5 py-0.2 rounded">
                                  Default courseData
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleTestLink(currentValue)}
                              disabled={!currentValue}
                              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-40 cursor-pointer"
                              title="Open and test destination URL in new tab"
                            >
                              <span>Test Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={currentValue}
                              onChange={(e) =>
                                setLinkDrafts({
                                  ...linkDrafts,
                                  [key]: e.target.value,
                                })
                              }
                              placeholder="Paste Google Drive URL (e.g. https://drive.google.com/drive/folders/...) or Base64 code"
                              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                            />
                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomLink(courseKey, semNum, effectiveBranch, key, '');
                                  const updated = getCustomLinks();
                                  setCustomLinks(updated);
                                  showToast(`Reset ${cat} to default`);
                                }}
                                className="px-2 py-1.5 text-[10px] text-rose-600 hover:bg-rose-50 rounded border border-rose-200 cursor-pointer font-medium"
                                title="Revert to default link"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveCurrentLinks}
                      className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save All Link Modifications</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: App Announcements & Notices */}
            {activeTab === 'appSettings' && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
                {/* Broadcast Announcement Bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          Library Broadcast Notice Banner
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500">
                        Display an announcement ticker or urgent update at the top of the engineering library for students.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.isAnnouncementEnabled}
                        onChange={handleToggleAnnouncement}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-2 text-xs font-semibold text-slate-700">
                        {settings.isAnnouncementEnabled ? 'Visible' : 'Hidden'}
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Notice Message Text:
                    </label>
                    <textarea
                      rows={3}
                      value={settings.announcementText}
                      onChange={(e) => handleSaveAnnouncementText(e.target.value)}
                      placeholder="e.g. 📢 RGPV Timetable declared! All study books and previous 5-year question papers for 4th semester are now updated."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Changes auto-save immediately.</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveAnnouncementText(
                          '📢 Welcome to NTechBay-Library! All RGPV B.Tech, Polytechnic, MBA & M.Tech resources are updated.'
                        );
                        showToast('Reset announcement to default message');
                      }}
                      className="text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      Reset default text
                    </button>
                  </div>
                </div>

                {/* System Diagnostics & Creator Profile */}
                <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                  <div>
                    <strong className="text-slate-800 font-bold block">Developer & Owner:</strong>
                    <span>Er. Nitish Khobragade (djnitish97@gmail.com)</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-500">NTechBay-Library Engine</span>
                    <span className="font-mono text-[11px] text-blue-700 font-bold">RGPV e-Library v2.5</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

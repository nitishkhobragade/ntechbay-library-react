import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from '../../context/RouterContext';
import {
  Users,
  Bell,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Plus,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Info,
  Upload,
  Eye,
  Save,
  X,
  RefreshCw,
  ExternalLink,
  Layers,
  Phone,
  Mail,
  UserCheck,
  UserX,
  KeyRound,
  LogOut,
  Menu,
  BookOpen,
  Download,
  UserPlus,
  Shield,
  Lock,
  FileSpreadsheet,
  Table,
  Grid,
  Calendar,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
} from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../../firebase';
import { UserProfile, NoticeItem, NoticeType, UserStatus, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StudentExportModal } from '../../components/StudentExportModal';
import { AddAdminModal } from '../../components/AddAdminModal';
import { MasterPasswordOverrideModal } from '../../components/MasterPasswordOverrideModal';
import { compressImageTo50KB } from '../../utils/imageCompressor';
import {
  fetchAllRegisteredUsers,
  getLocallyStoredUsers,
  saveUserLocally,
} from '../../utils/userStore';

interface AdminDashboardProps {
  onBackToLibrary: () => void;
  onOpenResourceLinkEditor?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToLibrary,
  onOpenResourceLinkEditor,
}) => {
  const navigate = useNavigate();
  const { isAdmin, userProfile, logout } = useAuth();
  const [isAdminNavOpen, setIsAdminNavOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'notices'>('metrics');

  // Users State - initialize immediately from local storage so registered users are never 0
  const [users, setUsers] = useState<UserProfile[]>(() => getLocallyStoredUsers());
  const [userSearch, setUserSearch] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [userSubTab, setUserSubTab] = useState<'students' | 'admins'>('students');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [overridePasswordStudent, setOverridePasswordStudent] = useState<UserProfile | null>(null);

  // Notices State
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [isCreatingNotice, setIsCreatingNotice] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);

  // Broadcasts & Promotion Management States
  const [noticeSearch, setNoticeSearch] = useState('');
  const [noticeFilterType, setNoticeFilterType] = useState<'all' | 'text' | 'promotion' | 'alert'>('all');
  const [noticeFilterStatus, setNoticeFilterStatus] = useState<'all' | 'active' | 'archived'>('all');
  const [noticeViewMode, setNoticeViewMode] = useState<'table' | 'cards'>('table');
  const [viewingNotice, setViewingNotice] = useState<NoticeItem | null>(null);

  // Filtered notices for Broadcast & Promotion Management
  const filteredNotices = useMemo(() => {
    return notices.filter((item) => {
      if (noticeFilterType !== 'all' && item.type !== noticeFilterType) return false;
      if (noticeFilterStatus === 'active' && !item.active) return false;
      if (noticeFilterStatus === 'archived' && item.active) return false;
      if (noticeSearch.trim()) {
        const query = noticeSearch.toLowerCase();
        return (
          item.title?.toLowerCase().includes(query) ||
          item.content?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [notices, noticeFilterType, noticeFilterStatus, noticeSearch]);

  // Contextual back action determination
  const canGoBack =
    activeTab !== 'metrics' ||
    Boolean(viewingUser) ||
    Boolean(selectedUserForEdit) ||
    Boolean(overridePasswordStudent) ||
    Boolean(viewingNotice) ||
    isCreatingNotice;

  const handleContextualBack = () => {
    if (viewingNotice) {
      setViewingNotice(null);
      return;
    }
    if (isCreatingNotice) {
      setIsCreatingNotice(false);
      setEditingNotice(null);
      return;
    }
    if (viewingUser) {
      setViewingUser(null);
      return;
    }
    if (selectedUserForEdit) {
      setSelectedUserForEdit(null);
      return;
    }
    if (overridePasswordStudent) {
      setOverridePasswordStudent(null);
      return;
    }
    if (activeTab === 'users' || activeTab === 'notices') {
      setActiveTab('metrics');
      return;
    }
  };

  const getBackLabel = () => {
    if (viewingNotice || isCreatingNotice) return 'Back to Broadcasts';
    if (viewingUser || selectedUserForEdit || overridePasswordStudent) return 'Back to Users';
    if (activeTab === 'users') return 'Back to Overview';
    if (activeTab === 'notices') return 'Back to Overview';
    return 'Back';
  };

  // Notice Form State
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    type: 'text' as NoticeType,
    imageUrl: '',
    active: true,
  });
  const [compressingNoticeImg, setCompressingNoticeImg] = useState(false);
  const noticeFileInputRef = useRef<HTMLInputElement>(null);

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Strict Admin Sign Out with full session purge and redirect
  const handleAdminLogout = async () => {
    try {
      await logout();
      sessionStorage.clear();
      localStorage.removeItem('ntechbay_admin_auth');
      localStorage.removeItem('ntechbay_emergency_admin');
      localStorage.removeItem('ntechbay_unlocked');
      navigate('/', { replace: true });
    } catch (err) {
      console.warn('Admin logout warning:', err);
      navigate('/', { replace: true });
    }
  };

  // Explicit Password Reset action for student account
  const handleSendPasswordReset = async (email: string, studentName: string) => {
    if (!email || !email.includes('@')) {
      showToast(`Cannot reset password: ${studentName} does not have a valid email.`, 'error');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showToast(`Password reset link sent to ${email}.`);
    } catch (err: any) {
      showToast(`Failed to trigger password reset: ${err.message}`, 'error');
    }
  };

  // Guard verification
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-rose-200 p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-600">
            This portal is restricted to authorized NTechBay administrators (Nitish Khobragade).
          </p>
          <button
            type="button"
            onClick={onBackToLibrary}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
          >
            Return to Library Home
          </button>
        </div>
      </div>
    );
  }

  // Fetch Users combining Cloud Firestore and browser persistence
  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await fetchAllRegisteredUsers();
      if (list.length > 0) {
        setUsers(list);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
      const local = getLocallyStoredUsers();
      if (local.length > 0) {
        setUsers(local);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  // Real-time listeners for users & notices
  useEffect(() => {
    fetchAllUsers();

    // Real-time listener for Firestore users collection
    let unsubscribeUsers: (() => void) | null = null;
    try {
      unsubscribeUsers = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: UserProfile[] = snapshot.docs.map((d) => ({
              uid: d.id,
              ...(d.data() as Omit<UserProfile, 'uid'>),
            }));
            const local = getLocallyStoredUsers();
            const map = new Map<string, UserProfile>();
            local.forEach((u) => map.set((u.email || u.uid).toLowerCase(), u));
            list.forEach((u) => {
              const k = (u.email || u.uid).toLowerCase();
              const ex = map.get(k);
              map.set(k, ex ? { ...ex, ...u } : u);
            });
            const merged = Array.from(map.values());
            setUsers(merged);
            try {
              localStorage.setItem('ntechbay_all_users', JSON.stringify(merged));
            } catch {}
          }
        },
        (error) => {
          console.warn('Users realtime snapshot note:', error);
        }
      );
    } catch (e) {
      console.warn('Snapshot listener setup:', e);
    }

    // Real-time listener for notices
    setLoadingNotices(true);
    let unsubscribeNotices: (() => void) | null = null;
    try {
      unsubscribeNotices = onSnapshot(
        collection(db, 'notices'),
        (snapshot) => {
          const list: NoticeItem[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<NoticeItem, 'id'>),
          }));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setNotices(list);
          setLoadingNotices(false);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'notices');
          setLoadingNotices(false);
        }
      );
    } catch (err) {
      console.warn(err);
      setLoadingNotices(false);
    }

    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeNotices) unsubscribeNotices();
    };
  }, []);

  // Update user status
  const handleToggleUserStatus = async (userToToggle: UserProfile) => {
    const newStatus: UserStatus = userToToggle.status === 'active' ? 'suspended' : 'active';
    const updatedUser = { ...userToToggle, status: newStatus };
    saveUserLocally(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.uid === userToToggle.uid ? updatedUser : u))
    );

    try {
      await updateDoc(doc(db, 'users', userToToggle.uid), {
        status: newStatus,
      });
      showToast(
        `User ${userToToggle.firstName} has been ${newStatus === 'active' ? 'activated' : 'suspended'}.`
      );
    } catch (err) {
      showToast('Status updated locally.', 'success');
    }
  };

  // Save edited user profile
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    const cleanPhone = selectedUserForEdit.phone.replace(/[^0-9]/g, '').slice(0, 10);
    if (cleanPhone.length !== 10) {
      showToast('Primary mobile number must be exactly 10 digits.', 'error');
      return;
    }

    const cleanAlt = (selectedUserForEdit.altPhone || '').replace(/[^0-9]/g, '').slice(0, 10);

    const updatedUser: UserProfile = {
      ...selectedUserForEdit,
      firstName: selectedUserForEdit.firstName.trim(),
      lastName: selectedUserForEdit.lastName.trim(),
      phone: cleanPhone,
      altPhone: cleanAlt,
      dob: selectedUserForEdit.dob || '',
      college: selectedUserForEdit.college?.trim() || '',
      course: selectedUserForEdit.course || 'B.Tech',
      branch: selectedUserForEdit.branch?.trim() || '',
    };

    saveUserLocally(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.uid === selectedUserForEdit.uid ? updatedUser : u))
    );
    setSelectedUserForEdit(null);
    showToast('User profile updated successfully.');

    try {
      await updateDoc(doc(db, 'users', selectedUserForEdit.uid), {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        altPhone: updatedUser.altPhone,
        dob: updatedUser.dob,
        college: updatedUser.college,
        course: updatedUser.course,
        branch: updatedUser.branch,
        role: updatedUser.role,
        status: updatedUser.status,
      });
    } catch (err) {
      console.warn('Firestore update sync note:', err);
    }
  };

  // Handle notice creation or update
  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      showToast('Please provide a title and content for the notice.', 'error');
      return;
    }

    try {
      if (editingNotice) {
        // Update existing
        await updateDoc(doc(db, 'notices', editingNotice.id), {
          title: noticeForm.title.trim(),
          content: noticeForm.content.trim(),
          type: noticeForm.type,
          imageUrl: noticeForm.imageUrl,
          active: noticeForm.active,
        });
        showToast('Notice updated successfully.');
      } else {
        // Create new
        await addDoc(collection(db, 'notices'), {
          title: noticeForm.title.trim(),
          content: noticeForm.content.trim(),
          type: noticeForm.type,
          imageUrl: noticeForm.imageUrl,
          active: noticeForm.active,
          createdAt: new Date().toISOString(),
        });
        showToast('Notice broadcasted successfully.');
      }

      setIsCreatingNotice(false);
      setEditingNotice(null);
      setNoticeForm({
        title: '',
        content: '',
        type: 'text',
        imageUrl: '',
        active: true,
      });
    } catch (err) {
      showToast('Failed to save notice.', 'error');
    }
  };

  // Toggle notice visibility
  const handleToggleNoticeActive = async (notice: NoticeItem) => {
    try {
      await updateDoc(doc(db, 'notices', notice.id), {
        active: !notice.active,
      });
      showToast(`Notice marked as ${!notice.active ? 'Active' : 'Inactive'}.`);
    } catch (err) {
      showToast('Failed to toggle notice visibility.', 'error');
    }
  };

  // Delete notice
  const handleDeleteNotice = async (noticeId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this notice?')) return;
    try {
      await deleteDoc(doc(db, 'notices', noticeId));
      showToast('Notice deleted.');
    } catch (err) {
      showToast('Failed to delete notice.', 'error');
    }
  };

  // Process notice banner upload <= 50KB
  const handleNoticeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressingNoticeImg(true);
    try {
      const compressed = await compressImageTo50KB(file);
      setNoticeForm((prev) => ({ ...prev, imageUrl: compressed.base64 }));
      showToast(`Banner compressed to ${compressed.sizeKB} KB.`);
    } catch (err) {
      showToast('Failed to compress banner image.', 'error');
    } finally {
      setCompressingNoticeImg(false);
    }
  };

  const isMasterAdminEmail = (email: string) => {
    const norm = (email || '').toLowerCase().trim();
    return (
      norm === 'djnitish97@gmail.com' ||
      norm === 'nitishkhobragade89@gmail.com' ||
      norm === 'admin@ntechbay.in'
    );
  };

  // Strictly segregate Students from Admins
  const studentUsers = useMemo(() => {
    return users.filter((u) => u.role === 'student' && !isMasterAdminEmail(u.email));
  }, [users]);

  const adminUsers = useMemo(() => {
    return users.filter((u) => u.role === 'admin' || isMasterAdminEmail(u.email));
  }, [users]);

  // Filtered Students exclusively (role === 'student')
  const filteredStudents = useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    return studentUsers.filter((u) => {
      const matchesSearch =
        !q ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.college && u.college.toLowerCase().includes(q)) ||
        (u.branch && u.branch.toLowerCase().includes(q));

      const matchesStatus =
        userFilterStatus === 'all' || u.status === userFilterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [studentUsers, userSearch, userFilterStatus]);

  // Filtered Admins exclusively (role === 'admin')
  const filteredAdmins = useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    return adminUsers.filter((u) => {
      return (
        !q ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [adminUsers, userSearch]);

  const totalStudentsCount = studentUsers.length;
  const activeStudentsCount = studentUsers.filter((u) => u.status === 'active').length;
  const suspendedStudentsCount = studentUsers.filter((u) => u.status === 'suspended').length;
  const totalAdminsCount = adminUsers.length;
  const activeNoticesCount = notices.filter((n) => n.active).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs sm:text-sm font-medium animate-fadeIn ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-rose-600 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Admin Navigation Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsAdminNavOpen(!isAdminNavOpen)}
              className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Toggle Admin Menu"
              aria-label="Admin Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {canGoBack && (
              <button
                type="button"
                onClick={handleContextualBack}
                className="px-2.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-white transition-all cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-semibold border border-white/20 shadow-xs active:scale-95"
                title={getBackLabel()}
              >
                <ArrowLeft className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">{getBackLabel()}</span>
              </button>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  Admin Panel
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">/</span>
                <span className="text-xs text-amber-200 font-semibold truncate hidden sm:inline">
                  {activeTab === 'metrics'
                    ? 'Overview & Metrics'
                    : activeTab === 'users'
                    ? userSubTab === 'students'
                      ? 'Student Directory'
                      : 'Administrators'
                    : 'Broadcast Feed & Promotions'}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold flex items-center gap-1.5 truncate text-white">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Administrative Control</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenResourceLinkEditor && (
              <button
                type="button"
                onClick={onOpenResourceLinkEditor}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Course Links Config</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchAllUsers}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Strict Admin Logout Button */}
            <button
              type="button"
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Sign Out of Admin Panel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex border-t border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Overview & Metrics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Student Management ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'notices'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notices & Promotions ({notices.length})</span>
          </button>
        </div>
      </header>

      {/* Mobile Contextual Admin Sidebar Drawer */}
      {isAdminNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAdminNavOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-slate-900 text-white h-full shadow-2xl flex flex-col z-10 border-r border-slate-800">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  Admin Panel
                </span>
                <p className="text-xs font-bold text-white mt-1">NTechBay Controls</p>
                <p className="text-[10px] text-slate-400">Er. Nitish Khobragade</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminNavOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Admin-Specific Nav Items */}
            <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('metrics');
                  setIsAdminNavOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'metrics'
                    ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Dashboard Overview</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('users');
                  setIsAdminNavOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'users'
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>Student Management ({users.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('notices');
                  setIsAdminNavOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'notices'
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Bell className="w-4 h-4 text-purple-400" />
                <span>Notice/Promotion Manager ({notices.length})</span>
              </button>

              {onOpenResourceLinkEditor && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminNavOpen(false);
                    onOpenResourceLinkEditor();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Course Links Settings</span>
                </button>
              )}

              <div className="pt-3 border-t border-slate-800 my-2" />

              {canGoBack && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminNavOpen(false);
                    handleContextualBack();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-amber-300 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-300" />
                  <span>{getBackLabel()}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsAdminNavOpen(false);
                  handleAdminLogout();
                }}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out (Logout)</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* TAB 1: METRICS */}
        {activeTab === 'metrics' && (
          <div className="space-y-6 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Students</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                  {totalStudentsCount}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Enrolled students (admins excluded)</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600">Active Students</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-2">
                  {activeStudentsCount}
                </div>
                <p className="text-[11px] text-emerald-600/80 mt-1">Authorized for library access</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-600">Suspended Students</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <UserX className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-rose-700 mt-2">
                  {suspendedStudentsCount}
                </div>
                <p className="text-[11px] text-rose-600/80 mt-1">Blocked from login</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-600">Platform Admins</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-amber-700 mt-2">
                  {totalAdminsCount}
                </div>
                <p className="text-[11px] text-amber-600/80 mt-1">Authorized administrators</p>
              </div>
            </div>

            {/* Quick Actions & Recent Users Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions Panel */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Admin Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('notices');
                      setIsCreatingNotice(true);
                    }}
                    className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Broadcast / Promotion</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Users className="w-4 h-4" />
                    <span>Inspect & Manage Student Accounts</span>
                  </button>
                </div>
              </div>

              {/* Security & System Info */}
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-white">Cloud Firestore & Security Guard</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Authentication is managed directly with Firebase Auth (browserLocalPersistence enabled). 
                  Student profiles are stored in Cloud Firestore under the <code className="text-amber-300">users</code> collection, with client-side image compression strictly limited to &le; 50KB to preserve quota and maximize performance.
                </p>
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span>Primary Admin: djnitish97@gmail.com</span>
                  <span>•</span>
                  <span>Database: Cloud Firestore</span>
                  <span>•</span>
                  <span>Auto-Lock: 5 Min Inactivity Guard</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT (Separated Students & Admins) */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fadeIn">
            {/* Sub-tab switcher + Action Buttons */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Sub-tabs */}
              <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUserSubTab('students')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    userSubTab === 'students'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Enrolled Students ({studentUsers.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserSubTab('admins')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    userSubTab === 'admins'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Administrators ({adminUsers.length})</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {userSubTab === 'students' && (
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    title="Export Student Data (Preview, Excel, PDF)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Student Data</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsAddAdminModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Create New Administrator Account"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                  <span>Add New Admin</span>
                </button>
              </div>
            </div>

            {/* User Search & Filter Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={
                    userSubTab === 'students'
                      ? 'Search students by name, email, phone, college...'
                      : 'Search admins by name or email...'
                  }
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {userSubTab === 'students' && (
                  <select
                    value={userFilterStatus}
                    onChange={(e: any) => setUserFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                )}

                <button
                  type="button"
                  onClick={fetchAllUsers}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* VIEW 1: STUDENTS TABLE (Role === 'student' strictly) */}
            {userSubTab === 'students' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Contact (Phone & Alt)</th>
                      <th className="py-3 px-4">College / Course</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Registered On</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          Loading students...
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No enrolled students found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((userItem) => (
                        <tr key={userItem.uid} className="hover:bg-slate-50/70 transition-colors">
                          {/* Student Name & Photo */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                                {userItem.photoBase64 ? (
                                  <img
                                    src={userItem.photoBase64}
                                    alt={userItem.firstName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Users className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">
                                  {userItem.firstName} {userItem.lastName}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">{userItem.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Phone, DOB & Alt Phone */}
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-800">{userItem.phone}</p>
                            {userItem.dob && (
                              <p className="text-[11px] text-blue-600 font-medium">DOB: {userItem.dob}</p>
                            )}
                            {userItem.altPhone && (
                              <p className="text-[11px] text-slate-400">Alt: {userItem.altPhone}</p>
                            )}
                          </td>

                          {/* College & Course */}
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-800">
                              {userItem.course || 'B.Tech'} {userItem.branch ? `• ${userItem.branch}` : ''}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                              {userItem.college || 'Institute not specified'}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                                userItem.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {userItem.status === 'active' ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <XCircle className="w-3 h-3 text-rose-600" />
                              )}
                              <span>{userItem.status}</span>
                            </span>
                          </td>

                          {/* Registered date */}
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {new Date(userItem.createdAt).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setViewingUser(userItem)}
                                className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer"
                                title="View Student Profile"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedUserForEdit(userItem)}
                                className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer"
                                title="Edit Student Fields"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Master Password Override Modal Trigger */}
                              <button
                                type="button"
                                onClick={() => setOverridePasswordStudent(userItem)}
                                className="p-1.5 hover:bg-purple-100 text-purple-700 rounded-lg cursor-pointer"
                                title="Admin Password Override & Direct Reset"
                              >
                                <Lock className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleSendPasswordReset(
                                    userItem.email,
                                    `${userItem.firstName} ${userItem.lastName}`
                                  )
                                }
                                className="p-1.5 hover:bg-amber-100 text-amber-600 rounded-lg cursor-pointer"
                                title="Send Password Reset Email"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(userItem)}
                                className={`p-1.5 rounded-lg cursor-pointer ${
                                  userItem.status === 'active'
                                    ? 'hover:bg-rose-100 text-rose-600'
                                    : 'hover:bg-emerald-100 text-emerald-600'
                                }`}
                                title={
                                  userItem.status === 'active'
                                    ? 'Suspend / Deactivate'
                                    : 'Activate Student'
                                }
                              >
                                {userItem.status === 'active' ? (
                                  <UserX className="w-4 h-4" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* VIEW 2: ADMINISTRATORS TABLE (Role === 'admin' strictly - Credentials & Name only) */
              <div className="overflow-x-auto">
                <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      <strong>Platform Administrators:</strong> These accounts have administrative access to the platform. In accordance with system security rules, administrator profiles strictly contain only authentication credentials, full name, and email (no student-specific data).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddAdminModalOpen(true)}
                    className="shrink-0 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
                  >
                    + Add Admin
                  </button>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Administrator</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Created On</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No administrators found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredAdmins.map((adminItem) => (
                        <tr key={adminItem.uid} className="hover:bg-slate-50/70 transition-colors">
                          {/* Admin Name & Email */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-amber-100 border border-amber-300 shrink-0 flex items-center justify-center text-amber-800 font-black">
                                <ShieldCheck className="w-5 h-5 text-amber-700" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">
                                  {adminItem.firstName} {adminItem.lastName}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">{adminItem.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                              ADMIN
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                                adminItem.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {adminItem.status === 'active' ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <XCircle className="w-3 h-3 text-rose-600" />
                              )}
                              <span>{adminItem.status}</span>
                            </span>
                          </td>

                          {/* Created date */}
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {new Date(adminItem.createdAt).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setSelectedUserForEdit(adminItem)}
                                className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer"
                                title="Edit Administrator Name & Credentials"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setOverridePasswordStudent(adminItem)}
                                className="p-1.5 hover:bg-purple-100 text-purple-700 rounded-lg cursor-pointer"
                                title="Admin Direct Password Change"
                              >
                                <Lock className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                   handleSendPasswordReset(
                                     adminItem.email,
                                     `${adminItem.firstName} ${adminItem.lastName}`
                                   )
                                }
                                className="p-1.5 hover:bg-amber-100 text-amber-600 rounded-lg cursor-pointer"
                                title="Send Admin Password Reset Email"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOTICES & PROMOTIONS (PROMOTION & BROADCAST MANAGER) */}
        {activeTab === 'notices' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Broadcast Feed & Promotion Manager
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                    Real-Time Cloud Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit, edit, and control live broadcasts or archive outdated promotions to keep the student portal fast and responsive.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingNotice(null);
                  setNoticeForm({
                    title: '',
                    content: '',
                    type: 'text',
                    imageUrl: '',
                    active: true,
                  });
                  setIsCreatingNotice(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Publish New Broadcast</span>
              </button>
            </div>

            {/* Broadcast Metric Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Total Broadcasts</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {notices.length}
                </div>
                <p className="text-[10.5px] text-slate-400 mt-0.5">All historic posts</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700">Active / Live</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-2">
                  {notices.filter((n) => n.active).length}
                </div>
                <p className="text-[10.5px] text-slate-500 mt-0.5">Visible to student portals</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600">Archived / Hidden</span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-700 mt-2">
                  {notices.filter((n) => !n.active).length}
                </div>
                <p className="text-[10.5px] text-slate-500 mt-0.5">Deactivated to save portal bandwidth</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-purple-700">Promotions</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-purple-600 mt-2">
                  {notices.filter((n) => n.type === 'promotion').length}
                </div>
                <p className="text-[10.5px] text-slate-500 mt-0.5">Marketing & special campaigns</p>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={noticeSearch}
                  onChange={(e) => setNoticeSearch(e.target.value)}
                  placeholder="Search broadcasts by title or content keywords..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-colors"
                />
                {noticeSearch && (
                  <button
                    type="button"
                    onClick={() => setNoticeSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters & View Mode */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Category Type Filter */}
                <select
                  value={noticeFilterType}
                  onChange={(e) => setNoticeFilterType(e.target.value as any)}
                  className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium cursor-pointer focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Categories</option>
                  <option value="text">General Announcements</option>
                  <option value="promotion">Promotions</option>
                  <option value="alert">Urgent Alerts</option>
                </select>

                {/* Status Filter */}
                <select
                  value={noticeFilterStatus}
                  onChange={(e) => setNoticeFilterStatus(e.target.value as any)}
                  className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium cursor-pointer focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="archived">Archived Only</option>
                </select>

                {/* View Switcher: Table vs Cards */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setNoticeViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                      noticeViewMode === 'table'
                        ? 'bg-white text-purple-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Table View"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoticeViewMode('cards')}
                    className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                      noticeViewMode === 'cards'
                        ? 'bg-white text-purple-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Cards Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content List Area */}
            {loadingNotices ? (
              <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
                <p className="text-xs font-medium">Syncing broadcasts from Cloud Firestore...</p>
              </div>
            ) : filteredNotices.length === 0 ? (
              <div className="py-14 bg-white rounded-2xl border border-slate-200 text-center p-6 space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {noticeSearch || noticeFilterType !== 'all' || noticeFilterStatus !== 'all'
                    ? 'No matching broadcasts found'
                    : 'No broadcast notices yet'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {noticeSearch || noticeFilterType !== 'all' || noticeFilterStatus !== 'all'
                    ? 'Try clearing your filters or search keywords to view all broadcasts.'
                    : 'Click "Publish New Broadcast" to post exam dates, promotions, or syllabus updates.'}
                </p>
                {(noticeSearch || noticeFilterType !== 'all' || noticeFilterStatus !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setNoticeSearch('');
                      setNoticeFilterType('all');
                      setNoticeFilterStatus('all');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : noticeViewMode === 'table' ? (
              /* TABLE VIEW: Optimized for viewing, editing, deleting and managing old posts */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Broadcast & Preview</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Post Date & Time</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Visibility Toggle</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredNotices.map((noticeItem) => (
                        <tr
                          key={noticeItem.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            !noticeItem.active ? 'bg-slate-50/40 text-slate-500' : ''
                          }`}
                        >
                          {/* Title & Preview */}
                          <td className="py-3 px-4">
                            <div className="flex items-start gap-3">
                              {noticeItem.imageUrl ? (
                                <img
                                  src={noticeItem.imageUrl}
                                  alt={noticeItem.title}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer"
                                  onClick={() => setViewingNotice(noticeItem)}
                                />
                              ) : (
                                <div
                                  onClick={() => setViewingNotice(noticeItem)}
                                  className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 cursor-pointer"
                                >
                                  <Bell className="w-5 h-5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => setViewingNotice(noticeItem)}
                                  className="font-bold text-slate-900 hover:text-purple-600 text-left text-xs sm:text-sm line-clamp-1 cursor-pointer transition-colors"
                                  title="Click to view full notice"
                                >
                                  {noticeItem.title}
                                </button>
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {noticeItem.content}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                noticeItem.type === 'alert'
                                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                                  : noticeItem.type === 'promotion'
                                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                                  : 'bg-blue-100 text-blue-800 border-blue-200'
                              }`}
                            >
                              {noticeItem.type}
                            </span>
                          </td>

                          {/* Date & Time */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="text-slate-800 font-medium">
                              {new Date(noticeItem.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-[10.5px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>
                                {new Date(noticeItem.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                                noticeItem.active
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  noticeItem.active ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              <span>{noticeItem.active ? 'Active (Live)' : 'Archived'}</span>
                            </span>
                          </td>

                          {/* Visibility Toggle */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleNoticeActive(noticeItem)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold cursor-pointer border transition-colors ${
                                noticeItem.active
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}
                              title={
                                noticeItem.active
                                  ? 'Deactivate to reduce portal load'
                                  : 'Reactivate to display on portal'
                              }
                            >
                              {noticeItem.active ? 'Archive' : 'Make Live'}
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setViewingNotice(noticeItem)}
                                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                                title="View Notice Details"
                              >
                                <Eye className="w-4 h-4 text-purple-600" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNotice(noticeItem);
                                  setNoticeForm({
                                    title: noticeItem.title,
                                    content: noticeItem.content,
                                    type: noticeItem.type,
                                    imageUrl: noticeItem.imageUrl || '',
                                    active: noticeItem.active,
                                  });
                                  setIsCreatingNotice(true);
                                }}
                                className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg cursor-pointer"
                                title="Edit Notice"
                              >
                                <Edit2 className="w-4 h-4 text-blue-600" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteNotice(noticeItem.id)}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                                title="Delete Notice Permanently"
                              >
                                <Trash2 className="w-4 h-4 text-rose-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* CARD GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotices.map((noticeItem) => (
                  <div
                    key={noticeItem.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                      noticeItem.active ? 'border-slate-200' : 'border-slate-200 opacity-65 bg-slate-50'
                    }`}
                  >
                    <div>
                      {/* Badge & Active toggle */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            noticeItem.type === 'alert'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : noticeItem.type === 'promotion'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }`}
                        >
                          {noticeItem.type}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleNoticeActive(noticeItem)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            noticeItem.active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {noticeItem.active ? '● Live' : '○ Archived'}
                        </button>
                      </div>

                      {/* Image Banner */}
                      {noticeItem.imageUrl && (
                        <div
                          className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200 cursor-pointer"
                          onClick={() => setViewingNotice(noticeItem)}
                        >
                          <img
                            src={noticeItem.imageUrl}
                            alt={noticeItem.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <h4
                        className="text-sm font-bold text-slate-900 leading-snug cursor-pointer hover:text-purple-600 transition-colors"
                        onClick={() => setViewingNotice(noticeItem)}
                      >
                        {noticeItem.title}
                      </h4>

                      <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                        {noticeItem.content}
                      </p>
                    </div>

                    {/* Bottom controls */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1 text-[10.5px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(noticeItem.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingNotice(noticeItem)}
                          className="p-1 hover:bg-purple-50 text-purple-600 rounded cursor-pointer"
                          title="View Notice Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingNotice(noticeItem);
                            setNoticeForm({
                              title: noticeItem.title,
                              content: noticeItem.content,
                              type: noticeItem.type,
                              imageUrl: noticeItem.imageUrl || '',
                              active: noticeItem.active,
                            });
                            setIsCreatingNotice(true);
                          }}
                          className="p-1 hover:bg-slate-100 text-blue-600 rounded cursor-pointer"
                          title="Edit Notice"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNotice(noticeItem.id)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: CREATE / EDIT NOTICE */}
      {isCreatingNotice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="p-4 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingNotice ? 'Edit Broadcast Notice' : 'Create New Broadcast Notice'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNotice(false);
                  setEditingNotice(null);
                }}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title / Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="e.g. RGPV Exam Timetable Announced"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Notice Type
                  </label>
                  <select
                    value={noticeForm.type}
                    onChange={(e: any) => setNoticeForm({ ...noticeForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  >
                    <option value="text">General Announcement (Blue)</option>
                    <option value="promotion">Promotion / Event (Purple)</option>
                    <option value="alert">Urgent Alert (Red)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Visibility
                  </label>
                  <select
                    value={noticeForm.active ? 'true' : 'false'}
                    onChange={(e) => setNoticeForm({ ...noticeForm, active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  >
                    <option value="true">Active (Broadcast to Students)</option>
                    <option value="false">Draft / Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="Enter full notice body or instructions..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Banner Image Upload (<= 50KB) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Banner Image (Optional, compressed &le; 50KB)
                </label>
                <input
                  ref={noticeFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNoticeImageUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => noticeFileInputRef.current?.click()}
                    disabled={compressingNoticeImg}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{noticeForm.imageUrl ? 'Change Banner' : 'Upload Banner'}</span>
                  </button>

                  {noticeForm.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setNoticeForm({ ...noticeForm, imageUrl: '' })}
                      className="text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {compressingNoticeImg && (
                  <p className="text-[11px] text-purple-600 mt-1 animate-pulse">
                    Compressing banner to &le; 50KB...
                  </p>
                )}

                {noticeForm.imageUrl && (
                  <div className="mt-2 w-full h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={noticeForm.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNotice(false);
                    setEditingNotice(null);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={compressingNoticeImg}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingNotice ? 'Update Notice' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW FULL USER PROFILE */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Student Profile Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                  {viewingUser.photoBase64 ? (
                    <img
                      src={viewingUser.photoBase64}
                      alt={viewingUser.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-slate-900">
                    {viewingUser.firstName} {viewingUser.lastName}
                  </h4>
                  <p className="text-xs text-slate-500">{viewingUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 capitalize">
                      {viewingUser.role}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        viewingUser.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {viewingUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">UID:</span>
                  <span className="font-mono text-slate-800 truncate max-w-[200px]">
                    {viewingUser.uid}
                  </span>
                </div>
                {viewingUser.role !== 'admin' && (
                  <>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-semibold text-slate-800">{viewingUser.phone}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Date of Birth (DOB):</span>
                      <span className="font-semibold text-slate-800">{viewingUser.dob || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Alternative Phone:</span>
                      <span className="text-slate-800">{viewingUser.altPhone || 'None'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">College / Institute:</span>
                      <span className="text-slate-800">{viewingUser.college || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Course & Branch:</span>
                      <span className="font-semibold text-slate-800">
                        {viewingUser.course || 'B.Tech'} {viewingUser.branch ? `• ${viewingUser.branch}` : ''}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Joined Date:</span>
                  <span className="text-slate-800">
                    {new Date(viewingUser.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSendPasswordReset(
                      viewingUser.email,
                      `${viewingUser.firstName} ${viewingUser.lastName}`
                    );
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Send Reset Email</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const u = viewingUser;
                      setViewingUser(null);
                      setSelectedUserForEdit(u);
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingUser(null)}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT USER PROFILE FIELDS */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Registered User</h3>
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={selectedUserForEdit.firstName}
                    onChange={(e) =>
                      setSelectedUserForEdit({
                        ...selectedUserForEdit,
                        firstName: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={selectedUserForEdit.lastName}
                    onChange={(e) =>
                      setSelectedUserForEdit({
                        ...selectedUserForEdit,
                        lastName: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {selectedUserForEdit.role !== 'admin' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Phone (10 Digits)
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={selectedUserForEdit.phone}
                        maxLength={10}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                          setSelectedUserForEdit({
                            ...selectedUserForEdit,
                            phone: clean,
                          });
                        }}
                        required
                        placeholder="10-digit phone"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-r-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alternative Phone (Optional)
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={selectedUserForEdit.altPhone || ''}
                        maxLength={10}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                          setSelectedUserForEdit({
                            ...selectedUserForEdit,
                            altPhone: clean,
                          });
                        }}
                        placeholder="10-digit alt phone"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-r-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      College / Institute
                    </label>
                    <input
                      type="text"
                      value={selectedUserForEdit.college || ''}
                      onChange={(e) =>
                        setSelectedUserForEdit({
                          ...selectedUserForEdit,
                          college: e.target.value,
                        })
                      }
                      placeholder="e.g. Government College of Engineering"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Degree / Course
                      </label>
                      <select
                        value={selectedUserForEdit.course || 'B.Tech'}
                        onChange={(e: any) =>
                          setSelectedUserForEdit({
                            ...selectedUserForEdit,
                            course: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="B.Tech">B.Tech</option>
                        <option value="Polytechnic">Polytechnic</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="MBA">MBA</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Branch / Discipline
                      </label>
                      <input
                        type="text"
                        value={selectedUserForEdit.branch || ''}
                        onChange={(e) =>
                          setSelectedUserForEdit({
                            ...selectedUserForEdit,
                            branch: e.target.value,
                          })
                        }
                        placeholder="e.g. CSE, CIVIL, MECH"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="date"
                      value={selectedUserForEdit.dob || ''}
                      onChange={(e) =>
                        setSelectedUserForEdit({
                          ...selectedUserForEdit,
                          dob: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={selectedUserForEdit.role}
                    onChange={(e: any) =>
                      setSelectedUserForEdit({
                        ...selectedUserForEdit,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={selectedUserForEdit.status}
                    onChange={(e: any) =>
                      setSelectedUserForEdit({
                        ...selectedUserForEdit,
                        status: e.target.value as UserStatus,
                      })
                    }
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Password Management Action inside Edit Modal */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Password Management</span>
                  </p>
                  <p className="text-[10px] text-amber-700">
                    Change credentials directly in database or dispatch reset email to {selectedUserForEdit.email}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedUserForEdit;
                      setSelectedUserForEdit(null);
                      setOverridePasswordStudent(target);
                    }}
                    className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Direct Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSendPasswordReset(
                        selectedUserForEdit.email,
                        `${selectedUserForEdit.firstName} ${selectedUserForEdit.lastName}`
                      )
                    }
                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW NOTICE / PROMOTION FULL DETAILS */}
      {viewingNotice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    viewingNotice.type === 'alert'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      : viewingNotice.type === 'promotion'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                  }`}
                >
                  {viewingNotice.type}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    viewingNotice.active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {viewingNotice.active ? '● Live on Portal' : '○ Archived / Hidden'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingNotice(null)}
                className="text-white/80 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-white/10"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {viewingNotice.title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Posted on: {new Date(viewingNotice.createdAt).toLocaleString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </p>
              </div>

              {viewingNotice.imageUrl && (
                <div className="w-full max-h-72 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-xs flex items-center justify-center">
                  <img
                    src={viewingNotice.imageUrl}
                    alt={viewingNotice.title}
                    className="w-full h-full max-h-72 object-contain"
                  />
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                  {viewingNotice.content}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  await handleToggleNoticeActive(viewingNotice);
                  setViewingNotice((prev) => (prev ? { ...prev, active: !prev.active } : null));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  viewingNotice.active
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <span>{viewingNotice.active ? 'Archive / Hide Notice' : 'Activate / Make Live'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const noticeToEdit = viewingNotice;
                    setViewingNotice(null);
                    setEditingNotice(noticeToEdit);
                    setNoticeForm({
                      title: noticeToEdit.title,
                      content: noticeToEdit.content,
                      type: noticeToEdit.type,
                      imageUrl: noticeToEdit.imageUrl || '',
                      active: noticeToEdit.active,
                    });
                    setIsCreatingNotice(true);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Notice</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const id = viewingNotice.id;
                    setViewingNotice(null);
                    await handleDeleteNotice(id);
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingNotice(null)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPORT STUDENTS (Table Preview, Excel CSV, PDF) */}
      <StudentExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        students={studentUsers}
      />

      {/* MODAL: ADD NEW ADMIN ACCOUNT (Strict schema: Name & Credentials only) */}
      <AddAdminModal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        onAdminCreated={(newAdmin) => {
          setUsers((prev) => [newAdmin, ...prev]);
          showToast(`Admin account ${newAdmin.email} created successfully.`, 'success');
        }}
      />

      {/* MODAL: MASTER PASSWORD OVERRIDE & DIRECT RESET */}
      <MasterPasswordOverrideModal
        isOpen={Boolean(overridePasswordStudent)}
        onClose={() => setOverridePasswordStudent(null)}
        user={overridePasswordStudent}
        student={overridePasswordStudent}
        onPasswordUpdated={(st, newPass) => {
          setUsers((prev) =>
            prev.map((u) =>
              u.uid === st.uid || u.email.toLowerCase() === st.email.toLowerCase()
                ? { ...u, ...st, passwordOverride: newPass }
                : u
            )
          );
          showToast(`Password successfully updated for ${st.firstName} ${st.lastName}.`, 'success');
        }}
      />
    </div>
  );
};

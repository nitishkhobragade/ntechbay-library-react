import React, { useEffect, useState, useRef } from 'react';
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
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { UserProfile, NoticeItem, NoticeType, UserStatus, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { compressImageTo50KB } from '../../utils/imageCompressor';

interface AdminDashboardProps {
  onBackToLibrary: () => void;
  onOpenResourceLinkEditor?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToLibrary,
  onOpenResourceLinkEditor,
}) => {
  const { isAdmin, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'notices'>('metrics');

  // Users State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);

  // Notices State
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [isCreatingNotice, setIsCreatingNotice] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);

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

  // Fetch Users
  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = snap.docs.map((d) => ({
        uid: d.id,
        ...(d.data() as Omit<UserProfile, 'uid'>),
      }));
      setUsers(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
      showToast('Failed to load registered users.', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Real-time listener for notices
  useEffect(() => {
    fetchAllUsers();

    setLoadingNotices(true);
    try {
      const unsubscribe = onSnapshot(
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
      return () => unsubscribe();
    } catch (err) {
      console.warn(err);
      setLoadingNotices(false);
    }
  }, []);

  // Update user status
  const handleToggleUserStatus = async (userToToggle: UserProfile) => {
    const newStatus: UserStatus = userToToggle.status === 'active' ? 'suspended' : 'active';
    try {
      await updateDoc(doc(db, 'users', userToToggle.uid), {
        status: newStatus,
      });
      setUsers((prev) =>
        prev.map((u) => (u.uid === userToToggle.uid ? { ...u, status: newStatus } : u))
      );
      showToast(
        `User ${userToToggle.firstName} has been ${newStatus === 'active' ? 'activated' : 'suspended'}.`
      );
    } catch (err) {
      showToast('Failed to update user status.', 'error');
    }
  };

  // Save edited user profile
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    try {
      await updateDoc(doc(db, 'users', selectedUserForEdit.uid), {
        firstName: selectedUserForEdit.firstName.trim(),
        lastName: selectedUserForEdit.lastName.trim(),
        phone: selectedUserForEdit.phone.trim(),
        altPhone: selectedUserForEdit.altPhone?.trim() || '',
        dob: selectedUserForEdit.dob || '',
        role: selectedUserForEdit.role,
        status: selectedUserForEdit.status,
      });
      setUsers((prev) =>
        prev.map((u) => (u.uid === selectedUserForEdit.uid ? selectedUserForEdit : u))
      );
      setSelectedUserForEdit(null);
      showToast('User profile updated successfully.');
    } catch (err) {
      showToast('Failed to update user profile.', 'error');
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

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch);

    const matchesStatus =
      userFilterStatus === 'all' || u.status === userFilterStatus;

    return matchesSearch && matchesStatus;
  });

  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const suspendedUsersCount = users.filter((u) => u.status === 'suspended').length;
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
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToLibrary}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Library</span>
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold flex items-center gap-2 truncate">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="truncate">NTechBay Admin Panel</span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Master Administrator: Er. Nitish Khobragade (NK)
              </p>
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
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
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
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Management ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* TAB 1: METRICS */}
        {activeTab === 'metrics' && (
          <div className="space-y-6 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Users</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                  {users.length}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Total registered accounts</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600">Active Students</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-2">
                  {activeUsersCount}
                </div>
                <p className="text-[11px] text-emerald-600/80 mt-1">Authorized for library access</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-600">Suspended Users</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <UserX className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-rose-700 mt-2">
                  {suspendedUsersCount}
                </div>
                <p className="text-[11px] text-rose-600/80 mt-1">Blocked from login</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-600">Active Broadcasts</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-purple-700 mt-2">
                  {activeNoticesCount}
                </div>
                <p className="text-[11px] text-purple-600/80 mt-1">Showing on student feeds</p>
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

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fadeIn">
            {/* User Search & Filter Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, phone..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={userFilterStatus}
                  onChange={(e: any) => setUserFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>

                <button
                  type="button"
                  onClick={fetchAllUsers}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Contact (Phone & Alt)</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered On</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No registered users found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((userItem) => (
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

                        {/* Role */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold capitalize ${
                              userItem.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {userItem.role}
                          </span>
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
                              title="View Full Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedUserForEdit(userItem)}
                              className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer"
                              title="Edit User Fields"
                            >
                              <Edit2 className="w-4 h-4" />
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
                                  : 'Activate User'
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
          </div>
        )}

        {/* TAB 3: NOTICES & PROMOTIONS */}
        {activeTab === 'notices' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top action bar */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Broadcast Feed & Promotions</h3>
                <p className="text-xs text-slate-500">
                  Published items immediately display to active students in real time
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publish New Notice</span>
              </button>
            </div>

            {/* Notice Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingNotices ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  Loading notices from Cloud Firestore...
                </div>
              ) : notices.length === 0 ? (
                <div className="col-span-full py-12 bg-white rounded-2xl border border-slate-200 text-center p-6 space-y-2">
                  <Bell className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No broadcast notices yet</h4>
                  <p className="text-xs text-slate-500">
                    Click "Publish New Notice" to post alerts, examination dates, or promotions.
                  </p>
                </div>
              ) : (
                notices.map((noticeItem) => (
                  <div
                    key={noticeItem.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                      noticeItem.active ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
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

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleNoticeActive(noticeItem)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              noticeItem.active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {noticeItem.active ? 'Live' : 'Hidden'}
                          </button>
                        </div>
                      </div>

                      {/* Image Banner if available */}
                      {noticeItem.imageUrl && (
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                          <img
                            src={noticeItem.imageUrl}
                            alt={noticeItem.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {noticeItem.title}
                      </h4>

                      <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                        {noticeItem.content}
                      </p>
                    </div>

                    {/* Bottom controls */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(noticeItem.createdAt).toLocaleDateString()}</span>

                      <div className="flex items-center gap-1">
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
                ))
              )}
            </div>
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
                  <span className="text-slate-500">Joined Date:</span>
                  <span className="text-slate-800">
                    {new Date(viewingUser.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Close
                </button>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={selectedUserForEdit.phone}
                  onChange={(e) =>
                    setSelectedUserForEdit({
                      ...selectedUserForEdit,
                      phone: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alternative Phone
                </label>
                <input
                  type="text"
                  value={selectedUserForEdit.altPhone || ''}
                  onChange={(e) =>
                    setSelectedUserForEdit({
                      ...selectedUserForEdit,
                      altPhone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
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
    </div>
  );
};

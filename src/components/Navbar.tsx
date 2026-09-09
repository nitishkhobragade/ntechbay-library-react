import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Mail,
  ShieldCheck,
  User,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  Sparkles,
  Phone,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenContact: () => void;
  onOpenAdmin?: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenProfile: () => void;
  onOpenNotices?: () => void;
  noticeCount?: number;
  currentView?: 'home' | 'courses';
  onGoHome?: () => void;
  onGoCourses?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenContact,
  onOpenAdmin,
  onOpenLogin,
  onOpenSignup,
  onOpenProfile,
  onOpenNotices,
  noticeCount = 0,
  currentView = 'home',
  onGoHome,
  onGoCourses,
}) => {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // MANDATE: The "Admin" button must appear ONLY on the main public landing page/homepage,
  // and must be completely hidden inside student dashboards and student profile pages.
  const showAdminButton = Boolean(onOpenAdmin && (!user || isAdmin));

  return (
    <header
      id="top-navbar"
      className="w-full bg-blue-600 text-white shadow-md sticky top-0 z-30"
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Left: Book icon + Full Site Name (clickable to go home) */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer hover:opacity-90 transition-opacity text-left"
          title="Return to Homepage"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h1 className="text-white font-bold text-sm sm:text-base md:text-lg tracking-wide whitespace-nowrap">
              NTechBay-Library
            </h1>
            <span className="text-blue-200 text-xs font-medium whitespace-nowrap hidden xs:inline">
              by NK
            </span>
          </div>
        </button>

        {/* Center/Quick View Switcher on tablet/desktop */}
        {(user || currentView === 'courses') && (
          <div className="hidden sm:flex items-center bg-blue-700/60 p-0.5 rounded-xl border border-white/20">
            <button
              type="button"
              onClick={onGoHome}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={onGoCourses}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === 'courses'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Courses</span>
            </button>
          </div>
        )}

        {/* Mobile Right: Admin + Mobile Logout + Hamburger Menu */}
        <div className="flex items-center gap-1.5 md:hidden">
          {showAdminButton && onOpenAdmin && (
            <button
              id="mobile-admin-header-btn"
              type="button"
              onClick={onOpenAdmin}
              className="p-1.5 sm:p-2 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/35 text-white transition-all cursor-pointer border border-white/20 shadow-xs flex items-center justify-center"
              title="Admin Panel & Controls"
              aria-label="Admin Panel"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
            </button>
          )}

          {/* Direct Quick Logout Button on Mobile Header when logged in */}
          {user && (
            <button
              id="mobile-logout-header-btn"
              type="button"
              onClick={async () => {
                await logout();
                if (onGoHome) onGoHome();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-all cursor-pointer border border-rose-400/40 shadow-xs flex items-center justify-center gap-1"
              title="Sign Out of Account"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span className="text-[11px] font-bold hidden xs:inline">Exit</span>
            </button>
          )}

          <button
            id="mobile-hamburger-btn"
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="relative p-1.5 sm:p-2 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/35 text-white transition-all cursor-pointer border border-white/20 shadow-xs flex items-center justify-center"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-white" />
            {typeof noticeCount === 'number' && noticeCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-0.5 shadow-md border-2 border-blue-600 animate-pulse">
                {noticeCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Right side controls */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Admin Button */}
          {showAdminButton && onOpenAdmin && (
            <button
              id="admin-nav-button"
              type="button"
              onClick={onOpenAdmin}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-xs"
              title="Admin Panel & Controls"
              aria-label="Admin Panel"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
            </button>
          )}

          {/* Notice Button */}
          <button
            id="notice-nav-button"
            type="button"
            onClick={onOpenNotices}
            className="relative bg-white/15 hover:bg-white/25 text-white px-2.5 sm:px-3 py-1.5 rounded-full font-medium text-xs sm:text-sm transition-colors border border-white/20 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
            title="Notice & Promotional Broadcast"
            aria-label="Notices and Promotions"
          >
            <div className="relative flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
              {typeof noticeCount === 'number' && noticeCount > 0 ? (
                <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white font-black text-[9px] min-w-[17px] h-[17px] flex items-center justify-center rounded-full px-1 shadow-md border-2 border-blue-600 animate-pulse">
                  {noticeCount}
                </span>
              ) : null}
            </div>
            <span className="hidden sm:inline">Notice</span>
          </button>

          {/* User Auth Section */}
          {user ? (
            /* Logged-In User Controls */
            <div className="flex items-center gap-2">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 p-1 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer transition-colors border border-white/30 shadow-xs"
                  title="Account Menu"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-white/30 border border-white/40 flex items-center justify-center shrink-0">
                    {userProfile?.photoBase64 ? (
                      <img
                        src={userProfile.photoBase64}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-xs font-semibold max-w-[80px] sm:max-w-[110px] truncate hidden md:inline px-1">
                    {userProfile?.firstName || 'Student'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80 pr-1" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 animate-fadeIn text-xs">
                    {/* User Profile Snapshot */}
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">
                        {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : user.email}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded capitalize ${
                            isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {userProfile?.role || (isAdmin ? 'admin' : 'student')}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-left text-slate-700 cursor-pointer font-medium"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      <span>My Student Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenContact();
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-left text-slate-700 cursor-pointer font-medium"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>Contact Admin & Help</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={async () => {
                        setDropdownOpen(false);
                        await logout();
                        if (onGoHome) onGoHome();
                      }}
                      className="w-full px-4 py-2 hover:bg-rose-50 flex items-center gap-2.5 text-left text-rose-600 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Dedicated Desktop Sign Out Button */}
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  if (onGoHome) onGoHome();
                }}
                className="bg-rose-500/90 hover:bg-rose-600 text-white px-3 py-1.5 rounded-full font-semibold text-xs transition-colors border border-rose-400/40 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Guest Buttons (Sign In & Register) */
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenLogin}
                className="bg-white text-blue-600 px-2.5 sm:px-3.5 py-1.5 rounded-full font-semibold text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={onOpenSignup}
                className="hidden sm:inline-flex bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-full font-semibold text-xs transition-colors border border-white/20 shadow-xs items-center gap-1 cursor-pointer active:scale-95 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE SLIDE-IN SIDEBAR DRAWER FROM RIGHT                      */}
      {/* ============================================================== */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            id="mobile-sidebar-backdrop"
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Drawer */}
          <aside
            id="mobile-right-sidebar"
            className="fixed inset-y-0 right-0 w-72 max-w-[85vw] bg-white text-slate-800 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Top / Header */}
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-white">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white leading-tight">NTechBay-Library</h3>
                    <p className="text-[10px] text-blue-100">by Nitish Khobragade</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Account / Profile Section */}
              {user ? (
                <div className="p-3 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-200 border border-blue-300 flex items-center justify-center shrink-0">
                      {userProfile?.photoBase64 ? (
                        <img
                          src={userProfile.photoBase64}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-blue-700" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : user.email}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block text-[9px] font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-sm uppercase mt-0.5">
                        {userProfile?.role || (isAdmin ? 'admin' : 'student')}
                      </span>
                    </div>
                  </div>

                  {/* Direct Sign Out chip inside user account card */}
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSidebarOpen(false);
                      await logout();
                      if (onGoHome) onGoHome();
                    }}
                    className="shrink-0 p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Exit</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-slate-700">Engineering Student Portal</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSidebarOpen(false);
                        onOpenSignup();
                      }}
                      className="w-full py-1.5 px-3 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sidebar Action Navigation Links */}
              <div className="p-2 space-y-1">
                {/* Home Page Link */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (onGoHome) onGoHome();
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-colors ${
                    currentView === 'home'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <span>Homepage</span>
                </button>

                {/* Course Library Link (hidden on homepage when user is not logged in) */}
                {onGoCourses && !(currentView === 'home' && !user) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      onGoCourses();
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-colors ${
                      currentView === 'courses'
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span>Course Library</span>
                  </button>
                )}

                {/* Notices & Broadcasts */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (onOpenNotices) onOpenNotices();
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span>Notices & Broadcasts</span>
                  </div>
                  {typeof noticeCount === 'number' && noticeCount > 0 ? (
                    <span className="bg-red-600 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                      {noticeCount}
                    </span>
                  ) : null}
                </button>

                {/* My Student Profile (if logged in) */}
                {user && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span>My Student Profile</span>
                  </button>
                )}

                {/* Contact Admin & Help */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onOpenContact();
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span>Contact Admin & Help</span>
                </button>

                {/* PROMINENT SIGN OUT BUTTON INSIDE MENU LIST */}
                {user && (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSidebarOpen(false);
                      await logout();
                      if (onGoHome) onGoHome();
                    }}
                    className="w-full px-3 py-2 mt-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-2.5 cursor-pointer transition-colors border border-rose-200/60"
                  >
                    <div className="w-6 h-6 rounded-md bg-rose-200 text-rose-700 flex items-center justify-center">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    <span>Sign Out (Logout)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar Bottom / Footer */}
            <div className="p-3 border-t border-slate-200">
              <div className="text-center text-[10px] text-slate-400">
                Created by Nitish Khobragade • NTechBay
              </div>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};


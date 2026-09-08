import React, { useState, useMemo, useEffect } from 'react';
import { CourseType, ResourceCategory, NoticeItem } from './types';
import {
  COURSE_SEMESTERS,
  COURSE_BRANCHES,
  isSemesterCommon,
  getResources,
  BRANCH_NAMES,
} from './data/mockResources';
import { Navbar } from './components/Navbar';
import { CourseSelector } from './components/CourseSelector';
import { FilterSection } from './components/FilterSection';
import { ResourceCard } from './components/ResourceCard';
import { ResourceModal } from './components/ResourceModal';
import { ContactModal } from './components/ContactModal';
import { QuickDriveModal } from './components/QuickDriveModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { NoticeBoard } from './components/NoticeBoard';
import { PromotionNoticeModal } from './components/PromotionNoticeModal';
import { PasswordGate } from './components/PasswordGate';
import { StudentHomePortal } from './components/StudentHomePortal';
import { LoginPage } from './pages/Auth/LoginPage';
import { SignupPage } from './pages/Auth/SignupPage';
import { StudentProfileModal } from './pages/Student/StudentProfileModal';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getAppSettings } from './data/linkStore';
import { b2a } from './utils/codec';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import {
  FolderOpen,
  Mail,
  MessageCircle,
  ShieldCheck,
  Bell,
  Linkedin,
  Github,
  Instagram,
  Globe,
  Sparkles,
  User,
  Phone,
  LogOut,
  ArrowLeft,
} from 'lucide-react';

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'Syllabus',
  'Study Books',
  'Notes',
  'Questions',
  'Videos',
  'Previous Year Papers',
];

// Auto-lock timeout: 5 minutes (300,000 ms)
const AUTO_LOCK_DURATION_MS = 5 * 60 * 1000;

function LibraryApp() {
  const { user, userProfile, isAdmin, logout } = useAuth();

  // 1. Password security state (Always locked on fresh page load if guest)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  // App settings & data revision counter for instant admin link reflection
  const [dataVersion, setDataVersion] = useState<number>(0);
  const appSettings = useMemo(() => getAppSettings(), [dataVersion]);

  const [activePassword, setActivePassword] = useState<string>(() => {
    try {
      return getAppSettings().studentPassword || localStorage.getItem('ntechbay_password') || 'nitishkhobragade';
    } catch {
      return 'nitishkhobragade';
    }
  });

  // Course & Semester Filter States (defaulting to B.Tech, Semester 4, CIVIL)
  const [selectedCourse, setSelectedCourse] = useState<CourseType>('B.Tech');
  const [selectedSemester, setSelectedSemester] = useState<string>('Semester 4');
  const [selectedBranch, setSelectedBranch] = useState<string>('CIVIL');

  // Modals & Navigation Views
  const [currentView, setCurrentView] = useState<'home' | 'courses'>('home');
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | null>(null);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [isQuickDriveOpen, setIsQuickDriveOpen] = useState<boolean>(false);
  const [isAdminPanelModalOpen, setIsAdminPanelModalOpen] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'login' | 'signup' | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAdminDashboardView, setIsAdminDashboardView] = useState<boolean>(false);

  // Notices & Promotional Broadcast State
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isPromotionNoticeOpen, setIsPromotionNoticeOpen] = useState<boolean>(false);

  // Real-time listener for notices from Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'notices'), where('active', '==', true));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: NoticeItem[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<NoticeItem, 'id'>),
          }));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setNotices(list);
        },
        (err) => {
          console.warn('Notice listener error:', err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to listen to notices:', err);
    }
  }, []);

  // Handler for opening profile
  const handleOpenProfile = () => {
    setIsProfileOpen(true);
  };

  // When user is authenticated with Firebase, they are automatically granted unlocked library access
  useEffect(() => {
    if (user) {
      setIsUnlocked(true);
    }
  }, [user]);

  const handleUnlock = () => {
    setIsUnlocked(true);
    setCurrentView('courses');
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setCurrentView('home');
    try {
      sessionStorage.removeItem('ntechbay_unlocked');
    } catch {}
  };

  // 2. Auto-lock when inactive for 5 minutes or more
  useEffect(() => {
    if (!isUnlocked) return;

    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        // If guest, lock the screen. If logged-in user, keep them protected.
        setIsUnlocked(false);
      }, AUTO_LOCK_DURATION_MS);
    };

    // Start 5-minute countdown immediately upon unlock
    resetTimer();

    // Reset countdown on any active user interaction
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    return () => {
      if (timer) clearTimeout(timer);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [isUnlocked]);

  const handleUpdatePassword = (newPassword: string) => {
    setActivePassword(newPassword);
    try {
      localStorage.setItem('ntechbay_password', newPassword);
    } catch {}
    setDataVersion((v) => v + 1);
  };

  // Semesters & Branches available for the currently selected course
  const currentSemesters = useMemo(
    () => COURSE_SEMESTERS[selectedCourse] || [],
    [selectedCourse]
  );
  const currentBranches = useMemo(
    () => COURSE_BRANCHES[selectedCourse] || [],
    [selectedCourse]
  );

  // 1st & 2nd sem are ONLY common for B.Tech and Polytechnic.
  const isBranchDisabled = useMemo(() => {
    if (selectedCourse === 'B.Tech' || selectedCourse === 'Polytechnic') {
      return isSemesterCommon(selectedCourse, selectedSemester);
    }
    if (selectedCourse === 'MBA') {
      return true; // MBA does not have engineering branches
    }
    return false; // M.Tech always has active branch selection in all semesters
  }, [selectedCourse, selectedSemester]);

  const showEngineeringCommonNotice = useMemo(() => {
    return (selectedCourse === 'B.Tech' || selectedCourse === 'Polytechnic') && isBranchDisabled;
  }, [selectedCourse, isBranchDisabled]);

  const branchDisabledReason = useMemo(() => {
    if (selectedCourse === 'MBA') {
      return 'General MBA Curriculum (All Semesters)';
    }
    if (selectedCourse === 'B.Tech' || selectedCourse === 'Polytechnic') {
      return 'Common for all branches (Semesters 1 & 2)';
    }
    return '';
  }, [selectedCourse]);

  // Handle course category changes safely
  const handleCourseChange = (newCourse: CourseType) => {
    setSelectedCourse(newCourse);

    const validSemesters = COURSE_SEMESTERS[newCourse] || [];
    let nextSem = selectedSemester;
    if (!validSemesters.includes(selectedSemester)) {
      nextSem = validSemesters.includes('Semester 4')
        ? 'Semester 4'
        : validSemesters[0] || 'Semester 1';
      setSelectedSemester(nextSem);
    }

    const validBranches = COURSE_BRANCHES[newCourse] || [];
    if (validBranches.length > 0) {
      const branchExists = validBranches.some((b) => b.code === selectedBranch);
      if (!branchExists) {
        setSelectedBranch(validBranches[0].code);
      }
    }
  };

  // Handle semester changes: adjust branch if moving between common & branch-specific
  const handleSemesterChange = (newSemester: string) => {
    setSelectedSemester(newSemester);
    if (currentBranches.length > 0) {
      const branchExists = currentBranches.some((b) => b.code === selectedBranch);
      if (!branchExists) {
        setSelectedBranch(currentBranches[0].code);
      }
    }
  };

  // Resources currently available for the selected course, semester, and branch
  const allCurrentResources = useMemo(() => {
    return getResources(selectedCourse, selectedSemester, selectedBranch);
  }, [selectedCourse, selectedSemester, selectedBranch, dataVersion]);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<ResourceCategory, number> = {
      Syllabus: 0,
      'Study Books': 0,
      Notes: 0,
      Questions: 0,
      Videos: 0,
      'Previous Year Papers': 0,
    };

    allCurrentResources.forEach((r) => {
      if (counts[r.category] !== undefined) {
        counts[r.category]++;
      }
    });

    return counts;
  }, [allCurrentResources]);

  // Active category resources for modal
  const activeCategoryResources = useMemo(() => {
    if (!activeCategory) return [];
    return allCurrentResources.filter((r) => r.category === activeCategory);
  }, [allCurrentResources, activeCategory]);

  // Direct open in Google Drive
  const handleDirectOpen = (category: ResourceCategory) => {
    const resource = allCurrentResources.find((r) => r.category === category);
    if (resource && resource.encodedLink) {
      const decodedUrl = b2a(resource.encodedLink);
      window.open(decodedUrl, '_blank', 'noopener,noreferrer');
    } else {
      setActiveCategory(category);
    }
  };

  const branchDisplayName = useMemo(() => {
    if (selectedCourse === 'MBA') {
      return 'General Management';
    }
    if ((selectedCourse === 'B.Tech' || selectedCourse === 'Polytechnic') && isBranchDisabled) {
      return 'Common (Sem 1 & 2)';
    }
    return BRANCH_NAMES[selectedBranch] || selectedBranch;
  }, [selectedCourse, isBranchDisabled, selectedBranch]);

  // Handle opening admin
  const handleOpenAdmin = () => {
    if (isAdmin) {
      setIsAdminDashboardView(true);
    } else if (!user) {
      // Prompt sign in for admin
      setAuthView('login');
    } else {
      // User is logged in as a student, no access
      alert('Administrator access requires master admin credentials (Er. Nitish Khobragade).');
    }
  };

  // If Admin Dashboard is active, render full dashboard
  if (isAdminDashboardView && isAdmin) {
    return (
      <AdminDashboard
        onBackToLibrary={() => setIsAdminDashboardView(false)}
        onOpenResourceLinkEditor={() => setIsAdminPanelModalOpen(true)}
      />
    );
  }

  // MANDATE: The "Admin" button must appear ONLY on the main public landing page/homepage header,
  // and must be completely hidden inside student dashboards and student profile pages.
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      {/* 1. Top Navigation Bar */}
      <Navbar
        isUnlocked={isUnlocked}
        onLock={handleLock}
        onOpenAdmin={handleOpenAdmin}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenLogin={() => setAuthView('login')}
        onOpenSignup={() => setAuthView('signup')}
        onOpenProfile={handleOpenProfile}
        onOpenNotices={() => setIsPromotionNoticeOpen(true)}
        noticeCount={notices.length}
        currentView={currentView}
        onGoHome={() => setCurrentView('home')}
        onGoCourses={() => setCurrentView('courses')}
      />

      {/* Main Content Router: Homepage by default on reload */}
      {currentView === 'home' ? (
        !user ? (
          <PasswordGate
            onUnlock={handleUnlock}
            onOpenContact={() => setIsContactOpen(true)}
            onOpenAdmin={handleOpenAdmin}
            currentPassword={appSettings.studentPassword}
            authView={authView}
            onSwitchAuthView={setAuthView}
          />
        ) : (
          <StudentHomePortal
            onEnterCourses={(course) => {
              if (course) setSelectedCourse(course);
              setCurrentView('courses');
            }}
            onOpenProfile={handleOpenProfile}
            onOpenContact={() => setIsContactOpen(true)}
            onOpenNotices={() => setIsPromotionNoticeOpen(true)}
            noticeCount={notices.length}
          />
        )
      ) : (
        /* Main Course Dashboard with Contact-style compact sizing */
        <main className="flex-1 w-full max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-2.5 sm:gap-3 items-center animate-fade-in">
          {/* Breadcrumb / Navigation back bar */}
          <div className="w-full flex items-center justify-between gap-2 pb-1 border-b border-slate-200/80">
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-blue-50 border border-blue-200/60 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 hidden xs:inline">
                {selectedCourse} Library
              </span>
              {user && (
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-rose-50 border border-rose-200/60 shadow-2xs"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>

          {/* Real-time Notice & Promotions Board from Cloud Firestore */}
          <NoticeBoard />

          {/* Legacy Admin Broadcast Announcement Notice Banner (If enabled) */}
          {appSettings.isAnnouncementEnabled && appSettings.announcementText && (
            <section className="w-full">
              <div className="w-full bg-amber-50 border border-amber-300/80 rounded-xl p-2.5 sm:px-3 sm:py-2 flex items-center gap-2 text-amber-900 text-xs font-medium shadow-2xs">
                <span className="p-1 bg-amber-200 text-amber-800 rounded-lg shrink-0">
                  <Bell className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1">{appSettings.announcementText}</span>
              </div>
            </section>
          )}

          {/* Course Category Selector */}
          <section className="w-full">
            <CourseSelector
              selectedCourse={selectedCourse}
              onSelectCourse={handleCourseChange}
            />
          </section>

          {/* Dropdown Filter Section */}
          <section className="w-full">
            <FilterSection
              semesters={currentSemesters}
              selectedSemester={selectedSemester}
              onSemesterChange={handleSemesterChange}
              branches={currentBranches}
              selectedBranch={selectedBranch}
              onBranchChange={setSelectedBranch}
              isBranchDisabled={isBranchDisabled}
              branchDisabledReason={branchDisabledReason}
              showEngineeringCommonNotice={showEngineeringCommonNotice}
            />
          </section>

          {/* Current Filter Status Banner */}
          <section className="w-full">
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span className="text-slate-500 font-medium">Viewing:</span>
                <strong className="text-slate-900 font-bold truncate">
                  {selectedCourse} • {selectedSemester} • {branchDisplayName}
                </strong>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200/60">
                  {allCurrentResources.length} Subjects Ready
                </span>
              </div>
            </div>
          </section>

          {/* 4. Resource Grid (2 Columns x 3 Rows) */}
          <section className="w-full">
            <div
              id="resource-grid"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full"
            >
              {RESOURCE_CATEGORIES.map((category) => (
                <ResourceCard
                  key={category}
                  category={category}
                  count={categoryCounts[category]}
                  onClick={() => setActiveCategory(category)}
                  onDirectOpen={() => handleDirectOpen(category)}
                />
              ))}
            </div>
          </section>
        </main>
      )}

      {/* Footer matching user's screenshot exactly */}
      <footer className="w-full bg-[#1b4393] text-white py-4 px-4 sm:px-6 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-center">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <p className="text-white/95">
              This website is created by{' '}
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="font-bold underline hover:text-blue-200 transition-colors cursor-pointer"
              >
                Nitish Khobragade
              </button>
            </p>

            {/* Contact functionality in bottom near contact text with small telephone icon */}
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer border border-white/25 active:scale-95"
              title="Contact Nitish Khobragade"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-300" />
              <span>Contact</span>
            </button>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-2.5">
            {/* LinkedIn */}
            <a
              href="https://in.linkedin.com/in/nitishkhobragade"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn: Nitish Khobragade"
              className="p-1.5 bg-white rounded-md text-[#0a66c2] hover:bg-blue-50 hover:scale-110 transition-all shadow-xs flex items-center justify-center cursor-pointer"
            >
              <Linkedin className="w-4 h-4" />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/nitishkhobragade/"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub: nitishkhobragade"
              className="p-1.5 bg-white rounded-md text-slate-900 hover:bg-slate-100 hover:scale-110 transition-all shadow-xs flex items-center justify-center cursor-pointer"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/nitish_khobragade"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram: @nitish_khobragade"
              className="p-1.5 bg-white rounded-md text-[#e4405f] hover:bg-pink-50 hover:scale-110 transition-all shadow-xs flex items-center justify-center cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* Portfolio */}
            <a
              href="https://nitishkhobragade.github.io/portfolio.nitish/"
              target="_blank"
              rel="noopener noreferrer"
              title="Official Portfolio: Nitish Khobragade"
              className="p-1.5 bg-white rounded-md text-indigo-600 hover:bg-indigo-50 hover:scale-110 transition-all shadow-xs flex items-center justify-center cursor-pointer"
            >
              <Globe className="w-4 h-4" />
            </a>

            {/* Gmail */}
            <a
              href="mailto:djnitish97@gmail.com"
              title="Email Nitish Khobragade (djnitish97@gmail.com)"
              className="p-1.5 bg-white rounded-md text-red-600 hover:bg-red-50 hover:scale-110 transition-all shadow-xs flex items-center justify-center cursor-pointer"
            >
              <Mail className="w-4 h-4" />
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/918982324497?text=Hello%20Admin%20Nitish%20Sir%2C%20I%20have%20contacted%20you%20from%20RGPV%20E%20Library%20Website%20Online"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="p-1.5 bg-emerald-600 rounded-md text-white hover:bg-emerald-500 hover:scale-110 transition-all shadow-xs flex items-center justify-center cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>

      {/* Auth Modals: Only if user is logged in and triggers auth explicitly */}
      {authView === 'login' && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <LoginPage
            onClose={() => setAuthView(null)}
            onSwitchToSignup={() => setAuthView('signup')}
            onSuccess={() => setAuthView(null)}
          />
        </div>
      )}

      {authView === 'signup' && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <SignupPage
            onClose={() => setAuthView(null)}
            onSwitchToLogin={() => setAuthView('login')}
            onSuccess={() => setAuthView(null)}
          />
        </div>
      )}

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Promotional Notice Broadcast Modal (auto-opens when profile opens and auto-closes in 3 to 4 seconds) */}
      <PromotionNoticeModal
        isOpen={isPromotionNoticeOpen}
        onClose={() => setIsPromotionNoticeOpen(false)}
        notices={notices}
        onOpenContact={() => setIsContactOpen(true)}
        autoCloseDurationMs={4000}
      />

      {/* Resource & Quick Drive Modals */}
      <ResourceModal
        isOpen={Boolean(activeCategory)}
        onClose={() => setActiveCategory(null)}
        category={activeCategory}
        course={selectedCourse}
        semester={selectedSemester}
        branch={
          selectedCourse === 'MBA'
            ? 'General Management'
            : (selectedCourse === 'B.Tech' || selectedCourse === 'Polytechnic') && isBranchDisabled
            ? 'Common'
            : selectedBranch
        }
        resources={activeCategoryResources}
      />

      <QuickDriveModal
        isOpen={isQuickDriveOpen}
        onClose={() => setIsQuickDriveOpen(false)}
        initialCourse={selectedCourse}
        initialSemester={selectedSemester}
        initialBranch={selectedBranch}
      />

      {/* Legacy Admin Links Config Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelModalOpen}
        onClose={() => setIsAdminPanelModalOpen(false)}
        onStudentPasswordUpdated={handleUpdatePassword}
        onDataChanged={() => setDataVersion((v) => v + 1)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LibraryApp />
    </AuthProvider>
  );
}

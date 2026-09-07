import React, { useState, useMemo, useEffect } from 'react';
import { CourseType, ResourceCategory } from './types';
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
import { PasswordGate } from './components/PasswordGate';
import { AdminPanelModal } from './components/AdminPanelModal';
import { getAppSettings } from './data/linkStore';
import { b2a } from './utils/codec';
import {
  FolderOpen,
  Mail,
  MessageCircle,
  ShieldCheck,
  Bell,
} from 'lucide-react';

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'Syllabus',
  'Study Books',
  'Notes',
  'Questions',
  'Videos',
  'Previous Year Papers',
];

export default function App() {
  // 1. Password security state (First page is password protected)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ntechbay_unlocked') === 'true';
    } catch {
      return false;
    }
  });

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

  // Modals
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | null>(null);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [isQuickDriveOpen, setIsQuickDriveOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  const handleUnlock = () => {
    setIsUnlocked(true);
    try {
      sessionStorage.setItem('ntechbay_unlocked', 'true');
    } catch {}
  };

  const handleLock = () => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem('ntechbay_unlocked');
    } catch {}
  };

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
  // For M.Tech: Semesters 1, 2, and 3 ALL have branch specialization (CSE, CTM, DCE, PRODUCTION) and are NEVER common.
  // For MBA: There are no branches; all 4 semesters are general management curriculum.
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

  // Count per category (0 or 1 Google Drive collection per category in courseData)
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

  // Direct open in Google Drive without displaying the raw link
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      {/* 1. Top Navigation Bar */}
      <Navbar
        isUnlocked={isUnlocked}
        onLock={handleLock}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Conditional Screen Rendering: First Page is Password Gate */}
      {!isUnlocked ? (
        <PasswordGate
          onUnlock={handleUnlock}
          onOpenContact={() => setIsContactOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          currentPassword={activePassword}
        />
      ) : (
        /* Main Course Dashboard (Unlocked State) */
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 items-center animate-fade-in">
          {/* Admin Broadcast Announcement Notice Banner (If enabled) */}
          {appSettings.isAnnouncementEnabled && appSettings.announcementText && (
            <section className="w-full max-w-4xl">
              <div className="w-full bg-amber-50 border border-amber-300/80 rounded-xl p-3 sm:px-4 sm:py-2.5 flex items-center gap-3 text-amber-900 text-xs sm:text-sm font-medium shadow-xs">
                <span className="p-1.5 bg-amber-200 text-amber-800 rounded-lg shrink-0">
                  <Bell className="w-4 h-4" />
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
          <section className="w-full max-w-2xl">
            <div className="bg-white border border-slate-200 rounded-full px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span className="text-slate-500 font-medium">Viewing:</span>
                <strong className="text-slate-900 font-semibold">
                  {selectedCourse} • {selectedSemester} • {branchDisplayName}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-50 text-blue-700 font-medium px-3 py-1 rounded-full border border-blue-200/60">
                  {allCurrentResources.length} Subjects Ready
                </span>
              </div>
            </div>
          </section>

          {/* 4. Resource Grid (2 Columns x 3 Rows) */}
          <section className="w-full max-w-4xl">
            <div
              id="resource-grid"
              className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full"
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

          {/* Quick Drive Folder Button */}
          <section className="w-full max-w-4xl flex items-center justify-center pt-2">
            <button
              type="button"
              onClick={() => setIsQuickDriveOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Quick Drive Folder Lookup</span>
            </button>
          </section>
        </main>
      )}

      {/* Floating Quick Drive Folder Button (Visible only when unlocked) */}
      {isUnlocked && (
        <button
          id="floating-quick-drive-btn"
          type="button"
          onClick={() => setIsQuickDriveOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 font-medium text-sm transition-all hover:scale-105 cursor-pointer border border-blue-400/40"
        >
          <FolderOpen className="w-4 h-4" />
          <span>📂 Quick Drive</span>
        </button>
      )}

      {/* Footer matching user's screenshot exactly */}
      <footer className="w-full bg-[#1b4393] text-white py-4 px-4 sm:px-6 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-center">
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

          <div className="flex items-center gap-3">
            {/* Red Gmail icon matching user screenshot */}
            <a
              href="mailto:djnitish97@gmail.com"
              title="Email Nitish Khobragade (djnitish97@gmail.com)"
              className="p-1.5 bg-white rounded-md text-red-600 hover:bg-red-50 hover:scale-110 transition-all shadow-xs flex items-center justify-center"
            >
              <Mail className="w-4 h-4" />
            </a>

            {/* Green WhatsApp icon matching user screenshot */}
            <a
              href="https://wa.me/?text=Hello%20Nitish,%20I%20need%20assistance%20with%20NTechBay%20Library"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp Nitish Khobragade"
              className="p-1.5 bg-emerald-600 rounded-md text-white hover:bg-emerald-500 hover:scale-110 transition-all shadow-xs flex items-center justify-center"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            {/* Admin Panel button */}
            <button
              id="footer-admin-btn"
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="p-1.5 bg-white/10 hover:bg-white/25 rounded-md text-amber-300 hover:scale-110 transition-all shadow-xs flex items-center justify-center cursor-pointer ml-1"
              title="Admin Panel & Course Links Manager"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
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

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
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

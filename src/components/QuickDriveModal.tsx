import React, { useState, useEffect } from 'react';
import {
  X,
  FolderOpen,
  ExternalLink,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { CourseType } from '../types';
import { courseData, CourseDataCategoryMap } from '../data/courseData';
import { COURSE_KEY_MAP, BRANCH_NAMES } from '../data/mockResources';
import { b2a } from '../utils/codec';
import { getCustomLinks, makeLinkKey } from '../data/linkStore';

interface QuickDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: CourseType;
  initialSemester?: string;
  initialBranch?: string;
}

export const QuickDriveModal: React.FC<QuickDriveModalProps> = ({
  isOpen,
  onClose,
  initialCourse = 'B.Tech',
  initialSemester = 'Semester 4',
  initialBranch = 'CIVIL',
}) => {
  const [course, setCourse] = useState<CourseType>(initialCourse);
  const [semester, setSemester] = useState<string>(initialSemester);
  const [branch, setBranch] = useState<string>(initialBranch);
  const [categoryKey, setCategoryKey] = useState<keyof CourseDataCategoryMap>('syllabus');

  // Sync with initial props when opened
  useEffect(() => {
    if (isOpen) {
      setCourse(initialCourse);
      setSemester(initialSemester);
      setBranch(initialBranch);
    }
  }, [isOpen, initialCourse, initialSemester, initialBranch]);

  if (!isOpen) return null;

  const courseKey = COURSE_KEY_MAP[course];
  const courseConfig = courseData[courseKey];

  const totalSemesters = courseConfig ? courseConfig.semesters : 8;
  const semesterOptions = Array.from({ length: totalSemesters }, (_, i) => `Semester ${i + 1}`);

  const semNum = parseInt(semester.replace(/\D/g, ''), 10) || 1;
  const isBTechOrPolyCommon =
    (course === 'B.Tech' || course === 'Polytechnic') &&
    (courseConfig ? courseConfig.common.includes(semNum) : false);
  const isMBA = course === 'MBA';

  const availableBranches = courseConfig ? courseConfig.branches : [];

  // Get active link from courseData or custom overrides
  let encodedLink = '';
  const customLinks = getCustomLinks();
  const effectiveBranch = (isBTechOrPolyCommon || isMBA) ? 'common' : branch;
  const customKey = makeLinkKey(courseKey, semNum, effectiveBranch, categoryKey);

  if (customLinks[customKey]) {
    encodedLink = customLinks[customKey];
  } else if (courseConfig && courseConfig.data[semNum]) {
    const semData = courseConfig.data[semNum];
    if (isBTechOrPolyCommon || isMBA) {
      encodedLink = semData.common?.[categoryKey] || '';
    } else {
      encodedLink = semData[branch]?.[categoryKey] || '';
    }
  }

  const handleOpenFolder = () => {
    if (!encodedLink) return;
    const targetUrl = b2a(encodedLink);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const CATEGORY_NAMES: Record<keyof CourseDataCategoryMap, string> = {
    syllabus: 'Official Syllabus Scheme',
    books: 'Recommended Study Books',
    notes: 'Handwritten Subject Notes',
    questions: 'University Question Bank',
    videos: 'Curated Video Lectures',
    papers: 'Previous Year Exam Papers',
  };

  return (
    <div
      id="quick-drive-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="quick-drive-modal-container"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Quick Drive Folder Lookup
              </h3>
              <p className="text-xs text-blue-100">
                Direct access to university subject archives
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-sm">
          {/* Course select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Course
            </label>
            <select
              value={course}
              onChange={(e) => {
                const nextCourse = e.target.value as CourseType;
                setCourse(nextCourse);
                const nextKey = COURSE_KEY_MAP[nextCourse];
                const nextConfig = courseData[nextKey];
                const nextBranches = nextConfig.branches;
                if (nextBranches.length > 0 && !nextBranches.includes(branch)) {
                  setBranch(nextBranches[0]);
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
            >
              <option value="B.Tech">B.Tech</option>
              <option value="Polytechnic">Polytechnic</option>
              <option value="MBA">MBA</option>
              <option value="M.Tech">M.Tech</option>
            </select>
          </div>

          {/* Semester select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
            >
              {semesterOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Branch select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Branch / Stream
            </label>
            {isBTechOrPolyCommon ? (
              <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 text-xs flex items-center justify-between">
                <span>Common curriculum for all branches (Semesters 1 & 2)</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ) : isMBA ? (
              <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 text-xs flex items-center justify-between">
                <span>General MBA Curriculum (All Semesters)</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded">All Specializations</span>
              </div>
            ) : availableBranches.length > 0 ? (
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                {availableBranches.map((b) => (
                  <option key={b} value={b}>
                    {BRANCH_NAMES[b] || b}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 text-xs">
                General Curriculum for all students
              </div>
            )}
          </div>

          {/* Resource select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resource Category
            </label>
            <select
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value as keyof CourseDataCategoryMap)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
            >
              <option value="syllabus">Syllabus</option>
              <option value="books">Study Books</option>
              <option value="notes">Notes</option>
              <option value="questions">Questions</option>
              <option value="videos">Videos</option>
              <option value="papers">Previous Year Papers</option>
            </select>
          </div>

          {/* Status Box: Clean confirmation without revealing raw link URL */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Target Resource:</span>
              <span className="text-xs font-semibold text-blue-700">
                {CATEGORY_NAMES[categoryKey]}
              </span>
            </div>
            {encodedLink ? (
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Google Drive cloud folder ready to open</span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic pt-1">
                Resource currently updating for this selection.
              </div>
            )}
          </div>

          {/* Action Button: Opens Google Drive on Click without writing the raw link URL on page */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenFolder}
              disabled={!encodedLink}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in Google Drive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

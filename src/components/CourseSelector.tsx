import React, { useState, useRef, useEffect } from 'react';
import { CourseType } from '../types';
import { COURSES } from '../data/mockResources';
import { GraduationCap, ChevronDown, Check, Sparkles, BookOpen, Award, Briefcase } from 'lucide-react';

interface CourseSelectorProps {
  selectedCourse: CourseType;
  onSelectCourse: (course: CourseType) => void;
}

const COURSE_META: Record<
  CourseType,
  { fullName: string; duration: string; icon: React.ReactNode; color: string; badge: string }
> = {
  'B.Tech': {
    fullName: 'Bachelor of Technology',
    duration: '8 Semesters • 4 Years',
    icon: <GraduationCap className="w-4 h-4 text-blue-600" />,
    color: 'from-blue-600 to-indigo-600',
    badge: 'Undergraduate',
  },
  Polytechnic: {
    fullName: 'Diploma in Engineering',
    duration: '6 Semesters • 3 Years',
    icon: <BookOpen className="w-4 h-4 text-amber-600" />,
    color: 'from-amber-500 to-orange-600',
    badge: 'Diploma',
  },
  MBA: {
    fullName: 'Master of Business Admin',
    duration: '4 Semesters • 2 Years',
    icon: <Briefcase className="w-4 h-4 text-emerald-600" />,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Management',
  },
  'M.Tech': {
    fullName: 'Master of Technology',
    duration: '4 Semesters • 2 Years',
    icon: <Award className="w-4 h-4 text-purple-600" />,
    color: 'from-purple-600 to-indigo-600',
    badge: 'Postgraduate',
  },
};

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  selectedCourse,
  onSelectCourse,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeMeta = COURSE_META[selectedCourse] || COURSE_META['B.Tech'];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="relative w-full max-w-md" ref={dropdownRef}>
        {/* Sleek Impressive "Select Course" Trigger */}
        <div className="flex items-center gap-1.5">
          <button
            id="course-selector-trigger"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-blue-300 rounded-xl p-2 sm:p-2.5 shadow-2xs transition-all flex items-center justify-between gap-2.5 cursor-pointer group"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            {/* Left: Icon & Label */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>

              <div className="text-left min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Selected Course
                  </span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 hidden xs:inline">
                    {activeMeta.badge}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight truncate">
                    {selectedCourse}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate hidden sm:inline">
                    • {activeMeta.fullName}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Change button & Chevron */}
            <div className="flex items-center gap-1 shrink-0 pl-1">
              <span className="text-[11px] font-bold text-blue-600 group-hover:text-blue-700 hidden xs:inline">
                Change
              </span>
              <div
                className={`w-6 h-6 rounded-md bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-transform duration-200 ${
                  isOpen ? 'rotate-180 bg-blue-100 text-blue-700' : ''
                }`}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>

        {/* Impressive Dropdown Popover */}
        {isOpen && (
          <div
            id="course-dropdown-menu"
            role="listbox"
            className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 p-1.5 z-40 animate-fadeIn space-y-1"
          >
            <div className="px-2.5 py-1 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-bold uppercase tracking-wider">Choose Engineering Stream</span>
              <span className="flex items-center gap-1 text-blue-600 font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>RGPV Bhopal</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {COURSES.map((course) => {
                const isSelected = selectedCourse === course;
                const meta = COURSE_META[course];

                return (
                  <button
                    key={course}
                    id={`select-course-option-${course.toLowerCase().replace('.', '')}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectCourse(course);
                      setIsOpen(false);
                    }}
                    className={`w-full p-2 rounded-lg text-left transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500/70 shadow-2xs ring-1 ring-blue-500/30'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {meta.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-blue-900' : 'text-slate-800'
                            }`}
                          >
                            {course}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400">
                            ({meta.badge})
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate leading-tight">
                          {meta.duration}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


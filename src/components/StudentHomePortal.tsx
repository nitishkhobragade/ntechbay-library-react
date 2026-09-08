import React from 'react';
import {
  BookOpen,
  User,
  LogOut,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  FolderGit2,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CourseType } from '../types';

interface StudentHomePortalProps {
  onEnterCourses: (course?: CourseType) => void;
  onOpenProfile: () => void;
  onOpenContact: () => void;
  onOpenNotices: () => void;
  noticeCount?: number;
}

const COURSES_INFO: Array<{
  id: CourseType;
  title: string;
  badge: string;
  desc: string;
  color: string;
}> = [
  {
    id: 'B.Tech',
    title: 'Bachelor of Technology',
    badge: '4 Years • 8 Semesters',
    desc: 'Civil, CSE, Mechanical, EC, EE, IT & EX engineering notes & syllabus.',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'Polytechnic',
    title: 'Diploma Engineering',
    badge: '3 Years • 6 Semesters',
    desc: 'Civil, Mechanical, Electrical & CS polytechnic question banks & guides.',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'MBA',
    title: 'Management Studies',
    badge: '2 Years • 4 Semesters',
    desc: 'Business management, finance, marketing and human resources resources.',
    color: 'from-amber-600 to-orange-600',
  },
  {
    id: 'M.Tech',
    title: 'Master of Technology',
    badge: '2 Years • 4 Semesters',
    desc: 'Advanced software systems, structural engineering, VLSI & power systems.',
    color: 'from-purple-600 to-pink-600',
  },
];

export const StudentHomePortal: React.FC<StudentHomePortalProps> = ({
  onEnterCourses,
  onOpenProfile,
  onOpenContact,
  onOpenNotices,
  noticeCount = 0,
}) => {
  const { user, userProfile, isAdmin, logout } = useAuth();

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-4 sm:py-6 animate-fade-in">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-3 sm:gap-3.5">
        {/* Top Student Welcome Card - Sized like ContactModal */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header Strip */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 py-3 sm:py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
                {userProfile?.photoBase64 ? (
                  <img
                    src={userProfile.photoBase64}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <GraduationCap className="w-5 h-5 text-amber-300" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200">
                    Student Portal
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                    Active
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  Welcome back, {userProfile?.firstName || 'Student'}!
                </h2>
              </div>
            </div>

            {/* Direct Logout on Homepage Welcome Header */}
            <button
              type="button"
              onClick={logout}
              className="px-2.5 py-1 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-rose-300/40 shadow-2xs"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sign Out</span>
            </button>
          </div>

          {/* Body with Student Info & Primary Actions */}
          <div className="p-3.5 sm:p-4 flex flex-col gap-3">
            {/* Student metadata row */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 font-medium">Logged in account:</p>
                <p className="font-bold text-slate-800 truncate">{user?.email}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                  {userProfile?.course || 'B.Tech'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {userProfile?.branch || 'General Engineering'}
                </span>
                {userProfile?.college && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[140px]">
                    {userProfile.college}
                  </span>
                )}
              </div>
            </div>

            {/* PRIMARY HERO BUTTON: Enter Course Library */}
            <button
              type="button"
              onClick={() => onEnterCourses()}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group active:scale-[0.99]"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Enter Course Library & Browse Notes</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={onOpenProfile}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                onClick={onOpenNotices}
                className="relative p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>Notices</span>
                {noticeCount > 0 && (
                  <span className="ml-1 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {noticeCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenContact}
                className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contact Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stream Jump Cards */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Available Engineering Streams
            </h3>
            <span className="text-[10px] text-blue-600 font-semibold">Select to open</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COURSES_INFO.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => onEnterCourses(course.id)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 text-left transition-all cursor-pointer group flex items-start gap-2.5"
              >
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${course.color} text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700 truncate">
                      {course.id}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.2 rounded-sm shrink-0">
                      {course.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 leading-tight">
                    {course.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Sign Out Strip */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <span>Need to switch account?</span>
          <button
            type="button"
            onClick={logout}
            className="text-rose-600 hover:text-rose-700 font-bold underline transition-colors cursor-pointer flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

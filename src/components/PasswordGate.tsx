import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  Cpu,
  GraduationCap,
  ShieldCheck,
  LogIn,
  UserPlus,
  BookOpen,
  FileText,
  Video,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface PasswordGateProps {
  onUnlock: () => void;
  onOpenContact: () => void;
  onOpenAdmin?: () => void;
  authView?: 'login' | 'signup' | null;
  onSwitchAuthView?: (view: 'login' | 'signup' | null) => void;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
  onExploreCourses?: () => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({
  onUnlock,
  onOpenContact,
  onOpenAdmin,
  authView,
  onSwitchAuthView,
  onOpenLogin,
  onOpenSignup,
  onExploreCourses,
}) => {
  // Parallax & floating animation states
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [rafOffset, setRafOffset] = useState({
    logo1: { x: 0, y: 0, r: 0 },
    logo2: { x: 0, y: 0, r: 0 },
    logo3: { x: 0, y: 0, r: 0 },
    books: { x: 0, y: 0, r: 0 },
    gears: { r: 0, x: 0, y: 0 },
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Mouse Parallax Tracker
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized coordinates from -1 to 1
      const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

      setMouseOffset({ x: normX, y: normY });
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Continuous Harmonic Floating Loop
  useEffect(() => {
    const loop = () => {
      const t = (Date.now() - startTimeRef.current) / 1000;

      const books_x = Math.sin(t * 0.75) * 55 + Math.cos(t * 0.35) * 25;
      const books_y = Math.cos(t * 0.6) * 35 + Math.sin(t * 0.25) * 20;
      const books_r = Math.sin(t * 0.5) * 4;

      const l1_x = Math.cos(t * 0.55) * 40 + Math.sin(t * 0.2) * 20;
      const l1_y = Math.sin(t * 0.65 + 1.0) * 50 + Math.cos(t * 0.3) * 20;
      const l1_r = Math.sin(t * 0.4) * 3;

      const l2_x = Math.sin(t * 0.5 + 2.0) * 45 + Math.cos(t * 0.3) * -20;
      const l2_y = Math.cos(t * 0.6 + 1.2) * 50 + Math.sin(t * 0.25) * 20;
      const l2_r = Math.cos(t * 0.45) * -3;

      const l3_x = Math.cos(t * 0.45 + 3.0) * 35 + Math.sin(t * 0.2) * 15;
      const l3_y = Math.sin(t * 0.5 + 2.5) * 40 + Math.cos(t * 0.35) * -20;
      const l3_r = Math.sin(t * 0.35) * 2.5;

      const gearRot = (t * 14) % 360;
      const gear_x = Math.sin(t * 0.4 + 1.5) * 30;
      const gear_y = Math.cos(t * 0.45 + 0.8) * 25;

      setRafOffset({
        logo1: { x: l1_x, y: l1_y, r: l1_r },
        logo2: { x: l2_x, y: l2_y, r: l2_r },
        logo3: { x: l3_x, y: l3_y, r: l3_r },
        books: { x: books_x, y: books_y, r: books_r },
        gears: { r: gearRot, x: gear_x, y: gear_y },
      });

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const handleTriggerLogin = () => {
    if (onSwitchAuthView) {
      onSwitchAuthView('login');
    } else if (onOpenLogin) {
      onOpenLogin();
    }
  };

  const handleTriggerSignup = () => {
    if (onSwitchAuthView) {
      onSwitchAuthView('signup');
    } else if (onOpenSignup) {
      onOpenSignup();
    }
  };

  const handleTriggerExplore = () => {
    if (onExploreCourses) {
      onExploreCourses();
    } else {
      onUnlock();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-1 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#1b4393] via-[#15397d] to-[#0d2657] text-white select-none px-3 sm:px-4 py-2 sm:py-3.5"
    >
      {/* ============================================================== */}
      {/* 🌟 BACKGROUND GRAPHICS LAYER                                    */}
      {/* ============================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Radial Lighting Spotlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Rotating Engineering Gears Blueprint Grid */}
        <div
          className="absolute -left-20 top-1/4 w-[420px] h-[420px] rounded-full border-4 border-dashed border-white/10 opacity-30 will-change-transform"
          style={{
            transform: `rotate(${rafOffset.gears.r}deg) translate(${mouseOffset.x * -12 + rafOffset.gears.x}px, ${mouseOffset.y * -12 + rafOffset.gears.y}px)`,
          }}
        />
        <div
          className="absolute -right-24 bottom-12 w-[420px] h-[420px] rounded-full border-4 border-dashed border-white/10 opacity-30 will-change-transform"
          style={{
            transform: `rotate(-${rafOffset.gears.r * 0.8}deg) translate(${mouseOffset.x * 12 - rafOffset.gears.x}px, ${mouseOffset.y * 12 - rafOffset.gears.y}px)`,
          }}
        />

        {/* FLOATING BADGE 1: Civil & Infra */}
        <div
          className="absolute left-3 sm:left-10 top-3 sm:top-5 pointer-events-none opacity-40 sm:opacity-75 hidden sm:block will-change-transform z-0"
          style={{
            transform: `translate3d(${rafOffset.logo1.x + mouseOffset.x * -18}px, ${rafOffset.logo1.y + mouseOffset.y * 14}px, 0) rotate(${rafOffset.logo1.r}deg)`,
          }}
        >
          <div className="p-1.5 sm:p-2 bg-slate-900/60 backdrop-blur-md rounded-xl border border-amber-400/30 shadow-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-lg text-lg">
              🏗️
            </div>
            <div className="text-left pr-1">
              <span className="text-[10.5px] font-extrabold text-amber-300 tracking-wider uppercase">Civil & Infra</span>
              <p className="text-[9.5px] text-blue-100/90 font-medium">B.Tech • Polytechnic</p>
            </div>
          </div>
        </div>

        {/* FLOATING BADGE 2: CS & IT Rig */}
        <div
          className="absolute left-3 sm:left-10 bottom-2 sm:bottom-4 pointer-events-none opacity-40 sm:opacity-75 hidden sm:block will-change-transform z-0"
          style={{
            transform: `translate3d(${rafOffset.logo2.x + mouseOffset.x * -15}px, ${rafOffset.logo2.y + mouseOffset.y * -16}px, 0) rotate(${rafOffset.logo2.r}deg)`,
          }}
        >
          <div className="p-1.5 sm:p-2 bg-slate-900/60 backdrop-blur-md rounded-xl border border-cyan-400/30 shadow-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-400 flex items-center justify-center text-white font-black shadow-lg text-lg">
              🖥️
            </div>
            <div className="text-left pr-1">
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] font-extrabold text-cyan-300 tracking-wider uppercase">CS & IT Rig</span>
                <Cpu className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
              </div>
              <p className="text-[9.5px] text-blue-100/90 font-medium">Algorithms • AI & ML</p>
            </div>
          </div>
        </div>

        {/* FLOATING BADGE 3: RGPV Official Seal */}
        <div
          className="absolute right-3 sm:right-10 top-3 sm:top-5 pointer-events-none opacity-40 sm:opacity-75 hidden sm:block will-change-transform z-0"
          style={{
            transform: `translate3d(${rafOffset.logo3.x + mouseOffset.x * 18}px, ${rafOffset.logo3.y + mouseOffset.y * -14}px, 0) rotate(${rafOffset.logo3.r}deg)`,
          }}
        >
          <div className="p-1.5 sm:p-2 bg-gradient-to-b from-red-950/60 to-slate-900/60 backdrop-blur-md rounded-xl border-2 border-red-400/35 shadow-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-red-400 p-0.5 bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center shadow-md relative overflow-hidden">
              <div className="w-full h-full rounded-full border border-red-200/60 flex flex-col items-center justify-center text-center leading-none text-white select-none">
                <span className="text-[4.5px] font-bold uppercase text-red-200">राजीव गांधी</span>
                <span className="text-[7.5px] font-black tracking-wider text-amber-200">RGPV</span>
                <span className="text-[4.5px] font-semibold text-red-100">BHOPAL</span>
              </div>
            </div>
            <div className="text-left pr-1">
              <span className="text-[10.5px] font-black text-red-300 uppercase tracking-wide">RGPV University</span>
              <p className="text-[9.5px] text-red-100/90 font-medium">Madhya Pradesh, India</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🚀 MODERN BILINGUAL HERO SECTION (Compact view-filling layout)  */}
      {/* ============================================================== */}
      <div
        id="hero-content-container"
        className="relative z-20 w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-2 sm:space-y-2.5"
        style={{
          transform: `translate3d(${mouseOffset.x * 3}px, ${mouseOffset.y * 3}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* University Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 backdrop-blur-md rounded-full border border-white/25 shadow-2xs">
          <GraduationCap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide">
            🏛️ RGPV University Bhopal (राजीव गांधी प्रौद्योगिकी विश्वविद्यालय)
          </span>
        </div>

        {/* Main Bilingual Headings */}
        <div className="space-y-0.5 max-w-3xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-black text-white tracking-tight leading-tight drop-shadow-md">
            RGPV Engineering Student E-Library
          </h1>
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-amber-300 tracking-normal drop-shadow-2xs">
            आरजीपीवी इंजीनियरिंग छात्र ई-लाइब्रेरी एवं डिजिटल अध्ययन पोर्टल
          </h2>
        </div>

        {/* Bilingual Lead Paragraphs */}
        <div className="space-y-0.5 max-w-xl text-blue-100 text-[11px] sm:text-xs leading-relaxed">
          <p>
            Academic resource portal created by <strong className="text-white font-bold">Er. Nitish Khobragade (NK)</strong> for B.Tech, Polytechnic, MBA & M.Tech students. Access official grading syllabus, PYQs, faculty lecture notes & video tutorials.
          </p>
          <p className="text-amber-200/90 text-[10px] sm:text-[11px] font-medium hidden sm:block">
            सभी सेमेस्टरों का आधिकारिक सिलेबस, विगत 10 वर्षों के प्रश्न पत्र (PYQ), टॉपर्स नोट्स एवं वीडियो लेक्चर्स।
          </p>
        </div>

        {/* CLEAR CALL-TO-ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 pt-0.5">
          {/* Primary CTA: Student Login */}
          <button
            id="hero-student-login-cta"
            type="button"
            onClick={handleTriggerLogin}
            className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-900/50 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-blue-400/40"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-300" />
            <span>Student Sign In (छात्र लॉगिन)</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/80" />
          </button>

          {/* Secondary CTA: New Student Registration */}
          <button
            id="hero-student-register-cta"
            type="button"
            onClick={handleTriggerSignup}
            className="px-4 sm:px-5 py-1.5 sm:py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-black shadow-md shadow-black/25 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-950" />
            <span>New Student Register (नया पंजीकरण)</span>
          </button>

          {/* Tertiary CTA: Explore Courses */}
          <button
            id="hero-explore-courses-cta"
            type="button"
            onClick={handleTriggerExplore}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-lg text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
            <span>Browse Courses (पाठ्यक्रम देखें)</span>
          </button>
        </div>

        {/* 4 BILINGUAL ACADEMIC PILLARS / HIGHLIGHTS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 w-full pt-1 sm:pt-1.5 text-left">
          {/* Pillar 1 */}
          <div className="p-2 sm:p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 shadow-2xs space-y-0.5">
            <div className="w-6 h-6 rounded-md bg-blue-500/30 flex items-center justify-center text-blue-300">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white leading-tight">Syllabus & Books</h3>
            <p className="text-[10px] text-amber-300 font-medium leading-none">पाठ्यक्रम एवं पुस्तकें</p>
            <p className="text-[9.5px] text-blue-100/80 leading-snug">
              Official RGPV grading scheme and standard reference textbooks.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-2 sm:p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 shadow-2xs space-y-0.5">
            <div className="w-6 h-6 rounded-md bg-emerald-500/30 flex items-center justify-center text-emerald-300">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white leading-tight">Previous Year Papers</h3>
            <p className="text-[10px] text-amber-300 font-medium leading-none">विगत वर्षों के प्रश्न पत्र (PYQ)</p>
            <p className="text-[9.5px] text-blue-100/80 leading-snug">
              10+ years solved and unsolved exam question archives.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-2 sm:p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 shadow-2xs space-y-0.5">
            <div className="w-6 h-6 rounded-md bg-purple-500/30 flex items-center justify-center text-purple-300">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white leading-tight">Lecture Notes</h3>
            <p className="text-[10px] text-amber-300 font-medium leading-none">हस्तलिखित नोट्स</p>
            <p className="text-[9.5px] text-blue-100/80 leading-snug">
              Unit-wise professor summaries and top-scoring student notes.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-2 sm:p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 shadow-2xs space-y-0.5">
            <div className="w-6 h-6 rounded-md bg-rose-500/30 flex items-center justify-center text-rose-300">
              <Video className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white leading-tight">Video Tutorials</h3>
            <p className="text-[10px] text-amber-300 font-medium leading-none">वीडियो लेक्चर्स</p>
            <p className="text-[9.5px] text-blue-100/80 leading-snug">
              Topic-wise animated explanations & numerical solutions.
            </p>
          </div>
        </div>

        {/* Quick Degree / Program Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5 text-[10.5px] text-blue-200">
          <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>B.Tech (8 Semesters)</span>
          </span>
          <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>Polytechnic Diploma (6 Semesters)</span>
          </span>
          <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>MBA & M.Tech Programs</span>
          </span>
          <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>100% Free Cloud Library</span>
          </span>
        </div>

        {/* Contact Nitish Khobragade trigger */}
        <div className="pt-0.5 flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-blue-200">
          <button
            type="button"
            onClick={onOpenContact}
            className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1 font-medium"
          >
            <HelpCircle className="w-3 h-3 text-amber-300" />
            <span>Need assistance or missing syllabus? Contact Er. Nitish Khobragade (NK)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

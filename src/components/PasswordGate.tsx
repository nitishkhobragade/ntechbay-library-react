import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  Cpu,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { LoginPage } from '../pages/Auth/LoginPage';
import { SignupPage } from '../pages/Auth/SignupPage';

interface PasswordGateProps {
  onUnlock: () => void;
  onOpenContact: () => void;
  onOpenAdmin?: () => void;
  currentPassword?: string;
  authView?: 'login' | 'signup' | null;
  onSwitchAuthView?: (view: 'login' | 'signup' | null) => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({
  onUnlock,
  onOpenContact,
  onOpenAdmin,
  authView = 'login',
  onSwitchAuthView,
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

  // JS Mouse Parallax Tracker
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

  // Continuous Harmonic Floating Loop: Items automatically float & move to different areas behind the form
  useEffect(() => {
    const loop = () => {
      const t = (Date.now() - startTimeRef.current) / 1000;

      // 1. Books & Graduation Cap: Multi-axis wandering orbital drift behind text & form
      const books_x = Math.sin(t * 0.75) * 55 + Math.cos(t * 0.35) * 25;
      const books_y = Math.cos(t * 0.6) * 35 + Math.sin(t * 0.25) * 20;
      const books_r = Math.sin(t * 0.5) * 4;

      // 2. Civil & Infra Crane: Drifting across left / upper-left / mid-left background
      const l1_x = Math.cos(t * 0.55) * 40 + Math.sin(t * 0.2) * 20;
      const l1_y = Math.sin(t * 0.65 + 1.0) * 50 + Math.cos(t * 0.3) * 20;
      const l1_r = Math.sin(t * 0.4) * 3;

      // 3. CS/IT Rig: Drifting across right / mid-right / lower-right background
      const l2_x = Math.sin(t * 0.5 + 2.0) * 45 + Math.cos(t * 0.3) * -20;
      const l2_y = Math.cos(t * 0.6 + 1.2) * 50 + Math.sin(t * 0.25) * 20;
      const l2_r = Math.cos(t * 0.45) * -3;

      // 4. RGPV Official Seal: Drifting across upper-right and upper-behind areas
      const l3_x = Math.cos(t * 0.45 + 3.0) * 35 + Math.sin(t * 0.2) * 15;
      const l3_y = Math.sin(t * 0.5 + 2.5) * 40 + Math.cos(t * 0.35) * -20;
      const l3_r = Math.sin(t * 0.35) * 2.5;

      // 5. Engineering Gears & Power: Rotating & floating across bottom background
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

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-1 flex flex-col items-center justify-start sm:justify-center overflow-hidden bg-gradient-to-b from-[#1b4393] via-[#15397d] to-[#0d2657] text-white select-none px-2.5 sm:px-4 py-1 sm:py-2.5 md:py-3"
    >
      {/* ============================================================== */}
      {/* 🌟 BACKGROUND GRAPHICS LAYER (Positioned BEHIND Login/Signup)   */}
      {/* All items float behind the texts and automatically move         */}
      {/* ============================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Radial Lighting Spotlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

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

        {/* "HAPPY ENGINEERS" & Engineering Blueprint Watermarks */}
        <div
          className="absolute right-6 sm:right-16 top-1/2 -translate-y-1/2 select-none opacity-10 hidden md:block will-change-transform"
          style={{
            transform: `translate(${mouseOffset.x * 18}px, calc(-50% + ${mouseOffset.y * 18}px))`,
          }}
        >
          <div className="text-right font-black text-6xl lg:text-8xl tracking-tighter leading-none text-white uppercase font-mono">
            <div>HAPPY</div>
            <div>ENGINEERS</div>
          </div>
        </div>

        {/* Background Engineering Floating Tags */}
        <div className="absolute left-1/4 top-10 opacity-20 text-xs font-mono text-cyan-200 hidden lg:block">
          ∫ f(x)dx • σ = E • ε • CAD & Simulation
        </div>
        <div className="absolute right-1/3 bottom-10 opacity-20 text-xs font-mono text-cyan-200 hidden lg:block">
          RGPV Bhopal • B.Tech • Polytechnic • MBA
        </div>

        {/* ============================================================ */}
        {/* FLOATING 3D BOOKS & GRADUATION CAP                           */}
        {/* FLOATS AUTOMATICALLY BEHIND THE TEXTS AND FORM               */}
        {/* Does NOT consume any vertical layout space                  */}
        {/* ============================================================ */}
        <div
          id="floating-bg-books"
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center will-change-transform select-none opacity-35 sm:opacity-45 pointer-events-none z-0"
          style={{
            transform: `translate3d(calc(-50% + ${rafOffset.books.x + mouseOffset.x * 12}px), calc(-50% + ${rafOffset.books.y + mouseOffset.y * 10}px), 0) rotate(${rafOffset.books.r}deg)`,
          }}
        >
          <div className="relative">
            <div className="text-6xl sm:text-7xl md:text-8xl drop-shadow-2xl">
              📚
            </div>
            <div className="absolute -top-4 -right-3 text-3xl sm:text-4xl animate-bounce">
              🎓
            </div>
          </div>
          <div
            className="w-28 h-2.5 bg-black/40 rounded-full blur-xs mt-1 will-change-transform"
            style={{
              transform: `scale(${1 - rafOffset.books.y / 60})`,
              opacity: 0.35,
            }}
          />
        </div>

        {/* ============================================================ */}
        {/* FLOATING LOGO 1: Civil & Infra Crane                         */}
        {/* Automatically floats & drifts across left area behind form   */}
        {/* ============================================================ */}
        <div
          id="floating-logo-construction"
          className="absolute left-2 sm:left-6 lg:left-12 top-12 sm:top-20 pointer-events-none opacity-40 sm:opacity-60 hidden sm:block will-change-transform z-0"
          style={{
            transform: `translate3d(${rafOffset.logo1.x + mouseOffset.x * -18}px, ${rafOffset.logo1.y + mouseOffset.y * -14}px, 0) rotate(${rafOffset.logo1.r}deg)`,
          }}
          title="Civil Engineering & Construction Infrastructure"
        >
          <div className="relative p-2 sm:p-2.5 bg-slate-900/60 backdrop-blur-md rounded-xl border border-blue-300/30 shadow-xl flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg text-xl sm:text-2xl">
              🏗️
            </div>
            <div className="text-left pr-1">
              <div className="flex items-center gap-1">
                <span className="text-[11px] sm:text-xs font-extrabold text-amber-300 tracking-wider uppercase">Civil & Infra</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[10px] text-blue-100/90 font-medium">B.Tech • Polytechnic</p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FLOATING LOGO 2: High-Performance CS/IT Rig                  */}
        {/* Automatically floats & drifts across lower/mid-left behind form */}
        {/* ============================================================ */}
        <div
          id="floating-logo-workstation"
          className="absolute left-2 sm:left-6 lg:left-12 bottom-6 sm:bottom-12 pointer-events-none opacity-40 sm:opacity-60 hidden sm:block will-change-transform z-0"
          style={{
            transform: `translate3d(${rafOffset.logo2.x + mouseOffset.x * -15}px, ${rafOffset.logo2.y + mouseOffset.y * -16}px, 0) rotate(${rafOffset.logo2.r}deg)`,
          }}
          title="Computer Science & Information Technology Rig"
        >
          <div className="relative p-2 sm:p-2.5 bg-slate-900/60 backdrop-blur-md rounded-xl border border-cyan-400/30 shadow-xl flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-400 flex items-center justify-center text-white font-black shadow-lg text-xl sm:text-2xl">
              🖥️
            </div>
            <div className="text-left pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] sm:text-xs font-extrabold text-cyan-300 tracking-wider uppercase">CS & IT Rig</span>
                <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-blue-100/90 font-medium">Algorithms • AI & ML</p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FLOATING LOGO 3: RGPV Official Seal                          */}
        {/* Automatically floats & drifts across right area behind form  */}
        {/* ============================================================ */}
        <div
          id="floating-logo-rgpv-seal"
          className="absolute right-2 sm:right-6 lg:right-12 top-12 sm:top-20 pointer-events-none opacity-40 sm:opacity-60 hidden sm:block will-change-transform z-0"
          style={{
            transform: `translate3d(${rafOffset.logo3.x + mouseOffset.x * 18}px, ${rafOffset.logo3.y + mouseOffset.y * -14}px, 0) rotate(${rafOffset.logo3.r}deg)`,
          }}
          title="Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV Bhopal)"
        >
          <div className="relative p-2 sm:p-2.5 bg-gradient-to-b from-red-950/60 to-slate-900/60 backdrop-blur-md rounded-xl border-2 border-red-400/35 shadow-xl flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-red-400 p-0.5 bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center shadow-md relative overflow-hidden">
              <div className="w-full h-full rounded-full border border-red-200/60 flex flex-col items-center justify-center text-center leading-none text-white select-none">
                <span className="text-[5px] font-bold uppercase text-red-200">राजीव गांधी</span>
                <span className="text-[8px] font-black tracking-wider text-amber-200">RGPV</span>
                <span className="text-[5px] font-semibold text-red-100">BHOPAL</span>
              </div>
            </div>
            <div className="text-left pr-1">
              <span className="text-[11px] sm:text-xs font-black text-red-300 uppercase tracking-wide">RGPV University</span>
              <p className="text-[10px] text-red-100/90 font-medium">Madhya Pradesh, India</p>
            </div>
          </div>
        </div>

        {/* Floating Mechanical Tools Decor (Bottom Right Background) */}
        <div
          className="absolute right-4 sm:right-10 bottom-6 sm:bottom-12 pointer-events-none hidden sm:flex items-center gap-2 opacity-35 will-change-transform z-0"
          style={{
            transform: `translate3d(${rafOffset.gears.x}px, ${rafOffset.gears.y}px, 0)`,
          }}
        >
          <div className="p-2 bg-white/10 backdrop-blur-xs rounded-xl text-lg animate-pulse">⚙️</div>
          <div className="p-2 bg-white/10 backdrop-blur-xs rounded-xl text-lg">⚡</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🚀 FOREGROUND CONTENT: Clean Headline + Compact Form Card       */}
      {/* Positioned tightly between header and footer without huge gaps */}
      {/* ============================================================== */}
      <div
        id="locked-area-container"
        className="relative z-20 w-full max-w-md mx-auto flex flex-col items-center justify-center my-0.5 sm:my-1.5"
        style={{
          transform: `translate3d(${mouseOffset.x * 3}px, ${mouseOffset.y * 3}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Compact, modern glass header banner */}
        <div className="mb-1.5 sm:mb-2 text-center px-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 backdrop-blur-md rounded-full border border-white/25 shadow-xs mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide">
              RGPV Engineering Student E-Library
            </span>
          </div>

          <h1 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight leading-tight drop-shadow-xs">
            Syllabus, Question Papers & Notes Portal
          </h1>

          <p className="text-[10px] sm:text-[11px] text-yellow-300 font-semibold mt-0.5 leading-tight drop-shadow-2xs">
            Student Login required to access course content (पाठ्यक्रम सामग्री देखने के लिए छात्र लॉगिन करें)
          </p>
        </div>

        {/* Main Center Auth Container with Glassmorphism */}
        <div className="w-full">
          {authView === 'signup' ? (
            /* Compact Signup View */
            <SignupPage
              onSwitchToLogin={() => onSwitchAuthView && onSwitchAuthView('login')}
              onSuccess={onUnlock}
            />
          ) : (
            /* Student Login Page Component */
            <LoginPage
              onSwitchToSignup={() => onSwitchAuthView && onSwitchAuthView('signup')}
              onSuccess={onUnlock}
            />
          )}
        </div>

        {/* Contact Nitish Khobragade trigger */}
        <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs text-blue-200">
          <button
            type="button"
            onClick={onOpenContact}
            className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1 font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need assistance? Contact Nitish Khobragade (NK)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

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
    gears: { r: 0 },
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

  // Continuous Harmonic Floating Loop for background graphics
  useEffect(() => {
    const loop = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;

      const l1_y = Math.sin(elapsed * 1.2) * 12 + Math.cos(elapsed * 0.7) * 4;
      const l1_x = Math.cos(elapsed * 0.9) * 6;
      const l1_r = Math.sin(elapsed * 0.8) * 2.5;

      const l2_y = Math.sin(elapsed * 1.4 + 1.5) * 14 + Math.cos(elapsed * 0.5) * 5;
      const l2_x = Math.cos(elapsed * 1.1 + 0.8) * 7;
      const l2_r = Math.cos(elapsed * 0.7 + 1.2) * -3;

      const l3_y = Math.sin(elapsed * 1.0 + 3.0) * 10 + Math.sin(elapsed * 0.6) * 6;
      const l3_x = Math.sin(elapsed * 0.8 + 2.0) * 5;
      const l3_r = Math.sin(elapsed * 0.5 + 1.0) * 2;

      const books_y = Math.sin(elapsed * 1.5) * 8;
      const books_x = Math.cos(elapsed * 0.8) * 4;
      const books_r = Math.sin(elapsed * 0.6) * 1.5;

      const gearRot = (elapsed * 12) % 360;

      setRafOffset({
        logo1: { x: l1_x, y: l1_y, r: l1_r },
        logo2: { x: l2_x, y: l2_y, r: l2_r },
        logo3: { x: l3_x, y: l3_y, r: l3_r },
        books: { x: books_x, y: books_y, r: books_r },
        gears: { r: gearRot },
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
      className="relative w-full flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-60px)] overflow-hidden bg-gradient-to-b from-[#1b4393] via-[#15397d] to-[#0d2657] text-white select-none px-3 sm:px-6 py-4"
    >
      {/* ============================================================== */}
      {/* 🌟 BACKGROUND GRAPHICS LAYER (Positioned BEHIND Login/Signup)   */}
      {/* ============================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Radial Lighting Spotlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Rotating Engineering Gears Blueprint Grid */}
        <div
          className="absolute -left-20 top-1/4 w-[420px] h-[420px] rounded-full border-4 border-dashed border-white/10 opacity-40 will-change-transform"
          style={{
            transform: `rotate(${rafOffset.gears.r}deg) translate(${mouseOffset.x * -12}px, ${mouseOffset.y * -12}px)`,
          }}
        />
        <div
          className="absolute -right-24 bottom-12 w-[420px] h-[420px] rounded-full border-4 border-dashed border-white/10 opacity-40 will-change-transform"
          style={{
            transform: `rotate(-${rafOffset.gears.r * 0.8}deg) translate(${mouseOffset.x * 12}px, ${mouseOffset.y * 12}px)`,
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
        <div className="absolute left-1/4 top-16 opacity-20 text-xs font-mono text-cyan-200 hidden lg:block">
          ∫ f(x)dx • σ = E • ε • CAD & Simulation
        </div>
        <div className="absolute right-1/3 bottom-16 opacity-20 text-xs font-mono text-cyan-200 hidden lg:block">
          RGPV Bhopal • B.Tech • Polytechnic • MBA
        </div>

        {/* ============================================================ */}
        {/* FLOATING 3D BOOKS & GRADUATION CAP (Ambient Hologram Behind Card) */}
        {/* ============================================================ */}
        <div
          id="floating-bg-books"
          className="absolute left-1/2 -translate-x-1/2 top-3 sm:top-6 flex flex-col items-center will-change-transform select-none opacity-85 hover:opacity-100 transition-opacity"
          style={{
            transform: `translate3d(calc(-50% + ${rafOffset.books.x + mouseOffset.x * 10}px), ${rafOffset.books.y + mouseOffset.y * 10}px, 0) rotate(${rafOffset.books.r}deg)`,
          }}
        >
          <div className="relative">
            <div className="text-5xl sm:text-6xl md:text-7xl drop-shadow-2xl">
              📚
            </div>
            <div className="absolute -top-3 -right-2 text-2xl sm:text-3xl animate-bounce">
              🎓
            </div>
          </div>
          <div
            className="w-24 h-2.5 bg-black/40 rounded-full blur-xs mt-1 will-change-transform"
            style={{
              transform: `scale(${1 - rafOffset.books.y / 25})`,
              opacity: 0.4 - rafOffset.books.y / 50,
            }}
          />
        </div>

        {/* ============================================================ */}
        {/* FLOATING LOGO 1: Civil & Infra Crane (Top Left Background)   */}
        {/* ============================================================ */}
        <div
          id="floating-logo-construction"
          className="absolute left-4 lg:left-12 top-8 lg:top-14 pointer-events-auto hidden md:block will-change-transform cursor-pointer group"
          style={{
            transform: `translate3d(${rafOffset.logo1.x + mouseOffset.x * -20}px, ${rafOffset.logo1.y + mouseOffset.y * -16}px, 0) rotate(${rafOffset.logo1.r}deg)`,
          }}
          title="Civil Engineering & Construction Infrastructure"
        >
          <div className="relative p-3 bg-slate-900/55 backdrop-blur-md rounded-2xl border border-blue-300/30 shadow-xl hover:border-yellow-400 hover:scale-105 transition-all flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 text-2xl group-hover:rotate-6 transition-transform">
              🏗️
            </div>
            <div className="text-left pr-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-extrabold text-amber-300 tracking-wider uppercase">Civil & Infra</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[11px] text-blue-100/90 font-medium">B.Tech • Polytechnic</p>
              <p className="text-[9px] text-blue-200/70">Structural • CAD • Notes</p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FLOATING LOGO 2: High-Performance CS/IT Rig (Bottom Left BG)  */}
        {/* ============================================================ */}
        <div
          id="floating-logo-workstation"
          className="absolute left-4 lg:left-12 bottom-8 lg:bottom-14 pointer-events-auto hidden md:block will-change-transform cursor-pointer group"
          style={{
            transform: `translate3d(${rafOffset.logo2.x + mouseOffset.x * -18}px, ${rafOffset.logo2.y + mouseOffset.y * -20}px, 0) rotate(${rafOffset.logo2.r}deg)`,
          }}
          title="Computer Science & Information Technology Rig"
        >
          <div className="relative p-3 bg-slate-900/55 backdrop-blur-md rounded-2xl border border-cyan-400/30 shadow-xl hover:border-cyan-400 hover:scale-105 transition-all flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-400 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/20 text-2xl group-hover:-rotate-6 transition-transform">
              🖥️
            </div>
            <div className="text-left pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-cyan-300 tracking-wider uppercase">CS & IT Rig</span>
                <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-blue-100/90 font-medium">Algorithms • AI & ML</p>
              <p className="text-[9px] text-blue-200/70">Lab Codes • Notes • Papers</p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FLOATING LOGO 3: RGPV Official Seal (Top/Mid Right Background) */}
        {/* ============================================================ */}
        <div
          id="floating-logo-rgpv-seal"
          className="absolute right-4 lg:right-12 top-8 lg:top-14 pointer-events-auto hidden sm:block will-change-transform cursor-pointer group"
          style={{
            transform: `translate3d(${rafOffset.logo3.x + mouseOffset.x * 20}px, ${rafOffset.logo3.y + mouseOffset.y * -16}px, 0) rotate(${rafOffset.logo3.r}deg)`,
          }}
          title="Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV Bhopal)"
        >
          <div className="relative p-3 bg-gradient-to-b from-red-950/60 to-slate-900/60 backdrop-blur-md rounded-2xl border-2 border-red-400/35 shadow-xl hover:border-red-400 hover:scale-105 transition-all flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-red-400 p-1 bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center shadow-md relative overflow-hidden group-hover:rotate-12 transition-transform">
              <div className="w-full h-full rounded-full border border-red-200/60 flex flex-col items-center justify-center text-center leading-none text-white select-none">
                <span className="text-[6px] font-bold tracking-tighter uppercase text-red-200">राजीव गांधी</span>
                <span className="text-[9px] font-black tracking-wider text-amber-200">RGPV</span>
                <span className="text-[6px] font-semibold tracking-tighter text-red-100">BHOPAL</span>
              </div>
            </div>
            <div className="text-left pr-1">
              <span className="text-xs font-black text-red-300 uppercase tracking-wide">RGPV University</span>
              <p className="text-[11px] text-red-100/90 font-medium">Madhya Pradesh, India</p>
              <p className="text-[9px] text-red-200/70">Official Syllabus & Schemes</p>
            </div>
          </div>
        </div>

        {/* Floating Mechanical Tools Decor (Bottom Right Background) */}
        <div
          className="absolute right-12 bottom-12 pointer-events-none hidden lg:flex items-center gap-2 opacity-35 will-change-transform"
          style={{
            transform: `translate3d(${rafOffset.books.x * 2}px, ${rafOffset.books.y * -1.5}px, 0)`,
          }}
        >
          <div className="p-2.5 bg-white/10 backdrop-blur-xs rounded-xl text-xl animate-pulse">⚙️</div>
          <div className="p-2.5 bg-white/10 backdrop-blur-xs rounded-xl text-xl">⚡</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🚀 FOREGROUND CONTENT: Clean Headline + Glassmorphic Card       */}
      {/* ============================================================== */}
      <div
        id="locked-area-container"
        className="relative z-20 w-full max-w-lg mx-auto flex flex-col items-center justify-center my-auto"
        style={{
          transform: `translate3d(${mouseOffset.x * 4}px, ${mouseOffset.y * 4}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Compact, modern glass header banner */}
        <div className="mb-2.5 text-center px-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/15 backdrop-blur-md rounded-full border border-white/25 shadow-md mb-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs font-bold text-white tracking-wide">
              RGPV Engineering Student E-Library
            </span>
          </div>

          <h1 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight drop-shadow-md">
            Syllabus, Question Papers & Notes Portal
          </h1>

          <p className="text-[11px] text-yellow-300 font-semibold mt-0.5 drop-shadow-xs">
            Student Login required to access course content (पाठ्यक्रम सामग्री देखने के लिए छात्र लॉगिन करें)
          </p>
        </div>

        {/* Main Center Auth Container with Glassmorphism (Passcode option removed as requested) */}
        <div className="w-full max-w-md mx-auto">
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
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3 text-xs text-blue-200">
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

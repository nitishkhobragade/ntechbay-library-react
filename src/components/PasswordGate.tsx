import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Cpu,
  Compass,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { getAppSettings } from '../data/linkStore';

interface PasswordGateProps {
  onUnlock: () => void;
  onOpenContact: () => void;
  onOpenAdmin?: () => void;
  currentPassword?: string;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({
  onUnlock,
  onOpenContact,
  onOpenAdmin,
  currentPassword = 'nitishkhobragade',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // JavaScript interactive floating & parallax state
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [rafOffset, setRafOffset] = useState({
    logo1: { x: 0, y: 0, r: 0 },
    logo2: { x: 0, y: 0, r: 0 },
    logo3: { x: 0, y: 0, r: 0 },
    logo4: { x: 0, y: 0, r: 0 },
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

  // JavaScript Harmonic Sine/Cosine Continuous Floating Loop (requestAnimationFrame)
  useEffect(() => {
    const loop = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;

      // Calculate continuous harmonic float calculations with unique frequency and phase for each logo
      const l1_y = Math.sin(elapsed * 1.2) * 12 + Math.cos(elapsed * 0.7) * 4;
      const l1_x = Math.cos(elapsed * 0.9) * 6;
      const l1_r = Math.sin(elapsed * 0.8) * 2.5;

      const l2_y = Math.sin(elapsed * 1.4 + 1.5) * 14 + Math.cos(elapsed * 0.5) * 5;
      const l2_x = Math.cos(elapsed * 1.1 + 0.8) * 7;
      const l2_r = Math.cos(elapsed * 0.7 + 1.2) * -3;

      const l3_y = Math.sin(elapsed * 1.0 + 3.0) * 10 + Math.sin(elapsed * 0.6) * 6;
      const l3_x = Math.sin(elapsed * 0.8 + 2.0) * 5;
      const l3_r = Math.sin(elapsed * 0.5 + 1.0) * 2;

      const l4_y = Math.sin(elapsed * 1.6) * 8; // Center books float
      const l4_x = Math.cos(elapsed * 0.8) * 3;
      const l4_r = Math.sin(elapsed * 0.7) * 1.5;

      const gearRot = (elapsed * 15) % 360;

      setRafOffset({
        logo1: { x: l1_x, y: l1_y, r: l1_r },
        logo2: { x: l2_x, y: l2_y, r: l2_r },
        logo3: { x: l3_x, y: l3_y, r: l3_r },
        logo4: { x: l4_x, y: l4_y, r: l4_r },
        gears: { r: gearRot },
      });

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = password.trim().toLowerCase();
    const activeStudentPwd = (getAppSettings().studentPassword || currentPassword || 'nitishkhobragade').trim().toLowerCase();

    // Verify against current active student password (or author name fallback)
    const validPasswords = [
      activeStudentPwd,
      'nitishkhobragade',
      'nitish',
    ];

    if (validPasswords.includes(cleanInput)) {
      setError(null);
      onUnlock();
    } else {
      setError('Incorrect password. Please contact Nitish Khobragade (Teacher/Admin) for access.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] overflow-hidden bg-gradient-to-b from-[#1e4da1] via-[#1a4391] to-[#123373] text-white select-none px-4 py-8"
    >
      {/* Background Graphic Watermarks & Rotating Gears using JS/CSS */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden flex items-center justify-between">
        {/* Floating engineering gears overlay with JS rotation and CSS dash */}
        <div
          className="absolute -left-20 top-1/4 w-96 h-96 rounded-full border-4 border-dashed border-white/20 will-change-transform"
          style={{
            transform: `rotate(${rafOffset.gears.r}deg) translate(${mouseOffset.x * -10}px, ${mouseOffset.y * -10}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
        <div
          className="absolute -right-24 bottom-10 w-96 h-96 rounded-full border-4 border-dashed border-white/20 will-change-transform"
          style={{
            transform: `rotate(-${rafOffset.gears.r * 0.7}deg) translate(${mouseOffset.x * 12}px, ${mouseOffset.y * 12}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      </div>

      {/* Decorative "HAPPY ENGINEERS" watermark with gentle JS drift */}
      <div
        className="absolute right-4 sm:right-16 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-15 hidden md:block will-change-transform"
        style={{
          transform: `translate(${mouseOffset.x * 15}px, calc(-50% + ${mouseOffset.y * 15}px))`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        <div className="text-right font-black text-6xl lg:text-7xl tracking-tighter leading-none text-white uppercase font-mono">
          <div>HAPPY</div>
          <div>ENGINEERS</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FLOATING LOGO 1: 3D Engineering & Construction Crane (Top Left) */}
      {/* ============================================================== */}
      <div
        id="floating-logo-construction"
        className="absolute left-4 lg:left-10 top-6 lg:top-12 z-10 pointer-events-auto hidden md:block will-change-transform cursor-pointer group"
        style={{
          transform: `translate3d(${rafOffset.logo1.x + mouseOffset.x * -25}px, ${rafOffset.logo1.y + mouseOffset.y * -20}px, 0) rotate(${rafOffset.logo1.r}deg)`,
          transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        title="Engineering & Construction Infrastructure"
      >
        <div className="animate-float-slow">
          <div className="relative p-3.5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-blue-300/30 shadow-2xl hover:border-yellow-400/60 hover:shadow-yellow-500/20 hover:scale-105 transition-all duration-300 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30 text-2xl group-hover:rotate-6 transition-transform">
              🏗️
            </div>
            <div className="text-left pr-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-extrabold text-amber-300 tracking-wider uppercase">Civil & Infra</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[11px] text-blue-100/90 font-medium">B.Tech • Polytechnic</p>
              <p className="text-[9px] text-blue-200/70">Structural • Surveying • CAD</p>
            </div>
          </div>
          {/* Dynamic Floating Shadow underneath Logo 1 */}
          <div
            className="w-3/4 h-2.5 mx-auto mt-2 bg-black/40 rounded-full blur-xs will-change-transform"
            style={{
              transform: `scale(${1 - (rafOffset.logo1.y / 40)})`,
              opacity: 0.4 - (rafOffset.logo1.y / 60),
            }}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* FLOATING LOGO 2: High-Performance Workstation / Tech Rig (Bottom Left) */}
      {/* ============================================================== */}
      <div
        id="floating-logo-workstation"
        className="absolute left-4 lg:left-12 bottom-6 lg:bottom-12 z-10 pointer-events-auto hidden md:block will-change-transform cursor-pointer group"
        style={{
          transform: `translate3d(${rafOffset.logo2.x + mouseOffset.x * -20}px, ${rafOffset.logo2.y + mouseOffset.y * -25}px, 0) rotate(${rafOffset.logo2.r}deg)`,
          transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        title="Computer Science, IT & Embedded Computing"
      >
        <div className="animate-float-medium">
          <div className="relative p-3.5 bg-slate-900/65 backdrop-blur-md rounded-2xl border border-cyan-400/30 shadow-2xl hover:border-cyan-400/70 hover:shadow-cyan-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-400 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/30 text-2xl group-hover:-rotate-6 transition-transform">
              🖥️
            </div>
            <div className="text-left pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-cyan-300 tracking-wider uppercase">CS & IT Rig</span>
                <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-blue-100/90 font-medium">Algorithms • AI & ML • Systems</p>
              <p className="text-[9px] text-blue-200/70">Lab Codes • Notes • Vivas</p>
            </div>
          </div>
          {/* Dynamic Floating Shadow underneath Logo 2 */}
          <div
            className="w-3/4 h-2.5 mx-auto mt-2 bg-black/40 rounded-full blur-xs will-change-transform"
            style={{
              transform: `scale(${1 - (rafOffset.logo2.y / 40)})`,
              opacity: 0.4 - (rafOffset.logo2.y / 60),
            }}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* FLOATING LOGO 3: RGPV University Bhopal Official Seal (Top/Mid Right) */}
      {/* ============================================================== */}
      <div
        id="floating-logo-rgpv-seal"
        className="absolute right-4 lg:right-12 top-10 lg:top-16 z-10 pointer-events-auto hidden sm:block will-change-transform cursor-pointer group"
        style={{
          transform: `translate3d(${rafOffset.logo3.x + mouseOffset.x * 25}px, ${rafOffset.logo3.y + mouseOffset.y * -20}px, 0) rotate(${rafOffset.logo3.r}deg)`,
          transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        title="Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV Bhopal)"
      >
        <div className="animate-float-reverse">
          <div className="relative p-3 bg-gradient-to-b from-red-950/70 to-slate-900/70 backdrop-blur-md rounded-2xl border-2 border-red-400/40 shadow-2xl hover:border-red-400 hover:shadow-red-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-3">
            {/* Authentically styled RGPV Circular Seal */}
            <div className="w-14 h-14 rounded-full border-2 border-red-400 p-1 bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center shadow-md relative overflow-hidden group-hover:rotate-12 transition-transform duration-500">
              <div className="w-full h-full rounded-full border border-red-200/60 flex flex-col items-center justify-center text-center leading-none text-white select-none">
                <span className="text-[7px] font-bold tracking-tighter uppercase text-red-200">राजीव गांधी</span>
                <span className="text-[10px] font-black tracking-wider text-amber-200">RGPV</span>
                <span className="text-[7px] font-semibold tracking-tighter text-red-100">BHOPAL</span>
              </div>
            </div>
            <div className="text-left pr-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-red-300 uppercase tracking-wide">RGPV University</span>
              </div>
              <p className="text-[11px] text-red-100/90 font-medium">Madhya Pradesh, India</p>
              <p className="text-[9px] text-red-200/70">Official Syllabus & Schemes</p>
            </div>
          </div>
          {/* Dynamic Floating Shadow underneath Logo 3 */}
          <div
            className="w-3/4 h-2.5 mx-auto mt-2 bg-black/40 rounded-full blur-xs will-change-transform"
            style={{
              transform: `scale(${1 - (rafOffset.logo3.y / 40)})`,
              opacity: 0.4 - (rafOffset.logo3.y / 60),
            }}
          />
        </div>
      </div>

      {/* Floating Mechanical Tools & Sparks Decor (Center background) */}
      <div
        className="absolute right-1/4 bottom-14 pointer-events-none hidden lg:flex items-center gap-2 opacity-40 will-change-transform"
        style={{
          transform: `translate3d(${rafOffset.logo4.x * 2 + mouseOffset.x * 10}px, ${rafOffset.logo4.y * -1.5}px, 0)`,
        }}
      >
        <div className="p-2 bg-white/10 backdrop-blur-xs rounded-xl text-xl animate-pulse">⚙️</div>
        <div className="p-2 bg-white/10 backdrop-blur-xs rounded-xl text-xl">⚡</div>
      </div>

      {/* ============================================================== */}
      {/* CENTER MAIN CARD (With Floating 3D Books & Graduation Cap)     */}
      {/* ============================================================== */}
      <div
        id="locked-area-container"
        className={`relative z-20 w-full max-w-2xl text-center flex flex-col items-center justify-center px-4 py-6 transition-transform duration-200 ${
          isShaking ? 'animate-shake' : ''
        }`}
        style={{
          transform: `translate3d(${mouseOffset.x * 6}px, ${mouseOffset.y * 6}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Title & Headline */}
        <div className="space-y-2 mb-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-normal drop-shadow-md flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-block hover:scale-125 transition-transform">🎓</span>
            <span>This Website is Created for Helping Engineering Students</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl mx-auto leading-relaxed drop-shadow-xs">
            Based on the <strong className="text-white font-semibold">RGPV Syllabus</strong>, it includes Syllabus, Important Questions, Notes, Previous Year Papers for <strong className="text-white">B.Tech</strong>, <strong className="text-white">Polytechnic</strong>, <strong className="text-white">M.Tech</strong>, and <strong className="text-white">MBA</strong>.
          </p>
        </div>

        {/* ============================================================ */}
        {/* FLOATING LOGO 4: Center 3D Stack of Books & Mortarboard Cap  */}
        {/* Animated with combined JS harmonic offset and CSS float      */}
        {/* ============================================================ */}
        <div
          id="floating-logo-books"
          className="my-2 flex flex-col items-center will-change-transform cursor-pointer group"
          style={{
            transform: `translate3d(${rafOffset.logo4.x}px, ${rafOffset.logo4.y}px, 0) rotate(${rafOffset.logo4.r}deg)`,
            transition: 'transform 0.08s ease-out',
          }}
          title="Curated Engineering Library"
        >
          {/* Main 3D Books Visual */}
          <div className="relative">
            <div className="text-6xl sm:text-7xl drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300 select-none animate-float-books">
              📚
            </div>
            <div className="absolute -top-3 -right-2 text-2xl animate-bounce">
              🎓
            </div>
          </div>

          {/* Dynamic Ground Shadow that expands/contracts with book elevation */}
          <div
            className="w-20 h-2 bg-black/50 rounded-full blur-xs mt-1 will-change-transform"
            style={{
              transform: `scale(${1 - (rafOffset.logo4.y / 25)})`,
              opacity: 0.5 - (rafOffset.logo4.y / 40),
            }}
          />

          {/* Locked Area status tag */}
          <div className="flex items-center gap-1.5 mt-2 bg-slate-900/60 backdrop-blur-md border border-white/20 px-4 py-1 rounded-full text-white text-xs sm:text-sm font-bold shadow-lg">
            <Lock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Locked Area</span>
          </div>
        </div>

        {/* Dual language instructions in Yellow matching reference */}
        <div className="my-3 space-y-1.5 text-center px-2">
          <p className="text-xs sm:text-sm font-semibold text-yellow-300 drop-shadow-xs">
            Enter the password to access course content (पाठ्यक्रम सामग्री तक पहुंचने के लिए पासवर्ड दर्ज करें)
          </p>
          <p className="text-xs sm:text-sm font-semibold text-yellow-300 drop-shadow-xs">
            Contact Your Teacher or Admin for Password (पासवर्ड के लिए अपने शिक्षक या Admin से संपर्क करें)
          </p>
        </div>

        {/* Password Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xs sm:max-w-sm mt-2 flex flex-col items-center gap-3"
        >
          {/* Password Input field */}
          <div className="w-full relative">
            <input
              id="password-gate-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter password (smallcase)"
              autoFocus
              className="w-full text-center px-4 py-2.5 sm:py-3 bg-white text-slate-800 font-semibold rounded-lg shadow-md border-2 border-white/80 focus:outline-hidden focus:ring-4 focus:ring-blue-300 text-sm sm:text-base placeholder-slate-400 transition-all"
            />
          </div>

          {/* Show Password toggle */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white/95 cursor-pointer select-none">
            <label
              htmlFor="show-password-checkbox"
              className="flex items-center gap-1.5 cursor-pointer hover:text-white"
            >
              <input
                id="show-password-checkbox"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
              <span>Show Password</span>
            </label>
          </div>

          {/* Error message if invalid */}
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-200 bg-rose-900/70 border border-rose-500/60 px-3 py-1.5 rounded-lg shadow-sm">
              <AlertCircle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Green Unlock Content button matching user's screen */}
          <button
            id="unlock-content-button"
            type="submit"
            className="w-full sm:w-auto min-w-[190px] py-2.5 px-6 bg-[#16a34a] hover:bg-[#15803d] active:bg-[#166534] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Content</span>
          </button>
        </form>

        {/* Contact Nitish Khobragade trigger & Admin Portal button */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-blue-200">
          <button
            type="button"
            onClick={onOpenContact}
            className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1 font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need password? Contact Nitish Khobragade (NK)</span>
          </button>

          {onOpenAdmin && (
            <button
              id="gate-admin-portal-button"
              type="button"
              onClick={onOpenAdmin}
              className="hover:text-amber-200 text-amber-300/90 transition-colors cursor-pointer flex items-center gap-1 font-medium bg-black/25 hover:bg-black/45 px-3 py-1 rounded-full border border-amber-300/30 shadow-xs"
              title="Open Admin Control Center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

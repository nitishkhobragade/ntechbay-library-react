import React from 'react';
import { BookOpen, Mail, Lock, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenContact: () => void;
  isUnlocked: boolean;
  onLock?: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenContact,
  isUnlocked,
  onLock,
  onOpenAdmin,
}) => {
  return (
    <header
      id="top-navbar"
      className="w-full bg-blue-600 text-white shadow-md sticky top-0 z-30"
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Left: Book/library icon alongside bold white title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm sm:text-lg md:text-xl tracking-wide flex items-center gap-1 sm:gap-1.5 truncate">
              <span className="truncate">NTechBay-Library</span>
              <span className="font-light text-blue-200 text-xs sm:text-sm shrink-0">by NK</span>
            </h1>
          </div>
        </div>

        {/* Right side controls (Compact & Icon-only for Admin and Lock to ensure 100% mobile fit) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenAdmin && (
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

          {isUnlocked && onLock && (
            <button
              id="lock-nav-button"
              type="button"
              onClick={onLock}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-xs"
              title="Lock Library"
              aria-label="Lock Library"
            >
              <Lock className="w-3.5 h-3.5 text-amber-200" />
            </button>
          )}

          <button
            id="contact-nav-button"
            type="button"
            onClick={onOpenContact}
            className="bg-white text-blue-600 px-2.5 sm:px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Contact</span>
          </button>
        </div>
      </div>
    </header>
  );
};

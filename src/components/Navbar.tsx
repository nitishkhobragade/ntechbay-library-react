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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between">
        {/* Left: Book/library icon alongside bold white title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base sm:text-lg md:text-xl tracking-wide flex items-center gap-1.5">
              <span>NTechBay-Library</span>
              <span className="font-light text-blue-200 text-xs sm:text-sm">by NK</span>
            </h1>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onOpenAdmin && (
            <button
              id="admin-nav-button"
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer border border-white/20 shadow-xs"
              title="Admin Panel & Controls"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Admin</span>
            </button>
          )}

          {isUnlocked && onLock && (
            <button
              id="lock-nav-button"
              type="button"
              onClick={onLock}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer"
              title="Lock Library"
            >
              <Lock className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          )}

          <button
            id="contact-nav-button"
            type="button"
            onClick={onOpenContact}
            className="bg-white text-blue-600 px-3.5 sm:px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            <span>Contact</span>
          </button>
        </div>
      </div>
    </header>
  );
};

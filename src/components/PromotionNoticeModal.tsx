import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Megaphone,
  Sparkles,
  Phone,
  MessageCircle,
  ExternalLink,
  Code2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';
import { NoticeItem } from '../types';

interface PromotionNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  notices: NoticeItem[];
  onOpenContact?: () => void;
  autoCloseDurationMs?: number; // 8000ms (8 seconds)
  isAutoOpened?: boolean;
}

export const PromotionNoticeModal: React.FC<PromotionNoticeModalProps> = ({
  isOpen,
  onClose,
  notices,
  onOpenContact,
  autoCloseDurationMs = 8000,
  isAutoOpened = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(autoCloseDurationMs / 1000);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset or manage auto-close timer
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(autoCloseDurationMs / 1000);
      setIsPaused(false);
      return;
    }

    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Countdown interval (updates every 100ms for smooth display)
    const startTime = Date.now();
    const duration = timeLeft * 1000;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (duration - elapsed) / 1000);
      setTimeLeft(parseFloat(remaining.toFixed(1)));
    }, 100);

    // Auto-close timeout
    timerRef.current = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, isPaused, onClose, autoCloseDurationMs]);

  if (!isOpen) return null;

  // Active notices from admin
  const activeNotices = notices.filter((n) => n.active);
  const latestNotice = activeNotices.length > 0 ? activeNotices[0] : null;

  const progressPercent = Math.max(
    0,
    Math.min(100, (timeLeft / (autoCloseDurationMs / 1000)) * 100)
  );

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-blue-200 animate-scaleUp relative flex flex-col max-h-[92vh]">
        {/* Top Auto-Close Progress Bar (8 seconds countdown) */}
        <div className="w-full bg-blue-950/20 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-400 transition-all duration-100 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header with Promotion Tag & Auto-timer status */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 relative shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-400 text-slate-900 rounded-xl shadow-xs animate-bounce">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  NTechBay Online Services & Notices
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Close notice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Countdown & Manual Touch-Safe Pause banner */}
          <div className="mt-3 flex items-center justify-between text-xs text-blue-100 bg-black/25 px-3 py-2 rounded-xl border border-white/20">
            <div className="flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${isPaused ? 'text-amber-400' : 'text-amber-300 animate-spin'}`} />
              <span className="font-medium">
                {isPaused ? (
                  <span className="text-amber-200 font-semibold">Timer paused manually</span>
                ) : (
                  <span>
                    auto closing in (<strong className="text-white font-bold">{Math.ceil(timeLeft)}s</strong>)
                  </span>
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
              title={isPaused ? 'Resume auto-close' : 'Pause auto-close timer'}
            >
              {isPaused ? (
                <>
                  <Play className="w-3 h-3 text-emerald-300 fill-emerald-300" />
                  <span>Resume Timer</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>Manual Pause</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Admin Notice (If posted in Firestore) */}
          {latestNotice ? (
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  <Megaphone className="w-3 h-3 text-amber-700" />
                  <span>Admin Broadcast</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(latestNotice.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{latestNotice.title}</h3>
              {latestNotice.imageUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-amber-200 bg-white max-h-48">
                  <img
                    src={latestNotice.imageUrl}
                    alt="Notice"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <p className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                {latestNotice.content}
              </p>
            </div>
          ) : null}

          {/* Er. Nitish Khobragade's Online Services Promotion */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                NK
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Er. Nitish Khobragade
                </h4>
                <p className="text-[10px] text-slate-500">
                  Software Engineer & Founder • NTechBay Platform
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Welcome to <strong>NTechBay-Library</strong>! We provide high-quality engineering resources and specialized professional IT solutions for students and businesses.
            </p>

            {/* Service Highlights */}
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <Code2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-bold">
                    Web & Full-Stack Application Development
                  </strong>
                  <span className="text-[11px] text-slate-600">
                    Modern responsive websites, React apps, databases, portfolios, and custom tools.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-bold">
                    RGPV Student Projects & Technical Mentorship
                  </strong>
                  <span className="text-[11px] text-slate-600">
                    Minor & Major engineering projects, coding guidance, viva preparation, and reports.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <Briefcase className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-bold">
                    Study Notes, Solved Papers & Cloud Library Access
                  </strong>
                  <span className="text-[11px] text-slate-600">
                    Syllabus-aligned books, previous year solved question papers, and lecture slides.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Direct Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <a
              href="https://wa.me/918982324497?text=Hello%20Er.%20Nitish%20Sir%2C%20I%20am%20interested%20in%20your%20NTechBay%20online%20services%20and%20project%20guidance."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire on WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenContact?.();
              }}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-blue-200" />
              <span>Contact Admin</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="text-[11px] font-medium text-slate-600">
            Official Notices & Student Updates
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Continue to Library
          </button>
        </div>
      </div>
    </div>
  );
};

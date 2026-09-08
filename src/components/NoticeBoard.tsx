import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import {
  Bell,
  Sparkles,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronLeft,
  X,
  Megaphone,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { NoticeItem } from '../types';

export const NoticeBoard: React.FC = () => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const q = query(
        collection(db, 'notices'),
        where('active', '==', true)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: NoticeItem[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<NoticeItem, 'id'>),
          }));
          // Sort by createdAt descending
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setNotices(list);
          if (list.length > 0 && currentIndex >= list.length) {
            setCurrentIndex(0);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'notices');
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to listen to notices:', err);
    }
  }, []);

  if (notices.length === 0 || isDismissed) {
    return null;
  }

  const current = notices[currentIndex] || notices[0];

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'alert':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
          label: 'Important Alert',
        };
      case 'promotion':
        return {
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
          label: 'Important Announcement',
        };
      default:
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Info className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Official Notice',
        };
    }
  };

  const badge = getBadgeStyle(current.type);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % notices.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + notices.length) % notices.length);
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200/80 rounded-xl p-2 sm:p-2.5 shadow-2xs mb-2 relative transition-all">
        <div className="flex items-start sm:items-center justify-between gap-2">
          {/* Left: Speaker icon & badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <span
              className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${badge.bg}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
            </span>
          </div>

          {/* Center: Notice text */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setSelectedNotice(current)}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`sm:hidden inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${badge.bg}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {current.title}
              </h4>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-600 truncate mt-0.5">
              {current.content}
            </p>
          </div>

          {/* Right: Controls (Prev, Next, Read, Dismiss) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {notices.length > 1 && (
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer"
                  title="Previous Notice"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] text-slate-500 font-medium px-1">
                  {currentIndex + 1}/{notices.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer"
                  title="Next Notice"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedNotice(current)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              View
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer ml-1"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                    getBadgeStyle(selectedNotice.type).bg
                  }`}
                >
                  {getBadgeStyle(selectedNotice.type).icon}
                  <span>{getBadgeStyle(selectedNotice.type).label}</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(selectedNotice.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {selectedNotice.title}
              </h3>

              {selectedNotice.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={selectedNotice.imageUrl}
                    alt={selectedNotice.title}
                    className="w-full h-auto max-h-64 object-contain mx-auto"
                  />
                </div>
              )}

              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {selectedNotice.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React from 'react';
import {
  BookOpenCheck,
  Library,
  NotebookPen,
  FileQuestion,
  Video,
  Archive,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ResourceCategory } from '../types';

interface ResourceCardProps {
  category: ResourceCategory;
  count: number;
  onClick: () => void;
  onDirectOpen?: (e: React.MouseEvent) => void;
}

const CATEGORY_CONFIG: Record<
  ResourceCategory,
  {
    icon: React.ReactNode;
    subtitle: string;
    iconBg: string;
    iconColor: string;
    badgeColor: string;
  }
> = {
  Syllabus: {
    icon: <BookOpenCheck className="w-8 h-8 text-blue-600" />,
    subtitle: 'Official curriculum scheme & exam pattern',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
  },
  'Study Books': {
    icon: <Library className="w-8 h-8 text-emerald-600" />,
    subtitle: 'Recommended reference textbooks & volumes',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  Notes: {
    icon: <NotebookPen className="w-8 h-8 text-amber-600" />,
    subtitle: 'Handwritten lecture notes & unit summaries',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  Questions: {
    icon: <FileQuestion className="w-8 h-8 text-purple-600" />,
    subtitle: 'Important university question banks & solutions',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/80',
  },
  Videos: {
    icon: <Video className="w-8 h-8 text-rose-600" />,
    subtitle: 'Curated video lecture series & tutorials',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/80',
  },
  'Previous Year Papers': {
    icon: <Archive className="w-8 h-8 text-teal-600" />,
    subtitle: 'Past solved & unsolved university papers',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/80',
  },
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  category,
  count,
  onClick,
  onDirectOpen,
}) => {
  const config = CATEGORY_CONFIG[category];
  const isAvailable = count > 0;

  return (
    <div
      id={`resource-card-${category.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4 shadow-xs transition-all cursor-pointer text-left w-full ${
        isAvailable
          ? 'hover:shadow-xl hover:scale-[1.02] hover:border-blue-300'
          : 'opacity-60 hover:opacity-80'
      }`}
    >
      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
        {/* Left icon with soft vibrant background */}
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 ${config.iconBg} rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs`}
        >
          {config.icon}
        </div>

        {/* Middle Text Details */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h3 className="font-bold text-gray-800 text-base sm:text-lg group-hover:text-blue-600 transition-colors truncate">
              {category}
            </h3>
            {isAvailable ? (
              <span
                className={`text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border ${config.badgeColor} shrink-0`}
              >
                Drive Folder
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                Not applicable
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-snug">
            {config.subtitle}
          </p>
        </div>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {isAvailable && onDirectOpen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDirectOpen(e);
            }}
            title="Open Google Drive folder"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 transition-colors"
          >
            <span>Drive</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
        <div className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

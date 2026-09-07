import React, { useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Video,
  Search,
  BookOpen,
  FolderOpen,
} from 'lucide-react';
import { CourseType, ResourceCategory, ResourceItem } from '../types';
import { b2a } from '../utils/codec';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ResourceCategory | null;
  course: CourseType;
  semester: string;
  branch: string;
  resources: ResourceItem[];
}

export const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onClose,
  category,
  course,
  semester,
  branch,
  resources,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<ResourceItem | null>(null);

  if (!isOpen || !category) return null;

  const filteredResources = resources.filter((res) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      res.title.toLowerCase().includes(query) ||
      res.subject.toLowerCase().includes(query) ||
      (res.authorOrProf && res.authorOrProf.toLowerCase().includes(query)) ||
      (res.description && res.description.toLowerCase().includes(query))
    );
  });

  const handleOpenDriveFolder = (item: ResourceItem) => {
    if (!item.encodedLink) return;
    const targetUrl = b2a(item.encodedLink);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="resource-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="resource-modal-container"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 sm:p-6 relative">
          <button
            id="close-resource-modal"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-blue-500/40 text-blue-100 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-400/30">
              {course}
            </span>
            <span className="text-blue-200 text-xs">•</span>
            <span className="bg-blue-500/40 text-blue-100 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-400/30">
              {semester}
            </span>
            <span className="text-blue-200 text-xs">•</span>
            <span className="bg-blue-500/40 text-blue-100 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-400/30">
              {branch}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs border border-white/20">
              {category === 'Videos' ? (
                <Video className="w-7 h-7 text-white" />
              ) : (
                <FileText className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {category}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
                Official RGPV curriculum and university archives
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="resource-search-input"
              type="text"
              placeholder={`Search ${category.toLowerCase()} or subject...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Resources Content List */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                No resources available for this category
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Please select another course or semester combination.
              </p>
            </div>
          ) : (
            filteredResources.map((item) => {
              const isVideo = item.format === 'VIDEO';

              return (
                <div
                  key={item.id}
                  id={`resource-item-${item.id}`}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {item.subject}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.format || 'Cloud Folder'}
                      </span>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Verified RGPV Material
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {(item.authorOrProf || item.yearOrEdition) && (
                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        {item.authorOrProf && (
                          <span>Source: <strong className="text-slate-700 font-medium">{item.authorOrProf}</strong></span>
                        )}
                        {item.yearOrEdition && (
                          <span>• {item.yearOrEdition}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Bar: Direct click to open Google Drive without writing URL on screen */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDriveFolder(item)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer active:scale-95"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>Open in Google Drive</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-0.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-slate-500" />
                        <span>Curriculum Overview</span>
                      </button>
                    </div>

                    <span className="text-xs text-slate-400 italic">
                      Click button to access archive
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-700">
            NTechBay-Library • Educational Archive
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Curriculum Summary / Preview Drawer without exposing any URL */}
      {previewItem && (
        <div
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="w-5 h-5 text-blue-400 shrink-0" />
                <h3 className="font-bold text-sm sm:text-base text-white truncate">
                  {previewItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-blue-900 text-base mb-1">
                  {previewItem.subject}
                </h4>
                <p className="text-xs text-blue-700">
                  {course} • {semester} • {branch}
                </p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {previewItem.description || 'Comprehensive university resources including unit-wise notes, solved past papers, and textbook references.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Resource Features
                </h5>
                <ul className="text-xs space-y-1.5 text-slate-600 list-disc list-inside">
                  <li>Direct access to full subject folder stored in secure Google Drive</li>
                  <li>Aligned with current RGPV examination pattern and grading scheme</li>
                  <li>Updated for the 2024–2025 academic session</li>
                </ul>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenDriveFolder(previewItem);
                    setPreviewItem(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Open in Google Drive</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

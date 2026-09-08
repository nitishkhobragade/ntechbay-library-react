import React from 'react';
import { ChevronDown, Lock, CheckCircle2 } from 'lucide-react';
import { BranchOption } from '../types';

interface FilterSectionProps {
  semesters: string[];
  selectedSemester: string;
  onSemesterChange: (sem: string) => void;
  branches: BranchOption[];
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  isBranchDisabled?: boolean;
  branchDisabledReason?: string;
  showEngineeringCommonNotice?: boolean;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  semesters,
  selectedSemester,
  onSemesterChange,
  branches,
  selectedBranch,
  onBranchChange,
  isBranchDisabled = false,
  branchDisabledReason = 'Common for all branches',
  showEngineeringCommonNotice = false,
}) => {
  return (
    <div className="flex flex-col gap-2 max-w-xl mx-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
        {/* Left Dropdown: Semester */}
        <div className="relative">
          <label htmlFor="semester-select" className="sr-only">
            Select Semester
          </label>
          <select
            id="semester-select"
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 sm:py-2.5 appearance-none text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer text-xs sm:text-sm hover:border-slate-400 transition-colors"
          >
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400 flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Right Dropdown: Branch / Stream */}
        <div className="relative">
          <label htmlFor="branch-select" className="sr-only">
            Select Branch / Stream
          </label>
          {isBranchDisabled ? (
            <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 sm:py-2.5 flex items-center justify-between text-slate-500 font-medium text-xs sm:text-sm cursor-not-allowed select-none">
              <span className="truncate">{branchDisabledReason}</span>
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
            </div>
          ) : (
            <>
              <select
                id="branch-select"
                value={selectedBranch}
                onChange={(e) => onBranchChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 sm:py-2.5 appearance-none text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer text-xs sm:text-sm hover:border-slate-400 transition-colors"
              >
                {branches.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400 flex items-center">
                <ChevronDown className="w-4 h-4" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Helpful indicator when semester is common ONLY for B.Tech / Polytechnic */}
      {showEngineeringCommonNotice && (
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-blue-700 bg-blue-50/80 border border-blue-200/60 rounded-lg px-2.5 py-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            Semesters 1 & 2 follow a common university syllabus. Branch selection unlocks from Semester 3 onwards.
          </span>
        </div>
      )}
    </div>
  );
};

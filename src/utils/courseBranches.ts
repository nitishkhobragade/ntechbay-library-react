/**
 * Predefined dependent branch mapping for each academic course
 * Conforms to NTechBay academic specifications
 */

export const COURSE_BRANCH_MAPPING: Record<string, string[]> = {
  'B.Tech': [
    'CIVIL',
    'CSE',
    'ELECTRICAL',
    'ECE',
    'MECHANICAL',
  ],
  'Polytechnic': [
    'CIVIL',
    'ELECTRICAL',
    'MECHANICAL',
  ],
  'M.Tech': [
    'CSE',
    'CTM',
    'DCE',
    'PRODUCTION',
  ],
  'MBA': [
    'Finance',
    'Marketing',
    'HR',
  ],
};

/**
 * Normalizes branch text to clean uppercase format for Firestore persistence
 */
export function normalizeBranchToUppercase(branch: string): string {
  if (!branch) return '';
  return branch.trim().toUpperCase();
}

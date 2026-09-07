import { BranchOption, CourseType, ResourceCategory, ResourceItem } from '../types';
import { courseData, CourseDataCategoryMap } from './courseData';
import { getCustomLinks, makeLinkKey } from './linkStore';

export const COURSES: CourseType[] = ['B.Tech', 'Polytechnic', 'MBA', 'M.Tech'];

export const COURSE_KEY_MAP: Record<CourseType, 'btech' | 'polytechnic' | 'mba' | 'mtech'> = {
  'B.Tech': 'btech',
  Polytechnic: 'polytechnic',
  MBA: 'mba',
  'M.Tech': 'mtech',
};

export const COURSE_SEMESTERS: Record<CourseType, string[]> = {
  'B.Tech': Array.from({ length: courseData.btech.semesters }, (_, i) => `Semester ${i + 1}`),
  Polytechnic: Array.from({ length: courseData.polytechnic.semesters }, (_, i) => `Semester ${i + 1}`),
  MBA: Array.from({ length: courseData.mba.semesters }, (_, i) => `Semester ${i + 1}`),
  'M.Tech': Array.from({ length: courseData.mtech.semesters }, (_, i) => `Semester ${i + 1}`),
};

export const BRANCH_NAMES: Record<string, string> = {
  CIVIL: 'Civil Engineering (CIVIL)',
  CSE: 'Computer Science & Engineering (CSE)',
  ELECTRICAL: 'Electrical Engineering (ELECTRICAL)',
  ECE: 'Electronics & Communication (ECE)',
  MECHANICAL: 'Mechanical Engineering (MECHANICAL)',
  CTM: 'Construction Technology & Mgmt (CTM)',
  DCE: 'Digital Communication Engg (DCE)',
  PRODUCTION: 'Production Engineering (PRODUCTION)',
  COMMON: 'Common for All Branches',
};

export const COURSE_BRANCHES: Record<CourseType, BranchOption[]> = {
  'B.Tech': courseData.btech.branches.map((code) => ({
    code,
    name: BRANCH_NAMES[code] || code,
  })),
  Polytechnic: courseData.polytechnic.branches.map((code) => ({
    code,
    name: BRANCH_NAMES[code] || code,
  })),
  'M.Tech': courseData.mtech.branches.map((code) => ({
    code,
    name: BRANCH_NAMES[code] || code,
  })),
  MBA: [],
};

export const CATEGORY_KEY_MAP: Record<ResourceCategory, keyof CourseDataCategoryMap> = {
  Syllabus: 'syllabus',
  'Study Books': 'books',
  Notes: 'notes',
  Questions: 'questions',
  Videos: 'videos',
  'Previous Year Papers': 'papers',
};

export const KEY_TO_CATEGORY: Record<keyof CourseDataCategoryMap, ResourceCategory> = {
  syllabus: 'Syllabus',
  books: 'Study Books',
  notes: 'Notes',
  questions: 'Questions',
  videos: 'Videos',
  papers: 'Previous Year Papers',
};

/**
 * Checks if a given semester is common for all branches in the selected course.
 * CRITICAL: Semesters 1 and 2 are ONLY common for B.Tech & Polytechnic.
 * For M.Tech: Semesters 1, 2, and 3 all have branch specialization (CSE, CTM, DCE, PRODUCTION) and are NOT common.
 * For MBA: There are no engineering branches; all 4 semesters are general management curriculum.
 */
export function isSemesterCommon(course: CourseType, semester: string): boolean {
  // Only B.Tech and Polytechnic have common 1st & 2nd semesters
  if (course !== 'B.Tech' && course !== 'Polytechnic') {
    return false;
  }

  const semNum = parseInt(semester.replace(/\D/g, ''), 10);
  if (isNaN(semNum)) return false;

  const courseKey = COURSE_KEY_MAP[course];
  const config = courseData[courseKey];
  return config ? config.common.includes(semNum) : false;
}

/**
 * Subject breakdown metadata for rich cards and preview
 */
const SUBJECT_DESCRIPTIONS: Record<string, string> = {
  Syllabus: 'Official university curriculum structure, course schemes, credit distributions, and exam regulations.',
  'Study Books': 'Standard recommended textbooks, reference literature, and author guides by renowned academicians.',
  Notes: 'Handwritten classroom lecture notes, module-wise revision capsules, and formula summaries.',
  Questions: 'Curated university question banks, numerical problem collections, and model exam sets.',
  Videos: 'Subject video lecture playlists, laboratory demonstrations, and topic tutorials.',
  'Previous Year Papers': 'Past 5 to 10 years solved and unsolved university examination question papers.',
};

/**
 * Fetches all resource items corresponding to the selected Course, Semester, and Branch.
 * Extracts the exact Base64 encoded Google Drive links from courseData.js.
 */
export function getResources(
  course: CourseType,
  semester: string,
  branch: string
): ResourceItem[] {
  const semNum = parseInt(semester.replace(/\D/g, ''), 10);
  const courseKey = COURSE_KEY_MAP[course];
  const config = courseData[courseKey];

  if (!config) return [];

  const isBTechOrPolyCommon = (course === 'B.Tech' || course === 'Polytechnic') && config.common.includes(semNum);
  const isMBA = course === 'MBA';

  const semData = config.data[semNum];
  if (!semData) return [];

  // In courseData, MBA and common B.Tech/Poly semesters store their links under .common
  const categoryMap: CourseDataCategoryMap = (isBTechOrPolyCommon || isMBA)
    ? semData.common || {}
    : semData[branch] || {};

  const results: ResourceItem[] = [];

  // Iterate over all categories in order
  const categories: ResourceCategory[] = [
    'Syllabus',
    'Study Books',
    'Notes',
    'Questions',
    'Videos',
    'Previous Year Papers',
  ];

  const customLinks = getCustomLinks();

  categories.forEach((cat) => {
    const key = CATEGORY_KEY_MAP[cat];
    const branchKey = (isBTechOrPolyCommon || isMBA) ? 'common' : branch;
    const customKey = makeLinkKey(courseKey, semNum, branchKey, key);
    // Custom link override takes precedence over default courseData link
    const encodedLink = customLinks[customKey] || categoryMap[key];

    if (encodedLink) {
      const isVideo = cat === 'Videos';
      const branchDisplay = isMBA
        ? 'General MBA'
        : isBTechOrPolyCommon
        ? 'Common (Sem 1 & 2)'
        : branch;

      const subjectDisplay = isMBA
        ? 'Master of Business Administration (All Specializations)'
        : isBTechOrPolyCommon
        ? 'Common First Year Engineering Curriculum'
        : (BRANCH_NAMES[branch] || branch);

      results.push({
        id: `rgpv-${courseKey}-${semNum}-${branchDisplay.toLowerCase().replace(/\s+/g, '-')}-${key}`,
        title: `${course} ${semester} ${isMBA ? 'General' : isBTechOrPolyCommon ? 'Common' : branch} ${cat} Drive Folder`,
        subject: subjectDisplay,
        course,
        semester,
        branch: isMBA ? 'General' : isBTechOrPolyCommon ? 'COMMON' : branch,
        category: cat,
        encodedLink,
        fileSize: isVideo ? undefined : 'Google Drive Cloud Folder',
        format: isVideo ? 'VIDEO' : 'PDF',
        authorOrProf: 'Er. Nitish Khobragade (NK) Library Archive',
        yearOrEdition: 'Academic Session 2024–2025',
        description: SUBJECT_DESCRIPTIONS[cat] || `Curated ${cat} resources available in Google Drive for ${course} students.`,
        duration: isVideo ? 'Multiple Video Modules' : undefined,
      });
    }
  });

  return results;
}

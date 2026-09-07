export type CourseType = 'B.Tech' | 'Polytechnic' | 'MBA' | 'M.Tech';

export type ResourceCategory =
  | 'Syllabus'
  | 'Study Books'
  | 'Notes'
  | 'Questions'
  | 'Videos'
  | 'Previous Year Papers';

export interface ResourceItem {
  id: string;
  title: string;
  subject: string;
  course: CourseType;
  semester: string;
  branch: string;
  category: ResourceCategory;
  /** Encoded with a2b (Base64), decoded via b2a (atob) on click */
  encodedLink: string;
  fileSize?: string;
  format?: 'PDF' | 'VIDEO' | 'DOC' | 'ZIP';
  authorOrProf?: string;
  yearOrEdition?: string;
  description?: string;
  duration?: string; // For videos
  driveFolderId?: string;
}

export interface BranchOption {
  code: string;
  name: string;
}

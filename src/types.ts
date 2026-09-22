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

export type UserRole = 'student' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  altPhone?: string;
  dob?: string; // Format: DD/MM/YYYY or YYYY-MM-DD
  bio?: string;
  college?: string;
  course?: string;
  branch?: string;
  photoBase64?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  authProvisioned?: boolean;
}

export type NoticeType = 'text' | 'promotion' | 'alert';

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  type: NoticeType;
  createdAt: string;
  active: boolean;
}

export interface BackupMetadata {
  exportDate: string; // DD/MM/YYYY
  exportTimestamp: string; // ISO string
  totalRecords: number;
  collectionCounts: {
    users: number;
    notices: number;
    courses: number;
    resources: number;
  };
  system: string;
  version: string;
}

export interface BackupDataPackage {
  metadata: BackupMetadata;
  collections: {
    users: Record<string, any>[];
    notices: Record<string, any>[];
    courses: Record<string, any>[];
    resources: Record<string, any>[];
  };
}

export interface RestoreItemResult {
  record: any;
  status: 'inserted' | 'skipped' | 'failed';
  reason?: string;
  identifier: string;
}

export interface RestoreSummary {
  totalInFile: number;
  successfullyRestored: number;
  skippedDuplicates: number;
  failed: number;
  details: RestoreItemResult[];
}

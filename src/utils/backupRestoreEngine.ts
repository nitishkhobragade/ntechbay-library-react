import {
  collection,
  getDocs,
  doc,
  writeBatch,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  UserProfile,
  BackupDataPackage,
  BackupMetadata,
  RestoreSummary,
  RestoreItemResult,
  UserRole,
  UserStatus,
} from '../types';
import { formatDateToDDMMYYYY } from './dateFormatter';

/**
 * Strict 400 writes chunk limit to safely prevent Firestore's 500-operation ceiling
 */
export const BATCH_CHUNK_LIMIT = 400;

/**
 * Recursively converts Firestore Timestamps, Dates, and nested objects
 * to clean ISO strings for lossless JSON export/import.
 */
export function serializeFirestoreValue(val: any): any {
  if (val === null || val === undefined) return val;

  // Check Firestore Timestamp with toDate method
  if (typeof val?.toDate === 'function') {
    try {
      return val.toDate().toISOString();
    } catch {
      // fallback
    }
  }

  // Check serialized Firestore Timestamp object { seconds, nanoseconds }
  if (typeof val?.seconds === 'number' && typeof val?.nanoseconds === 'number') {
    try {
      return new Date(val.seconds * 1000 + val.nanoseconds / 1e6).toISOString();
    } catch {
      // fallback
    }
  }

  if (val instanceof Date) {
    return val.toISOString();
  }

  if (Array.isArray(val)) {
    return val.map(serializeFirestoreValue);
  }

  if (typeof val === 'object' && val.constructor === Object) {
    const serialized: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      serialized[key] = serializeFirestoreValue(val[key]);
    }
    return serialized;
  }

  return val;
}

/**
 * Normalize mobile phone numbers strictly to 10 standard digits
 */
export function normalizePhoneNumber(rawPhone?: string | number | null): string {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/[^0-9]/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

/**
 * Strict date formatting to DD/MM/YYYY for DOB inputs
 */
export function sanitizeDobToDDMMYYYY(dateStr?: string | null): string {
  if (!dateStr) return '';
  const trimmed = String(dateStr).trim();
  if (!trimmed || trimmed === '—' || trimmed === '-') return '';

  // Already in DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // In DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  // In YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  // In MM/DD/YYYY
  const mdyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    const [, m, d, y] = mdyMatch;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  // Fallback to formatter
  const formatted = formatDateToDDMMYYYY(trimmed);
  return formatted !== '—' ? formatted : trimmed;
}

/**
 * Robust CSV Line Parser that handles quoted commas, escaped quotes ("") and line breaks
 */
export function parseCSVToRows(csvContent: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  const content = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped double quote inside quotes
        currentField += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Push final field if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * 1. Fetch all documents from Firestore collections: users, notices, courses, and resources.
 * Lossless JSON export converting Timestamps to ISO strings.
 * Downloads named ntechbay_full_backup_DD-MM-YYYY.json.
 */
export async function executeFullDatabaseExport(): Promise<{
  fileName: string;
  metadata: BackupMetadata;
  totalRecords: number;
}> {
  const collectionsToFetch = ['users', 'notices', 'courses', 'resources'];
  const collectionsData: Record<string, Record<string, any>[]> = {
    users: [],
    notices: [],
    courses: [],
    resources: [],
  };

  for (const collName of collectionsToFetch) {
    try {
      const snap = await getDocs(collection(db, collName));
      const items: Record<string, any>[] = [];
      snap.forEach((docSnap) => {
        const rawData = docSnap.data();
        const serialized = serializeFirestoreValue(rawData);
        // Ensure id is preserved
        if (!serialized.id) {
          serialized.id = docSnap.id;
        }
        if (!serialized.uid && collName === 'users') {
          serialized.uid = docSnap.id;
        }
        items.push(serialized);
      });
      collectionsData[collName] = items;
    } catch (err) {
      console.warn(`Collection ${collName} could not be fetched or is empty:`, err);
      collectionsData[collName] = [];
    }
  }

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const exportDateDDMMYYYY = `${day}/${month}/${year}`;
  const totalCount =
    collectionsData.users.length +
    collectionsData.notices.length +
    collectionsData.courses.length +
    collectionsData.resources.length;

  const metadata: BackupMetadata = {
    system: 'NTechBay Library Platform',
    version: '1.0',
    exportDate: exportDateDDMMYYYY,
    exportTimestamp: now.toISOString(),
    totalRecords: totalCount,
    collectionCounts: {
      users: collectionsData.users.length,
      notices: collectionsData.notices.length,
      courses: collectionsData.courses.length,
      resources: collectionsData.resources.length,
    },
  };

  const backupPackage: BackupDataPackage = {
    metadata,
    collections: {
      users: collectionsData.users,
      notices: collectionsData.notices,
      courses: collectionsData.courses,
      resources: collectionsData.resources,
    },
  };

  const fileName = `ntechbay_full_backup_${day}-${month}-${year}.json`;

  // Trigger browser file download
  const blob = new Blob([JSON.stringify(backupPackage, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Store last backup date in localStorage for admin convenience
  localStorage.setItem('ntechbay_last_backup_date', now.toISOString());
  localStorage.setItem('ntechbay_last_backup_records', String(totalCount));

  return { fileName, metadata, totalRecords: totalCount };
}

/**
 * Downloads a sample CSV template with expected headers:
 * name,email,mobileNumber,dob,course,branch,status
 */
export function downloadSampleCSVTemplate(): void {
  const headers = ['name', 'email', 'mobileNumber', 'dob', 'course', 'branch', 'status'];
  const sampleRows = [
    ['Rahul Sharma', 'rahul.sharma@example.com', '9876543210', '15/08/2002', 'B.Tech', 'CSE', 'active'],
    ['Priya Verma', 'priya.verma@example.com', '9812345678', '24/11/2003', 'B.Tech', 'IT', 'active'],
    ['Aman Patel', 'aman.patel@example.com', '9988776655', '03/05/2001', 'B.Tech', 'ME', 'active'],
    ['Sneha Gupta', 'sneha.gupta@example.com', '9123456780', '19/02/2003', 'B.Tech', 'ECE', 'active'],
  ];

  const csvContent =
    headers.join(',') + '\n' + sampleRows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'ntechbay_student_import_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitizes and cleans student profile attributes parsed from CSV row
 */
export function sanitizeStudentInput(rawRecord: Record<string, any>): UserProfile {
  // Extract name parts
  let firstName = (rawRecord.firstName || rawRecord.firstname || '').trim();
  let lastName = (rawRecord.lastName || rawRecord.lastname || '').trim();

  if (!firstName && rawRecord.name) {
    const rawName = String(rawRecord.name).trim();
    const parts = rawName.split(/\s+/);
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
  }

  const cleanEmail = (rawRecord.email || '').trim().toLowerCase();
  const cleanPhone = normalizePhoneNumber(
    rawRecord.mobileNumber || rawRecord.mobilenumber || rawRecord.phone || rawRecord.mobile
  );

  // Convert branch to uppercase strictly
  const rawBranch = String(rawRecord.branch || rawRecord.stream || rawRecord.department || 'CSE').trim();
  const cleanBranch = rawBranch.toUpperCase();

  // Format DOB strictly to DD/MM/YYYY
  const cleanDob = sanitizeDobToDDMMYYYY(
    rawRecord.dob || rawRecord.dateOfBirth || rawRecord.dateofbirth || rawRecord.birthdate
  );

  // Default values
  const rawStatus = String(rawRecord.status || 'active').trim().toLowerCase();
  const cleanStatus: UserStatus = rawStatus === 'suspended' ? 'suspended' : 'active';
  const cleanCourse = String(rawRecord.course || rawRecord.program || 'B.Tech').trim() || 'B.Tech';
  const cleanRole: UserRole = (rawRecord.role as UserRole) || 'student';

  const uid = rawRecord.uid || rawRecord.id || `student_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    uid,
    firstName: firstName || 'Student',
    lastName: lastName || '',
    email: cleanEmail,
    phone: cleanPhone,
    altPhone: rawRecord.altPhone ? normalizePhoneNumber(rawRecord.altPhone) : '',
    dob: cleanDob,
    college: (rawRecord.college || 'RGPV Affiliated College').trim(),
    course: cleanCourse,
    branch: cleanBranch,
    bio: (rawRecord.bio || '').trim(),
    photoBase64: rawRecord.photoBase64 || '',
    role: cleanRole,
    status: cleanStatus,
    createdAt: rawRecord.createdAt || new Date().toISOString(),
    authProvisioned: false, // Imported profiles without Auth UID require initial password reset
  };
}

export interface PreCheckResult {
  fileName: string;
  fileType: 'json' | 'csv';
  totalInFile: number;
  toInsertCount: number;
  skippedDuplicatesCount: number;
  failedCount: number;
  itemsToInsert: {
    collectionName: string;
    docId: string;
    data: Record<string, any>;
    identifier: string;
  }[];
  details: RestoreItemResult[];
  metadata?: BackupMetadata;
}

/**
 * 2. Pre-check Database State & Smart Deduplication Check:
 * - Pull existing user records from Firestore: collect existing email and mobileNumber sets.
 * - Deduplicate: If email or phone exists -> mark SKIPPED.
 * - If unique (or db empty) -> mark TO BE INSERTED.
 */
export async function preCheckImportFile(file: File): Promise<PreCheckResult> {
  const fileName = file.name;
  const isJson = fileName.toLowerCase().endsWith('.json');
  const isCsv = fileName.toLowerCase().endsWith('.csv');

  if (!isJson && !isCsv) {
    throw new Error('Unsupported file format. Please upload a valid .json backup or .csv student file.');
  }

  const textContent = await file.text();
  if (!textContent.trim()) {
    throw new Error('The selected file is empty.');
  }

  // Pre-check Database State: Fetch existing users to memory
  const existingEmails = new Set<string>();
  const existingPhones = new Set<string>();

  try {
    const snap = await getDocs(collection(db, 'users'));
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.email) {
        existingEmails.add(String(data.email).trim().toLowerCase());
      }
      if (data.phone) {
        const p = normalizePhoneNumber(data.phone);
        if (p) existingPhones.add(p);
      }
    });
  } catch (err) {
    console.warn('Could not read existing users from Firestore (database may be fresh/empty):', err);
  }

  const itemsToInsert: {
    collectionName: string;
    docId: string;
    data: Record<string, any>;
    identifier: string;
  }[] = [];

  const details: RestoreItemResult[] = [];

  // Track in-file duplicates during this import run
  const batchEmailsSeen = new Set<string>();
  const batchPhonesSeen = new Set<string>();

  let totalInFile = 0;
  let metadata: BackupMetadata | undefined;

  if (isJson) {
    let parsed: any;
    try {
      parsed = JSON.parse(textContent);
    } catch {
      throw new Error('Invalid JSON format. Please ensure the file is clean, uncorrupted JSON.');
    }

    // Check if it's a unified NTechBay backup package
    if (parsed.collections && typeof parsed.collections === 'object') {
      metadata = parsed.metadata;

      // 1. Process Users
      const usersList: any[] = Array.isArray(parsed.collections.users) ? parsed.collections.users : [];
      for (const rawUser of usersList) {
        totalInFile++;
        const email = (rawUser.email || '').trim().toLowerCase();
        const phone = normalizePhoneNumber(rawUser.phone || rawUser.mobileNumber);
        const identifier = email || phone || rawUser.uid || `Record #${totalInFile}`;

        if (!email && !phone) {
          details.push({
            record: rawUser,
            status: 'failed',
            reason: 'Missing both email and phone number',
            identifier,
          });
          continue;
        }

        // Deduplication Check
        if (email && (existingEmails.has(email) || batchEmailsSeen.has(email))) {
          details.push({
            record: rawUser,
            status: 'skipped',
            reason: `Duplicate Email: ${email}`,
            identifier,
          });
          continue;
        }

        if (phone && (existingPhones.has(phone) || batchPhonesSeen.has(phone))) {
          details.push({
            record: rawUser,
            status: 'skipped',
            reason: `Duplicate Phone: ${phone}`,
            identifier,
          });
          continue;
        }

        // Mark as TO BE INSERTED
        if (email) batchEmailsSeen.add(email);
        if (phone) batchPhonesSeen.add(phone);

        const sanitized = sanitizeStudentInput(rawUser);
        const docId = rawUser.uid || rawUser.id || sanitized.uid;

        itemsToInsert.push({
          collectionName: 'users',
          docId,
          data: sanitized,
          identifier,
        });

        details.push({
          record: sanitized,
          status: 'inserted',
          identifier,
        });
      }

      // 2. Process Notices
      const noticesList: any[] = Array.isArray(parsed.collections.notices) ? parsed.collections.notices : [];
      for (const rawNotice of noticesList) {
        totalInFile++;
        const docId = rawNotice.id || `notice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const identifier = rawNotice.title || docId;

        itemsToInsert.push({
          collectionName: 'notices',
          docId,
          data: {
            title: rawNotice.title || 'Untitled Notice',
            content: rawNotice.content || '',
            imageUrl: rawNotice.imageUrl || '',
            type: rawNotice.type || 'text',
            createdAt: rawNotice.createdAt || new Date().toISOString(),
            active: rawNotice.active ?? true,
          },
          identifier,
        });

        details.push({
          record: rawNotice,
          status: 'inserted',
          identifier,
        });
      }

      // 3. Process Courses
      const coursesList: any[] = Array.isArray(parsed.collections.courses) ? parsed.collections.courses : [];
      for (const rawCourse of coursesList) {
        totalInFile++;
        const docId = rawCourse.id || `course_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const identifier = rawCourse.name || docId;

        itemsToInsert.push({
          collectionName: 'courses',
          docId,
          data: rawCourse,
          identifier,
        });

        details.push({
          record: rawCourse,
          status: 'inserted',
          identifier,
        });
      }

      // 4. Process Resources
      const resourcesList: any[] = Array.isArray(parsed.collections.resources) ? parsed.collections.resources : [];
      for (const rawResource of resourcesList) {
        totalInFile++;
        const docId = rawResource.id || `res_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const identifier = rawResource.title || docId;

        itemsToInsert.push({
          collectionName: 'resources',
          docId,
          data: rawResource,
          identifier,
        });

        details.push({
          record: rawResource,
          status: 'inserted',
          identifier,
        });
      }
    } else {
      // Raw JSON array of user records
      const records: any[] = Array.isArray(parsed) ? parsed : parsed.users ? parsed.users : [parsed];
      for (const rawUser of records) {
        totalInFile++;
        const email = (rawUser.email || '').trim().toLowerCase();
        const phone = normalizePhoneNumber(rawUser.phone || rawUser.mobileNumber);
        const identifier = email || phone || `Record #${totalInFile}`;

        if (!email && !phone) {
          details.push({
            record: rawUser,
            status: 'failed',
            reason: 'Missing both email and phone number',
            identifier,
          });
          continue;
        }

        if (email && (existingEmails.has(email) || batchEmailsSeen.has(email))) {
          details.push({
            record: rawUser,
            status: 'skipped',
            reason: `Duplicate Email: ${email}`,
            identifier,
          });
          continue;
        }

        if (phone && (existingPhones.has(phone) || batchPhonesSeen.has(phone))) {
          details.push({
            record: rawUser,
            status: 'skipped',
            reason: `Duplicate Phone: ${phone}`,
            identifier,
          });
          continue;
        }

        if (email) batchEmailsSeen.add(email);
        if (phone) batchPhonesSeen.add(phone);

        const sanitized = sanitizeStudentInput(rawUser);
        const docId = rawUser.uid || rawUser.id || sanitized.uid;

        itemsToInsert.push({
          collectionName: 'users',
          docId,
          data: sanitized,
          identifier,
        });

        details.push({
          record: sanitized,
          status: 'inserted',
          identifier,
        });
      }
    }
  } else if (isCsv) {
    // 3. CSV File Parser & Formatting
    const rows = parseCSVToRows(textContent);
    if (rows.length < 2) {
      throw new Error('CSV file must contain a header row and at least one student data row.');
    }

    const headerRow = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Map headers
    const findHeaderIndex = (aliases: string[]): number => {
      return headerRow.findIndex((col) => aliases.includes(col));
    };

    const nameIdx = findHeaderIndex(['name', 'fullname', 'studentname', 'student']);
    const firstNameIdx = findHeaderIndex(['firstname', 'fname', 'first']);
    const lastNameIdx = findHeaderIndex(['lastname', 'lname', 'last']);
    const emailIdx = findHeaderIndex(['email', 'emailid', 'emailaddress']);
    const phoneIdx = findHeaderIndex(['mobilenumber', 'mobile', 'phone', 'phonenumber', 'contact']);
    const dobIdx = findHeaderIndex(['dob', 'dateofbirth', 'birthdate']);
    const courseIdx = findHeaderIndex(['course', 'program', 'degree']);
    const branchIdx = findHeaderIndex(['branch', 'stream', 'department']);
    const statusIdx = findHeaderIndex(['status', 'accountstatus', 'state']);

    if (emailIdx === -1 && phoneIdx === -1) {
      throw new Error(
        'CSV must contain at least an "email" or "mobileNumber" header column for student uniqueness check.'
      );
    }

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      totalInFile++;

      const rawEmail = emailIdx !== -1 ? (row[emailIdx] || '').trim() : '';
      const rawPhone = phoneIdx !== -1 ? (row[phoneIdx] || '').trim() : '';
      const cleanEmail = rawEmail.toLowerCase();
      const cleanPhone = normalizePhoneNumber(rawPhone);

      const identifier = cleanEmail || cleanPhone || `CSV Row #${r + 1}`;

      // Email validation check
      if (!cleanEmail && !cleanPhone) {
        details.push({
          record: row,
          status: 'failed',
          reason: 'Row has no email and no mobile number',
          identifier,
        });
        continue;
      }

      if (cleanEmail && !cleanEmail.includes('@')) {
        details.push({
          record: row,
          status: 'failed',
          reason: `Invalid email format: "${cleanEmail}"`,
          identifier,
        });
        continue;
      }

      // Deduplication Check: Check existing and batch sets
      if (cleanEmail && (existingEmails.has(cleanEmail) || batchEmailsSeen.has(cleanEmail))) {
        details.push({
          record: row,
          status: 'skipped',
          reason: `Duplicate Email: ${cleanEmail}`,
          identifier,
        });
        continue;
      }

      if (cleanPhone && (existingPhones.has(cleanPhone) || batchPhonesSeen.has(cleanPhone))) {
        details.push({
          record: row,
          status: 'skipped',
          reason: `Duplicate Mobile Phone: ${cleanPhone}`,
          identifier,
        });
        continue;
      }

      // Mark unique and reserve in batch set
      if (cleanEmail) batchEmailsSeen.add(cleanEmail);
      if (cleanPhone) batchPhonesSeen.add(cleanPhone);

      let nameVal = nameIdx !== -1 ? row[nameIdx] || '' : '';
      let fNameVal = firstNameIdx !== -1 ? row[firstNameIdx] || '' : '';
      let lNameVal = lastNameIdx !== -1 ? row[lastNameIdx] || '' : '';

      const rawRecord = {
        name: nameVal,
        firstName: fNameVal,
        lastName: lNameVal,
        email: cleanEmail,
        mobileNumber: cleanPhone,
        dob: dobIdx !== -1 ? row[dobIdx] : '',
        course: courseIdx !== -1 ? row[courseIdx] : 'B.Tech',
        branch: branchIdx !== -1 ? row[branchIdx] : 'CSE',
        status: statusIdx !== -1 ? row[statusIdx] : 'active',
      };

      const sanitizedStudent = sanitizeStudentInput(rawRecord);

      itemsToInsert.push({
        collectionName: 'users',
        docId: sanitizedStudent.uid,
        data: sanitizedStudent,
        identifier,
      });

      details.push({
        record: sanitizedStudent,
        status: 'inserted',
        identifier,
      });
    }
  }

  const toInsertCount = details.filter((d) => d.status === 'inserted').length;
  const skippedDuplicatesCount = details.filter((d) => d.status === 'skipped').length;
  const failedCount = details.filter((d) => d.status === 'failed').length;

  return {
    fileName,
    fileType: isJson ? 'json' : 'csv',
    totalInFile,
    toInsertCount,
    skippedDuplicatesCount,
    failedCount,
    itemsToInsert,
    details,
    metadata,
  };
}

/**
 * 2. Commit Smart Restore with Batch Chunking (Commit every 400 writes):
 * Commits exactly every 400 writes to prevent Firestore's 500-operation limit.
 * Provides real-time progress updates.
 */
export async function commitSmartRestore(
  itemsToInsert: PreCheckResult['itemsToInsert'],
  totalInFile: number,
  preCheckDetails: RestoreItemResult[],
  onProgress: (importedCount: number, totalToImport: number, percentage: number, message: string) => void
): Promise<RestoreSummary> {
  const totalToImport = itemsToInsert.length;
  let importedCount = 0;

  if (totalToImport === 0) {
    onProgress(0, 0, 100, 'Completed. No new records needed to be inserted.');
    return {
      totalInFile,
      successfullyRestored: 0,
      skippedDuplicates: preCheckDetails.filter((d) => d.status === 'skipped').length,
      failed: preCheckDetails.filter((d) => d.status === 'failed').length,
      details: preCheckDetails,
    };
  }

  // Iterate in chunks of strictly BATCH_CHUNK_LIMIT (400)
  for (let i = 0; i < totalToImport; i += BATCH_CHUNK_LIMIT) {
    const chunk = itemsToInsert.slice(i, i + BATCH_CHUNK_LIMIT);
    const chunkIndex = Math.floor(i / BATCH_CHUNK_LIMIT) + 1;
    const totalChunks = Math.ceil(totalToImport / BATCH_CHUNK_LIMIT);

    onProgress(
      importedCount,
      totalToImport,
      Math.round((importedCount / totalToImport) * 100),
      `Preparing chunk ${chunkIndex} of ${totalChunks} (${chunk.length} writes)...`
    );

    const batch = writeBatch(db);

    for (const item of chunk) {
      const docRef = doc(db, item.collectionName, item.docId);
      batch.set(docRef, item.data, { merge: true });
    }

    await batch.commit();

    importedCount += chunk.length;
    const pct = Math.round((importedCount / totalToImport) * 100);

    onProgress(
      importedCount,
      totalToImport,
      pct,
      `Importing: ${importedCount} / ${totalToImport} records... (${pct}%)`
    );
  }

  onProgress(importedCount, totalToImport, 100, 'Import completed successfully!');

  const skippedCount = preCheckDetails.filter((d) => d.status === 'skipped').length;
  const failedCount = preCheckDetails.filter((d) => d.status === 'failed').length;

  return {
    totalInFile,
    successfullyRestored: importedCount,
    skippedDuplicates: skippedCount,
    failed: failedCount,
    details: preCheckDetails,
  };
}

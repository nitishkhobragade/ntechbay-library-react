/**
 * Store and Manager for Custom Link Overrides and Admin Settings
 * Persisted in localStorage so changes made in the Admin Panel persist across refreshes.
 */

export interface CustomLinkMap {
  // key format: `${courseKey}_${semNum}_${branchKey}_${categoryKey}`
  // e.g. "btech_4_CIVIL_notes" or "polytechnic_1_common_syllabus"
  [key: string]: string;
}

export interface AppSettings {
  announcementText: string;
  isAnnouncementEnabled: boolean;
  adminPassword: string;
  studentPassword: string;
}

const CUSTOM_LINKS_KEY = 'ntechbay_custom_links';
const APP_SETTINGS_KEY = 'ntechbay_app_settings';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  announcementText: '📢 Welcome to NTechBay-Library! All RGPV B.Tech, Polytechnic, MBA & M.Tech resources are updated.',
  isAnnouncementEnabled: false,
  adminPassword: 'admin@nk',
  studentPassword: 'nitishkhobragade',
};

/**
 * Generate a unique storage key for a specific link
 */
export function makeLinkKey(
  courseKey: string,
  semNum: number,
  branch: string,
  categoryKey: string
): string {
  return `${courseKey.toLowerCase()}_sem${semNum}_${branch.toUpperCase()}_${categoryKey.toLowerCase()}`;
}

/**
 * Get all custom link overrides from localStorage
 */
export function getCustomLinks(): CustomLinkMap {
  try {
    const raw = localStorage.getItem(CUSTOM_LINKS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom links:', e);
    return {};
  }
}

/**
 * Save all custom link overrides to localStorage
 */
export function saveCustomLinks(links: CustomLinkMap): void {
  try {
    localStorage.setItem(CUSTOM_LINKS_KEY, JSON.stringify(links));
  } catch (e) {
    console.error('Failed to save custom links:', e);
  }
}

/**
 * Update a single link override
 */
export function setCustomLink(
  courseKey: string,
  semNum: number,
  branch: string,
  categoryKey: string,
  newLink: string
): void {
  const current = getCustomLinks();
  const key = makeLinkKey(courseKey, semNum, branch, categoryKey);
  if (!newLink.trim()) {
    delete current[key];
  } else {
    current[key] = newLink.trim();
  }
  saveCustomLinks(current);
}

/**
 * Clear all custom links (reset to defaults from courseData)
 */
export function clearAllCustomLinks(): void {
  try {
    localStorage.removeItem(CUSTOM_LINKS_KEY);
  } catch (e) {
    console.error('Failed to clear custom links:', e);
  }
}

/**
 * Get app settings from localStorage
 */
export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY);
    if (!raw) {
      // Check legacy student password if available
      const legacyStudentPwd = localStorage.getItem('ntechbay_password');
      return {
        ...DEFAULT_APP_SETTINGS,
        studentPassword: legacyStudentPwd || DEFAULT_APP_SETTINGS.studentPassword,
      };
    }
    return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load app settings:', e);
    return DEFAULT_APP_SETTINGS;
  }
}

/**
 * Save app settings to localStorage
 */
export function saveAppSettings(settings: Partial<AppSettings>): AppSettings {
  try {
    const current = getAppSettings();
    const updated: AppSettings = { ...current, ...settings };
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(updated));
    // Also synchronize the student password in legacy key for backward compatibility
    if (settings.studentPassword) {
      localStorage.setItem('ntechbay_password', settings.studentPassword);
    }
    return updated;
  } catch (e) {
    console.error('Failed to save app settings:', e);
    return DEFAULT_APP_SETTINGS;
  }
}

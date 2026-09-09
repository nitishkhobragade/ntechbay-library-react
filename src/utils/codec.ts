/**
 * Encoder / Decoder utility for NTechBay-Library
 * The author uses an a2b (ASCII-to-Binary/Base64) encoder for all resource and object links.
 * The application decodes these links using b2a (Base64-to-ASCII/atob) before opening or downloading.
 */

/**
 * a2b JavaScript Encoder: Encodes plain text / URL into Base64 format
 */
export function a2b(plainText: string): string {
  if (!plainText) return '';
  try {
    return btoa(unescape(encodeURIComponent(plainText)));
  } catch {
    try {
      return btoa(plainText);
    } catch (e) {
      console.error('a2b encoding error:', e);
      return plainText;
    }
  }
}

/**
 * Normalizes and sanitizes URLs, correcting common typos like 'drive^google.com' or 'drive_google.com'
 * to guarantee that all opened links succeed.
 */
export function normalizeUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  // Correct typographical domain variations found in legacy course link datasets
  if (cleaned.includes('drive^google.com')) {
    cleaned = cleaned.replace(/drive\^google\.com/g, 'drive.google.com');
  }
  if (cleaned.includes('drive_google.com')) {
    cleaned = cleaned.replace(/drive_google\.com/g, 'drive.google.com');
  }
  return cleaned;
}

/**
 * b2a JavaScript Decoder: Decodes Base64 encoded link into standard URL
 */
export function b2a(encodedString: string): string {
  if (!encodedString) return '';
  const trimmed = encodedString.trim();

  // If it's already a standard URL, return sanitized directly
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('blob:')
  ) {
    return normalizeUrl(trimmed);
  }

  try {
    const binaryStr = atob(trimmed);
    let decoded = binaryStr;
    try {
      decoded = decodeURIComponent(escape(binaryStr));
    } catch {
      decoded = binaryStr;
    }
    return normalizeUrl(decoded);
  } catch (error) {
    console.warn('b2a decoding fallback for string:', encodedString, error);
    return normalizeUrl(trimmed);
  }
}

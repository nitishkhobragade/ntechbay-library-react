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
 * b2a JavaScript Decoder: Decodes Base64 encoded link into standard URL
 */
export function b2a(encodedString: string): string {
  if (!encodedString) return '';
  // If it's already a standard URL, return it directly
  if (
    encodedString.startsWith('http://') ||
    encodedString.startsWith('https://') ||
    encodedString.startsWith('mailto:') ||
    encodedString.startsWith('blob:')
  ) {
    return encodedString;
  }

  try {
    const binaryStr = atob(encodedString);
    try {
      return decodeURIComponent(escape(binaryStr));
    } catch {
      return binaryStr;
    }
  } catch (error) {
    console.warn('b2a decoding fallback for string:', encodedString, error);
    return encodedString;
  }
}

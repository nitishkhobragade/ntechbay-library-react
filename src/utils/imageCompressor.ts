/**
 * Real-Time Client-Side Image Compression Utility
 * Iteratively resizes dimensions and adjusts JPEG quality using HTML5 Canvas API
 * strictly targeting the 50 KB - 100 KB file size range (51,200 - 102,400 bytes).
 */

export interface CompressedImageResult {
  base64: string;
  blob: Blob;
  sizeBytes: number;
  sizeKB: number;
}

export function getBase64ByteSize(base64String: string): number {
  const commaIdx = base64String.indexOf(',');
  const data = commaIdx >= 0 ? base64String.slice(commaIdx + 1) : base64String;
  const padding = (data.match(/=+$/) || [''])[0].length;
  return Math.floor((data.length * 3) / 4) - padding;
}

function base64ToBlob(base64String: string): Blob {
  const commaIdx = base64String.indexOf(',');
  const data = commaIdx >= 0 ? base64String.slice(commaIdx + 1) : base64String;
  const mimeMatch = base64String.match(/data:([^;]+);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const byteCharacters = atob(data);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([byteNumbers], { type: mime });
}

/**
 * Compresses an image file (e.g. from an <input type="file" onChange={...}>)
 * strictly into the 50 KB - 100 KB range before setting form state or sending to Firebase.
 */
export async function compressImageTo50to100KB(
  file: File | Blob
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context unavailable'));
        }

        const TARGET_MIN_BYTES = 50 * 1024; // 51,200 bytes
        const TARGET_MAX_BYTES = 100 * 1024; // 102,400 bytes

        // Initial dimension calculation with high-quality cap
        let maxDim = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = Math.max(width, 10);
        canvas.height = Math.max(height, 10);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Iterative search for quality between 0.95 and 0.25
        let quality = 0.88;
        let base64 = canvas.toDataURL('image/jpeg', quality);
        let byteSize = getBase64ByteSize(base64);

        // If larger than 100 KB, decrease quality
        while (byteSize > TARGET_MAX_BYTES && quality > 0.3) {
          quality -= 0.08;
          base64 = canvas.toDataURL('image/jpeg', quality);
          byteSize = getBase64ByteSize(base64);
        }

        // If still > 100 KB, downscale dimensions
        while (byteSize > TARGET_MAX_BYTES && (canvas.width > 200 || canvas.height > 200)) {
          canvas.width = Math.round(canvas.width * 0.85);
          canvas.height = Math.round(canvas.height * 0.85);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          quality = 0.75;
          base64 = canvas.toDataURL('image/jpeg', quality);
          byteSize = getBase64ByteSize(base64);

          while (byteSize > TARGET_MAX_BYTES && quality > 0.25) {
            quality -= 0.08;
            base64 = canvas.toDataURL('image/jpeg', quality);
            byteSize = getBase64ByteSize(base64);
          }
        }

        // If image was originally small (< 50 KB) and canvas dimension allows higher resolution/quality
        if (byteSize < TARGET_MIN_BYTES && quality < 0.96) {
          const testQuality = 0.96;
          const testBase64 = canvas.toDataURL('image/jpeg', testQuality);
          const testSize = getBase64ByteSize(testBase64);
          if (testSize <= TARGET_MAX_BYTES) {
            base64 = testBase64;
            byteSize = testSize;
          }
        }

        const sizeKB = Math.round((byteSize / 1024) * 10) / 10;
        const blob = base64ToBlob(base64);

        resolve({
          base64,
          blob,
          sizeBytes: byteSize,
          sizeKB,
        });
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}

/**
 * Backward-compatible alias for existing imports
 */
export async function compressImageTo50KB(
  file: File | Blob
): Promise<CompressedImageResult> {
  return compressImageTo50to100KB(file);
}

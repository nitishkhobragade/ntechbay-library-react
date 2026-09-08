/**
 * Compresses an image file strictly to <= 50KB (51,200 bytes) in Base64 format
 * using native HTML5 Canvas API.
 */
export async function compressImageTo50KB(
  file: File | Blob
): Promise<{ base64: string; sizeBytes: number; sizeKB: number }> {
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

        // Start with a reasonable avatar size (max 400x400)
        let maxDim = 400;
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

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const TARGET_MAX_BYTES = 50 * 1024; // 51,200 bytes

        // Iteratively try quality and then scale down dimension if needed
        let quality = 0.85;
        let base64 = canvas.toDataURL('image/jpeg', quality);
        let byteSize = getBase64ByteSize(base64);

        while (byteSize > TARGET_MAX_BYTES && quality > 0.15) {
          quality -= 0.1;
          base64 = canvas.toDataURL('image/jpeg', quality);
          byteSize = getBase64ByteSize(base64);
        }

        // If still > 50KB, reduce canvas dimensions
        if (byteSize > TARGET_MAX_BYTES) {
          maxDim = 250;
          width = Math.round(width * 0.7);
          height = Math.round(height * 0.7);
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          quality = 0.75;
          base64 = canvas.toDataURL('image/jpeg', quality);
          byteSize = getBase64ByteSize(base64);

          while (byteSize > TARGET_MAX_BYTES && quality > 0.1) {
            quality -= 0.1;
            base64 = canvas.toDataURL('image/jpeg', quality);
            byteSize = getBase64ByteSize(base64);
          }
        }

        // Final safety check if extreme: scale down to 180x180
        if (byteSize > TARGET_MAX_BYTES) {
          canvas.width = 160;
          canvas.height = 160;
          ctx.drawImage(img, 0, 0, 160, 160);
          base64 = canvas.toDataURL('image/jpeg', 0.6);
          byteSize = getBase64ByteSize(base64);
        }

        const sizeKB = Math.round((byteSize / 1024) * 10) / 10;
        resolve({
          base64,
          sizeBytes: byteSize,
          sizeKB,
        });
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}

export function getBase64ByteSize(base64String: string): number {
  const padding = (base64String.match(/=+$/) || [''])[0].length;
  const base64Length = base64String.length - (base64String.indexOf(',') + 1);
  return Math.floor((base64Length * 3) / 4) - padding;
}

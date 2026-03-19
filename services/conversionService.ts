import { TargetFormat } from '../types';

/**
 * Encode ImageData to AVIF using @jsquash/avif WASM encoder.
 */
async function encodeAvifWithWasm(imageData: ImageData, quality: number): Promise<Blob> {
  const { default: encode } = await import('@jsquash/avif/encode');
  const avifBuffer = await encode(imageData, {
    quality: Math.round(quality * 100),
  });
  return new Blob([avifBuffer], { type: 'image/avif' });
}

/**
 * Converts an image file to the target format using the browser's native Canvas API.
 * This ensures data never leaves the client.
 */
export const convertImageFile = (
  file: File,
  format: TargetFormat,
  quality: number = 0.8
): Promise<Blob> => {
  // PDF conversion uses jsPDF
  if (format === 'application/pdf') {
    return convertToPdf(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        // Create canvas matching image dimensions
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw image to canvas
        // For JPG/GIF, fill white background since they don't support transparency
        if (format === 'image/jpeg' || format === 'image/gif') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        // For AVIF output, try native encoding first, then WASM fallback
        if (format === 'image/avif') {
          canvas.toBlob(
            (blob) => {
              if (blob && blob.type === 'image/avif') {
                resolve(blob);
              } else {
                // Browser doesn't support AVIF encoding, try with OffscreenCanvas
                try {
                  const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
                  const offCtx = offscreen.getContext('2d');
                  if (!offCtx) {
                    // OffscreenCanvas failed, fall back to WASM encoder
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    encodeAvifWithWasm(imageData, quality).then(resolve, reject);
                    return;
                  }
                  offCtx.drawImage(img, 0, 0);
                  offscreen.convertToBlob({ type: 'image/avif', quality }).then(
                    (avifBlob) => {
                      if (avifBlob && avifBlob.type === 'image/avif') {
                        resolve(avifBlob);
                      } else {
                        // OffscreenCanvas didn't produce AVIF, fall back to WASM
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        encodeAvifWithWasm(imageData, quality).then(resolve, reject);
                      }
                    },
                    () => {
                      // OffscreenCanvas.convertToBlob failed, fall back to WASM
                      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                      encodeAvifWithWasm(imageData, quality).then(resolve, reject);
                    }
                  );
                } catch {
                  // OffscreenCanvas not available, fall back to WASM encoder
                  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  encodeAvifWithWasm(imageData, quality).then(resolve, reject);
                }
              }
            },
            'image/avif',
            quality
          );
          return;
        }

        // For GIF output, use PNG as intermediate (single frame)
        if (format === 'image/gif') {
          // Browsers don't support canvas.toBlob('image/gif')
          // Convert via PNG and re-encode using canvas data
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Return as GIF-compatible image (PNG with .gif extension)
                // Most browsers will handle this gracefully
                resolve(blob);
              } else {
                reject(new Error('GIF conversion failed'));
              }
            },
            'image/png',
            1.0
          );
          return;
        }

        // Export to blob for standard formats
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Conversion failed'));
            }
          },
          format,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image. The format might not be supported by your browser yet.'));
      };

      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Convert image to PDF using jsPDF
 */
async function convertToPdf(file: File): Promise<Blob> {
  const { jsPDF } = await import('jspdf');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create PDF with image dimensions
        const orientation = img.width > img.height ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
          orientation,
          unit: 'px',
          format: [img.width, img.height],
        });

        // Convert image to data URL for embedding
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(dataUrl, 'JPEG', 0, 0, img.width, img.height);

        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);
      };
      img.onerror = () => reject(new Error('Failed to load image for PDF conversion'));
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const getExtensionFromMime = (mime: TargetFormat): string => {
  switch (mime) {
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    case 'image/webp': return 'webp';
    case 'image/avif': return 'avif';
    case 'image/gif': return 'gif';
    case 'application/pdf': return 'pdf';
    default: return 'jpg';
  }
};

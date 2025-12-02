import { TargetFormat } from '../types';

/**
 * Converts an image file to the target format using the browser's native Canvas API.
 * This ensures data never leaves the client.
 */
export const convertImageFile = (
  file: File,
  format: TargetFormat,
  quality: number = 0.8
): Promise<Blob> => {
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
        // For PNG, we preserve transparency. For JPG, we might want a white background if transparent.
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);

        // Export to blob
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
    default: return 'jpg';
  }
};

import { TargetFormat } from '../types';

// File size limit: 10MB (reduced from 50MB)
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_BATCH_SIZE = 30;

// Supported formats
const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

export enum FileValidationError {
  NON_IMAGE = 'non_image',
  OVERSIZED = 'oversized',
  CORRUPTED = 'corrupted',
  SAME_FORMAT = 'same_format',
  UNSUPPORTED = 'unsupported',
  BATCH_LIMIT = 'batch_limit',
  VALID = 'valid'
}

export interface ValidationResult {
  isValid: boolean;
  error?: FileValidationError;
  sourceFormat?: string;
}

/**
 * Detects the source format of a file
 */
export const detectSourceFormat = (file: File): string => {
  // First check MIME type
  if (file.type) {
    const mimeToFormat: Record<string, string> = {
      'image/jpeg': 'JPG',
      'image/jpg': 'JPG',
      'image/png': 'PNG',
      'image/webp': 'WebP',
      'image/avif': 'AVIF'
    };
    if (mimeToFormat[file.type.toLowerCase()]) {
      return mimeToFormat[file.type.toLowerCase()];
    }
  }

  // Fallback to extension
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) return 'JPG';
  if (fileName.endsWith('.png')) return 'PNG';
  if (fileName.endsWith('.webp')) return 'WebP';
  if (fileName.endsWith('.avif')) return 'AVIF';

  return 'Unknown';
};

/**
 * Checks if target format matches source format
 */
export const isSameFormat = (sourceFormat: string, targetFormat: TargetFormat): boolean => {
  const formatMap: Record<string, TargetFormat> = {
    'JPG': 'image/jpeg',
    'PNG': 'image/png',
    'WebP': 'image/webp'
  };

  return formatMap[sourceFormat] === targetFormat;
};

/**
 * Validates a single file
 */
export const validateFile = (file: File, targetFormat: TargetFormat): ValidationResult => {
  // 1. Check if file is corrupted (0 bytes)
  if (file.size === 0) {
    return { isValid: false, error: FileValidationError.CORRUPTED };
  }

  // 2. Check file size limit
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: FileValidationError.OVERSIZED };
  }

  // 3. Check if it's an image file
  const isImage = file.type.startsWith('image/') ||
                  SUPPORTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));

  if (!isImage) {
    return { isValid: false, error: FileValidationError.NON_IMAGE };
  }

  // 4. Check if format is supported
  const isSupportedMime = SUPPORTED_IMAGE_FORMATS.includes(file.type.toLowerCase());
  const isSupportedExt = SUPPORTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));

  if (!isSupportedMime && !isSupportedExt) {
    return { isValid: false, error: FileValidationError.UNSUPPORTED };
  }

  // 5. Detect source format
  const sourceFormat = detectSourceFormat(file);

  // 6. Check if source and target formats are the same
  if (isSameFormat(sourceFormat, targetFormat)) {
    return { isValid: false, error: FileValidationError.SAME_FORMAT, sourceFormat };
  }

  return { isValid: true, error: FileValidationError.VALID, sourceFormat };
};

/**
 * Gets the format name from MIME type
 */
export const getFormatName = (mimeType: TargetFormat): string => {
  const formatMap: Record<TargetFormat, string> = {
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/webp': 'WebP'
  };
  return formatMap[mimeType] || 'Unknown';
};

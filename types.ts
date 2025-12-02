export enum ConversionStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export type TargetFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ProcessedFile {
  id: string;
  originalFile: File;
  previewUrl: string; // Blob URL for preview
  status: ConversionStatus;
  progress: number;
  convertedBlob?: Blob;
  convertedUrl?: string;
  outputSize?: number;
  errorMessage?: string;
  targetFormat?: TargetFormat; // Individual file override format
  sourceFormat?: string; // Detected source format (e.g., 'PNG', 'WebP')
  isFormatOverride?: boolean; // Whether this file has local format override
}

export interface NavItem {
  label: string;
  href: string;
  highlight?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

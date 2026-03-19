'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadCloud, X, Download, RefreshCw, AlertCircle, Eye, ChevronDown } from 'lucide-react';
import { ProcessedFile, ConversionStatus, TargetFormat } from '../types';
import { convertImageFile, formatBytes, getExtensionFromMime } from '../services/conversionService';
import {
  validateFile,
  detectSourceFormat,
  isSameFormat,
  getFormatName,
  FileValidationError,
  MAX_BATCH_SIZE,
  MAX_FILE_SIZE_BYTES
} from '../services/fileValidationService';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ToastContainer, ToastMessage } from './Toast';
import { ImageComparisonSlider } from './ImageComparisonSlider';
import JSZip from 'jszip';

// Helper to download blob without external dependency
const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Map format to corresponding page route
const formatToRoute: Record<string, string> = {
  'image/jpeg': '/avif-to-jpg',
  'image/png': '/avif-to-png',
  'image/webp': '/avif-to-webp',
  'image/avif': '/',
  'image/gif': '/avif-to-gif',
  'application/pdf': '/avif-to-pdf',
};

// Pages that convert TO AVIF (reverse conversion pages)
const reversePages = new Set(['png-to-avif', 'jpg-to-avif', 'webp-to-avif']);

type PageKey = 'home' | 'jpg' | 'png' | 'webp' | 'png-to-avif' | 'jpg-to-avif' | 'webp-to-avif' | 'avif-to-gif' | 'avif-to-pdf' | 'avif-viewer';

interface ConverterProps {
  defaultOutputFormat?: TargetFormat;
  pageKey?: PageKey;
}

export const Converter: React.FC<ConverterProps> = ({ defaultOutputFormat = 'image/jpeg', pageKey }) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [globalTargetFormat, setGlobalTargetFormat] = useState<TargetFormat>(defaultOutputFormat);
  const [quality, setQuality] = useState<number>(0.85);
  const [isDragging, setIsDragging] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dropZoneError, setDropZoneError] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef(files);
  filesRef.current = files;

  // Determine if this is a reverse conversion page
  const isReversePage = pageKey && reversePages.has(pageKey);

  // Update format if prop changes (e.g. navigation)
  useEffect(() => {
    setGlobalTargetFormat(defaultOutputFormat);
  }, [defaultOutputFormat]);

  // Cleanup all Blob URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clipboard paste support (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        addFiles(imageFiles);
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  });

  // Toast management
  const addToast = (message: string, type: ToastMessage['type'] = 'error', actionLabel?: string, onAction?: () => void) => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts(prev => [...prev, { id, message, type, actionLabel, onAction }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Get the appropriate error message key for same-format errors
  const getSameFormatErrorKey = (targetFormat: TargetFormat): string => {
    const formatName = getFormatName(targetFormat);
    return `converter.errors.same_format_${formatName.toLowerCase()}`;
  };

  // Get alternative format for "Convert instead?" action
  const getAlternativeFormat = (targetFormat: TargetFormat): TargetFormat => {
    const formats: TargetFormat[] = ['image/jpeg', 'image/png', 'image/webp'];
    const currentIndex = formats.indexOf(targetFormat);
    const nextIndex = (currentIndex + 1) % formats.length;
    return formats[nextIndex >= 0 ? nextIndex : 0];
  };

  // -- File Handling --
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const addFiles = (newFiles: File[]) => {
    setDropZoneError(false);

    if (filesRef.current.length + newFiles.length > MAX_BATCH_SIZE) {
      addToast(t('converter.errors.batch_limit'), 'warning');
      setDropZoneError(true);
      return;
    }

    const validFiles: { file: File; sourceFormat: string }[] = [];
    const rejectedFiles: { file: File; error: FileValidationError }[] = [];
    const sameFormatFiles: { file: File; format: string }[] = [];

    newFiles.forEach(file => {
      const validation = validateFile(file, globalTargetFormat);

      if (validation.error === FileValidationError.SAME_FORMAT) {
        sameFormatFiles.push({ file, format: validation.sourceFormat || 'Unknown' });
      } else if (validation.error === FileValidationError.CORRUPTED) {
        validFiles.push({ file, sourceFormat: validation.sourceFormat || 'Unknown' });
      } else if (!validation.isValid) {
        rejectedFiles.push({ file, error: validation.error! });
      } else {
        validFiles.push({ file, sourceFormat: validation.sourceFormat || 'Unknown' });
      }
    });

    if (rejectedFiles.length > 0) {
      setDropZoneError(true);
      const errorGroups = rejectedFiles.reduce((acc, { error }) => {
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {} as Record<FileValidationError, number>);

      Object.entries(errorGroups).forEach(([error]) => {
        let message = '';
        let type: ToastMessage['type'] = 'error';

        switch (error as FileValidationError) {
          case FileValidationError.NON_IMAGE:
            message = t('converter.errors.non_image');
            break;
          case FileValidationError.OVERSIZED:
            message = t('converter.errors.size_limit');
            type = 'warning';
            break;
          case FileValidationError.UNSUPPORTED:
            message = t('converter.errors.non_image');
            break;
        }

        if (message) {
          addToast(message, type);
        }
      });
    }

    if (sameFormatFiles.length > 0) {
      const altFormat = getAlternativeFormat(globalTargetFormat);
      const altFormatName = getFormatName(altFormat);

      sameFormatFiles.forEach(({ file }) => {
        const errorKey = getSameFormatErrorKey(globalTargetFormat);
        addToast(
          `${file.name} ${t(errorKey)}`,
          'info',
          t('converter.errors.convert_instead', { format: altFormatName }),
          () => {
            setGlobalTargetFormat(altFormat);
            dismissToast(toasts[toasts.length - 1]?.id);
          }
        );
      });
    }

    if (validFiles.length === 0) return;

    const processedFiles: ProcessedFile[] = validFiles.map(({ file, sourceFormat }) => {
      const isCorrupted = file.size === 0;
      return {
        id: Math.random().toString(36).substring(2, 11),
        originalFile: file,
        previewUrl: isCorrupted ? '' : URL.createObjectURL(file),
        status: isCorrupted ? ConversionStatus.ERROR : ConversionStatus.IDLE,
        progress: 0,
        sourceFormat,
        errorMessage: isCorrupted ? t('converter.corrupted') : undefined,
        isFormatOverride: false
      };
    });

    setFiles(prev => [...prev, ...processedFiles]);

    const corruptedCount = validFiles.filter(({ file }) => file.size === 0).length;
    if (corruptedCount > 0) {
      addToast(t('converter.toast.corrupted_added'), 'warning');
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.previewUrl) URL.revokeObjectURL(fileToRemove.previewUrl);
      if (fileToRemove?.convertedUrl) URL.revokeObjectURL(fileToRemove.convertedUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  // -- Drag & Drop --
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  }, [files.length, globalTargetFormat, t]);

  // -- Format Control --
  const handleGlobalFormatChange = (newFormat: TargetFormat) => {
    // Navigate to the corresponding tool page when format changes
    const route = formatToRoute[newFormat];
    if (route && !isReversePage) {
      router.push(route);
      return;
    }

    // For reverse pages, just change the format state
    setGlobalTargetFormat(newFormat);
    setFiles(prev => prev.map(file => {
      if (!file.isFormatOverride) {
        return { ...file, targetFormat: undefined };
      }
      return file;
    }));
  };

  const handleLocalFormatChange = (fileId: string, newFormat: TargetFormat) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          targetFormat: newFormat,
          isFormatOverride: true
        };
      }
      return file;
    }));
  };

  const getEffectiveFormat = (file: ProcessedFile): TargetFormat => {
    return file.isFormatOverride && file.targetFormat ? file.targetFormat : globalTargetFormat;
  };

  // -- Conversion Logic --
  const convertAll = async () => {
    const filesToConvert = files.filter(f =>
      (f.status === ConversionStatus.IDLE || f.status === ConversionStatus.ERROR) &&
      f.originalFile.size > 0
    );

    if (filesToConvert.length === 0) return;

    setIsConverting(true);

    const updateFileStatus = (id: string, updates: Partial<ProcessedFile>) => {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const processFile = async (fileData: ProcessedFile) => {
      updateFileStatus(fileData.id, { status: ConversionStatus.PROCESSING, progress: 10 });

      try {
        const effectiveFormat = getEffectiveFormat(fileData);
        const blob = await convertImageFile(fileData.originalFile, effectiveFormat, quality);
        updateFileStatus(fileData.id, {
          status: ConversionStatus.COMPLETED,
          progress: 100,
          convertedBlob: blob,
          convertedUrl: URL.createObjectURL(blob),
          outputSize: blob.size
        });
      } catch (err) {
        console.error(err);
        updateFileStatus(fileData.id, {
          status: ConversionStatus.ERROR,
          errorMessage: err instanceof Error ? err.message : t('converter.errors.generic')
        });
      }
    };

    const CONCURRENCY = 3;
    const queue = [...filesToConvert];
    const runNext = async (): Promise<void> => {
      const fileData = queue.shift();
      if (!fileData) return;
      await processFile(fileData);
      await runNext();
    };
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () => runNext())
    );

    setIsConverting(false);
  };

  const downloadFile = (file: ProcessedFile) => {
    if (file.convertedBlob) {
      const effectiveFormat = getEffectiveFormat(file);
      const ext = getExtensionFromMime(effectiveFormat);
      const name = file.originalFile.name.replace(/\.[^/.]+$/, "") + `.${ext}`;
      saveBlob(file.convertedBlob, name);
    }
  };

  const downloadAllZip = async () => {
    const zip = new JSZip();
    const completedFiles = files.filter(f => f.status === ConversionStatus.COMPLETED && f.convertedBlob);

    if (completedFiles.length === 0) return;

    completedFiles.forEach(f => {
      if (f.convertedBlob) {
        const effectiveFormat = getEffectiveFormat(f);
        const ext = getExtensionFromMime(effectiveFormat);
        const name = f.originalFile.name.replace(/\.[^/.]+$/, "") + `.${ext}`;
        zip.file(name, f.convertedBlob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveBlob(content, 'avifkit_converted.zip');
  };

  // Determine which format options to show
  const getFormatOptions = () => {
    if (isReversePage) {
      return (
        <option value="image/avif">{t('converter.settings.format_avif')}</option>
      );
    }
    return (
      <>
        <option value="image/jpeg">{t('converter.settings.format_jpg')}</option>
        <option value="image/png">{t('converter.settings.format_png')}</option>
        <option value="image/webp">{t('converter.settings.format_webp')}</option>
        <option value="image/avif">{t('converter.settings.format_avif')}</option>
        <option value="image/gif">{t('converter.settings.format_gif')}</option>
        <option value="application/pdf">{t('converter.settings.format_pdf')}</option>
      </>
    );
  };

  // Determine accepted input formats
  const getAcceptedFormats = () => {
    if (isReversePage) {
      // Reverse pages accept specific source formats
      if (pageKey === 'png-to-avif') return 'image/png';
      if (pageKey === 'jpg-to-avif') return 'image/jpeg';
      if (pageKey === 'webp-to-avif') return 'image/webp';
    }
    return 'image/avif,image/jpeg,image/png,image/webp,image/gif';
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div id="converter" className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-100">

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept={getAcceptedFormats()}
        />

        {/* 1. Settings Bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 sm:p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  {t('converter.settings.global_format')}
                </label>
                <select
                  value={globalTargetFormat}
                  onChange={(e) => handleGlobalFormatChange(e.target.value as TargetFormat)}
                  className="appearance-none bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto min-w-[140px] p-2.5 pr-8 font-medium"
                >
                  {getFormatOptions()}
                </select>
              </div>

              {globalTargetFormat !== 'image/png' && globalTargetFormat !== 'image/gif' && globalTargetFormat !== 'application/pdf' && (
              <div className="flex-grow sm:flex-grow-0 sm:min-w-[200px]">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  {t('converter.settings.quality')}: {Math.round(quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full sm:w-40 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
               {files.some(f => f.status === ConversionStatus.COMPLETED) && (
                 <button
                   onClick={downloadAllZip}
                   className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
                 >
                   <Download className="w-4 h-4" />
                   <span>{t('converter.download_zip')}</span>
                 </button>
               )}
               <button
                 onClick={convertAll}
                 disabled={isConverting || files.length === 0 || !files.some(f => f.status === ConversionStatus.IDLE && f.originalFile.size > 0)}
                 className="flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 whitespace-nowrap"
               >
                 <RefreshCw className={`w-4 h-4 ${isConverting ? 'animate-spin' : ''}`} />
                 <span>
                   {isConverting
                     ? `${files.filter(f => f.status === ConversionStatus.COMPLETED).length}/${files.filter(f => f.originalFile.size > 0).length}`
                     : t('converter.convert_all')
                   }
                 </span>
               </button>
            </div>
          </div>
        </div>

        {/* 2. Drop Zone */}
        {files.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`
              cursor-pointer p-12 md:p-20 text-center transition-all duration-200 border-2 border-dashed
              ${dropZoneError ? 'animate-pulse-border-red' : ''}
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'}
            `}
          >
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('converter.drop_title')}</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-6">{t('converter.drop_subtitle')}</p>
            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {t('converter.client_side_tag')}
            </span>
          </div>
        ) : (
          <div className="p-4 bg-white min-h-[300px]">
             <div className="flex justify-between items-center mb-4 px-2">
               <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t('converter.queue_title')} ({files.length} / {MAX_BATCH_SIZE})</h4>
               <button onClick={() => { setFiles([]); }} className="text-xs text-red-500 hover:text-red-700 font-medium">{t('converter.clear_all')}</button>
             </div>

             <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
               {files.map(file => {
                 const isExpanded = expandedFileId === file.id;
                 const isCompleted = file.status === ConversionStatus.COMPLETED;
                 const savings = isCompleted && file.outputSize
                   ? Math.round((1 - file.outputSize / file.originalFile.size) * 100)
                   : 0;
                 const sizeIncreased = savings < 0;

                 return (
                 <div key={file.id} className="rounded-xl border border-slate-100 hover:border-blue-200 transition-all bg-white overflow-hidden">
                   <div className="group relative flex items-center gap-4 p-3">
                    <div
                      className={`w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 ${isCompleted ? 'cursor-pointer' : ''}`}
                      onClick={() => isCompleted && setExpandedFileId(isExpanded ? null : file.id)}
                    >
                      {file.previewUrl ? (
                        <img src={file.previewUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{file.originalFile.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <span>{formatBytes(file.originalFile.size)}</span>
                        {file.sourceFormat && file.sourceFormat !== 'Unknown' && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs font-medium">
                            {t('converter.source_format')}: {file.sourceFormat}
                          </span>
                        )}
                        {isCompleted && (
                          <>
                            <span>&rarr;</span>
                            <span className="font-bold text-emerald-600">{formatBytes(file.outputSize || 0)}</span>
                            {savings !== 0 && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                sizeIncreased
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {sizeIncreased ? '+' : '-'}{Math.abs(savings)}%
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {file.originalFile.size > 0 && !isCompleted && (
                      <div className="flex-shrink-0">
                        <select
                          value={getEffectiveFormat(file)}
                          onChange={(e) => handleLocalFormatChange(file.id, e.target.value as TargetFormat)}
                          className={`text-xs border rounded px-2 py-1 ${
                            file.isFormatOverride
                              ? 'border-blue-400 bg-blue-50 text-blue-700 font-semibold'
                              : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          <option value="image/jpeg">JPG</option>
                          <option value="image/png">PNG</option>
                          <option value="image/webp">WebP</option>
                          <option value="image/avif">AVIF</option>
                          <option value="image/gif">GIF</option>
                          <option value="application/pdf">PDF</option>
                        </select>
                      </div>
                    )}

                    <div className="flex-shrink-0 flex items-center gap-1.5">
                      {file.status === ConversionStatus.IDLE && <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded">{t('converter.ready')}</span>}
                      {file.status === ConversionStatus.PROCESSING && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }} />
                          </div>
                          <span className="text-xs text-blue-600 font-medium">{t('converter.converting')}</span>
                        </div>
                      )}
                      {file.status === ConversionStatus.ERROR && (
                        <span className="text-xs text-red-500 font-medium px-2 py-1 bg-red-50 rounded max-w-[150px] truncate inline-block">
                          {file.errorMessage || t('converter.error')}
                        </span>
                      )}
                      {isCompleted && (
                        <>
                          <button
                            onClick={() => setExpandedFileId(isExpanded ? null : file.id)}
                            className="flex items-center gap-1 px-2 py-1.5 text-slate-500 hover:text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors"
                            title={t('converter.preview')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          <button
                            onClick={() => downloadFile(file)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                          >
                            <Download className="w-3 h-3" /> {t('converter.download')}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => removeFile(file.id)}
                      className="flex-shrink-0 w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all md:opacity-0 md:group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                   </div>

                   {/* Expanded preview with comparison */}
                   {isExpanded && isCompleted && file.previewUrl && file.convertedUrl && (
                     <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-3">
                       {/* Compression progress bar */}
                       <div className="flex items-center gap-3">
                         <span className="text-xs text-slate-500 flex-shrink-0">{formatBytes(file.originalFile.size)}</span>
                         <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden">
                           <div
                             className={`h-full rounded-full transition-all duration-500 ${sizeIncreased ? 'bg-amber-400' : 'bg-emerald-500'}`}
                             style={{ width: `${Math.min(100, Math.max(5, (file.outputSize || 0) / file.originalFile.size * 100))}%` }}
                           />
                         </div>
                         <span className="text-xs font-bold text-emerald-600 flex-shrink-0">{formatBytes(file.outputSize || 0)}</span>
                       </div>

                       {/* Side by side or slider comparison */}
                       {getEffectiveFormat(file) !== 'application/pdf' && (
                         <ImageComparisonSlider
                           beforeSrc={file.previewUrl}
                           afterSrc={file.convertedUrl}
                           beforeLabel={t('converter.original')}
                           afterLabel={t('converter.converted')}
                           beforeSize={formatBytes(file.originalFile.size)}
                           afterSize={formatBytes(file.outputSize || 0)}
                           className="max-h-[300px]"
                         />
                       )}
                     </div>
                   )}
                 </div>
                 );
               })}
             </div>

             <div className="mt-6 flex justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={files.length >= MAX_BATCH_SIZE}
                  className="text-sm text-slate-500 hover:text-blue-600 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('converter.add_more')}
                </button>
             </div>
          </div>
        )}
      </div>
    </>
  );
};

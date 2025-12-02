'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadCloud, X, Download, RefreshCw, Settings, AlertCircle } from 'lucide-react';
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
import { useTranslations } from 'next-intl';
import { ToastContainer, ToastMessage } from './Toast';
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

interface ConverterProps {
  defaultOutputFormat?: TargetFormat;
}

export const Converter: React.FC<ConverterProps> = ({ defaultOutputFormat = 'image/jpeg' }) => {
  const t = useTranslations();
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [globalTargetFormat, setGlobalTargetFormat] = useState<TargetFormat>(defaultOutputFormat);
  const [quality, setQuality] = useState<number>(0.85);
  const [isDragging, setIsDragging] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dropZoneError, setDropZoneError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update format if prop changes (e.g. navigation)
  useEffect(() => {
    setGlobalTargetFormat(defaultOutputFormat);
  }, [defaultOutputFormat]);

  // Toast management
  const addToast = (message: string, type: ToastMessage['type'] = 'error', actionLabel?: string, onAction?: () => void) => {
    const id = Math.random().toString(36).substr(2, 9);
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
    // Simple rotation: JPG -> PNG -> WebP -> JPG
    const formats: TargetFormat[] = ['image/jpeg', 'image/png', 'image/webp'];
    const currentIndex = formats.indexOf(targetFormat);
    const nextIndex = (currentIndex + 1) % formats.length;
    return formats[nextIndex];
  };

  // -- File Handling --
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      // Reset input so same file can be selected again if needed
      e.target.value = '';
    }
  };

  const addFiles = (newFiles: File[]) => {
    // Reset error states
    setDropZoneError(false);

    // 1. Check Batch Size Limit
    if (files.length + newFiles.length > MAX_BATCH_SIZE) {
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
        // Allow corrupted files to enter the queue but mark them
        validFiles.push({ file, sourceFormat: validation.sourceFormat || 'Unknown' });
      } else if (!validation.isValid) {
        rejectedFiles.push({ file, error: validation.error! });
      } else {
        validFiles.push({ file, sourceFormat: validation.sourceFormat || 'Unknown' });
      }
    });

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      setDropZoneError(true);

      // Group errors by type
      const errorGroups = rejectedFiles.reduce((acc, { error }) => {
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {} as Record<FileValidationError, number>);

      // Show toast for each error type
      Object.entries(errorGroups).forEach(([error, count]) => {
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

    // Handle same-format files
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

    // Add valid files to queue
    const processedFiles: ProcessedFile[] = validFiles.map(({ file, sourceFormat }) => {
      const isCorrupted = file.size === 0;
      return {
        id: Math.random().toString(36).substr(2, 9),
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

    // Show toast if corrupted files were added
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
    setGlobalTargetFormat(newFormat);

    // Update all files that don't have local override
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
      f.originalFile.size > 0 // Skip corrupted files
    );

    if (filesToConvert.length === 0) return;

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
          errorMessage: t('converter.errors.generic')
        });
      }
    };

    // Run parallel
    await Promise.all(filesToConvert.map(f => processFile(f)));
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

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div id="converter" className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-100">

        {/* Hidden Input - Always rendered so it works for both initial and "Add More" */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept="image/avif,image/jpeg,image/png,image/webp"
        />

        {/* 1. Settings Bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 sm:p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            {/* Settings Controls */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Format Selector */}
              <div className="flex-shrink-0">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  {t('converter.settings.global_format')}
                </label>
                <select
                  value={globalTargetFormat}
                  onChange={(e) => handleGlobalFormatChange(e.target.value as TargetFormat)}
                  className="appearance-none bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto min-w-[140px] p-2.5 pr-8 font-medium"
                >
                  <option value="image/jpeg">{t('converter.settings.format_jpg')}</option>
                  <option value="image/png">{t('converter.settings.format_png')}</option>
                  <option value="image/webp">{t('converter.settings.format_webp')}</option>
                </select>
              </div>

              {/* Quality Slider */}
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
            </div>

            {/* Action Buttons */}
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
                 disabled={files.length === 0 || !files.some(f => f.status === ConversionStatus.IDLE && f.originalFile.size > 0)}
                 className="flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 whitespace-nowrap"
               >
                 <RefreshCw className="w-4 h-4" />
                 <span>{t('converter.convert_all')}</span>
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

             <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
               {files.map(file => (
                 <div key={file.id} className="group relative flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all bg-white">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      {file.previewUrl ? (
                        <img src={file.previewUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{file.originalFile.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{formatBytes(file.originalFile.size)}</span>
                        {file.sourceFormat && file.sourceFormat !== 'Unknown' && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs font-medium">
                            {t('converter.source_format')}: {file.sourceFormat}
                          </span>
                        )}
                        {file.status === ConversionStatus.COMPLETED && (
                          <>
                            <span>→</span>
                            <span className="font-bold text-emerald-600">{formatBytes(file.outputSize || 0)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Format Selector (for non-corrupted files) */}
                    {file.originalFile.size > 0 && file.status !== ConversionStatus.COMPLETED && (
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
                        </select>
                      </div>
                    )}

                    {/* Status & Action */}
                    <div className="flex-shrink-0">
                      {file.status === ConversionStatus.IDLE && <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded">{t('converter.ready')}</span>}
                      {file.status === ConversionStatus.PROCESSING && <span className="text-xs text-blue-600 font-medium animate-pulse">{t('converter.converting')}</span>}
                      {file.status === ConversionStatus.ERROR && (
                        <span className="text-xs text-red-500 font-medium px-2 py-1 bg-red-50 rounded">
                          {file.errorMessage || t('converter.error')}
                        </span>
                      )}
                      {file.status === ConversionStatus.COMPLETED && (
                         <button
                          onClick={() => downloadFile(file)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                         >
                           <Download className="w-3 h-3" /> {t('converter.download')}
                         </button>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                 </div>
               ))}
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

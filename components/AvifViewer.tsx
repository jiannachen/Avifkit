'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileImage, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatBytes } from '../services/conversionService';
import Link from 'next/link';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';

interface FileInfo {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  previewUrl: string;
}

export const AvifViewer: React.FC = () => {
  const t = useTranslations();
  const { getLink } = useLocalizedLink();
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type || 'image/avif',
        width: img.naturalWidth,
        height: img.naturalHeight,
        previewUrl,
      });
    };
    img.onerror = () => {
      setError(t('viewer.no_preview'));
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type || 'image/avif',
        width: 0,
        height: 0,
        previewUrl: '',
      });
    };
    img.src = previewUrl;
  }, [t]);

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
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/avif,image/*"
      />

      {!fileInfo ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            cursor-pointer p-12 md:p-20 text-center transition-all duration-200 border-2 border-dashed rounded-3xl bg-white shadow-2xl shadow-blue-900/10
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'}
          `}
        >
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('viewer.upload_title')}</h3>
          <p className="text-slate-500 max-w-xs mx-auto">{t('viewer.upload_subtitle')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-100">
          {/* Image Preview */}
          {fileInfo.previewUrl ? (
            <div className="bg-[#f0f0f0] p-4 flex items-center justify-center min-h-[300px] max-h-[500px]">
              <img
                src={fileInfo.previewUrl}
                alt={fileInfo.name}
                className="max-w-full max-h-[480px] object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="bg-slate-100 p-12 flex items-center justify-center min-h-[200px]">
              <div className="text-center text-slate-400">
                <FileImage className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* File Info */}
          <div className="p-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">{t('viewer.file_info')}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">{t('viewer.file_size')}</p>
                <p className="font-semibold text-slate-900">{formatBytes(fileInfo.size)}</p>
              </div>
              {fileInfo.width > 0 && (
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">{t('viewer.dimensions')}</p>
                  <p className="font-semibold text-slate-900">{fileInfo.width} x {fileInfo.height}</p>
                </div>
              )}
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">{t('viewer.file_type')}</p>
                <p className="font-semibold text-slate-900">{fileInfo.type}</p>
              </div>
              {fileInfo.width > 0 && (
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">{t('viewer.color_depth')}</p>
                  <p className="font-semibold text-slate-900">8-bit</p>
                </div>
              )}
            </div>

            {/* Convert CTA */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-medium text-blue-900 mb-3">{t('viewer.convert_cta')}</p>
              <div className="flex gap-3">
                <Link
                  href={getLink('avif-to-jpg')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {t('viewer.convert_to_jpg')}
                </Link>
                <Link
                  href={getLink('avif-to-png')}
                  className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  {t('viewer.convert_to_png')}
                </Link>
              </div>
            </div>

            {/* Upload another */}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  if (fileInfo.previewUrl) URL.revokeObjectURL(fileInfo.previewUrl);
                  setFileInfo(null);
                  setError(null);
                }}
                className="text-sm text-slate-500 hover:text-blue-600 font-medium"
              >
                {t('viewer.view_another')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

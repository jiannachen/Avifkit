'use client';

import React, { useState } from 'react';
import { ImageComparisonSlider } from './ImageComparisonSlider';
import { useTranslations } from 'next-intl';

export interface ImageSizeStats {
  originalSize: string;
  convertedSize: string;
  savings: string;
  smaller: boolean;
}

const BASE_IMAGES = [
  {
    id: 'landscape',
    label: 'Landscape',
    originalSrc: 'https://img.avifkit.com/demo/landscape.webp',
    compressedSrc: 'https://img.avifkit.com/demo/landscape.webp',
  },
  {
    id: 'portrait',
    label: 'Portrait',
    originalSrc: 'https://img.avifkit.com/demo/portrait.webp',
    compressedSrc: 'https://img.avifkit.com/demo/portrait.webp',
  },
  {
    id: 'graphic',
    label: 'Graphic',
    originalSrc: 'https://img.avifkit.com/demo/graphic.webp',
    compressedSrc: 'https://img.avifkit.com/demo/graphic.webp',
  },
];

export const BeforeAfterDemo: React.FC<{ pageKey?: string; demoStats?: ImageSizeStats[] }> = ({
  pageKey = 'home',
  demoStats,
}) => {
  const t = useTranslations(`pages.${pageKey}`);
  const [activeDemo, setActiveDemo] = useState(0);

  const demos = BASE_IMAGES.map((img, idx) => ({
    ...img,
    ...(demoStats?.[idx] ?? { originalSize: '-', convertedSize: '-', savings: '-', smaller: true }),
  }));

  const current = demos[activeDemo];
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        {BASE_IMAGES.map((demo, idx) => (
          <button
            key={demo.id}
            onClick={() => setActiveDemo(idx)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              idx === activeDemo
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {demo.label}
          </button>
        ))}
      </div>

      <ImageComparisonSlider
        beforeSrc={current.originalSrc}
        afterSrc={current.compressedSrc}
        beforeLabel={t('sections.beforeAfter.original_label')}
        afterLabel={t('sections.beforeAfter.compressed_label')}
        beforeSize={current.originalSize}
        afterSize={current.convertedSize}
        className="shadow-xl"
      />

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-slate-600">
            {t('sections.beforeAfter.original_label')}: <strong>{current.originalSize}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${current.smaller ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-slate-600">
            {t('sections.beforeAfter.compressed_label')}: <strong>{current.convertedSize}</strong>
          </span>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
          current.smaller
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <span className={`font-bold ${current.smaller ? 'text-emerald-700' : 'text-amber-700'}`}>
            {current.savings}
          </span>
          <span className={`text-xs ${current.smaller ? 'text-emerald-600' : 'text-amber-600'}`}>
            {current.smaller ? '↓' : '↑'}
          </span>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        {t('sections.beforeAfter.drag_hint')}
      </p>
    </div>
  );
};
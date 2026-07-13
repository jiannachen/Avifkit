'use client';

import React, { useState } from 'react';

interface ImageComparisonSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeSize?: string;
  afterSize?: string;
  className?: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Before',
  afterLabel = 'After',
  beforeSize,
  afterSize,
  className = '',
}) => {
  const [position, setPosition] = useState(50);

  return (
    <div
      className={`relative select-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${className}`}
    >
      {/* After image (full background) */}
      <div className="relative w-full">
        <img
          src={afterSrc}
          alt={afterLabel}
          className="block w-full h-auto"
          draggable={false}
        />
      </div>

      {/* Before image (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="block h-full w-full object-cover"
          draggable={false}
        />
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label={`${beforeLabel} / ${afterLabel}`}
        className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
      />

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="h-full w-0.5 bg-white" />
        {/* Slider handle */}
        <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-blue-200 bg-white shadow-md">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-500">
            <path d="M5 3L2 8L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 3L14 8L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-20">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900">
          {beforeLabel}
          {beforeSize && <span className="opacity-75">({beforeSize})</span>}
        </span>
      </div>
      <div className="absolute top-3 right-3 z-20">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900">
          {afterLabel}
          {afterSize && <span className="opacity-75">({afterSize})</span>}
        </span>
      </div>
    </div>
  );
};

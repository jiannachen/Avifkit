'use client';

import React from 'react';
import { AvifViewer } from '@/components/AvifViewer';
import { Shield, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FAQSchema, SoftwareAppSchema } from '@/components/StructuredData';

export default function AvifViewerClient() {
  const t = useTranslations();
  const p = useTranslations('pages.avif-viewer');

  const faqData = [
    { question: p('faq.q5'), answer: p('faq.a5') },
    { question: p('faq.q8'), answer: p('faq.a8') },
  ];

  return (
    <div className="bg-white">
      <FAQSchema faqs={faqData} />
      <SoftwareAppSchema
        name="Avifkit AVIF Viewer"
        description={t('seo.avif-viewer.description')}
        category="MultimediaApplication"
      />

      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-semibold mb-4 animate-fade-in-up">
            <Shield className="w-3.5 h-3.5" />
            <span>{p('hero.privacy_banner')}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            {t('seo.avif-viewer.h1')}
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
            {p('subtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{p('hero.badges.privacy')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{p('hero.badges.speed')}</span>
            </div>
          </div>
        </div>

        <AvifViewer />
      </section>
    </div>
  );
}

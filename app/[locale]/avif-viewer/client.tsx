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
    <div className="bg-[#fafafa]">
      <FAQSchema faqs={faqData} />
      <SoftwareAppSchema
        name="Avifkit AVIF Viewer"
        description={t('seo.avif-viewer.description')}
        category="MultimediaApplication"
      />

      <section className="paper-grid relative overflow-hidden px-4 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="mx-auto mb-14 max-w-4xl space-y-6 text-center">
          <div className="eyebrow animate-fade-in-up">
            <Shield className="w-3.5 h-3.5" />
            <span>{p('hero.privacy_banner')}</span>
          </div>

          <h1 className="display-title text-slate-950">
            {t('seo.avif-viewer.h1')}
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            {p('subtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-700">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{p('hero.badges.privacy')}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-700">
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

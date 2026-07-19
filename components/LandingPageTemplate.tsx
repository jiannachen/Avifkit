'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Converter } from './Converter';
import { Shield, Zap, Image, CheckCircle, HelpCircle, ChevronDown, ArrowRight, Monitor, Mail, Printer, Globe } from 'lucide-react';
import { TargetFormat } from '../types';
import { useTranslations, useLocale } from 'next-intl';
import { FAQSchema, HowToSchema, SoftwareAppSchema, WebsiteSchema, OrganizationSchema } from './StructuredData';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { BeforeAfterDemo, ImageSizeStats } from './BeforeAfterDemo';

type PageKey = 'jpg' | 'png' | 'webp' | 'png-to-avif' | 'jpg-to-avif' | 'webp-to-avif' | 'avif-to-gif' | 'avif-to-pdf' | 'avif-viewer';

interface LandingPageProps {
  pageKey: PageKey;
  defaultFormat?: TargetFormat;
  isHomePage?: boolean;
  demoStats?: ImageSizeStats[];
}

const ScrollReveal: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-6'}`}>
      {children}
    </div>
  );
};

const TrustBadge: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-700">
    <div className="text-blue-600">{icon}</div>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const FeatureCard: React.FC<{ title: string; desc: string; icon: React.ReactNode }> = ({ title, desc, icon }) => (
  <div className="canvas-card p-6 transition-colors hover:border-blue-200">
    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-600">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-semibold text-slate-950">{title}</h3>
    <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
  </div>
);

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = React.useId();
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex min-h-14 w-full items-center justify-between gap-3 py-5 text-left"
      >
        <span className="flex items-start gap-3 font-medium text-slate-950">
          <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          {question}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div id={panelId} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="pb-5 pl-8 text-sm leading-relaxed text-slate-600">{answer}</p>
        </div>
      </div>
    </div>
  );
};

const useCaseIcons = [
  <Mail key="mail" className="w-6 h-6" />,
  <Globe key="globe" className="w-6 h-6" />,
  <Printer key="printer" className="w-6 h-6" />,
  <Monitor key="monitor" className="w-6 h-6" />,
];

const formatLabels: Record<TargetFormat, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
  'image/avif': 'AVIF',
  'image/gif': 'GIF',
  'application/pdf': 'PDF',
};

const sourceFormatLabels: Partial<Record<PageKey, string>> = {
  'png-to-avif': 'PNG',
  'jpg-to-avif': 'JPG',
  'webp-to-avif': 'WEBP',
};

export const LandingPageTemplate: React.FC<LandingPageProps> = ({
  pageKey,
  defaultFormat = 'image/jpeg',
  isHomePage = false,
  demoStats,
}) => {
  const t = useTranslations();
  const p = useTranslations(`pages.${pageKey}`);
  const currentLocale = useLocale();
  const { getLink } = useLocalizedLink();
  const sourceFormatLabel = sourceFormatLabels[pageKey] ?? 'AVIF';
  const targetFormatLabel = formatLabels[defaultFormat];

  const subtitle = p('subtitle');

  // Get SEO-optimized headings
  const h1Text = p('seo.h1');
  const h2HowText = p('seo.h2_how');
  const h2WhyText = p('seo.h2_why');

  // Prepare FAQ data for schema
  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];
  const faqData = faqKeys
    .filter(key => p.has(`faq.${key}`))
    .map(key => ({
      question: p(`faq.${key}`),
      answer: p(`faq.a${key.slice(1)}`),
    }));

  // Prepare HowTo steps for schema
  const howToSteps = [
    { name: p('howto.steps.upload.title'), text: p('howto.steps.upload.description') },
    { name: p('howto.steps.select.title'), text: p('howto.steps.select.description') },
    { name: p('howto.steps.download.title'), text: p('howto.steps.download.description') },
  ];

  // Get schema translations
  const howToSchemaName = p('schemas.howto.name');
  const howToSchemaDescription = p('schemas.howto.description');
  const softwareSchemaName = t('schemas.software.name');
  const softwareSchemaDescription = t('schemas.software.description');

  // Use cases data
  const useCasesItems = p.raw('sections.useCases.items') as Array<{ title: string; description: string }>;

  // Comparison data
  const comparisonHeaders = p.raw('sections.comparison.headers') as string[];
  const comparisonRows = p.raw('sections.comparison.rows') as string[][];

  // Specs data
  const specsItems = p.raw('sections.specs.items') as Array<{ label: string; value: string }>;

  // Related tools - filter out current page
  const allRelatedTools = p.raw('sections.relatedTools.items') as Record<string, { title: string; description: string }>;
  const relatedToolKeys = Object.keys(allRelatedTools).filter(key => {
    // Map pageKey to route key for filtering
    const pageToRoute: Record<string, string> = {
      'home': 'avif-to-jpg',
      'jpg': 'avif-to-jpg',
      'png': 'avif-to-png',
      'webp': 'avif-to-webp',
    };
    const currentRoute = pageToRoute[pageKey] || pageKey;
    return key !== currentRoute;
  });

  return (
    <div className="bg-[#fafafa]">
      {/* Structured Data */}
      <FAQSchema faqs={faqData} />
      <HowToSchema
        name={howToSchemaName}
        description={howToSchemaDescription}
        steps={howToSteps}
      />
      {isHomePage && (
        <>
          <WebsiteSchema />
          <OrganizationSchema />
        </>
      )}
      <SoftwareAppSchema
        name={softwareSchemaName}
        description={softwareSchemaDescription}
        category="MultimediaApplication"
      />

      {/* 1. Hero Section */}
      <section className="paper-grid relative overflow-hidden px-4 pb-24 pt-20 md:pb-32 md:pt-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="floating-panel absolute left-[4%] top-28 w-36 -rotate-3 p-3">
            <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-slate-50 text-2xl font-semibold text-blue-600">{sourceFormatLabel}</div>
            <div className="mt-3 h-2 w-16 rounded-full bg-slate-200" />
          </div>
          <div className="floating-panel absolute right-[5%] top-40 w-40 rotate-3 p-3">
            <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-blue-50 text-2xl font-semibold text-blue-700">{targetFormatLabel}</div>
            <div className="mt-3 flex items-center gap-2"><span className="status-node" /><span className="h-2 w-20 rounded-full bg-slate-200" /></div>
          </div>
        </div>
        <div className="relative z-10 mx-auto mb-14 max-w-4xl space-y-6 text-center">

          {/* Privacy Banner */}
          <div className="eyebrow animate-fade-in-up">
            <Shield className="w-3.5 h-3.5" />
            <span>{p('hero.privacy_banner')}</span>
          </div>

          {/* SEO-Optimized H1 */}
          <h1 className="display-title text-slate-950">
            {h1Text}
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            {subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-2 pt-3">
            <TrustBadge icon={<Shield className="w-4 h-4"/>} text={p('hero.badges.privacy')} />
            <TrustBadge icon={<Zap className="w-4 h-4"/>} text={p('hero.badges.speed')} />
            <TrustBadge icon={<CheckCircle className="w-4 h-4"/>} text={p('hero.badges.bulk')} />
          </div>
        </div>

        <Converter defaultOutputFormat={defaultFormat} pageKey={pageKey} />
      </section>

      {/* 2. How-To Section */}
      <section className="section-band bg-slate-50">
        <ScrollReveal>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="section-title mb-12 text-center text-slate-950">
            {h2HowText}
          </h2>

          <div className="relative grid gap-8 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-blue-200 md:block"></div>
            <div className="text-center relative">
               <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-xl font-semibold text-blue-700">1</div>
               <h3 className="font-bold text-lg mb-2">{p('howto.steps.upload.title')}</h3>
               <p className="text-sm text-slate-500">{p('howto.steps.upload.description')}</p>
            </div>
            <div className="text-center relative">
               <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-xl font-semibold text-blue-700">2</div>
               <h3 className="font-bold text-lg mb-2">{p('howto.steps.select.title')}</h3>
               <p className="text-sm text-slate-500">{p('howto.steps.select.description')}</p>
            </div>
            <div className="text-center relative">
               <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-xl font-semibold text-blue-700">3</div>
               <h3 className="font-bold text-lg mb-2">{p('howto.steps.download.title')}</h3>
               <p className="text-sm text-slate-500">{p('howto.steps.download.description')}</p>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* 3. Features Grid */}
      <section className="section-band bg-white">
        <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title text-slate-950">
              {h2WhyText}
            </h2>
            <p className="text-slate-500 mt-2">{p('features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title={p('features.privacy_title')}
              desc={p('features.privacy_desc')}
              icon={<Shield className="w-6 h-6"/>}
            />
            <FeatureCard
              title={p('features.speed_title')}
              desc={p('features.speed_desc')}
              icon={<Zap className="w-6 h-6"/>}
            />
            <FeatureCard
              title={p('features.quality_title')}
              desc={p('features.quality_desc')}
              icon={<Image className="w-6 h-6"/>}
            />
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* 4. Before/After Section */}
      <section className="section-band bg-slate-50">
        <ScrollReveal>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="section-title mb-4 text-center text-slate-950">
            {p('sections.beforeAfter.title')}
          </h2>
          <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
            {p('sections.beforeAfter.description')}
          </p>
          <BeforeAfterDemo pageKey={pageKey} demoStats={demoStats} />
        </div>
        </ScrollReveal>
      </section>

      {/* 5. Use Cases Section */}
      <section className="section-band bg-white">
        <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-12 text-center text-slate-950">
            {p('sections.useCases.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCasesItems.map((item, idx) => (
              <div key={idx} className="canvas-card flex gap-4 p-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
                  {useCaseIcons[idx % useCaseIcons.length]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* 6. Format Comparison Table */}
      <section className="section-band bg-slate-50">
        <ScrollReveal>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="section-title mb-4 text-center text-slate-950">
            {p('sections.comparison.title')}
          </h2>
          <p className="text-slate-500 text-center mb-10">
            {p('sections.comparison.description')}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <thead>
                <tr className="border-b border-slate-200 bg-blue-50 text-slate-950">
                  {comparisonHeaders.map((header, idx) => (
                    <th key={idx} className="px-6 py-4 text-left text-sm font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className={`px-6 py-3 text-sm ${cellIdx === 0 ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* 7. Tool Specifications */}
      <section className="section-band bg-white">
        <ScrollReveal>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="section-title mb-10 text-center text-slate-950">
            {p('sections.specs.title')}
          </h2>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
            {specsItems.map((item, idx) => (
              <div key={idx} className={`flex justify-between items-center px-6 py-4 ${idx < specsItems.length - 1 ? 'border-b border-slate-200' : ''}`}>
                <span className="text-sm font-medium text-slate-600">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* 8. FAQ Section (Expanded) */}
      <section className="section-band bg-slate-50">
        <ScrollReveal>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="section-title mb-10 text-center text-slate-950">{p('faq.title')}</h2>
          <div className="border-y border-slate-200">
            {faqData.map((faq, idx) => (
              <FaqItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* 9. Related Tools Section */}
      <section className="section-band bg-white">
        <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-12 text-center text-slate-950">
            {p('sections.relatedTools.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedToolKeys.slice(0, 8).map((key) => {
              const tool = allRelatedTools[key];
              const routeKey = key as any;
              let href: string;
              try {
                href = getLink(routeKey);
              } catch {
                href = `/${currentLocale === 'en' ? '' : currentLocale + '/'}${key}`;
              }
              return (
                <Link
                  key={key}
                  href={href}
                  className="group canvas-card p-5 transition-colors hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 flex items-center gap-2">
                    {tool.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-500">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* Footer Text */}
      <section className="py-12 px-4 max-w-7xl mx-auto text-slate-400 text-xs">
         <p>{t('footer_description')}</p>
      </section>
    </div>
  );
};

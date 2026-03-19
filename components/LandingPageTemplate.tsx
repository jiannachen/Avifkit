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
  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
    <div className="text-blue-600">{icon}</div>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const FeatureCard: React.FC<{ title: string; desc: string; icon: React.ReactNode }> = ({ title, desc, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 py-4 text-left"
      >
        <h4 className="font-semibold text-slate-900 flex items-start gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          {question}
        </h4>
        <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-600 text-sm leading-relaxed pl-7">{answer}</p>
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

  const titlePrefix = p('title_prefix');
  const titleGradient = p('title_gradient');
  const titleSuffix = p('title_suffix');
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
    <div className="bg-white">
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
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
           <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
           <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-6 mb-12">

          {/* Privacy Banner */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-semibold mb-4 animate-fade-in-up">
            <Shield className="w-3.5 h-3.5" />
            <span>{p('hero.privacy_banner')}</span>
          </div>

          {/* SEO-Optimized H1 */}
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            {h1Text}
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <TrustBadge icon={<Shield className="w-4 h-4"/>} text={p('hero.badges.privacy')} />
            <TrustBadge icon={<Zap className="w-4 h-4"/>} text={p('hero.badges.speed')} />
            <TrustBadge icon={<CheckCircle className="w-4 h-4"/>} text={p('hero.badges.bulk')} />
          </div>
        </div>

        <Converter defaultOutputFormat={defaultFormat} pageKey={pageKey} />
      </section>

      {/* 2. How-To Section */}
      <section className="py-16 bg-slate-50">
        <ScrollReveal>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            {h2HowText}
          </h2>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200 -z-10"></div>
            <div className="text-center relative">
               <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">1</div>
               <h3 className="font-bold text-lg mb-2">{p('howto.steps.upload.title')}</h3>
               <p className="text-sm text-slate-500">{p('howto.steps.upload.description')}</p>
            </div>
            <div className="text-center relative">
               <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">2</div>
               <h3 className="font-bold text-lg mb-2">{p('howto.steps.select.title')}</h3>
               <p className="text-sm text-slate-500">{p('howto.steps.select.description')}</p>
            </div>
            <div className="text-center relative">
               <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">3</div>
               <h3 className="font-bold text-lg mb-2">{p('howto.steps.download.title')}</h3>
               <p className="text-sm text-slate-500">{p('howto.steps.download.description')}</p>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* 3. Features Grid */}
      <section className="py-16 bg-white">
        <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">
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
      <section className="py-16 bg-slate-50">
        <ScrollReveal>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
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
      <section className="py-16 bg-white">
        <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">
            {p('sections.useCases.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCasesItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
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
      <section className="py-16 bg-slate-50">
        <ScrollReveal>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            {p('sections.comparison.title')}
          </h2>
          <p className="text-slate-500 text-center mb-10">
            {p('sections.comparison.description')}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <thead>
                <tr className="bg-slate-900 text-white">
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
      <section className="py-16 bg-white">
        <ScrollReveal>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
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
      <section className="py-16 bg-slate-50">
        <ScrollReveal>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">{p('faq.title')}</h2>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            {faqData.map((faq, idx) => (
              <FaqItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* 9. Related Tools Section */}
      <section className="py-16 bg-white">
        <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">
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
                  className="group p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
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

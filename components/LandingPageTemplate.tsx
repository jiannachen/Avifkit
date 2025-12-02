'use client';

import React from 'react';
import { Converter } from './Converter';
import { Shield, Zap, Image, CheckCircle, HelpCircle } from 'lucide-react';
import { TargetFormat } from '../types';
import { useTranslations, useLocale } from 'next-intl';
import { FAQSchema, HowToSchema, SoftwareAppSchema, WebsiteSchema, OrganizationSchema } from './StructuredData';

interface LandingPageProps {
  pageKey: 'home' | 'jpg' | 'png' | 'webp';
  defaultFormat?: TargetFormat;
}

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

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
  <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
    <h4 className="font-semibold text-slate-900 mb-2 flex items-start gap-2">
      <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      {question}
    </h4>
    <p className="text-slate-600 text-sm leading-relaxed pl-7">{answer}</p>
  </div>
);

export const LandingPageTemplate: React.FC<LandingPageProps> = ({
  pageKey,
  defaultFormat = 'image/jpeg'
}) => {
  const t = useTranslations();
  const currentLocale = useLocale();

  const titlePrefix = t(`pages.${pageKey}.title_prefix`);
  const titleGradient = t(`pages.${pageKey}.title_gradient`);
  const titleSuffix = t(`pages.${pageKey}.title_suffix`);
  const subtitle = t(`pages.${pageKey}.subtitle`);

  // Get SEO-optimized headings for non-home pages
  const isConverterPage = pageKey !== 'home';
  const h1Text = isConverterPage ? t(`seo.${pageKey}.h1`) : null;
  const h2HowText = isConverterPage ? t(`seo.${pageKey}.h2_how`) : null;
  const h2WhyText = isConverterPage ? t(`seo.${pageKey}.h2_why`) : null;

  // Prepare FAQ data for schema
  const faqData = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
  ];

  // Prepare HowTo steps for schema
  const howToSteps = [
    { name: t('howto.steps.upload.title'), text: t('howto.steps.upload.description') },
    { name: t('howto.steps.select.title'), text: t('howto.steps.select.description') },
    { name: t('howto.steps.download.title'), text: t('howto.steps.download.description') },
  ];

  const formatName = pageKey === 'jpg' ? 'JPG' : pageKey === 'png' ? 'PNG' : pageKey === 'webp' ? 'WebP' : 'multiple formats';

  // Get schema translations
  const schemaKey = pageKey === 'home' ? 'home' : pageKey;
  const howToSchemaName = t(`schemas.howto.${schemaKey}.name`);
  const howToSchemaDescription = t(`schemas.howto.${schemaKey}.description`);
  const softwareSchemaName = t('schemas.software.name');
  const softwareSchemaDescription = t('schemas.software.description');

  return (
    <div className="bg-white">
      {/* Structured Data */}
      <FAQSchema faqs={faqData} />
      <HowToSchema
        name={howToSchemaName}
        description={howToSchemaDescription}
        steps={howToSteps}
      />
      {pageKey === 'home' && (
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
            <span>{t('hero.privacy_banner')}</span>
          </div>

          {/* SEO-Optimized H1 */}
          {h1Text ? (
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              {h1Text}
            </h1>
          ) : (
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              {titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{titleGradient}</span> {titleSuffix}
            </h1>
          )}

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <TrustBadge icon={<Shield className="w-4 h-4"/>} text={t('hero.badges.privacy')} />
            <TrustBadge icon={<Zap className="w-4 h-4"/>} text={t('hero.badges.speed')} />
            <TrustBadge icon={<CheckCircle className="w-4 h-4"/>} text={t('hero.badges.bulk')} />
          </div>
        </div>

        <Converter defaultOutputFormat={defaultFormat} />
      </section>

      {/* 2. How-To Section (SEO-Optimized H2 for Featured Snippets) */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            {h2HowText || "How to convert AVIF files?"}
          </h2>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-slate-100 -z-10"></div>
            <div className="text-center relative">
               <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">1</div>
               <h3 className="font-bold text-lg mb-2">{t('howto.steps.upload.title')}</h3>
               <p className="text-sm text-slate-500">{t('howto.steps.upload.description')}</p>
            </div>
            <div className="text-center relative">
               <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">2</div>
               <h3 className="font-bold text-lg mb-2">{t('howto.steps.select.title')}</h3>
               <p className="text-sm text-slate-500">{t('howto.steps.select.description')}</p>
            </div>
            <div className="text-center relative">
               <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">3</div>
               <h3 className="font-bold text-lg mb-2">{t('howto.steps.download.title')}</h3>
               <p className="text-sm text-slate-500">{t('howto.steps.download.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid (with SEO-Optimized H2 for "Why Use") */}
      <section className="py-16 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">
              {h2WhyText || t('features.title')}
            </h2>
            <p className="text-slate-500 mt-2">{t('features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title={t('features.privacy_title')}
              desc={t('features.privacy_desc')}
              icon={<Shield className="w-6 h-6"/>}
            />
            <FeatureCard
              title={t('features.speed_title')}
              desc={t('features.speed_desc')}
              icon={<Zap className="w-6 h-6"/>}
            />
            <FeatureCard
              title={t('features.quality_title')}
              desc={t('features.quality_desc')}
              icon={<Image className="w-6 h-6"/>}
            />
          </div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">{t('faq.title')}</h2>
          <div className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <FaqItem question={t('faq.q1')} answer={t('faq.a1')} />
            <FaqItem question={t('faq.q2')} answer={t('faq.a2')} />
            <FaqItem question={t('faq.q3')} answer={t('faq.a3')} />
            <FaqItem question={t('faq.q4')} answer={t('faq.a4')} />
            <FaqItem question={t('faq.q5')} answer={t('faq.a5')} />
          </div>
        </div>
      </section>

      {/* Footer Text */}
      <section className="py-12 px-4 max-w-7xl mx-auto text-slate-400 text-xs">
         <p>{t('footer_description')}</p>
      </section>
    </div>
  );
};
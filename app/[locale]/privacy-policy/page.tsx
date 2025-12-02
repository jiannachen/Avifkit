import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.privacy.meta' });

  const privacyUrl = `https://avifkit.com/${locale === 'en' ? '' : locale + '/'}privacy-policy`;
  const localeMap: Record<string, string> = {
    'en': 'en_US',
    'es': 'es_ES',
    'ja': 'ja_JP',
    'fr': 'fr_FR'
  };

  return {
    title: t('title'),
    description: t('description'),

    // OpenGraph tags
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      url: privacyUrl,
      siteName: 'Avifkit',
      locale: localeMap[locale] || 'en_US',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },

    // Twitter Card tags
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-image.png'],
    },

    // Robots directives
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Canonical URL and alternate languages
    alternates: {
      canonical: privacyUrl,
      languages: {
        'en': '/privacy-policy',
        'es': '/es/privacy-policy',
        'ja': '/ja/privacy-policy',
        'fr': '/fr/privacy-policy',
      },
    },
  };
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 text-center mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <p className="text-sm text-slate-500 text-center mt-4">
            {t('hero.last_updated')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-slate max-w-none">

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.introduction.title')}</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.introduction.content')}
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 my-6">
              <p className="text-emerald-900 font-semibold mb-2">{t('sections.introduction.principle_title')}</p>
              <p className="text-emerald-800 text-sm">
                {t.rich('sections.introduction.principle_content', {
                  strong: (chunks) => <strong>{chunks}</strong>
                })}
              </p>
            </div>
          </section>

          {/* Client-Side Processing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.client_side.title')}</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.client_side.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              {(t.raw('sections.client_side.items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.info_collect.title')}</h2>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">{t('sections.info_collect.analytics_title')}</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.info_collect.analytics_intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              {(t.raw('sections.info_collect.analytics_items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">{t('sections.info_collect.technical_title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.info_collect.technical_content')}
            </p>
          </section>

          {/* What We Don't Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.not_collect.title')}</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.not_collect.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              {(t.raw('sections.not_collect.items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.cookies.title')}</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.cookies.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              {(t.raw('sections.cookies.items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              {t('sections.cookies.control')}
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.third_party.title')}</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.third_party.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              {(t.raw('sections.third_party.items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              {t('sections.third_party.note')}
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.security.title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.security.content')}
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.rights.title')}</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.rights.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              {(t.raw('sections.rights.items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.children.title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.children.content')}
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.changes.title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.changes.content')}
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.contact.title')}</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.contact.intro')}
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <p className="text-slate-700 font-medium">{t('sections.contact.email')}</p>
              <p className="text-slate-600 text-sm mt-2">{t('sections.contact.response')}</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

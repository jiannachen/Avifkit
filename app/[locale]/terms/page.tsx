import React from 'react';
import { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.terms.meta' });

  const termsUrl = `https://avifkit.com/${locale === 'en' ? '' : locale + '/'}terms`;
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
      url: termsUrl,
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
      canonical: termsUrl,
      languages: {
        'en': '/terms',
        'es': '/es/terms',
        'ja': '/ja/terms',
        'fr': '/fr/terms',
      },
    },
  };
}

export default async function TermsOfServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.terms' });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
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

          {/* Acceptance of Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.acceptance.title')}</h2>
            {(t.raw('sections.acceptance.content') as string[]).map((paragraph, index) => (
              <p key={index} className="text-slate-600 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </section>

          {/* Use of Service */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.use.title')}</h2>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">{t('sections.use.permitted_title')}</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.use.permitted_intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              {(t.raw('sections.use.permitted_items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">{t('sections.use.prohibited_title')}</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.use.prohibited_intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              {(t.raw('sections.use.prohibited_items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.intellectual.title')}</h2>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">{t('sections.intellectual.your_content_title')}</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.intellectual.your_content')}
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">{t('sections.intellectual.our_service_title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.intellectual.our_service')}
            </p>
          </section>

          {/* Service Availability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.availability.title')}</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.availability.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              {(t.raw('sections.availability.items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              {t('sections.availability.note')}
            </p>
          </section>

          {/* Disclaimers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.disclaimers.title')}</h2>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">{t('sections.disclaimers.warranties_title')}</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.disclaimers.warranties_intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              {(t.raw('sections.disclaimers.warranties_items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">{t('sections.disclaimers.liability_title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.disclaimers.liability_content')}
            </p>
          </section>

          {/* User Responsibilities */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.responsibilities.title')}</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('sections.responsibilities.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              {(t.raw('sections.responsibilities.items') as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Browser Compatibility */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.browser.title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.browser.content')}
            </p>
          </section>

          {/* Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.privacy_section.title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.privacy_section.content')}
            </p>
          </section>

          {/* Third-Party Links */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.third_party_links.title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.third_party_links.content')}
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.indemnification.title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.indemnification.content')}
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.governing_law.title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.governing_law.content')}
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.changes.title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.changes.content')}
            </p>
          </section>

          {/* Severability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sections.severability.title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('sections.severability.content')}
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
              <p className="text-slate-600 text-sm mt-2">{t('sections.contact.website')}</p>
            </div>
          </section>

          {/* Acknowledgment */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
            <p className="text-blue-900 font-semibold mb-2">{t('sections.acknowledgment.title')}</p>
            <p className="text-blue-800 text-sm">
              {t('sections.acknowledgment.content')}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

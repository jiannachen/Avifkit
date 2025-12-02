import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type PageKey = 'jpg' | 'png' | 'webp';
type LocaleKey = 'en' | 'es' | 'ja' | 'fr';

export async function generateSEOMetadata(
  pageKey: PageKey,
  locale: LocaleKey = 'en'
): Promise<Metadata> {
  const t = await getTranslations({ locale });

  return {
    title: t(`seo.${pageKey}.title`),
    description: t(`seo.${pageKey}.description`),
    openGraph: {
      title: t(`seo.${pageKey}.title`),
      description: t(`seo.${pageKey}.description`),
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale === 'es' ? 'es_ES' : locale === 'ja' ? 'ja_JP' : 'fr_FR',
      siteName: 'AvifKit',
    },
    twitter: {
      card: 'summary_large_image',
      title: t(`seo.${pageKey}.title`),
      description: t(`seo.${pageKey}.description`),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `https://avifkit.com/${locale === 'en' ? '' : locale + '/'}avif-to-${pageKey}`,
      languages: {
        'en': `/avif-to-${pageKey}`,
        'es': `/es/avif-to-${pageKey}`,
        'ja': `/ja/avif-to-${pageKey}`,
        'fr': `/fr/avif-to-${pageKey}`,
      },
    },
  };
}

export async function getH1Text(pageKey: PageKey, locale: LocaleKey = 'en'): Promise<string> {
  const t = await getTranslations({ locale });
  return t(`seo.${pageKey}.h1`);
}

export async function getH2How(pageKey: PageKey, locale: LocaleKey = 'en'): Promise<string> {
  const t = await getTranslations({ locale });
  return t(`seo.${pageKey}.h2_how`);
}

export async function getH2Why(pageKey: PageKey, locale: LocaleKey = 'en'): Promise<string> {
  const t = await getTranslations({ locale });
  return t(`seo.${pageKey}.h2_why`);
}

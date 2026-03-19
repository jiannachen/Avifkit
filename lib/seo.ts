import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type PageKey = 'jpg' | 'png' | 'webp' | 'png-to-avif' | 'jpg-to-avif' | 'webp-to-avif' | 'avif-to-gif' | 'avif-to-pdf' | 'avif-viewer';
type LocaleKey = 'en' | 'es' | 'ja' | 'fr';

const BASE_URL = 'https://avifkit.com';
const DEFAULT_OG_IMAGE = 'https://img.avifkit.com/blog/what-is-avif-guide.webp';

// Map page keys to URL slugs
const pageKeyToSlug: Record<PageKey, string> = {
  'jpg': 'avif-to-jpg',
  'png': 'avif-to-png',
  'webp': 'avif-to-webp',
  'png-to-avif': 'png-to-avif',
  'jpg-to-avif': 'jpg-to-avif',
  'webp-to-avif': 'webp-to-avif',
  'avif-to-gif': 'avif-to-gif',
  'avif-to-pdf': 'avif-to-pdf',
  'avif-viewer': 'avif-viewer',
};

function buildLocalePath(locale: string, slug: string): string {
  return locale === 'en' ? `/${slug}` : `/${locale}/${slug}`;
}

export async function generateSEOMetadata(
  pageKey: PageKey,
  locale: LocaleKey = 'en'
): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const slug = pageKeyToSlug[pageKey];

  const canonicalPath = buildLocalePath(locale, slug);

  const languageAlternates: Record<string, string> = {};
  const locales: LocaleKey[] = ['en', 'es', 'ja', 'fr'];
  for (const loc of locales) {
    languageAlternates[loc] = `${BASE_URL}${buildLocalePath(loc, slug)}`;
  }
  languageAlternates['x-default'] = `${BASE_URL}/${slug}`;

  const title = t(`seo.${pageKey}.title`);
  const description = t(`seo.${pageKey}.description`);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE_URL}${canonicalPath}`,
      locale: locale === 'en' ? 'en_US' : locale === 'es' ? 'es_ES' : locale === 'ja' ? 'ja_JP' : 'fr_FR',
      siteName: 'AvifKit',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
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
      canonical: `${BASE_URL}${canonicalPath}`,
      languages: languageAlternates,
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

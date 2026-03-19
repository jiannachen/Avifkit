import { LandingPageTemplate } from '@/components/LandingPageTemplate';
import type { Metadata } from 'next';
import type { ImageSizeStats } from '@/components/BeforeAfterDemo';
import { getTranslations } from 'next-intl/server';

const BASE_URL = 'https://avifkit.com';
const DEFAULT_OG_IMAGE = 'https://img.avifkit.com/blog/what-is-avif-guide.webp';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const title = t('site.title');
  const description = t('site.description');
  const canonicalPath = locale === 'en' ? '' : `/${locale}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE_URL}${canonicalPath || '/'}`,
      locale: locale === 'en' ? 'en_US' : locale === 'es' ? 'es_ES' : locale === 'ja' ? 'ja_JP' : 'fr_FR',
      siteName: 'AvifKit',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: t('site.og_image_alt'),
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
      canonical: `${BASE_URL}${canonicalPath || '/'}`,
      languages: {
        'en': `${BASE_URL}/`,
        'es': `${BASE_URL}/es`,
        'ja': `${BASE_URL}/ja`,
        'fr': `${BASE_URL}/fr`,
        'x-default': `${BASE_URL}/`,
      },
    },
  };
}

const demoStats: ImageSizeStats[] = [
  { originalSize: '292.2 KB', convertedSize: '151.4 KB', savings: '-48%', smaller: true },
  { originalSize: '35.1 KB', convertedSize: '45.9 KB', savings: '+31%', smaller: false },
  { originalSize: '64.3 KB', convertedSize: '73.1 KB', savings: '+14%', smaller: false },
];

export default async function Home() {
  return (
    <LandingPageTemplate
      defaultFormat="image/jpeg"
      pageKey="jpg"
      isHomePage
      demoStats={demoStats}
    />
  );
}

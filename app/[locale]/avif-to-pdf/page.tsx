import { LandingPageTemplate } from '@/components/LandingPageTemplate';
import { generateSEOMetadata } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { ImageSizeStats } from '@/components/BeforeAfterDemo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateSEOMetadata('avif-to-pdf', locale as any);
}

const demoStats: ImageSizeStats[] = [
  { originalSize: '292.2 KB', convertedSize: '214.1 KB', savings: '-27%', smaller: true },
  { originalSize: '35.1 KB', convertedSize: '52.1 KB', savings: '+48%', smaller: false },
  { originalSize: '64.3 KB', convertedSize: '82.1 KB', savings: '+28%', smaller: false },
];

export default async function AvifToPdf({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <LandingPageTemplate
      defaultFormat="application/pdf"
      pageKey="avif-to-pdf"
      demoStats={demoStats}
    />
  );
}

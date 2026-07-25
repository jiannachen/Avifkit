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
  return generateSEOMetadata('webp', locale as any);
}

const demoStats: ImageSizeStats[] = [
  { originalSize: '292.2 KB', convertedSize: '144.6 KB', savings: '-51%', smaller: true },
  { originalSize: '35.1 KB', convertedSize: '25.0 KB', savings: '-29%', smaller: true },
  { originalSize: '64.3 KB', convertedSize: '44.8 KB', savings: '-30%', smaller: true },
];

export default async function AvifToWebP({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <LandingPageTemplate
      defaultFormat="image/webp"
      pageKey="webp"
      demoStats={demoStats}
    />
  );
}

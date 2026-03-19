import { LandingPageTemplate } from '@/components/LandingPageTemplate';
import { generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import type { ImageSizeStats } from '@/components/BeforeAfterDemo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateSEOMetadata('jpg', locale as any);
}

const demoStats: ImageSizeStats[] = [
  { originalSize: '292.2 KB', convertedSize: '151.4 KB', savings: '-48%', smaller: true },
  { originalSize: '35.1 KB', convertedSize: '45.9 KB', savings: '+31%', smaller: false },
  { originalSize: '64.3 KB', convertedSize: '73.1 KB', savings: '+14%', smaller: false },
];

export default function AvifToJpg() {
  return (
    <LandingPageTemplate
      defaultFormat="image/jpeg"
      pageKey="jpg"
      demoStats={demoStats}
    />
  );
}

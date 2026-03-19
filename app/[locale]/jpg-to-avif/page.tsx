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
  return generateSEOMetadata('jpg-to-avif', locale as any);
}

const demoStats: ImageSizeStats[] = [
  { originalSize: '151.4 KB', convertedSize: '292.2 KB', savings: '+93%', smaller: false },
  { originalSize: '45.9 KB', convertedSize: '35.1 KB', savings: '-24%', smaller: true },
  { originalSize: '73.1 KB', convertedSize: '64.3 KB', savings: '-12%', smaller: true },
];

export default function JpgToAvif() {
  return (
    <LandingPageTemplate
      defaultFormat="image/avif"
      pageKey="jpg-to-avif"
      demoStats={demoStats}
    />
  );
}

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
  return generateSEOMetadata('webp-to-avif', locale as any);
}

const demoStats: ImageSizeStats[] = [
  { originalSize: '144.6 KB', convertedSize: '292.2 KB', savings: '+102%', smaller: false },
  { originalSize: '25.0 KB', convertedSize: '35.1 KB', savings: '+40%', smaller: false },
  { originalSize: '44.8 KB', convertedSize: '64.3 KB', savings: '+44%', smaller: false },
];

export default function WebpToAvif() {
  return (
    <LandingPageTemplate
      defaultFormat="image/avif"
      pageKey="webp-to-avif"
      demoStats={demoStats}
    />
  );
}

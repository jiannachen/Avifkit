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
  return generateSEOMetadata('png-to-avif', locale as any);
}

const demoStats: ImageSizeStats[] = [
  { originalSize: '916.5 KB', convertedSize: '292.2 KB', savings: '-68%', smaller: true },
  { originalSize: '263.3 KB', convertedSize: '35.1 KB', savings: '-87%', smaller: true },
  { originalSize: '429.6 KB', convertedSize: '64.3 KB', savings: '-85%', smaller: true },
];

export default function PngToAvif() {
  return (
    <LandingPageTemplate
      defaultFormat="image/avif"
      pageKey="png-to-avif"
      demoStats={demoStats}
    />
  );
}

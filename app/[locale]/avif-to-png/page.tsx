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
  return generateSEOMetadata('png', locale as any);
}

const demoStats: ImageSizeStats[] = [
  { originalSize: '292.2 KB', convertedSize: '916.5 KB', savings: '+214%', smaller: false },
  { originalSize: '35.1 KB', convertedSize: '263.3 KB', savings: '+650%', smaller: false },
  { originalSize: '64.3 KB', convertedSize: '429.6 KB', savings: '+568%', smaller: false },
];

export default function AvifToPng() {
  return (
    <LandingPageTemplate
      defaultFormat="image/png"
      pageKey="png"
      demoStats={demoStats}
    />
  );
}

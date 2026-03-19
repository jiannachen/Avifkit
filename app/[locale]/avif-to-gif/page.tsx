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
  return generateSEOMetadata('avif-to-gif', locale as any);
}

const demoStats: ImageSizeStats[] = [
  { originalSize: '292.2 KB', convertedSize: '1.2 MB', savings: '+310%', smaller: false },
  { originalSize: '35.1 KB', convertedSize: '389.6 KB', savings: '+1009%', smaller: false },
  { originalSize: '64.3 KB', convertedSize: '684.8 KB', savings: '+965%', smaller: false },
];

export default function AvifToGif() {
  return (
    <LandingPageTemplate
      defaultFormat="image/gif"
      pageKey="avif-to-gif"
      demoStats={demoStats}
    />
  );
}

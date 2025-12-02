import { LandingPageTemplate } from '@/components/LandingPageTemplate';
import { generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateSEOMetadata('png', locale as any);
}

export default function AvifToPng() {
  return (
    <LandingPageTemplate
      defaultFormat="image/png"
      pageKey="png"
    />
  );
}
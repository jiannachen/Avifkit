import { LandingPageTemplate } from '@/components/LandingPageTemplate';
import { generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateSEOMetadata('jpg', locale as any);
}

export default function AvifToJpg() {
  return (
    <LandingPageTemplate
      defaultFormat="image/jpeg"
      pageKey="jpg"
    />
  );
}
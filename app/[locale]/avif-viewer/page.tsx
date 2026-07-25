import { generateSEOMetadata } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import AvifViewerClient from './client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateSEOMetadata('avif-viewer', locale as any);
}

export default async function AvifViewerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AvifViewerClient />;
}

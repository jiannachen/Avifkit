import { generateSEOMetadata } from '@/lib/seo';
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

export default function AvifViewerPage() {
  return <AvifViewerClient />;
}

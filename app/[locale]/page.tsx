import { LandingPageTemplate } from '@/components/LandingPageTemplate';
import { Locale } from '@/i18n/config';

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <LandingPageTemplate
      defaultFormat="image/jpeg"
      pageKey="home"
    />
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { LayoutClient } from "@/components/LayoutClient";
import { routing } from "@/i18n/routing";
import { getMessages, getTranslations } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    metadataBase: new URL('https://avifkit.com'),
    title: t('site.title'),
    description: t('site.description'),
    openGraph: {
      title: t('site.title'),
      description: t('site.description'),
      url: 'https://avifkit.com',
      siteName: 'Avifkit',
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale === 'es' ? 'es_ES' : locale === 'ja' ? 'ja_JP' : 'fr_FR',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('site.og_image_alt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('site.title'),
      description: t('site.description'),
      images: ['/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `https://avifkit.com${locale === 'en' ? '' : '/' + locale}`,
      languages: {
        'en': '/',
        'es': '/es',
        'ja': '/ja',
        'fr': '/fr',
      },
    },
    verification: {
      google: 'your-google-verification-code', // TODO: Add your verification code
    },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Avifkit',
              url: 'https://avifkit.com',
              logo: 'https://avifkit.com/logo.svg',
              description: messages.site?.description || 'Free online AVIF converter and image tools',
              sameAs: [],
            }),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Avifkit',
              url: 'https://avifkit.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://avifkit.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <LayoutClient>{children}</LayoutClient>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

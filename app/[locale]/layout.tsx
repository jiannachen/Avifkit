import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { LayoutClient } from "@/components/LayoutClient";
import { routing } from "@/i18n/routing";
import { getMessages, getTranslations } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const DEFAULT_OG_IMAGE = 'https://img.avifkit.com/blog/what-is-avif-guide.webp';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const title = t('site.title');
  const description = t('site.description');

  return {
    metadataBase: new URL('https://avifkit.com'),
    title,
    description,
    openGraph: {
      title,
      description,
      url: 'https://avifkit.com',
      siteName: 'AvifKit',
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale === 'es' ? 'es_ES' : locale === 'ja' ? 'ja_JP' : 'fr_FR',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: t('site.og_image_alt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
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
        'en': 'https://avifkit.com/',
        'es': 'https://avifkit.com/es',
        'ja': 'https://avifkit.com/ja',
        'fr': 'https://avifkit.com/fr',
        'x-default': 'https://avifkit.com/',
      },
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
      <head />
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <LayoutClient>{children}</LayoutClient>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

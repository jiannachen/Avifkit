import type { Metadata } from 'next';
import { Gauge, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ChangeType = 'new' | 'improved' | 'fixed' | 'maintenance';

interface ChangeItem {
  type: ChangeType;
  text: string;
}

interface Release {
  date: string;
  version: string;
  title: string;
  summary: string;
  changes: ChangeItem[];
}

const BASE_URL = 'https://avifkit.com';
const locales = ['en', 'es', 'ja', 'fr'] as const;

const changeStyles: Record<ChangeType, { icon: typeof Sparkles; className: string }> = {
  new: { icon: Sparkles, className: 'bg-blue-50 text-blue-700 ring-blue-100' },
  improved: { icon: Gauge, className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  fixed: { icon: Wrench, className: 'bg-amber-50 text-amber-700 ring-amber-100' },
  maintenance: { icon: ShieldCheck, className: 'bg-slate-100 text-slate-700 ring-slate-200' },
};

function localizedUrl(locale: string) {
  return `${BASE_URL}${locale === 'en' ? '' : `/${locale}`}/changelog`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.changelog.meta' });
  const languages = Object.fromEntries(locales.map((item) => [item, localizedUrl(item)]));

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      url: localizedUrl(locale),
      siteName: 'AvifKit',
    },
    twitter: {
      card: 'summary',
      title: t('title'),
      description: t('description'),
    },
    alternates: {
      canonical: localizedUrl(locale),
      languages: { ...languages, 'x-default': localizedUrl('en') },
    },
  };
}

export default async function ChangelogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pages.changelog' });
  const releases = t.raw('releases') as Release[];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="paper-grid border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t('hero.eyebrow')}
            </div>
            <h1 className="display-title text-slate-950">{t('hero.title')}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="sr-only">{t('timeline_title')}</h2>
        <div className="relative border-l border-slate-200 pl-6 sm:pl-10">
          {releases.map((release, releaseIndex) => (
            <article
              key={release.version}
              className={`relative ${releaseIndex === releases.length - 1 ? '' : 'border-b border-slate-200 pb-14 mb-14'}`}
            >
              <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-[3px] border-[#fafafa] bg-blue-600 ring-1 ring-blue-200 sm:-left-[45px]" />

              <div className="grid gap-5 md:grid-cols-[150px_minmax(0,1fr)] md:gap-10">
                <div>
                  <time
                    dateTime={release.date}
                    className="block text-sm font-semibold text-slate-900"
                  >
                    {new Intl.DateTimeFormat(locale, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC',
                    }).format(new Date(`${release.date}T00:00:00Z`))}
                  </time>
                  <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
                    {release.version}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-3xl font-semibold text-slate-950 sm:text-4xl">
                    {release.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                    {release.summary}
                  </p>

                  <ul className="mt-7 space-y-4">
                    {release.changes.map((change, changeIndex) => {
                      const style = changeStyles[change.type];
                      const Icon = style.icon;

                      return (
                        <li key={`${release.version}-${changeIndex}`} className="flex items-start gap-4">
                          <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1 ${style.className}`}>
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 pt-0.5">
                            <span className="text-xs font-semibold uppercase text-slate-500">
                              {t(`labels.${change.type}`)}
                            </span>
                            <p className="mt-1 text-base leading-7 text-slate-800">{change.text}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

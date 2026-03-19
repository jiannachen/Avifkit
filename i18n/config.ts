export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'ja', 'es', 'fr'],
} as const;

export type Locale = (typeof i18n)['locales'][number];

// Route configurations for homepage and other pages
// English (default locale) has no prefix, other languages have /{lang} prefix
export const routes = {
  'avif-to-jpg': {
    en: '/avif-to-jpg',
    ja: '/ja/avif-to-jpg',
    es: '/es/avif-to-jpg',
    fr: '/fr/avif-to-jpg',
  },
  'avif-to-png': {
    en: '/avif-to-png',
    ja: '/ja/avif-to-png',
    es: '/es/avif-to-png',
    fr: '/fr/avif-to-png',
  },
  'avif-to-webp': {
    en: '/avif-to-webp',
    ja: '/ja/avif-to-webp',
    es: '/es/avif-to-webp',
    fr: '/fr/avif-to-webp',
  },
  'png-to-avif': {
    en: '/png-to-avif',
    ja: '/ja/png-to-avif',
    es: '/es/png-to-avif',
    fr: '/fr/png-to-avif',
  },
  'jpg-to-avif': {
    en: '/jpg-to-avif',
    ja: '/ja/jpg-to-avif',
    es: '/es/jpg-to-avif',
    fr: '/fr/jpg-to-avif',
  },
  'webp-to-avif': {
    en: '/webp-to-avif',
    ja: '/ja/webp-to-avif',
    es: '/es/webp-to-avif',
    fr: '/fr/webp-to-avif',
  },
  'avif-to-gif': {
    en: '/avif-to-gif',
    ja: '/ja/avif-to-gif',
    es: '/es/avif-to-gif',
    fr: '/fr/avif-to-gif',
  },
  'avif-to-pdf': {
    en: '/avif-to-pdf',
    ja: '/ja/avif-to-pdf',
    es: '/es/avif-to-pdf',
    fr: '/fr/avif-to-pdf',
  },
  'avif-viewer': {
    en: '/avif-viewer',
    ja: '/ja/avif-viewer',
    es: '/es/avif-viewer',
    fr: '/fr/avif-viewer',
  },
  blog: {
    en: '/blog',
    ja: '/ja/blog',
    es: '/es/blog',
    fr: '/fr/blog',
  },
  'privacy-policy': {
    en: '/privacy-policy',
    ja: '/ja/privacy-policy',
    es: '/es/privacy-policy',
    fr: '/fr/privacy-policy',
  },
  terms: {
    en: '/terms',
    ja: '/ja/terms',
    es: '/es/terms',
    fr: '/fr/terms',
  },
} as const;

export type RouteKey = keyof typeof routes;

/**
 * Get localized route path
 * @param route - Route key (e.g., 'home', 'avif-to-jpg')
 * @param locale - Target locale
 * @returns Localized path
 */
export function getLocalizedRoute(route: RouteKey, locale: Locale): string {
  return routes[route][locale];
}

/**
 * Get the locale from a pathname
 * @param pathname - The current pathname
 * @returns The detected locale or default locale
 */
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // Check if the first segment is a valid locale
  if (i18n.locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }

  // If no locale prefix found, return default locale (en)
  return i18n.defaultLocale;
}

/**
 * Remove locale prefix from pathname
 * @param pathname - The pathname with possible locale prefix
 * @returns Pathname without locale prefix
 */
export function removeLocalePrefix(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);

  if (locale === i18n.defaultLocale) {
    return pathname;
  }

  return pathname.replace(`/${locale}`, '') || '/';
}

/**
 * Get all available locales for a given route
 * @param route - Route key
 * @returns Array of locale-path pairs
 */
export function getAlternateRoutes(route: RouteKey): Array<{ locale: Locale; path: string }> {
  return i18n.locales.map((locale) => ({
    locale,
    path: routes[route][locale],
  }));
}

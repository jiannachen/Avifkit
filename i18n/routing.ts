import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ja', 'es', 'fr'],

  // Used when no locale matches
  defaultLocale: 'en',

  // English uses canonical URLs without a locale prefix.
  localePrefix: 'as-needed',

  // HTML metadata and sitemap own hreflang output so HTTP headers don't drift from canonicals.
  alternateLinks: false,
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

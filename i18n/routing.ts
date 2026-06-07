import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ja', 'es', 'fr'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Keep middleware rewrites stable; public default-locale URLs are normalized in middleware.
  localePrefix: 'always',

  // HTML metadata and sitemap own hreflang output so HTTP headers don't drift from canonicals.
  alternateLinks: false,
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

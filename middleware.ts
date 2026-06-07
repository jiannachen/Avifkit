import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

function hasLocalePrefix(pathname: string) {
  return routing.locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

function hasPublicFileExtension(pathname: string) {
  return /\/[^/]+\.[^/]+$/.test(pathname);
}

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const defaultLocalePrefix = `/${routing.defaultLocale}`;

  if (pathname === defaultLocalePrefix || pathname.startsWith(`${defaultLocalePrefix}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocalePrefix.length) || '/';
    return NextResponse.redirect(url);
  }

  if (!hasLocalePrefix(pathname) && !hasPublicFileExtension(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}${pathname === '/' ? '' : pathname}`;

    const headers = new Headers(request.headers);
    headers.set('X-NEXT-INTL-LOCALE', routing.defaultLocale);

    const response = NextResponse.rewrite(url, {
      request: {
        headers,
      },
    });

    response.headers.set('Link', buildAlternateLinks(request));
    return response;
  }

  return intlMiddleware(request);
}

function buildAlternateLinks(request: NextRequest) {
  const normalizedPathname = request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname;
  const origin = request.nextUrl.origin;
  const links = routing.locales.map((locale) => {
    const localizedPathname = locale === routing.defaultLocale
      ? normalizedPathname || '/'
      : `/${locale}${normalizedPathname}`;

    return `<${origin}${localizedPathname}>; rel="alternate"; hreflang="${locale}"`;
  });

  links.push(`<${origin}${normalizedPathname || '/'}>; rel="alternate"; hreflang="x-default"`);

  return links.join(', ');
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

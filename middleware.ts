import createMiddleware from 'next-intl/middleware';
import {NextResponse, type NextRequest} from 'next/server';
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

function hasLocalePrefix(pathname: string) {
  return routing.locales.some(
    (locale) =>
      pathname === `/${locale}` ||
      pathname.startsWith(`/${locale}/`)
  );
}

function removeLocalePrefix(pathname: string) {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) {
      return '';
    }

    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
  }

  return pathname;
}

function buildAlternateLinks(request: NextRequest) {
  const origin = request.nextUrl.origin;

  // 去掉 locale 前缀
  let pathname = removeLocalePrefix(request.nextUrl.pathname);

  if (!pathname || pathname === '/') {
    pathname = '';
  }

  const links = routing.locales.map((locale) => {
    const localizedPathname =
      locale === routing.defaultLocale
        ? pathname || '/'
        : `/${locale}${pathname}`;

    return `<${origin}${localizedPathname}>; rel="alternate"; hreflang="${locale}"`;
  });

  links.push(
    `<${origin}${pathname || '/'}>; rel="alternate"; hreflang="x-default"`
  );

  return links.join(', ');
}

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 如果用户访问 /en 或 /en/xxx，则永久跳转到默认语言地址
  if (
    pathname === `/${routing.defaultLocale}` ||
    pathname.startsWith(`/${routing.defaultLocale}/`)
  ) {
    const url = request.nextUrl.clone();

    url.pathname =
      pathname.slice(routing.defaultLocale.length + 1) || '/';

    return NextResponse.redirect(url, 308);
  }

  // 全部交给 next-intl 处理
  const response = intlMiddleware(request);

  // 添加 hreflang
  response.headers.set(
    'Link',
    buildAlternateLinks(request)
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};